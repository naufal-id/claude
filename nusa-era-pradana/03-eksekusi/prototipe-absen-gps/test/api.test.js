'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { buatAplikasi, bacaKonfigurasi } = require('../server');

const KUNCI = 'kunci-uji';

// Pengganti modul WhatsApp: mencatat pesan tanpa membuka WhatsApp Web.
function waTiruan() {
  const pesan = [];
  return {
    pesan,
    mulai() {},
    status: () => ({ aktif: true, status: 'siap', pesan: '', qr_gambar: null, nomor_terhubung: '628000', tujuan: ['628111'], riwayat: [] }),
    async kirimKeAdmin(teks) { pesan.push(teks); return { terkirim: 1 }; },
    async tutup() {},
  };
}

async function jalankan(env = {}) {
  const konfig = bacaKonfigurasi({ DB_FILE: ':memory:', KUNCI_ADMIN: KUNCI, ...env });
  const wa = waTiruan();
  const { tangani, db } = buatAplikasi(konfig, { wa });
  const server = http.createServer(tangani);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const dasar = `http://127.0.0.1:${server.address().port}`;
  const tutup = () => new Promise((r) => server.close(() => { db.tutup(); r(); }));
  return { dasar, tutup, wa };
}

function kirim(dasar, jalur, { method = 'GET', body, admin = false, token, headers = {} } = {}) {
  return fetch(dasar + jalur, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(admin ? { 'X-Kunci-Admin': KUNCI } : {}),
      ...(token ? { 'X-Token-Sesi': token } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function login(dasar, id, nama) {
  const res = await kirim(dasar, '/api/sesi', { method: 'POST', body: { id_karyawan: id, nama } });
  assert.equal(res.status, 201);
  return (await res.json()).token;
}

const posisiDekat = { jenis: 'masuk', lat: 3.5908, lon: 98.6780, akurasi: 12, waktu_gps: Date.now() };

test('alur absen lengkap', async (t) => {
  const { dasar, tutup, wa } = await jalankan();
  t.after(tutup);
  const token = {};

  await t.test('halaman, peta lokal, dan header keamanan', async () => {
    for (const jalur of ['/', '/rekap', '/js/absen.js', '/js/peta.js', '/css/gaya.css', '/vendor/leaflet/leaflet.js']) {
      const res = await kirim(dasar, jalur);
      assert.equal(res.status, 200, jalur);
      const csp = res.headers.get('content-security-policy');
      assert.match(csp, /default-src 'self'/);
      assert.match(csp, /img-src [^;]*https:\/\/server\.arcgisonline\.com/);
      assert.equal(res.headers.get('permissions-policy'), 'geolocation=(self), camera=(), microphone=()');
    }
  });

  await t.test('berkas di luar folder public tidak bisa diambil', async () => {
    for (const jalur of ['/../server.js', '/%2e%2e/server.js', '/..%2fserver.js']) {
      assert.equal((await kirim(dasar, jalur)).status, 404, jalur);
    }
  });

  await t.test('absen tanpa login ditolak 401', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'POST', body: posisiDekat });
    assert.equal(res.status, 401);
  });

  await t.test('login: ID dikapitalkan, nama dirapikan, login ganda di perangkat sama ditolak', async () => {
    const res = await kirim(dasar, '/api/sesi', { method: 'POST', body: { id_karyawan: 'nep-0001', nama: '  Budi   Santoso ' } });
    assert.equal(res.status, 201);
    const json = await res.json();
    token.budi = json.token;
    assert.equal(json.sesi.id_karyawan, 'NEP-0001');
    assert.equal(json.sesi.nama, 'Budi Santoso');
    const lagi = await kirim(dasar, '/api/sesi', { method: 'POST', token: token.budi, body: { id_karyawan: 'X', nama: 'Y' } });
    assert.equal(lagi.status, 409);
    const tidakValid = await kirim(dasar, '/api/sesi', { method: 'POST', body: { id_karyawan: 'a b', nama: '' } });
    assert.equal(tidakValid.status, 422);
  });

  await t.test('absen dekat kantor valid, identitas diambil dari sesi, WA terkirim', async () => {
    const res = await kirim(dasar, '/api/absen', {
      method: 'POST', token: token.budi, body: { ...posisiDekat, id_karyawan: 'PALSU', nama: 'Orang Lain' },
    });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.absen.status, 'valid');
    assert.equal(json.absen.id_karyawan, 'NEP-0001');
    assert.equal(json.absen.nama, 'Budi Santoso');
    await new Promise((r) => setImmediate(r));
    const pesan = wa.pesan.at(-1);
    assert.match(pesan, /Absen MASUK/);
    assert.match(pesan, /NEP-0001/);
    assert.match(pesan, /google\.com\/maps\?q=3\.5908,98\.678/);
  });

  await t.test('absen ganda dalam jeda ditolak 409', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'POST', token: token.budi, body: posisiDekat });
    assert.equal(res.status, 409);
  });

  await t.test('absen jauh dan absen tidak akurat diberi status sesuai', async () => {
    token.siti = await login(dasar, 'NEP-0002', 'Siti');
    token.rudi = await login(dasar, 'NEP-0003', 'Rudi');
    const jauh = await kirim(dasar, '/api/absen', {
      method: 'POST', token: token.siti, body: { ...posisiDekat, lat: 3.6422, lon: 98.8853 },
    });
    assert.equal((await jauh.json()).absen.status, 'di_luar_area');
    const kabur = await kirim(dasar, '/api/absen', {
      method: 'POST', token: token.rudi, body: { ...posisiDekat, akurasi: 900 },
    });
    assert.equal((await kabur.json()).absen.status, 'akurasi_rendah');
  });

  await t.test('data absen tidak valid ditolak 422 dengan daftar galat', async () => {
    const res = await kirim(dasar, '/api/absen', {
      method: 'POST', token: token.budi, body: { jenis: 'lembur', lat: 91, lon: 'x', akurasi: 0 },
    });
    assert.equal(res.status, 422);
    assert.equal((await res.json()).galat.length, 4);
  });

  await t.test('content-type salah ditolak 415, body besar ditolak 413', async () => {
    const r1 = await fetch(dasar + '/api/absen', { method: 'POST', headers: { 'X-Token-Sesi': token.budi }, body: 'lat=1' });
    assert.equal(r1.status, 415);
    const r2 = await kirim(dasar, '/api/absen', { method: 'POST', token: token.budi, body: { x: 'x'.repeat(20000) } });
    assert.equal(r2.status, 413);
  });

  await t.test('logout: kode tidak dikirim ke karyawan, hanya ke admin dan WA', async () => {
    const res = await kirim(dasar, '/api/sesi/logout', { method: 'POST', token: token.budi, body: {} });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.kode, undefined);
    assert.ok(json.kedaluwarsa);

    // Menekan logout lagi tidak membuat kode baru.
    const ulang = await (await kirim(dasar, '/api/sesi/logout', { method: 'POST', token: token.budi, body: {} })).json();
    assert.equal(ulang.baru, false);

    const admin = await (await kirim(dasar, '/api/admin/logout', { admin: true })).json();
    assert.equal(admin.menunggu.length, 1);
    assert.equal(admin.menunggu[0].id_karyawan, 'NEP-0001');
    assert.match(admin.menunggu[0].kode, /^\d{6}$/);
    assert.equal(admin.menunggu[0].token_sesi, undefined);
    token.kodeBudi = admin.menunggu[0].kode;

    await new Promise((r) => setImmediate(r));
    assert.ok(wa.pesan.some((p) => p.includes(token.kodeBudi) && p.includes('NEP-0001')));

    const sesi = await (await kirim(dasar, '/api/sesi', { token: token.budi })).json();
    assert.ok(sesi.sesi.logout_menunggu);
  });

  await t.test('logout: kode salah mengurangi sisa percobaan, kode benar mengakhiri sesi', async () => {
    const salahKode = token.kodeBudi === '000000' ? '111111' : '000000';
    const salah = await kirim(dasar, '/api/sesi/logout/konfirmasi', { method: 'POST', token: token.budi, body: { kode: salahKode } });
    assert.equal(salah.status, 403);
    assert.match((await salah.json()).pesan, /Sisa percobaan: 4/);

    const benar = await kirim(dasar, '/api/sesi/logout/konfirmasi', { method: 'POST', token: token.budi, body: { kode: token.kodeBudi } });
    assert.equal(benar.status, 200);
    assert.equal((await kirim(dasar, '/api/sesi', { token: token.budi })).status, 401);

    const admin = await (await kirim(dasar, '/api/admin/logout', { admin: true })).json();
    assert.equal(admin.menunggu.length, 0);
    assert.equal(admin.riwayat[0].status, 'dipakai');
  });

  await t.test('logout: 5 kali salah membuat kode terkunci', async () => {
    await kirim(dasar, '/api/sesi/logout', { method: 'POST', token: token.siti, body: {} });
    const admin = await (await kirim(dasar, '/api/admin/logout', { admin: true })).json();
    const salahKode = admin.menunggu[0].kode === '000000' ? '111111' : '000000';
    let res;
    for (let i = 0; i < 5; i += 1) {
      res = await kirim(dasar, '/api/sesi/logout/konfirmasi', { method: 'POST', token: token.siti, body: { kode: salahKode } });
    }
    assert.equal(res.status, 429);
    const lagi = await kirim(dasar, '/api/sesi/logout/konfirmasi', { method: 'POST', token: token.siti, body: { kode: admin.menunggu[0].kode } });
    assert.equal(lagi.status, 404);
    assert.equal((await kirim(dasar, '/api/sesi', { token: token.siti })).status, 200);
  });

  await t.test('admin bisa melihat perangkat login dan memaksa logout', async () => {
    const daftar = await (await kirim(dasar, '/api/admin/sesi', { admin: true })).json();
    const ids = daftar.data.map((s) => s.id_karyawan).sort();
    assert.deepEqual(ids, ['NEP-0002', 'NEP-0003']);
    const rudi = daftar.data.find((s) => s.id_karyawan === 'NEP-0003');
    const res = await kirim(dasar, `/api/admin/sesi?token=${encodeURIComponent(rudi.token)}`, { method: 'DELETE', admin: true });
    assert.equal(res.status, 200);
    assert.equal((await kirim(dasar, '/api/absen', { method: 'POST', token: token.rudi, body: posisiDekat })).status, 401);
  });

  await t.test('rute admin butuh kunci', async () => {
    for (const jalur of ['/api/absen', '/api/admin/logout', '/api/admin/sesi', '/api/admin/wa']) {
      assert.equal((await kirim(dasar, jalur)).status, 401, jalur);
      assert.equal((await kirim(dasar, jalur, { headers: { 'X-Kunci-Admin': 'salah' } })).status, 401, jalur);
    }
    const json = await (await kirim(dasar, '/api/absen', { admin: true })).json();
    assert.equal(json.total, 3);
    const wa = await (await kirim(dasar, '/api/admin/wa', { admin: true })).json();
    assert.equal(wa.wa.status, 'siap');
  });

  await t.test('CSV berisi header dan menetralkan rumus Excel', async () => {
    const tokenJahil = await login(dasar, 'NEP-0004', '=HYPERLINK("x")');
    await kirim(dasar, '/api/absen', { method: 'POST', token: tokenJahil, body: posisiDekat });
    const res = await kirim(dasar, '/api/absen.csv', { admin: true });
    assert.equal(res.status, 200);
    // res.text() membuang BOM, jadi periksa bita mentahnya.
    const bita = Buffer.from(await res.arrayBuffer());
    assert.deepEqual([...bita.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
    const teks = bita.subarray(3).toString('utf8');
    assert.ok(teks.startsWith('id,id_karyawan,nama'));
    assert.ok(teks.includes(`"'=HYPERLINK(""x"")"`));
  });

  await t.test('ubah lokasi kantor mengubah status absen berikutnya', async () => {
    const put = await kirim(dasar, '/api/pengaturan', {
      method: 'PUT', admin: true,
      body: { nama_lokasi: 'Kualanamu', lat: 3.6422, lon: 98.8853, radius_m: 200, batas_akurasi_m: 50 },
    });
    assert.equal(put.status, 200);
    const tokenBaru = await login(dasar, 'NEP-0005', 'Andi');
    const res = await kirim(dasar, '/api/absen', {
      method: 'POST', token: tokenBaru, body: { ...posisiDekat, lat: 3.6425, lon: 98.8850 },
    });
    assert.equal((await res.json()).absen.status, 'valid');
  });

  await t.test('hapus semua data absen', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'DELETE', admin: true });
    assert.equal((await res.json()).terhapus, 5);
    const cek = await (await kirim(dasar, '/api/absen', { admin: true })).json();
    assert.equal(cek.total, 0);
  });
});

test('mode notifikasi WA "bermasalah" melewati absen valid', async (t) => {
  const { dasar, tutup, wa } = await jalankan({ WA_NOTIF_ABSEN: 'bermasalah' });
  t.after(tutup);
  const a = await login(dasar, 'A1', 'A');
  const b = await login(dasar, 'B1', 'B');
  await kirim(dasar, '/api/absen', { method: 'POST', token: a, body: posisiDekat });
  await kirim(dasar, '/api/absen', { method: 'POST', token: b, body: { ...posisiDekat, lat: 3.7 } });
  await new Promise((r) => setImmediate(r));
  assert.equal(wa.pesan.length, 1);
  assert.match(wa.pesan[0], /DI LUAR AREA/);
});
