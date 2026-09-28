'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { buatAplikasi, bacaKonfigurasi } = require('../server');

const KUNCI = 'kunci-uji';

async function jalankan() {
  const konfig = bacaKonfigurasi({ DB_FILE: ':memory:', KUNCI_ADMIN: KUNCI });
  const { tangani, db } = buatAplikasi(konfig);
  const server = http.createServer(tangani);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const dasar = `http://127.0.0.1:${server.address().port}`;
  const tutup = () => new Promise((r) => server.close(() => { db.tutup(); r(); }));
  return { dasar, tutup, konfig };
}

function kirim(dasar, jalur, { method = 'GET', body, admin = false, headers = {} } = {}) {
  return fetch(dasar + jalur, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(admin ? { 'X-Kunci-Admin': KUNCI } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const absenDekat = {
  id_karyawan: 'nep-0001',
  nama: '  Budi   Santoso ',
  jenis: 'masuk',
  lat: 3.5908,
  lon: 98.6780,
  akurasi: 12,
  waktu_gps: Date.now(),
};

test('alur absen lengkap', async (t) => {
  const { dasar, tutup } = await jalankan();
  t.after(tutup);

  await t.test('halaman absen dan rekap tersaji dengan header keamanan', async () => {
    for (const jalur of ['/', '/rekap', '/js/absen.js', '/css/gaya.css']) {
      const res = await kirim(dasar, jalur);
      assert.equal(res.status, 200, jalur);
      assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
      assert.equal(res.headers.get('permissions-policy'), 'geolocation=(self), camera=(), microphone=()');
    }
  });

  await t.test('berkas di luar folder public tidak bisa diambil', async () => {
    for (const jalur of ['/../server.js', '/%2e%2e/server.js', '/..%2fserver.js']) {
      const res = await kirim(dasar, jalur);
      assert.equal(res.status, 404, jalur);
    }
  });

  await t.test('absen dekat kantor tercatat valid, nama dirapikan, ID dikapitalkan', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'POST', body: absenDekat });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.absen.status, 'valid');
    assert.equal(json.absen.nama, 'Budi Santoso');
    assert.equal(json.absen.id_karyawan, 'NEP-0001');
    assert.ok(json.absen.jarak_m < 100);
    assert.ok(json.absen.waktu_server);
  });

  await t.test('absen ganda dalam jeda ditolak 409', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'POST', body: absenDekat });
    assert.equal(res.status, 409);
  });

  await t.test('absen jauh dan absen tidak akurat diberi status sesuai', async () => {
    const jauh = await kirim(dasar, '/api/absen', {
      method: 'POST',
      body: { ...absenDekat, id_karyawan: 'NEP-0002', lat: 3.6422, lon: 98.8853 },
    });
    assert.equal((await jauh.json()).absen.status, 'di_luar_area');
    const kabur = await kirim(dasar, '/api/absen', {
      method: 'POST',
      body: { ...absenDekat, id_karyawan: 'NEP-0003', akurasi: 900 },
    });
    assert.equal((await kabur.json()).absen.status, 'akurasi_rendah');
  });

  await t.test('data tidak valid ditolak 422 dengan daftar galat', async () => {
    const res = await kirim(dasar, '/api/absen', {
      method: 'POST',
      body: { id_karyawan: 'a b', nama: '', jenis: 'lembur', lat: 91, lon: 'x', akurasi: 0 },
    });
    assert.equal(res.status, 422);
    const json = await res.json();
    assert.equal(json.galat.length, 6);
  });

  await t.test('content-type salah ditolak 415, body besar ditolak 413', async () => {
    const r1 = await fetch(dasar + '/api/absen', { method: 'POST', body: 'lat=1' });
    assert.equal(r1.status, 415);
    const r2 = await kirim(dasar, '/api/absen', { method: 'POST', body: { nama: 'x'.repeat(20000) } });
    assert.equal(r2.status, 413);
  });

  await t.test('rute admin butuh kunci', async () => {
    assert.equal((await kirim(dasar, '/api/absen')).status, 401);
    assert.equal((await kirim(dasar, '/api/absen', { headers: { 'X-Kunci-Admin': 'salah' } })).status, 401);
    const res = await kirim(dasar, '/api/absen', { admin: true });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.total, 3);
    assert.equal(json.data[0].id_karyawan, 'NEP-0003');
  });

  await t.test('CSV berisi header dan menetralkan rumus Excel', async () => {
    await kirim(dasar, '/api/absen', {
      method: 'POST',
      body: { ...absenDekat, id_karyawan: 'NEP-0004', nama: '=HYPERLINK("x")' },
    });
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
      method: 'PUT',
      admin: true,
      body: { nama_lokasi: 'Kualanamu', lat: 3.6422, lon: 98.8853, radius_m: 200, batas_akurasi_m: 50 },
    });
    assert.equal(put.status, 200);
    const res = await kirim(dasar, '/api/absen', {
      method: 'POST',
      body: { ...absenDekat, id_karyawan: 'NEP-0005', lat: 3.6425, lon: 98.8850 },
    });
    assert.equal((await res.json()).absen.status, 'valid');
  });

  await t.test('hapus semua data', async () => {
    const res = await kirim(dasar, '/api/absen', { method: 'DELETE', admin: true });
    assert.equal((await res.json()).terhapus, 5);
    const cek = await (await kirim(dasar, '/api/absen', { admin: true })).json();
    assert.equal(cek.total, 0);
  });
});
