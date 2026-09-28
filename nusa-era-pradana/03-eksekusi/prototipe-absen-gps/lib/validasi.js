'use strict';

const { jarakMeter, bersilang } = require('./geo');

const JENIS_ABSEN = ['masuk', 'pulang'];

function angkaDalamRentang(nilai, min, maks) {
  return typeof nilai === 'number' && Number.isFinite(nilai) && nilai >= min && nilai <= maks;
}

function teksBersih(nilai, maks) {
  if (typeof nilai !== 'string') return null;
  const hasil = nilai.trim().replace(/\s+/g, ' ');
  if (hasil.length === 0 || hasil.length > maks) return null;
  return hasil;
}

function validasiLogin(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, galat: ['Body harus berupa objek JSON.'] };
  }
  const galat = [];
  const idKaryawan = teksBersih(body.id_karyawan, 30);
  if (!idKaryawan || !/^[A-Za-z0-9._-]+$/.test(idKaryawan)) {
    galat.push('id_karyawan wajib, 1-30 karakter, hanya huruf, angka, titik, strip, garis bawah.');
  }
  const nama = teksBersih(body.nama, 80);
  if (!nama) galat.push('nama wajib, 1-80 karakter.');
  if (galat.length) return { ok: false, galat };
  return { ok: true, data: { id_karyawan: idKaryawan.toUpperCase(), nama } };
}

// Identitas karyawan tidak dikirim di sini: server mengambilnya dari sesi login.
function validasiAbsen(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, galat: ['Body harus berupa objek JSON.'] };
  }
  const galat = [];
  if (!JENIS_ABSEN.includes(body.jenis)) {
    galat.push('jenis harus "masuk" atau "pulang".');
  }
  if (!angkaDalamRentang(body.lat, -90, 90)) galat.push('lat harus angka antara -90 dan 90.');
  if (!angkaDalamRentang(body.lon, -180, 180)) galat.push('lon harus angka antara -180 dan 180.');
  if (!angkaDalamRentang(body.akurasi, 0, 100000) || body.akurasi === 0) {
    galat.push('akurasi harus angka positif dalam meter.');
  }

  let waktuGps = null;
  if (body.waktu_gps !== undefined && body.waktu_gps !== null) {
    if (!angkaDalamRentang(body.waktu_gps, 0, 8.64e15)) {
      galat.push('waktu_gps harus epoch milidetik.');
    } else {
      waktuGps = new Date(body.waktu_gps).toISOString();
    }
  }

  if (galat.length) return { ok: false, galat };
  return {
    ok: true,
    data: { jenis: body.jenis, lat: body.lat, lon: body.lon, akurasi: body.akurasi, waktu_gps: waktuGps },
  };
}

function validasiPengaturan(body) {
  const galat = [];
  if (!body || typeof body !== 'object') {
    return { ok: false, galat: ['Body harus berupa objek JSON.'] };
  }
  const nama = teksBersih(body.nama_lokasi, 80);
  if (!nama) galat.push('nama_lokasi wajib, 1-80 karakter.');
  if (!angkaDalamRentang(body.lat, -90, 90)) galat.push('lat harus angka antara -90 dan 90.');
  if (!angkaDalamRentang(body.lon, -180, 180)) galat.push('lon harus angka antara -180 dan 180.');
  if (!angkaDalamRentang(body.radius_m, 10, 5000)) galat.push('radius_m harus 10-5000 meter.');
  if (!angkaDalamRentang(body.batas_akurasi_m, 5, 5000)) {
    galat.push('batas_akurasi_m harus 5-5000 meter.');
  }
  const bentuk = body.bentuk === undefined ? 'lingkaran' : body.bentuk;
  if (!['lingkaran', 'poligon'].includes(bentuk)) galat.push('bentuk harus "lingkaran" atau "poligon".');

  let titik = [];
  if (bentuk === 'poligon') {
    const sah = Array.isArray(body.titik) && body.titik.length >= 3 && body.titik.length <= 30 &&
      body.titik.every((t) => Array.isArray(t) && t.length === 2 &&
        angkaDalamRentang(t[0], -90, 90) && angkaDalamRentang(t[1], -180, 180));
    if (!sah) {
      galat.push('titik harus berisi 3-30 sudut [lintang, bujur].');
    } else if (galat.length === 0) {
      titik = body.titik.map(([a, b]) => [Number(a.toFixed(7)), Number(b.toFixed(7))]);
      if (titik.some(([a, b]) => jarakMeter(a, b, body.lat, body.lon) > 10000)) {
        galat.push('Semua sudut area harus berada dalam 10 km dari titik kantor.');
      } else if (bersilang(titik)) {
        galat.push('Sisi area saling bersilang. Geser sudutnya supaya bentuknya tidak seperti pita.');
      }
    }
  }
  if (galat.length) return { ok: false, galat };
  return {
    ok: true,
    data: {
      nama_lokasi: nama,
      lat: body.lat,
      lon: body.lon,
      radius_m: Math.round(body.radius_m),
      batas_akurasi_m: Math.round(body.batas_akurasi_m),
      bentuk,
      titik,
    },
  };
}

module.exports = { validasiLogin, validasiAbsen, validasiPengaturan, JENIS_ABSEN };
