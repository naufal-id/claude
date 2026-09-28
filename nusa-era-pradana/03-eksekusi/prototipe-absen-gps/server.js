'use strict';

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const { bukaDatabase } = require('./lib/db');
const { jarakMeter, tentukanStatus } = require('./lib/geo');
const { validasiAbsen, validasiPengaturan } = require('./lib/validasi');

const FOLDER_PUBLIK = path.join(__dirname, 'public');
const BATAS_BODY_BYTE = 10 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const HALAMAN = {
  '/': 'index.html',
  '/rekap': 'rekap.html',
};

const HEADER_KEAMANAN = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  // Hanya halaman dari origin ini yang boleh meminta lokasi.
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; " +
    "connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};

function bacaKonfigurasi(env = process.env) {
  const angka = (nilai, bawaan) => (nilai === undefined || nilai === '' ? bawaan : Number(nilai));
  return {
    port: angka(env.PORT, 3000),
    host: env.HOST || '0.0.0.0',
    dbFile: env.DB_FILE || path.join(__dirname, 'data', 'absensi.db'),
    kunciAdmin: env.KUNCI_ADMIN || '',
    sslKey: env.SSL_KEY || '',
    sslCert: env.SSL_CERT || '',
    percayaProxy: env.TRUST_PROXY === '1',
    jedaAbsenGandaDetik: angka(env.JEDA_ABSEN_GANDA_DETIK, 60),
    // Nilai awal lokasi kantor. Setelah database terbentuk, ubah lewat halaman /rekap.
    pengaturanAwal: {
      nama_lokasi: env.KANTOR_NAMA || 'Kantor contoh (Lapangan Merdeka, Medan)',
      lat: angka(env.KANTOR_LAT, 3.5906),
      lon: angka(env.KANTOR_LON, 98.6779),
      radius_m: angka(env.KANTOR_RADIUS_M, 100),
      batas_akurasi_m: angka(env.BATAS_AKURASI_M, 50),
    },
  };
}

function kirimJson(res, kode, isi) {
  res.writeHead(kode, {
    ...HEADER_KEAMANAN,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(isi));
}

function kirimGalat(res, kode, pesan, galat) {
  kirimJson(res, kode, { ok: false, pesan, ...(galat ? { galat } : {}) });
}

function bacaBodyJson(req) {
  return new Promise((resolve, reject) => {
    const tipe = req.headers['content-type'] || '';
    if (!tipe.toLowerCase().startsWith('application/json')) {
      reject(Object.assign(new Error('Content-Type harus application/json.'), { kode: 415 }));
      return;
    }
    const potongan = [];
    let ukuran = 0;
    req.on('data', (bagian) => {
      ukuran += bagian.length;
      if (ukuran <= BATAS_BODY_BYTE) potongan.push(bagian);
    });
    req.on('end', () => {
      if (ukuran > BATAS_BODY_BYTE) {
        reject(Object.assign(new Error('Body terlalu besar.'), { kode: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(potongan).toString('utf8') || 'null'));
      } catch {
        reject(Object.assign(new Error('JSON tidak valid.'), { kode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function samaAman(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function alamatIp(req, percayaProxy) {
  if (percayaProxy) {
    const diteruskan = req.headers['x-forwarded-for'];
    if (diteruskan) return String(diteruskan).split(',')[0].trim();
  }
  return req.socket.remoteAddress || '';
}

// Sel yang diawali = + - @ bisa dieksekusi sebagai rumus oleh Excel.
function selCsv(nilai, teksBebas = false) {
  if (nilai === null || nilai === undefined) return '';
  let s = String(nilai);
  if (teksBebas && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function keCsv(baris) {
  const kolom = [
    'id', 'id_karyawan', 'nama', 'jenis', 'status', 'lat', 'lon', 'akurasi_m', 'jarak_m',
    'waktu_server', 'waktu_gps', 'ip', 'perangkat',
  ];
  const teksBebas = new Set(['id_karyawan', 'nama', 'perangkat', 'ip']);
  const isi = baris.map((b) => kolom.map((k) => selCsv(b[k], teksBebas.has(k))).join(','));
  return '\uFEFF' + [kolom.join(','), ...isi].join('\r\n') + '\r\n';
}

function kirimBerkasStatis(res, namaBerkas) {
  const lokasi = path.normalize(path.join(FOLDER_PUBLIK, namaBerkas));
  if (!lokasi.startsWith(FOLDER_PUBLIK + path.sep)) return false;
  let isi;
  try {
    isi = fs.readFileSync(lokasi);
  } catch {
    return false;
  }
  res.writeHead(200, {
    ...HEADER_KEAMANAN,
    'Content-Type': MIME[path.extname(lokasi)] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  res.end(isi);
  return true;
}

function buatAplikasi(konfig) {
  const db = bukaDatabase(konfig.dbFile, konfig.pengaturanAwal);

  function adminSah(req) {
    const kunci = req.headers['x-kunci-admin'];
    return Boolean(kunci) && samaAman(kunci, konfig.kunciAdmin);
  }

  async function tanganiApi(req, res, url) {
    const rute = `${req.method} ${url.pathname}`;

    if (rute === 'GET /api/status') {
      return kirimJson(res, 200, {
        ok: true,
        waktu_server: new Date().toISOString(),
        https: Boolean(konfig.sslKey && konfig.sslCert),
        database: konfig.dbFile === ':memory:' ? 'memori (hilang saat server mati)' : 'berkas SQLite',
      });
    }

    if (rute === 'GET /api/pengaturan') {
      return kirimJson(res, 200, { ok: true, pengaturan: db.ambilPengaturan() });
    }

    if (rute === 'POST /api/absen') {
      const body = await bacaBodyJson(req);
      const hasil = validasiAbsen(body);
      if (!hasil.ok) return kirimGalat(res, 422, 'Data absen tidak valid.', hasil.galat);
      const d = hasil.data;

      const sekarang = new Date();
      const sebelumnya = db.absenTerakhir(d.id_karyawan, d.jenis);
      if (sebelumnya) {
        const selisihDetik = (sekarang - new Date(sebelumnya.waktu_server)) / 1000;
        if (selisihDetik < konfig.jedaAbsenGandaDetik) {
          return kirimGalat(
            res,
            409,
            `Absen ${d.jenis} untuk ${d.id_karyawan} sudah tercatat ${Math.round(selisihDetik)} detik lalu. ` +
              `Tunggu ${Math.ceil(konfig.jedaAbsenGandaDetik - selisihDetik)} detik lagi.`
          );
        }
      }

      const p = db.ambilPengaturan();
      const jarak = jarakMeter(d.lat, d.lon, p.lat, p.lon);
      const status = tentukanStatus({
        jarak,
        akurasi: d.akurasi,
        radius: p.radius_m,
        batasAkurasi: p.batas_akurasi_m,
      });

      const absen = db.simpanAbsen({
        ...d,
        akurasi_m: Math.round(d.akurasi * 10) / 10,
        jarak_m: Math.round(jarak * 10) / 10,
        status,
        waktu_server: sekarang.toISOString(),
        ip: alamatIp(req, konfig.percayaProxy),
        perangkat: String(req.headers['user-agent'] || '').slice(0, 200),
      });
      return kirimJson(res, 201, { ok: true, absen, lokasi_kantor: p });
    }

    // Semua rute di bawah ini khusus admin.
    if (!adminSah(req)) {
      return kirimGalat(res, 401, 'Kunci admin salah atau belum diisi.');
    }

    if (rute === 'GET /api/absen') {
      const batas = Math.min(Math.max(Number(url.searchParams.get('batas')) || 200, 1), 5000);
      return kirimJson(res, 200, {
        ok: true,
        total: db.jumlahAbsen(),
        pengaturan: db.ambilPengaturan(),
        data: db.daftarAbsen(batas),
      });
    }

    if (rute === 'GET /api/absen.csv') {
      res.writeHead(200, {
        ...HEADER_KEAMANAN,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="absensi-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      });
      return res.end(keCsv(db.daftarAbsen(1_000_000)));
    }

    if (rute === 'DELETE /api/absen') {
      const terhapus = db.hapusSemuaAbsen();
      return kirimJson(res, 200, { ok: true, terhapus });
    }

    if (rute === 'PUT /api/pengaturan') {
      const body = await bacaBodyJson(req);
      const hasil = validasiPengaturan(body);
      if (!hasil.ok) return kirimGalat(res, 422, 'Pengaturan tidak valid.', hasil.galat);
      return kirimJson(res, 200, { ok: true, pengaturan: db.simpanPengaturan(hasil.data) });
    }

    return kirimGalat(res, 404, 'Rute API tidak ditemukan.');
  }

  async function tangani(req, res) {
    const url = new URL(req.url, 'http://lokal');
    try {
      if (url.pathname.startsWith('/api/')) {
        await tanganiApi(req, res, url);
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        kirimGalat(res, 405, 'Metode tidak didukung.');
        return;
      }
      const berkas = HALAMAN[url.pathname] || url.pathname.slice(1);
      if (!kirimBerkasStatis(res, berkas)) kirimGalat(res, 404, 'Halaman tidak ditemukan.');
    } catch (err) {
      if (err.kode) {
        kirimGalat(res, err.kode, err.message);
      } else {
        console.error(err);
        kirimGalat(res, 500, 'Terjadi kesalahan di server.');
      }
    }
  }

  return { tangani, db };
}

function alamatJaringanLokal() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
}

function mulai() {
  const konfig = bacaKonfigurasi();
  let kunciDibuatOtomatis = false;
  if (!konfig.kunciAdmin) {
    konfig.kunciAdmin = crypto.randomBytes(4).toString('hex');
    kunciDibuatOtomatis = true;
  }

  const { tangani, db } = buatAplikasi(konfig);
  const pakaiHttps = Boolean(konfig.sslKey && konfig.sslCert);
  const server = pakaiHttps
    ? https.createServer(
        { key: fs.readFileSync(konfig.sslKey), cert: fs.readFileSync(konfig.sslCert) },
        tangani
      )
    : http.createServer(tangani);

  server.listen(konfig.port, konfig.host, () => {
    const skema = pakaiHttps ? 'https' : 'http';
    const baris = [
      '',
      'Prototipe Absen GPS berjalan',
      `  Halaman absen : ${skema}://localhost:${konfig.port}/`,
      `  Halaman rekap : ${skema}://localhost:${konfig.port}/rekap`,
      `  Database      : ${konfig.dbFile}`,
      `  Kunci admin   : ${konfig.kunciAdmin}${kunciDibuatOtomatis ? '  (acak, berganti tiap server dijalankan ulang; atur KUNCI_ADMIN di .env agar tetap)' : ''}`,
    ];
    if (konfig.host === '0.0.0.0') {
      for (const ip of alamatJaringanLokal()) {
        baris.push(
          `  Dari HP (LAN) : ${skema}://${ip}:${konfig.port}/` +
            (pakaiHttps ? '' : '  <- HTTP biasa, browser akan MEMBLOKIR GPS. Baca README bagian 4.')
        );
      }
    }
    baris.push('', 'Tekan Ctrl+C untuk berhenti.', '');
    console.log(baris.join('\n'));
  });

  const berhenti = () => {
    server.close();
    db.tutup();
    process.exit(0);
  };
  process.on('SIGINT', berhenti);
  process.on('SIGTERM', berhenti);
}

if (require.main === module) mulai();

module.exports = { buatAplikasi, bacaKonfigurasi };
