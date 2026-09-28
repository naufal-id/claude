'use strict';

const fs = require('node:fs');
const path = require('node:path');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  console.error(
    'Modul node:sqlite tidak tersedia. Pakai Node.js 22.13 ke atas (disarankan versi LTS terbaru).\n' +
      'Cek versi dengan: node --version'
  );
  process.exit(1);
}

const SKEMA = `
  CREATE TABLE IF NOT EXISTS absensi (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_karyawan  TEXT    NOT NULL,
    nama         TEXT    NOT NULL,
    jenis        TEXT    NOT NULL CHECK (jenis IN ('masuk', 'pulang')),
    lat          REAL    NOT NULL,
    lon          REAL    NOT NULL,
    akurasi_m    REAL    NOT NULL,
    jarak_m      REAL    NOT NULL,
    status       TEXT    NOT NULL,
    waktu_server TEXT    NOT NULL,
    waktu_gps    TEXT,
    ip           TEXT,
    perangkat    TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_absensi_karyawan
    ON absensi (id_karyawan, jenis, waktu_server);
  CREATE TABLE IF NOT EXISTS pengaturan (
    kunci TEXT PRIMARY KEY,
    nilai TEXT NOT NULL
  );
`;

function bukaDatabase(lokasi, pengaturanAwal) {
  if (lokasi !== ':memory:') {
    fs.mkdirSync(path.dirname(lokasi), { recursive: true });
  }
  const db = new DatabaseSync(lokasi);
  if (lokasi !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SKEMA);

  const stmt = {
    sisip: db.prepare(`
      INSERT INTO absensi
        (id_karyawan, nama, jenis, lat, lon, akurasi_m, jarak_m, status,
         waktu_server, waktu_gps, ip, perangkat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    ambilSatu: db.prepare('SELECT * FROM absensi WHERE id = ?'),
    terakhir: db.prepare(`
      SELECT * FROM absensi
      WHERE id_karyawan = ? AND jenis = ?
      ORDER BY waktu_server DESC LIMIT 1
    `),
    daftar: db.prepare('SELECT * FROM absensi ORDER BY id DESC LIMIT ?'),
    jumlah: db.prepare('SELECT COUNT(*) AS n FROM absensi'),
    hapusSemua: db.prepare('DELETE FROM absensi'),
    ambilPengaturan: db.prepare("SELECT nilai FROM pengaturan WHERE kunci = 'lokasi_kantor'"),
    simpanPengaturan: db.prepare(`
      INSERT INTO pengaturan (kunci, nilai) VALUES ('lokasi_kantor', ?)
      ON CONFLICT (kunci) DO UPDATE SET nilai = excluded.nilai
    `),
  };

  if (!stmt.ambilPengaturan.get()) {
    stmt.simpanPengaturan.run(JSON.stringify(pengaturanAwal));
  }

  return {
    simpanAbsen(r) {
      const hasil = stmt.sisip.run(
        r.id_karyawan, r.nama, r.jenis, r.lat, r.lon, r.akurasi_m, r.jarak_m,
        r.status, r.waktu_server, r.waktu_gps, r.ip, r.perangkat
      );
      return { ...stmt.ambilSatu.get(hasil.lastInsertRowid) };
    },
    absenTerakhir(idKaryawan, jenis) {
      const baris = stmt.terakhir.get(idKaryawan, jenis);
      return baris ? { ...baris } : null;
    },
    daftarAbsen(batas) {
      return stmt.daftar.all(batas).map((b) => ({ ...b }));
    },
    jumlahAbsen() {
      return stmt.jumlah.get().n;
    },
    hapusSemuaAbsen() {
      return Number(stmt.hapusSemua.run().changes);
    },
    ambilPengaturan() {
      return JSON.parse(stmt.ambilPengaturan.get().nilai);
    },
    simpanPengaturan(p) {
      stmt.simpanPengaturan.run(JSON.stringify(p));
      return p;
    },
    tutup() {
      db.close();
    },
  };
}

module.exports = { bukaDatabase };
