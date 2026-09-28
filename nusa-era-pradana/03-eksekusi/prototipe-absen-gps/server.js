'use strict';

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const { bukaDatabase } = require('./lib/db');
const { evaluasi, tentukanStatus, persegi, ringkas } = require('./lib/geo');
const { validasiLogin, validasiAbsen, validasiPengaturan } = require('./lib/validasi');
const { buatWa, folderSesiBawaan } = require('./lib/wa');

const FOLDER_PUBLIK = path.join(__dirname, 'public');
const BATAS_BODY_BYTE = 10 * 1024;
const MASA_BERLAKU_KODE_MENIT = 10;
const BATAS_SALAH_KODE = 5;

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
  // img-src membuka dua server ubin peta: citra satelit Esri dan peta jalan OpenStreetMap.
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: https://server.arcgisonline.com https://tile.openstreetmap.org; " +
    "style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; " +
    "frame-ancestors 'none'",
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
    waAktif: env.WA_AKTIF === '1',
    waTujuan: (env.WA_NOMOR_ADMIN || '').split(',').filter((t) => t.trim()),
    waNotifAbsen: ['semua', 'bermasalah', 'mati'].includes(env.WA_NOTIF_ABSEN) ? env.WA_NOTIF_ABSEN : 'semua',
    waFolderSesi: env.WA_FOLDER_SESI || folderSesiBawaan(),
    waChromePath: env.WA_CHROME_PATH || '',
    pengaturanAwal: pengaturanAwal(env, angka),
  };
}

// Nilai awal lokasi kantor. Setelah database terbentuk, ubah lewat halaman /rekap.
// Bawaannya persegi dengan sisi 2 x KANTOR_RADIUS_M di sekitar titik kantor.
function pengaturanAwal(env, angka) {
  const lat = angka(env.KANTOR_LAT, 3.5906);
  const lon = angka(env.KANTOR_LON, 98.6779);
  const radius = angka(env.KANTOR_RADIUS_M, 100);
  const bentuk = env.KANTOR_BENTUK === 'lingkaran' ? 'lingkaran' : 'poligon';
  return {
    nama_lokasi: env.KANTOR_NAMA || 'Kantor contoh (Lapangan Merdeka, Medan)',
    lat,
    lon,
    radius_m: radius,
    batas_akurasi_m: angka(env.BATAS_AKURASI_M, 50),
    bentuk,
    titik: bentuk === 'poligon' ? persegi(lat, lon, radius) : [],
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
    'id', 'id_karyawan', 'nama', 'jenis', 'status', 'lat', 'lon', 'akurasi_m', 'jarak_m', 'jarak_luar_m',
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

function formatWib(tanggal) {
  return new Date(tanggal).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short',
  }) + ' WIB';
}

function formatMeter(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(2).replace('.', ',')} km` : `${Math.round(m)} m`;
}

const LABEL_STATUS = {
  valid: 'Valid, di dalam area',
  di_luar_area: 'DI LUAR AREA',
  akurasi_rendah: 'AKURASI RENDAH',
};

function pesanAbsenWa(a, p) {
  const ikon = a.status === 'valid' ? '✅' : '⚠️';
  return [
    `${ikon} *Absen ${a.jenis.toUpperCase()}*`,
    `${a.id_karyawan} · ${a.nama}`,
    `Status: ${LABEL_STATUS[a.status] || a.status}`,
    `Posisi: ${a.jarak_luar_m > 0 ? `${formatMeter(a.jarak_luar_m)} di luar batas area` : 'di dalam area'} (${ringkas(p)})`,
    `Jarak ke titik ${p.nama_lokasi}: ${formatMeter(a.jarak_m)}`,
    `Akurasi GPS: ±${formatMeter(a.akurasi_m)}`,
    `Waktu: ${formatWib(a.waktu_server)}`,
    `Peta: https://www.google.com/maps?q=${a.lat},${a.lon}`,
  ].join('\n');
}

function buatAplikasi(konfig, opsi = {}) {
  const db = bukaDatabase(konfig.dbFile, konfig.pengaturanAwal);
  const wa = opsi.wa || buatWa(konfig);

  function adminSah(req) {
    const kunci = req.headers['x-kunci-admin'];
    return Boolean(kunci) && samaAman(kunci, konfig.kunciAdmin);
  }

  function sesiDariRequest(req) {
    const token = req.headers['x-token-sesi'];
    if (!token || typeof token !== 'string' || token.length > 100) return null;
    return db.ambilSesi(token);
  }

  // Kirim notifikasi tanpa menunggu, supaya balasan ke karyawan tidak tertahan WhatsApp.
  function beritahuAdmin(teks) {
    wa.kirimKeAdmin(teks).catch((err) => console.error('[WA]', err));
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

    if (rute === 'POST /api/sesi') {
      if (sesiDariRequest(req)) {
        return kirimGalat(res, 409, 'Perangkat ini sudah login. Logout dulu dengan kode dari admin.');
      }
      const hasil = validasiLogin(await bacaBodyJson(req));
      if (!hasil.ok) return kirimGalat(res, 422, 'Data login tidak valid.', hasil.galat);
      const sesi = db.buatSesi({
        ...hasil.data,
        token: crypto.randomBytes(24).toString('base64url'),
        dibuat: new Date().toISOString(),
        perangkat: String(req.headers['user-agent'] || '').slice(0, 200),
        ip: alamatIp(req, konfig.percayaProxy),
      });
      return kirimJson(res, 201, { ok: true, token: sesi.token, sesi: infoSesi(sesi) });
    }

    if (url.pathname.startsWith('/api/sesi') || rute === 'POST /api/absen') {
      const sesi = sesiDariRequest(req);
      if (!sesi) return kirimGalat(res, 401, 'Belum login atau sesi sudah diakhiri admin.');
      return tanganiRuteKaryawan(req, res, rute, sesi);
    }

    // Semua rute di bawah ini khusus admin.
    if (!adminSah(req)) {
      return kirimGalat(res, 401, 'Kunci admin salah atau belum diisi.');
    }
    return tanganiRuteAdmin(req, res, rute, url);
  }

  function infoSesi(sesi) {
    const menunggu = db.permintaanLogoutAktif(sesi.token);
    const masihBerlaku = menunggu && new Date(menunggu.kedaluwarsa) > new Date();
    return {
      id_karyawan: sesi.id_karyawan,
      nama: sesi.nama,
      dibuat: sesi.dibuat,
      logout_menunggu: masihBerlaku ? { kedaluwarsa: menunggu.kedaluwarsa } : null,
    };
  }

  async function tanganiRuteKaryawan(req, res, rute, sesi) {
    if (rute === 'GET /api/sesi') {
      return kirimJson(res, 200, { ok: true, sesi: infoSesi(sesi) });
    }

    // Langkah 1 logout: buat kode. Kodenya TIDAK dikirim ke karyawan, hanya ke admin.
    if (rute === 'POST /api/sesi/logout') {
      const sekarang = new Date();
      const lama = db.permintaanLogoutAktif(sesi.token);
      if (lama && new Date(lama.kedaluwarsa) > sekarang) {
        return kirimJson(res, 200, { ok: true, baru: false, kedaluwarsa: lama.kedaluwarsa });
      }
      const permintaan = db.buatPermintaanLogout({
        token_sesi: sesi.token,
        id_karyawan: sesi.id_karyawan,
        nama: sesi.nama,
        kode: String(crypto.randomInt(0, 1_000_000)).padStart(6, '0'),
        dibuat: sekarang.toISOString(),
        kedaluwarsa: new Date(sekarang.getTime() + MASA_BERLAKU_KODE_MENIT * 60_000).toISOString(),
      });
      beritahuAdmin([
        '🔑 *Permintaan logout*',
        `${sesi.id_karyawan} · ${sesi.nama}`,
        `Kode: *${permintaan.kode}*`,
        `Berlaku sampai ${formatWib(permintaan.kedaluwarsa)}.`,
        'Berikan kode ini hanya kalau karyawan memang boleh logout dari perangkatnya.',
      ].join('\n'));
      return kirimJson(res, 201, { ok: true, baru: true, kedaluwarsa: permintaan.kedaluwarsa });
    }

    // Langkah 2 logout: karyawan mengetik kode yang didapat dari admin.
    if (rute === 'POST /api/sesi/logout/konfirmasi') {
      const body = await bacaBodyJson(req);
      const kode = body && typeof body.kode === 'string' ? body.kode.trim() : '';
      const permintaan = db.permintaanLogoutAktif(sesi.token);
      if (!permintaan) return kirimGalat(res, 404, 'Belum ada permintaan logout. Tekan Logout dulu.');
      if (new Date(permintaan.kedaluwarsa) <= new Date()) {
        db.ubahStatusLogout(permintaan.id, 'kedaluwarsa');
        return kirimGalat(res, 410, 'Kode sudah kedaluwarsa. Minta kode baru.');
      }
      if (!/^\d{6}$/.test(kode) || !samaAman(kode, permintaan.kode)) {
        const terbaru = db.tambahPercobaanLogout(permintaan.id);
        const sisa = BATAS_SALAH_KODE - terbaru.percobaan;
        if (sisa <= 0) {
          db.ubahStatusLogout(permintaan.id, 'diblokir');
          return kirimGalat(res, 429, 'Terlalu banyak kode salah. Minta kode baru ke admin.');
        }
        return kirimGalat(res, 403, `Kode salah. Sisa percobaan: ${sisa}.`);
      }
      db.ubahStatusLogout(permintaan.id, 'dipakai');
      db.hapusSesi(sesi.token);
      beritahuAdmin(`🚪 ${sesi.id_karyawan} · ${sesi.nama} sudah logout (${formatWib(new Date())}).`);
      return kirimJson(res, 200, { ok: true });
    }

    if (rute === 'POST /api/absen') {
      return simpanAbsen(req, res, sesi);
    }

    return kirimGalat(res, 404, 'Rute API tidak ditemukan.');
  }

  async function simpanAbsen(req, res, sesi) {
    const body = await bacaBodyJson(req);
    const hasil = validasiAbsen(body);
    if (!hasil.ok) return kirimGalat(res, 422, 'Data absen tidak valid.', hasil.galat);
    const d = { ...hasil.data, id_karyawan: sesi.id_karyawan, nama: sesi.nama };

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
    const area = evaluasi(p, d.lat, d.lon);
    const status = tentukanStatus({ diDalam: area.diDalam, akurasi: d.akurasi, batasAkurasi: p.batas_akurasi_m });

    const absen = db.simpanAbsen({
      ...d,
      akurasi_m: Math.round(d.akurasi * 10) / 10,
      jarak_m: Math.round(area.jarakKantor * 10) / 10,
      jarak_luar_m: Math.round(area.jarakLuar * 10) / 10,
      status,
      waktu_server: sekarang.toISOString(),
      ip: alamatIp(req, konfig.percayaProxy),
      perangkat: String(req.headers['user-agent'] || '').slice(0, 200),
    });
    const kirimWa = konfig.waNotifAbsen === 'semua' ||
      (konfig.waNotifAbsen === 'bermasalah' && absen.status !== 'valid');
    if (kirimWa) beritahuAdmin(pesanAbsenWa(absen, p));
    return kirimJson(res, 201, { ok: true, absen, lokasi_kantor: p });
  }

  async function tanganiRuteAdmin(req, res, rute, url) {
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

    if (rute === 'GET /api/admin/logout') {
      const sekarang = new Date();
      const semua = db.daftarPermintaanLogout(50).map((p) => ({
        ...p,
        token_sesi: undefined,
        status: p.status === 'menunggu' && new Date(p.kedaluwarsa) <= sekarang ? 'kedaluwarsa' : p.status,
      }));
      return kirimJson(res, 200, {
        ok: true,
        waktu_server: sekarang.toISOString(),
        menunggu: semua.filter((p) => p.status === 'menunggu'),
        riwayat: semua.filter((p) => p.status !== 'menunggu').slice(0, 20),
      });
    }

    if (rute === 'GET /api/admin/sesi') {
      return kirimJson(res, 200, { ok: true, data: db.daftarSesi() });
    }

    if (rute === 'DELETE /api/admin/sesi') {
      const token = url.searchParams.get('token') || '';
      const aktif = db.permintaanLogoutAktif(token);
      if (aktif) db.ubahStatusLogout(aktif.id, 'dipaksa_admin');
      const terhapus = db.hapusSesi(token);
      if (!terhapus) return kirimGalat(res, 404, 'Sesi tidak ditemukan.');
      return kirimJson(res, 200, { ok: true });
    }

    if (rute === 'GET /api/admin/wa') {
      return kirimJson(res, 200, { ok: true, wa: wa.status(), mode_notif_absen: konfig.waNotifAbsen });
    }

    if (rute === 'POST /api/admin/wa/tes') {
      const hasil = await wa.kirimKeAdmin(`🧪 Tes notifikasi Absen GPS, ${formatWib(new Date())}.`);
      return kirimJson(res, 200, { ok: true, ...hasil, wa: wa.status() });
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

  return { tangani, db, wa };
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

  const { tangani, db, wa } = buatAplikasi(konfig);
  wa.mulai();
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
      `  WhatsApp      : ${konfig.waAktif ? `aktif, notifikasi ke ${konfig.waTujuan.join(', ') || '(WA_NOMOR_ADMIN kosong)'}` : 'mati (WA_AKTIF=1 untuk menyalakan)'}`,
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

  const berhenti = async () => {
    server.close();
    await wa.tutup();
    db.tutup();
    process.exit(0);
  };
  process.on('SIGINT', berhenti);
  process.on('SIGTERM', berhenti);
}

if (require.main === module) mulai();

module.exports = { buatAplikasi, bacaKonfigurasi };
