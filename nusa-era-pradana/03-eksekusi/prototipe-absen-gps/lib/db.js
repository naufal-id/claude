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
  -- Satu baris = satu perangkat yang sedang login sebagai karyawan.
  CREATE TABLE IF NOT EXISTS sesi (
    token        TEXT PRIMARY KEY,
    id_karyawan  TEXT NOT NULL,
    nama         TEXT NOT NULL,
    dibuat       TEXT NOT NULL,
    perangkat    TEXT,
    ip           TEXT
  );
  -- Logout karyawan butuh kode yang hanya dilihat admin.
  CREATE TABLE IF NOT EXISTS permintaan_logout (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    token_sesi   TEXT    NOT NULL,
    id_karyawan  TEXT    NOT NULL,
    nama         TEXT    NOT NULL,
    kode         TEXT    NOT NULL,
    dibuat       TEXT    NOT NULL,
    kedaluwarsa  TEXT    NOT NULL,
    percobaan    INTEGER NOT NULL DEFAULT 0,
    status       TEXT    NOT NULL DEFAULT 'menunggu'
  );
  CREATE INDEX IF NOT EXISTS idx_logout_sesi ON permintaan_logout (token_sesi, status);
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
    sisipSesi: db.prepare(
      'INSERT INTO sesi (token, id_karyawan, nama, dibuat, perangkat, ip) VALUES (?, ?, ?, ?, ?, ?)'
    ),
    ambilSesi: db.prepare('SELECT * FROM sesi WHERE token = ?'),
    daftarSesi: db.prepare('SELECT * FROM sesi ORDER BY dibuat DESC'),
    hapusSesi: db.prepare('DELETE FROM sesi WHERE token = ?'),
    batalkanLogoutLama: db.prepare(
      "UPDATE permintaan_logout SET status = 'diganti' WHERE token_sesi = ? AND status = 'menunggu'"
    ),
    sisipLogout: db.prepare(`
      INSERT INTO permintaan_logout (token_sesi, id_karyawan, nama, kode, dibuat, kedaluwarsa)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    ambilLogout: db.prepare('SELECT * FROM permintaan_logout WHERE id = ?'),
    logoutAktif: db.prepare(`
      SELECT * FROM permintaan_logout
      WHERE token_sesi = ? AND status = 'menunggu'
      ORDER BY id DESC LIMIT 1
    `),
    tambahPercobaan: db.prepare('UPDATE permintaan_logout SET percobaan = percobaan + 1 WHERE id = ?'),
    ubahStatusLogout: db.prepare('UPDATE permintaan_logout SET status = ? WHERE id = ?'),
    daftarLogout: db.prepare('SELECT * FROM permintaan_logout ORDER BY id DESC LIMIT ?'),
  };

  const salin = (baris) => (baris ? { ...baris } : null);

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
    buatSesi(s) {
      stmt.sisipSesi.run(s.token, s.id_karyawan, s.nama, s.dibuat, s.perangkat, s.ip);
      return salin(stmt.ambilSesi.get(s.token));
    },
    ambilSesi(token) {
      return salin(stmt.ambilSesi.get(token));
    },
    daftarSesi() {
      return stmt.daftarSesi.all().map(salin);
    },
    hapusSesi(token) {
      return Number(stmt.hapusSesi.run(token).changes);
    },
    buatPermintaanLogout(p) {
      stmt.batalkanLogoutLama.run(p.token_sesi);
      const hasil = stmt.sisipLogout.run(
        p.token_sesi, p.id_karyawan, p.nama, p.kode, p.dibuat, p.kedaluwarsa
      );
      return salin(stmt.ambilLogout.get(hasil.lastInsertRowid));
    },
    permintaanLogoutAktif(token) {
      return salin(stmt.logoutAktif.get(token));
    },
    tambahPercobaanLogout(id) {
      stmt.tambahPercobaan.run(id);
      return salin(stmt.ambilLogout.get(id));
    },
    ubahStatusLogout(id, status) {
      stmt.ubahStatusLogout.run(status, id);
    },
    daftarPermintaanLogout(batas) {
      return stmt.daftarLogout.all(batas).map(salin);
    },
    tutup() {
      db.close();
    },
  };
}

module.exports = { bukaDatabase };
