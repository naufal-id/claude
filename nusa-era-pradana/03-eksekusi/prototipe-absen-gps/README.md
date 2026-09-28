# Prototipe Absen GPS

Percobaan website absen yang meminta izin lokasi (GPS) di browser, mengirim
koordinat ke server, lalu menyimpannya di database SQLite sementara. Ada dua halaman:

- `/` halaman absen untuk karyawan: login dengan ID dan nama, pilih Masuk atau Pulang, ambil
  lokasi (tampil di peta satelit bersama area kantor), kirim. Logout dari perangkat butuh kode
  6 angka dari admin.
- `/rekap` halaman admin dengan empat tab:
  - **Peta & Data**: peta satelit semua titik absen, geofence kantor yang bisa digeser langsung
    di peta, tabel, unduh CSV, hapus data.
  - **Kode Logout**: kode logout yang sedang diminta karyawan.
  - **Perangkat Login**: siapa login di perangkat mana, dengan tombol paksa logout.
  - **WhatsApp**: status koneksi, QR login, pesan tes, dan riwayat notifikasi.

Server ditulis dengan Node.js. Database memakai modul `node:sqlite` bawaan Node, jadi tidak perlu
memasang MySQL atau PostgreSQL. Tanpa `npm install` semuanya jalan kecuali notifikasi WhatsApp,
yang butuh paket whatsapp-web.js (bagian 8).

Ini alat uji, bukan sistem absen siap pakai. Bagian 11 menjelaskan apa saja yang masih kurang.

---

## 1. Localhost atau harus hosting?

**Bisa dicoba di localhost, tidak wajib hosting.** Tapi ada satu aturan browser yang menentukan
semuanya: Geolocation API hanya jalan di *secure context*, yaitu halaman yang dibuka lewat
`https://`, atau lewat `http://localhost` dan `http://127.0.0.1` (browser menganggap
localhost aman karena lalu lintasnya tidak keluar dari komputer).

Akibatnya:

| Skenario | GPS jalan? | Catatan |
|---|---|---|
| Laptop membuka `http://localhost:3000` | Ya | Lokasi laptop berasal dari Wi-Fi atau IP, bukan GPS. Akurasi puluhan meter sampai beberapa kilometer |
| HP membuka `http://192.168.x.x:3000` (Wi-Fi sama) | **Tidak** | Alamat IP dengan HTTP biasa bukan secure context. Browser memblokir tanpa bertanya |
| HP lewat tunnel HTTPS (cloudflared) | Ya | Cara paling mudah mencoba GPS HP asli. Bagian 4.1 |
| HP Android lewat kabel USB (port forwarding Chrome) | Ya | Tidak butuh internet. Bagian 4.2 |
| HP lewat HTTPS lokal (mkcert) | Ya | Perlu memasang sertifikat di HP. Bagian 4.3 |
| Hosting (VPS atau PaaS) dengan HTTPS | Ya | Untuk uji bersama banyak karyawan selama beberapa hari. Bagian 9 |

Urutan yang disarankan: bangun dan uji alurnya di localhost, pakai tunnel HTTPS untuk mencoba
GPS di HP, lalu hosting kalau percobaan sudah melibatkan banyak orang di lapangan.

Halaman absen memeriksa ini sendiri. Kalau dibuka lewat HTTP biasa di alamat IP, muncul pita
merah "GPS diblokir" dan tombol lokasi dimatikan.

---

## 2. Cara kerjanya

```
 HP / laptop (browser)                         Server Node.js                    SQLite
 ─────────────────────                         ──────────────                    ──────
 1. Tekan "Ambil lokasi saya"
 2. Browser tanya izin lokasi
 3. watchPosition() membaca posisi
    berulang sampai 20 detik, simpan
    bacaan paling akurat
 4. Kirim JSON ───────────────────────────►  5. Validasi isi (tipe, rentang)
    {jenis, lat, lon, akurasi,                6. Ambil ID dan nama dari token sesi,
     waktu_gps} + token sesi login               tolak absen ganda < 60 detik
                                              7. Hitung jarak ke kantor (haversine)
                                              8. Tentukan status               ──► 9. INSERT
                                                 valid / di_luar_area /             ke tabel
                                                 akurasi_rendah                     absensi
 10. Tampilkan status  ◄──────────────────── 11. Balas data yang tersimpan
```

Beberapa keputusan yang disengaja:

- **Status dihitung di server**, bukan di browser. JavaScript di browser bisa diubah pengguna,
  jadi browser hanya menampilkan jarak sebagai perkiraan.
- **Waktu absen memakai jam server** (`waktu_server`). Jam HP bisa diubah. Waktu dari GPS tetap
  disimpan (`waktu_gps`) sebagai pembanding.
- **`maximumAge: 0` dan `enableHighAccuracy: true`**: browser dipaksa membaca posisi baru, bukan
  memakai lokasi lama di cache, dan menyalakan GPS bila ada.
- **`watchPosition` selama maksimal 20 detik**, bukan sekali `getCurrentPosition`. Bacaan pertama
  GPS sering masih kasar (100 m ke atas) lalu makin tajam dalam beberapa detik. Pencarian berhenti
  lebih cepat begitu akurasi mencapai batas yang diatur admin.
- **Lokasi hanya diambil saat tombol ditekan.** Tidak ada pelacakan di latar belakang.

---

## 3. Menjalankan di komputer sendiri

### 3.1 Prasyarat

- **Node.js 22.13 atau lebih baru.** Disarankan versi LTS terbaru dari https://nodejs.org.
  Cek dengan `node --version`. Versi lama belum punya `node:sqlite`.
- Chrome, Edge, Firefox, atau Safari versi baru.

Tidak ada `npm install`. Proyek ini tidak punya dependensi.

### 3.2 Langkah

```bash
cd nusa-era-pradana/03-eksekusi/prototipe-absen-gps

# Salin contoh konfigurasi (boleh dilewati, server punya nilai bawaan)
cp contoh.env .env          # Windows: copy contoh.env .env

npm start
```

Terminal akan menampilkan:

```
Prototipe Absen GPS berjalan
  Halaman absen : http://localhost:3000/
  Halaman rekap : http://localhost:3000/rekap
  Database      : .../prototipe-absen-gps/data/absensi.db
  Kunci admin   : ganti-dengan-kunci-sendiri
  Dari HP (LAN) : http://192.168.1.10:3000/  <- HTTP biasa, browser akan MEMBLOKIR GPS. Baca README bagian 4.
```

Di Windows, saat pertama jalan mungkin muncul dialog Windows Defender Firewall untuk Node.js.
Izinkan untuk jaringan *Private* kalau ingin dibuka dari HP. Kalau hanya localhost, boleh ditolak.

### 3.3 Mencoba

1. Buka `http://localhost:3000`. Pita hijau "Konteks aman" berarti browser boleh meminta lokasi.
2. Login dengan ID karyawan (misal `NEP-0001`) dan nama.
3. Masuk atau Pulang terpilih otomatis sesuai jam. Tekan **Ambil lokasi saya**, lalu pilih
   **Izinkan** di dialog browser.
4. Tunggu sampai muncul "Lokasi terkunci". Titik biru di peta satelit adalah posisimu, lingkaran
   hijau putus putus adalah area kantor.
5. Tekan **Kirim absen**. Kotak hasil menampilkan nomor absen dan statusnya.
6. Buka `http://localhost:3000/rekap`, masukkan kunci admin dari terminal.
7. Coba logout: di halaman absen tekan **Logout**, lalu ambil kodenya dari tab **Kode Logout**
   di halaman rekap dan ketik di HP.

**Absen dari rumah pasti berstatus "di luar area"**, karena lokasi kantor bawaan adalah contoh
(Lapangan Merdeka, Medan). Supaya bisa menguji status "valid": di halaman rekap geser penanda
kantor ke tempatmu, atau tekan **Pakai lokasi saya**, lalu **Simpan lokasi kantor**. Absen
berikutnya dari tempat yang sama akan masuk radius.

Di laptop, akurasi sering ratusan meter atau lebih sehingga statusnya "akurasi rendah". Itu normal
(lihat bagian 11.3). Untuk uji di laptop, naikkan **Batas akurasi** di halaman rekap, misal ke 2000 m.

### 3.4 Memalsukan lokasi untuk pengujian (tanpa pindah tempat)

Chrome dan Edge punya simulator lokasi:

1. Buka halaman absen, tekan `F12` untuk DevTools.
2. Tekan `Ctrl+Shift+P` (macOS `Cmd+Shift+P`), ketik **Show Sensors**, Enter.
3. Di bagian **Location**, pilih kota yang tersedia atau **Other...** lalu isi lintang dan bujur sendiri.
4. Tekan **Ambil lokasi saya** lagi.

Dengan cara ini kamu bisa mencoba titik di dalam dan di luar radius. Cara yang sama bisa dipakai
orang untuk curang, dan itu dibahas di bagian 11.1.

### 3.5 Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm start` | Jalankan server |
| `npm run dev` | Jalankan server dan mulai ulang otomatis saat berkas diubah |
| `npm test` | Jalankan tes otomatis (hitung jarak, validasi, API, login/logout, WhatsApp tiruan) |
| `npm install` | Hanya perlu untuk notifikasi WhatsApp (bagian 8) |

---

## 4. Mencoba dengan GPS HP asli

Pilih salah satu. Cara 4.1 paling mudah.

### 4.1 Tunnel HTTPS dengan cloudflared (disarankan)

Tunnel membuat alamat `https://` publik yang diteruskan ke `localhost:3000` di laptop.
Quick tunnel Cloudflare tidak butuh akun.

1. Pasang cloudflared:
   - Windows: `winget install --id Cloudflare.cloudflared`
   - macOS: `brew install cloudflared`
   - Linux: unduh paket dari https://github.com/cloudflare/cloudflared/releases
2. Di `.env`, aktifkan `TRUST_PROXY=1` supaya IP yang tercatat adalah IP HP, bukan IP tunnel.
   Jalankan ulang `npm start`.
3. Di terminal kedua:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. Terminal menampilkan alamat seperti `https://kata-acak-lagi.trycloudflare.com`.
   Buka alamat itu di HP.

Hati hati: alamat itu publik. Siapa pun yang tahu tautannya bisa membuka halaman absen.
Halaman rekap tetap dilindungi kunci admin, jadi isi `KUNCI_ADMIN` dengan kunci yang tidak mudah
ditebak. Matikan tunnel (`Ctrl+C`) setelah selesai mencoba.

Alternatif lain yang cara kerjanya sama: `ngrok http 3000` (perlu akun gratis dan authtoken),
atau panel **Ports** di VS Code (Forward a Port, lalu ubah visibilitas ke Public).

### 4.2 HP Android lewat kabel USB (tanpa internet)

Chrome bisa meneruskan `localhost:3000` di HP ke `localhost:3000` di laptop. Karena di HP
alamatnya tetap `localhost`, browser menganggapnya aman.

1. Di HP: aktifkan **Opsi pengembang** (ketuk **Nomor build** 7 kali di Setelan, Tentang ponsel),
   lalu nyalakan **Debugging USB**.
2. Sambungkan HP ke laptop dengan kabel, izinkan debugging saat ditanya.
3. Di Chrome laptop, buka `chrome://inspect/#devices`.
4. Klik **Port forwarding...**, isi port `3000` dan alamat `localhost:3000`, centang
   **Enable port forwarding**, klik **Done**.
5. Di Chrome HP, buka `http://localhost:3000`.

### 4.3 HTTPS lokal dengan mkcert (Wi-Fi yang sama)

Server bisa langsung melayani HTTPS kalau diberi sertifikat. mkcert membuat sertifikat yang
dipercaya perangkatmu sendiri.

1. Pasang mkcert (https://github.com/FiloSottile/mkcert), lalu:
   ```bash
   mkcert -install
   mkdir sertifikat
   mkcert -key-file sertifikat/kunci.pem -cert-file sertifikat/sertifikat.pem \
     localhost 127.0.0.1 192.168.1.10
   ```
   Ganti `192.168.1.10` dengan IP laptop yang tampil di terminal saat `npm start`.
2. Di `.env`, aktifkan:
   ```
   SSL_KEY=./sertifikat/kunci.pem
   SSL_CERT=./sertifikat/sertifikat.pem
   ```
3. `npm start`, lalu buka `https://192.168.1.10:3000` di HP.
4. HP harus memercayai CA milik mkcert. Lokasi berkasnya: `mkcert -CAROOT`, ambil `rootCA.pem`.
   - Android: salin ke HP, lalu Setelan, Keamanan, Enkripsi & kredensial, Instal sertifikat,
     Sertifikat CA. Nama menu berbeda sedikit antar merek.
   - iPhone: kirim berkasnya ke HP dan pasang sebagai profil, lalu Pengaturan, Umum, Mengenai,
     Pengaturan Kepercayaan Sertifikat, aktifkan sertifikat mkcert.

Folder `sertifikat/` dan berkas `*.pem` sudah masuk `.gitignore`. Jangan pernah membagikan
`rootCA-key.pem`.

### 4.4 Jalan pintas khusus uji: flag Chrome

Di Chrome HP, buka `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, isi
`http://192.168.1.10:3000`, pilih **Enabled**, lalu **Relaunch**. Chrome akan menganggap alamat
itu aman. Hanya untuk perangkatmu sendiri, bukan solusi untuk karyawan.

### 4.5 Izin lokasi di HP

Kalau akurasi di HP tetap ratusan meter sampai kilometer, hampir selalu karena lokasi presisi
dimatikan.

- **Android**: lokasi perangkat harus menyala. Di Setelan, Aplikasi, Chrome, Izin, Lokasi: pilih
  **Izinkan hanya saat aplikasi digunakan** dan nyalakan **Gunakan lokasi akurat**. Kalau di dialog
  izin dipilih "Perkiraan", posisi hanya akurat sekitar beberapa kilometer.
- **iPhone**: Pengaturan, Privasi & Keamanan, Layanan Lokasi harus menyala. Di **Situs Web Safari**,
  pilih **Saat App Digunakan** dan nyalakan **Lokasi Akurat**.
- Kalau pernah menekan **Blokir**: ketuk ikon gembok atau pengaturan situs di address bar, ubah
  Lokasi menjadi Izinkan, lalu muat ulang halaman.

---

## 5. Database sementara

Data disimpan di berkas SQLite `data/absensi.db`. Berkas dan foldernya dibuat otomatis saat
server pertama kali jalan, dan sudah masuk `.gitignore` sehingga tidak ikut ter-commit.

| Ingin | Caranya |
|---|---|
| Mengosongkan data absen | Tombol **Hapus semua data** di `/rekap` |
| Mulai dari nol, termasuk pengaturan kantor | Matikan server, hapus folder `data/`, jalankan lagi |
| Database yang hilang sendiri saat server mati | Isi `DB_FILE=:memory:` di `.env` |
| Melihat isi database langsung | `sqlite3 data/absensi.db "SELECT * FROM absensi;"` atau aplikasi DB Browser for SQLite |
| Membuka di Excel | Tombol **Unduh CSV** di `/rekap` |

Kenapa SQLite: satu berkas, tanpa server database, tanpa instalasi. Perintah SQL-nya hampir sama
dengan PostgreSQL atau MySQL, jadi saat pindah ke database sungguhan yang berubah hanya `lib/db.js`.

### Struktur tabel `absensi`

| Kolom | Isi |
|---|---|
| `id` | Nomor urut otomatis |
| `id_karyawan` | ID yang diketik, disimpan huruf besar |
| `nama` | Nama, spasi berlebih dirapikan |
| `jenis` | `masuk` atau `pulang` |
| `lat`, `lon` | Koordinat dari browser (derajat desimal, WGS84) |
| `akurasi_m` | Radius ketidakpastian yang dilaporkan browser, dalam meter |
| `jarak_m` | Jarak ke titik kantor, dihitung server |
| `status` | `valid`, `di_luar_area`, atau `akurasi_rendah` |
| `waktu_server` | Waktu diterima server (UTC, format ISO). Ini waktu absen resmi |
| `waktu_gps` | Waktu bacaan GPS menurut perangkat |
| `ip` | Alamat IP pengirim |
| `perangkat` | User-Agent browser (dipotong 200 karakter) |

Tabel `pengaturan` menyimpan satu baris JSON berisi nama lokasi, lintang, bujur, radius, dan
batas akurasi kantor.

---

## 6. Peta satelit

Peta memakai [Leaflet](https://leafletjs.com) yang disimpan di `public/vendor/leaflet/` (tidak
lewat CDN). Gambar peta diambil saat halaman dibuka, jadi **peta butuh internet**. Absen tetap
bisa dikirim walau gambar peta gagal dimuat.

| Pilihan lapisan | Sumber | Kegunaan |
|---|---|---|
| Satelit + label (bawaan) | Esri World Imagery + label jalan dan nama tempat Esri | Paling mudah untuk mengenali gedung dan jalan |
| Satelit polos | Esri World Imagery | Melihat atap gedung dan halaman tanpa tulisan |
| Peta jalan | OpenStreetMap | Kalau citra satelit di daerah itu kabur atau lama |

Ganti lapisan lewat tombol tumpukan di pojok kanan atas peta. Di halaman rekap, tombol yang sama
juga bisa menyembunyikan titik per status (Valid, Di luar area, Akurasi rendah) dan lingkar akurasi.

**Halaman absen** menampilkan titik biru (posisi karyawan), lingkaran biru tipis (radius akurasi
GPS), kotak gelap (kantor), dan lingkaran hijau putus putus (area absen).

**Halaman rekap, tab Peta & Data:**

- Setiap absen jadi titik berwarna sesuai status. Klik titik untuk detail dan tautan Google Maps.
- Klik baris di tabel untuk terbang ke titiknya.
- **Mengatur geofence langsung di peta**: geser kotak kantor, atau tekan **Pilih titik di peta**
  lalu klik lokasinya. Ubah radius di formulir dan lingkarannya ikut berubah. Tidak ada yang
  tersimpan sebelum **Simpan lokasi kantor** ditekan, dan **Batalkan perubahan** mengembalikan
  posisi lama.

Catatan penggunaan: citra Esri dipakai tanpa kunci API dan wajib mencantumkan atribusi (sudah
tampil di pojok kanan bawah peta). Untuk pemakaian produksi dengan banyak pengguna, daftarkan akun
ArcGIS atau pakai penyedia citra berbayar, dan baca syarat penggunaan penyedianya.

Server ubin yang diizinkan diatur di `Content-Security-Policy` (`img-src`) dalam `server.js`.
Kalau mengganti penyedia peta, tambahkan domainnya di sana, kalau tidak gambarnya diblokir browser.

---

## 7. Login dan logout dengan kode admin

Tujuannya mencegah satu HP dipakai bergantian untuk absen atas nama beberapa orang (titip absen).

1. Karyawan login dengan ID dan nama. Server membuat token sesi acak yang disimpan di browser HP.
   Selama token itu ada, halaman absen tidak menampilkan formulir login lagi, dan server menolak
   login kedua dari browser yang sama (`409`).
2. Absen memakai identitas dari sesi. ID dan nama yang dikirim di body diabaikan.
3. Karyawan menekan **Logout**. Server membuat kode 6 angka, berlaku 10 menit. Kode itu **tidak**
   dikirim ke HP karyawan. Kode hanya tampil di tab **Kode Logout** halaman rekap (dengan hitung
   mundur dan angka merah di judul tab), dan dikirim ke WhatsApp admin kalau aktif.
4. Karyawan meminta kode ke admin, lalu mengetiknya. Kode benar mengakhiri sesi. Lima kali salah
   membuat kode terkunci, dan karyawan harus menekan Logout lagi untuk kode baru.
5. Admin bisa memaksa logout dari tab **Perangkat Login**, misalnya kalau HP karyawan hilang.
   Tab itu juga menandai ID yang login di lebih dari satu perangkat.

Batasnya: sesi disimpan di `localStorage` browser. Karyawan yang menghapus data situs atau memakai
mode penyamaran bisa login ulang tanpa kode. Tab **Perangkat Login** akan menampilkan dua perangkat
untuk ID yang sama, jadi admin tetap bisa melihatnya. Mengikat akun ke satu perangkat secara ketat
butuh aplikasi native atau login dengan kata sandi per karyawan.

---

## 8. Notifikasi WhatsApp (whatsapp-web.js)

Server bisa mengirim WhatsApp ke admin untuk setiap absen dan setiap permintaan kode logout.
Caranya memakai [whatsapp-web.js](https://wwebjs.dev): server membuka WhatsApp Web di Chromium
tersembunyi, lalu login dengan memindai QR, sama seperti menautkan WhatsApp Web di laptop.

Contoh pesan absen:

```
✅ Absen MASUK
NEP-0001 · Budi Santoso
Status: Valid, di dalam area
Jarak ke Kantor contoh (Lapangan Merdeka, Medan): 31 m (radius 100 m)
Akurasi GPS: ±12 m
Waktu: 28 Sep 2026, 10.35 WIB
Peta: https://www.google.com/maps?q=3.5908,98.6781
```

Contoh pesan kode logout:

```
🔑 Permintaan logout
NEP-0001 · Budi Santoso
Kode: 298843
Berlaku sampai 28 Sep 2026, 11.30 WIB.
```

### 8.1 Menyalakan

1. Pasang paketnya (sekali saja, sekitar 200 MB karena ikut mengunduh Chromium):
   ```bash
   npm install
   ```
2. Di `.env`:
   ```
   WA_AKTIF=1
   WA_NOMOR_ADMIN=081234567890
   WA_NOTIF_ABSEN=semua
   ```
   `WA_NOMOR_ADMIN` boleh lebih dari satu, pisahkan dengan koma. Format `08xx` otomatis diubah ke
   `628xx`. `WA_NOTIF_ABSEN=bermasalah` hanya mengirim absen di luar area atau akurasi rendah.
3. `npm start`. QR muncul di terminal dan di tab **WhatsApp** halaman rekap.
4. Di HP yang nomornya akan jadi pengirim: WhatsApp, Setelan, **Perangkat tertaut**, **Tautkan
   perangkat**, lalu pindai QR.
5. Status berubah menjadi **Terhubung**. Tekan **Kirim pesan tes** untuk mencoba.

Login tersimpan di `data/wa-sesi/`, jadi QR hanya perlu dipindai sekali. Hapus folder itu untuk
mengganti nomor pengirim.

### 8.2 Yang perlu diketahui

- **whatsapp-web.js bukan API resmi WhatsApp.** Pemakaiannya melanggar ketentuan WhatsApp, dan
  nomor bisa diblokir, terutama kalau mengirim banyak pesan. Pakai nomor khusus atau cadangan,
  jangan nomor pribadi atau nomor utama kantor. Untuk produksi, gunakan WhatsApp Business Platform
  (Cloud API) resmi dari Meta atau penyedia resminya.
- Notifikasi dikirim di latar belakang. Kalau WhatsApp belum siap atau gagal, absen tetap tersimpan
  dan kegagalannya tercatat di riwayat pada tab WhatsApp.
- Server harus tetap menyala supaya WhatsApp tetap terhubung.
- WhatsApp Web kadang berubah dan membuat whatsapp-web.js berhenti bekerja sampai paketnya
  diperbarui. Coba `npm update whatsapp-web.js` kalau tiba tiba gagal.
- Kalau Chromium bawaan bermasalah (sering terjadi di Windows dengan antivirus), isi
  `WA_CHROME_PATH` dengan lokasi Chrome yang sudah terpasang.

---

## 9. API

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `GET /api/status` | Publik | Cek server hidup |
| `GET /api/pengaturan` | Publik | Lokasi kantor, radius, batas akurasi |
| `POST /api/sesi` | Publik | Login karyawan, balas `token` |
| `GET /api/sesi` | Karyawan | Data sesi dan status permintaan logout |
| `POST /api/absen` | Karyawan | Simpan absen |
| `POST /api/sesi/logout` | Karyawan | Minta kode logout (kode dikirim ke admin, bukan ke karyawan) |
| `POST /api/sesi/logout/konfirmasi` | Karyawan | Kirim kode `{ "kode": "123456" }` untuk logout |
| `GET /api/absen?batas=200` | Admin | Daftar absen terbaru |
| `GET /api/absen.csv` | Admin | Semua absen dalam CSV |
| `DELETE /api/absen` | Admin | Hapus semua absen |
| `PUT /api/pengaturan` | Admin | Ubah lokasi kantor |
| `GET /api/admin/logout` | Admin | Kode logout yang menunggu dan riwayatnya |
| `GET /api/admin/sesi` | Admin | Perangkat yang sedang login |
| `DELETE /api/admin/sesi?token=...` | Admin | Paksa logout |
| `GET /api/admin/wa` | Admin | Status WhatsApp dan QR |
| `POST /api/admin/wa/tes` | Admin | Kirim pesan tes ke nomor admin |

Rute karyawan butuh header `X-Token-Sesi`, rute admin butuh header `X-Kunci-Admin`.

Contoh login lalu absen tanpa browser:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/sesi \
  -H "Content-Type: application/json" \
  -d '{"id_karyawan":"NEP-0001","nama":"Budi"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')

curl -X POST http://localhost:3000/api/absen \
  -H "Content-Type: application/json" -H "X-Token-Sesi: $TOKEN" \
  -d '{"jenis":"masuk","lat":3.5908,"lon":98.6781,"akurasi":12}'
```

Balasan `201` berisi data yang tersimpan beserta `status` dan `jarak_m`. Kode lain:
`422` isi tidak valid (daftar kesalahan ada di `galat`), `409` absen ganda atau sudah login,
`415` bukan JSON, `413` body lebih dari 10 KB, `401` belum login atau kunci admin salah,
`403` kode logout salah, `410` kode kedaluwarsa, `429` kode salah 5 kali.

Contoh di atas sekaligus menunjukkan kelemahan terbesar absen berbasis web: koordinat datang
dari klien, jadi siapa pun yang punya token bisa mengirim angka apa saja. Lihat bagian 11.1.

---

## 10. Konfigurasi

Semua diatur lewat `.env` (salin dari `contoh.env`). Semuanya opsional.

| Variabel | Bawaan | Fungsi |
|---|---|---|
| `PORT` | `3000` | Port server |
| `HOST` | `0.0.0.0` | `0.0.0.0` bisa diakses perangkat lain di jaringan. `127.0.0.1` hanya dari laptop ini |
| `DB_FILE` | `data/absensi.db` | Lokasi berkas database, atau `:memory:` |
| `KUNCI_ADMIN` | acak | Kunci halaman rekap. Kalau kosong, dibuat acak dan berganti tiap server dijalankan ulang |
| `KANTOR_NAMA`, `KANTOR_LAT`, `KANTOR_LON` | Lapangan Merdeka, Medan | Titik kantor awal. Hanya dipakai saat database baru dibuat |
| `KANTOR_RADIUS_M` | `100` | Radius geofence awal |
| `BATAS_AKURASI_M` | `50` | Akurasi terburuk yang masih diterima sebagai valid |
| `JEDA_ABSEN_GANDA_DETIK` | `60` | Jeda minimal absen jenis sama oleh ID yang sama |
| `TRUST_PROXY` | kosong | Isi `1` kalau di belakang tunnel atau reverse proxy |
| `SSL_KEY`, `SSL_CERT` | kosong | Jalur berkas sertifikat untuk HTTPS langsung |
| `WA_AKTIF` | `0` | `1` untuk menyalakan notifikasi WhatsApp |
| `WA_NOMOR_ADMIN` | kosong | Nomor penerima, pisahkan dengan koma. ID grup `...@g.us` juga bisa |
| `WA_NOTIF_ABSEN` | `semua` | `semua`, `bermasalah`, atau `mati`. Kode logout selalu dikirim |
| `WA_FOLDER_SESI` | `data/wa-sesi` | Tempat menyimpan login WhatsApp |
| `WA_CHROME_PATH` | kosong | Lokasi Chrome kalau Chromium bawaan bermasalah |

Setelah database terbentuk, lokasi kantor diubah lewat halaman `/rekap`, bukan lewat `.env`.

---

## 11. Batasan (baca sebelum dipakai sungguhan)

### 11.1 Lokasi bisa dipalsukan

Browser tidak bisa membuktikan bahwa koordinat itu asli. Cara curang yang umum:

- Aplikasi Fake GPS di Android dengan fitur *mock location*.
- Simulator lokasi DevTools (bagian 3.4).
- Mengirim request langsung dengan curl atau Postman memakai token yang sah.

Prototipe ini tidak mencegah semua itu. Langkah yang biasa ditumpuk di sistem absen sungguhan:

| Langkah | Menutup celah |
|---|---|
| Login dengan kata sandi per karyawan, bukan ID yang diketik bebas | Absen atas nama orang lain |
| Foto selfie saat absen, dicocokkan dengan wajah terdaftar | Titip absen |
| QR code berganti tiap beberapa detik yang ditampilkan di layar kantor | Absen tanpa hadir fisik |
| Cek jaringan: IP publik atau nama Wi-Fi kantor | Absen dari luar kantor |
| Cek kewajaran: dua absen berjarak jauh dalam waktu singkat | Lompatan lokasi palsu |
| Aplikasi native Android dengan deteksi mock location (`Location.isMock()`) dan Play Integrity | Fake GPS |

Untuk pekerja lapangan alih daya yang lokasinya berpindah, kombinasi login, selfie, dan GPS
biasanya cukup sebagai langkah pertama. Deteksi Fake GPS yang andal hanya mungkin lewat aplikasi
native, bukan website.

### 11.2 Login masih sederhana

Login hanya memakai ID dan nama tanpa kata sandi, jadi siapa pun yang tahu ID karyawan bisa login
di perangkat baru. Kode logout mencegah pergantian akun di perangkat yang sama, bukan pemalsuan
identitas (lihat bagian 7). Kunci admin juga hanya satu kunci bersama. Sistem sungguhan butuh akun
dengan kata sandi per karyawan dan per admin.

### 11.3 Akurasi

| Perangkat dan tempat | Akurasi wajar |
|---|---|
| HP, luar ruangan, langit terbuka | 3 sampai 10 m |
| HP, dalam gedung | 10 sampai 50 m, kadang lebih |
| Laptop atau PC (Wi-Fi) | 20 m sampai beberapa km |
| Laptop tanpa Wi-Fi (hanya IP) | Bisa meleset ke kota lain |
| HP dengan lokasi "perkiraan" | Sekitar beberapa km |

Karena itu radius kantor sebaiknya 50 sampai 150 m, bukan 10 m. Di dalam gedung GPS memantul dan
posisi bisa bergeser puluhan meter walau orangnya diam. Peta satelit di halaman rekap membantu
melihat pola ini: titik yang berkumpul di satu sisi gedung biasanya tanda pantulan sinyal.

Aturan status yang dipakai (`lib/geo.js`):

1. Akurasi lebih buruk dari batas: `akurasi_rendah`.
2. Kalau akurasi cukup tapi jarak ke kantor lebih dari radius: `di_luar_area`.
3. Selain itu: `valid`.

Absen tetap disimpan apa pun statusnya, supaya admin bisa menilai sendiri. Tidak ada absen yang
ditolak hanya karena lokasinya, yang ditolak hanya data rusak dan absen ganda.

### 11.4 Data pribadi

Lokasi seseorang termasuk data pribadi menurut UU No. 27 Tahun 2022 tentang Pelindungan Data
Pribadi. Sebelum uji dengan karyawan sungguhan: beri tahu tujuan pengumpulan, siapa yang bisa
melihat, dan berapa lama data disimpan. Prototipe ini sudah membatasi pengambilan lokasi hanya
saat tombol ditekan, dan halaman absen menampilkan pemberitahuan singkat di bawah formulir.
Notifikasi WhatsApp ikut membawa nama dan lokasi karyawan ke HP admin, jadi batasi nomor
penerimanya. Hapus data uji setelah percobaan selesai.

---

## 12. Kalau naik ke hosting

| Jenis | Cocok? | Catatan |
|---|---|---|
| VPS (server virtual) | Ya | Kode ini jalan apa adanya, termasuk WhatsApp. Pasang Caddy atau Nginx di depan untuk HTTPS (Let's Encrypt), jalankan Node dengan systemd atau pm2, isi `TRUST_PROXY=1` |
| PaaS (Render, Railway, Fly.io, dan sejenisnya) | Ya, dengan syarat | Pastikan paket yang dipakai punya disk persisten dan `DB_FILE` serta `WA_FOLDER_SESI` diarahkan ke sana. Tanpa disk persisten, database dan login WhatsApp hilang tiap deploy atau restart |
| Serverless (Vercel, Netlify) | Tidak langsung | Tidak ada server yang terus jalan dan tidak ada disk permanen, jadi whatsapp-web.js tidak bisa jalan. Perlu ditulis ulang menjadi fungsi, memakai database terkelola, dan WhatsApp Cloud API resmi |

Sebelum dibuka ke banyak orang:

- HTTPS wajib, kalau tidak GPS tidak akan jalan.
- `KUNCI_ADMIN` diisi kunci panjang dan acak.
- Backup berkas database secara berkala.
- Tambahkan pembatas jumlah request per IP.

---

## 13. Struktur berkas

```
prototipe-absen-gps/
├── server.js             Server HTTP: rute halaman, API, sesi, header keamanan, HTTPS opsional
├── lib/
│   ├── db.js             Skema dan query SQLite (absensi, pengaturan, sesi, permintaan_logout)
│   ├── geo.js            Rumus jarak haversine dan aturan status
│   ├── validasi.js       Validasi login, absen, dan pengaturan
│   └── wa.js             Notifikasi WhatsApp lewat whatsapp-web.js (opsional)
├── public/
│   ├── index.html        Halaman absen
│   ├── rekap.html        Halaman admin (empat tab)
│   ├── css/gaya.css      Gaya bersama (palet 1c proyek NEP, font sistem)
│   ├── js/
│   │   ├── peta.js       Lapisan peta satelit/jalan, penanda, lingkaran geofence
│   │   ├── absen.js      Login, logout dengan kode, izin lokasi, kirim absen
│   │   └── rekap.js      Tab rekap, peta titik absen, edit geofence, kode logout, WhatsApp
│   └── vendor/leaflet/   Leaflet 1.9.4 (lisensi BSD-2, lihat LICENSE di folder itu)
├── test/                 Tes otomatis (node:test)
├── contoh.env            Contoh konfigurasi
└── data/                 Database dan login WhatsApp, dibuat otomatis, tidak ikut commit
```

Semua skrip dan gaya disajikan dari server sendiri. Yang diambil dari internet hanya gambar peta
(Esri dan OpenStreetMap), dan tautan "Buka di Google Maps" di halaman rekap.

---

## 14. Masalah yang sering muncul

| Gejala | Penyebab dan solusi |
|---|---|
| `Modul node:sqlite tidak tersedia` | Node terlalu lama. Pasang Node LTS terbaru |
| Pita merah "GPS diblokir" dan tombol abu abu | Halaman dibuka lewat HTTP di alamat IP. Pakai localhost, tunnel, atau HTTPS (bagian 4) |
| "Izin lokasi ditolak" | Pernah menekan Blokir. Buka pengaturan situs di address bar, ubah Lokasi ke Izinkan, muat ulang |
| Akurasi selalu ratusan meter atau lebih | Wajar di laptop. Di HP, nyalakan lokasi akurat (bagian 4.5) |
| "Waktu habis sebelum lokasi didapat" | Sinyal GPS lemah di dalam ruangan. Coba dekat jendela atau di luar |
| Peta abu abu tanpa gambar | Tidak ada internet, atau jaringan kantor memblokir `server.arcgisonline.com`. Coba lapisan "Peta jalan" |
| Citra satelit bertulisan "Map data not yet available" | Zoom terlalu dekat untuk daerah itu. Perkecil zoom |
| Semua absen "di luar area" | Titik kantor masih contoh. Geser penanda kantor di tab Peta & Data, lalu simpan |
| Karyawan tidak bisa logout karena kode hilang | Admin buka tab Kode Logout. Kalau sudah kedaluwarsa, karyawan tekan Logout lagi. Atau admin pakai Paksa logout |
| Tab WhatsApp: "Paket belum dipasang" | Jalankan `npm install`, lalu jalankan ulang server |
| QR WhatsApp tidak muncul, status "Gagal" | Baca pesan di tab WhatsApp. Coba isi `WA_CHROME_PATH`, atau hapus `data/wa-sesi/` lalu jalankan ulang |
| Pesan WA tidak sampai | Cek riwayat di tab WhatsApp. Nomor harus terdaftar di WhatsApp dan ditulis lengkap |
| Kunci admin tidak diterima setelah server dijalankan ulang | Kunci acak berganti. Isi `KUNCI_ADMIN` di `.env` |
| `EADDRINUSE` | Port 3000 dipakai program lain. Isi `PORT=3001` |
| HP tidak bisa membuka alamat LAN sama sekali | Firewall laptop memblokir, atau Wi-Fi tamu memisahkan perangkat. Pakai tunnel |
| Kolom CSV menyatu di Excel | Buka lewat Data, From Text/CSV, pilih pemisah koma |

---

## 15. Yang sudah diuji

- `npm test`: 26 tes lulus. Mencakup rumus jarak, tiga jenis status, validasi, login, absen
  dengan identitas dari sesi, logout dengan kode (salah, benar, terkunci setelah 5 kali salah,
  kode tidak bocor ke karyawan), paksa logout, notifikasi WhatsApp dengan klien tiruan (termasuk
  mode "bermasalah"), CSV, perubahan lokasi kantor, dan upaya membaca berkas di luar `public`.
- Chromium lewat Playwright dengan lokasi tiruan: login, peta di halaman absen, absen valid dan di
  luar area, minta kode logout, kode tampil di tab admin, kode salah lalu benar, klik baris tabel
  membuka popup di peta, memindah kantor dengan klik peta lalu membatalkan, tab perangkat dan
  WhatsApp. Lebar 390 px dan 1366 px tanpa scroll horizontal, tanpa galat di konsol.
- Paket whatsapp-web.js 1.34.7 asli terpasang dan server berhasil menjalankannya sampai membuka
  Chromium.

Belum diuji:

- **Citra satelit.** Jaringan tempat pengujian memblokir server ubin, jadi yang diuji adalah
  permintaan ubinnya (alamat dan izin CSP benar), bukan gambarnya.
- **Login WhatsApp dan pengiriman pesan sungguhan.** Jaringan pengujian memblokir
  `web.whatsapp.com`. Coba di komputer sendiri dengan langkah bagian 8.1.
- **HP fisik.** Coba dengan cara di bagian 4.

## 16. Langkah berikutnya

1. Uji di HP fisik lewat tunnel, di dalam dan di luar gedung, catat akurasi yang didapat.
2. Tentukan radius dan batas akurasi dari hasil uji itu, dengan bantuan peta satelit.
3. Ganti login ID dan nama dengan kata sandi per karyawan, dan akun per admin.
4. Tambah foto selfie saat absen.
5. Kalau WhatsApp akan dipakai sungguhan, pindah ke WhatsApp Cloud API resmi.
6. Putuskan: tetap website, atau aplikasi Android bila deteksi Fake GPS dibutuhkan.
