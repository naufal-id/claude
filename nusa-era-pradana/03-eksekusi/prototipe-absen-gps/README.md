# Prototipe Absen GPS

Percobaan website absen yang meminta izin lokasi (GPS) di browser, mengirim
koordinat ke server, lalu menyimpannya di database SQLite sementara. Ada dua halaman:

- `/` halaman absen untuk karyawan: isi ID dan nama, pilih Masuk atau Pulang, ambil lokasi, kirim.
- `/rekap` halaman admin: tabel absen, sebaran titik terhadap kantor, pengaturan lokasi kantor
  (geofence), unduh CSV, dan hapus data.

Server ditulis dengan Node.js tanpa satu pun dependensi npm. Database memakai modul
`node:sqlite` bawaan Node, jadi tidak perlu memasang MySQL atau PostgreSQL untuk mencoba.

Ini alat uji, bukan sistem absen siap pakai. Bagian 8 menjelaskan apa saja yang masih kurang.

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
    {id_karyawan, nama, jenis,                6. Tolak absen ganda < 60 detik
     lat, lon, akurasi, waktu_gps}            7. Hitung jarak ke kantor (haversine)
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
2. Isi ID karyawan (misal `NEP-0001`) dan nama. Masuk atau Pulang terpilih otomatis sesuai jam.
3. Tekan **Ambil lokasi saya**, lalu pilih **Izinkan** di dialog browser.
4. Tunggu sampai muncul "Lokasi terkunci". Lintang, bujur, akurasi, dan jarak ke kantor tampil.
5. Tekan **Kirim absen**. Kotak hasil menampilkan nomor absen dan statusnya.
6. Buka `http://localhost:3000/rekap`, masukkan kunci admin dari terminal.

**Absen dari rumah pasti berstatus "di luar area"**, karena lokasi kantor bawaan adalah contoh
(Lapangan Merdeka, Medan). Supaya bisa menguji status "valid": di halaman rekap tekan
**Pakai lokasi saya sekarang**, lalu **Simpan lokasi kantor**. Absen berikutnya dari tempat yang
sama akan masuk radius.

Di laptop, akurasi sering ratusan meter atau lebih sehingga statusnya "akurasi rendah". Itu normal
(lihat bagian 8.3). Untuk uji di laptop, naikkan **Batas akurasi** di halaman rekap, misal ke 2000 m.

### 3.4 Memalsukan lokasi untuk pengujian (tanpa pindah tempat)

Chrome dan Edge punya simulator lokasi:

1. Buka halaman absen, tekan `F12` untuk DevTools.
2. Tekan `Ctrl+Shift+P` (macOS `Cmd+Shift+P`), ketik **Show Sensors**, Enter.
3. Di bagian **Location**, pilih kota yang tersedia atau **Other...** lalu isi lintang dan bujur sendiri.
4. Tekan **Ambil lokasi saya** lagi.

Dengan cara ini kamu bisa mencoba titik di dalam dan di luar radius. Cara yang sama bisa dipakai
orang untuk curang, dan itu dibahas di bagian 8.1.

### 3.5 Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm start` | Jalankan server |
| `npm run dev` | Jalankan server dan mulai ulang otomatis saat berkas diubah |
| `npm test` | Jalankan 16 tes otomatis (hitung jarak, validasi, API, keamanan dasar) |

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

## 6. API

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `GET /api/status` | Publik | Cek server hidup |
| `GET /api/pengaturan` | Publik | Lokasi kantor, radius, batas akurasi |
| `POST /api/absen` | Publik | Simpan absen |
| `GET /api/absen?batas=200` | Admin | Daftar absen terbaru |
| `GET /api/absen.csv` | Admin | Semua absen dalam CSV |
| `DELETE /api/absen` | Admin | Hapus semua absen |
| `PUT /api/pengaturan` | Admin | Ubah lokasi kantor |

Rute admin butuh header `X-Kunci-Admin`.

Contoh mengirim absen tanpa browser:

```bash
curl -X POST http://localhost:3000/api/absen \
  -H "Content-Type: application/json" \
  -d '{"id_karyawan":"NEP-0001","nama":"Budi","jenis":"masuk","lat":3.5908,"lon":98.6781,"akurasi":12}'
```

Balasan `201` berisi data yang tersimpan beserta `status` dan `jarak_m`. Kode lain:
`422` isi tidak valid (daftar kesalahan ada di `galat`), `409` absen ganda, `415` bukan JSON,
`413` body lebih dari 10 KB, `401` kunci admin salah.

Contoh di atas sekaligus menunjukkan kelemahan terbesar absen berbasis web: koordinat datang
dari klien, jadi siapa pun bisa mengirim angka apa saja. Lihat bagian 8.1.

---

## 7. Konfigurasi

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

Setelah database terbentuk, lokasi kantor diubah lewat halaman `/rekap`, bukan lewat `.env`.

---

## 8. Batasan (baca sebelum dipakai sungguhan)

### 8.1 Lokasi bisa dipalsukan

Browser tidak bisa membuktikan bahwa koordinat itu asli. Cara curang yang umum:

- Aplikasi Fake GPS di Android dengan fitur *mock location*.
- Simulator lokasi DevTools (bagian 3.4).
- Mengirim request langsung dengan curl atau Postman, tanpa membuka halaman sama sekali.

Prototipe ini tidak mencegah semua itu. Langkah yang biasa ditumpuk di sistem absen sungguhan:

| Langkah | Menutup celah |
|---|---|
| Login per karyawan, bukan ID yang diketik bebas | Absen atas nama orang lain |
| Foto selfie saat absen, dicocokkan dengan wajah terdaftar | Titip absen |
| QR code berganti tiap beberapa detik yang ditampilkan di layar kantor | Absen tanpa hadir fisik |
| Cek jaringan: IP publik atau nama Wi-Fi kantor | Absen dari luar kantor |
| Cek kewajaran: dua absen berjarak jauh dalam waktu singkat | Lompatan lokasi palsu |
| Aplikasi native Android dengan deteksi mock location (`Location.isMock()`) dan Play Integrity | Fake GPS |

Untuk pekerja lapangan alih daya yang lokasinya berpindah, kombinasi login, selfie, dan GPS
biasanya cukup sebagai langkah pertama. Deteksi Fake GPS yang andal hanya mungkin lewat aplikasi
native, bukan website.

### 8.2 Belum ada login

Siapa pun yang membuka halaman absen bisa mengetik ID siapa saja. Kunci admin juga hanya satu
kunci bersama. Sistem sungguhan butuh akun per karyawan dan per admin.

### 8.3 Akurasi

| Perangkat dan tempat | Akurasi wajar |
|---|---|
| HP, luar ruangan, langit terbuka | 3 sampai 10 m |
| HP, dalam gedung | 10 sampai 50 m, kadang lebih |
| Laptop atau PC (Wi-Fi) | 20 m sampai beberapa km |
| Laptop tanpa Wi-Fi (hanya IP) | Bisa meleset ke kota lain |
| HP dengan lokasi "perkiraan" | Sekitar beberapa km |

Karena itu radius kantor sebaiknya 50 sampai 150 m, bukan 10 m. Di dalam gedung GPS memantul dan
posisi bisa bergeser puluhan meter walau orangnya diam.

Aturan status yang dipakai (`lib/geo.js`):

1. Akurasi lebih buruk dari batas: `akurasi_rendah`.
2. Kalau akurasi cukup tapi jarak ke kantor lebih dari radius: `di_luar_area`.
3. Selain itu: `valid`.

Absen tetap disimpan apa pun statusnya, supaya admin bisa menilai sendiri. Tidak ada absen yang
ditolak hanya karena lokasinya, yang ditolak hanya data rusak dan absen ganda.

### 8.4 Data pribadi

Lokasi seseorang termasuk data pribadi menurut UU No. 27 Tahun 2022 tentang Pelindungan Data
Pribadi. Sebelum uji dengan karyawan sungguhan: beri tahu tujuan pengumpulan, siapa yang bisa
melihat, dan berapa lama data disimpan. Prototipe ini sudah membatasi pengambilan lokasi hanya
saat tombol ditekan, dan halaman absen menampilkan pemberitahuan singkat di bawah formulir.
Hapus data uji setelah percobaan selesai.

---

## 9. Kalau naik ke hosting

| Jenis | Cocok? | Catatan |
|---|---|---|
| VPS (server virtual) | Ya | Kode ini jalan apa adanya. Pasang Caddy atau Nginx di depan untuk HTTPS (Let's Encrypt), jalankan Node dengan systemd atau pm2, isi `TRUST_PROXY=1` |
| PaaS (Render, Railway, Fly.io, dan sejenisnya) | Ya, dengan syarat | Pastikan paket yang dipakai punya disk persisten dan `DB_FILE` diarahkan ke sana. Tanpa disk persisten, berkas SQLite hilang tiap deploy atau restart |
| Serverless (Vercel, Netlify) | Tidak langsung | Tidak ada server yang terus jalan dan tidak ada disk permanen. Perlu ditulis ulang menjadi fungsi dan memakai database terkelola seperti PostgreSQL |

Sebelum dibuka ke banyak orang:

- HTTPS wajib, kalau tidak GPS tidak akan jalan.
- `KUNCI_ADMIN` diisi kunci panjang dan acak.
- Backup berkas database secara berkala.
- Tambahkan pembatas jumlah request per IP.

---

## 10. Struktur berkas

```
prototipe-absen-gps/
├── server.js           Server HTTP: rute halaman, API, header keamanan, HTTPS opsional
├── lib/
│   ├── db.js           Skema dan query SQLite (node:sqlite)
│   ├── geo.js          Rumus jarak haversine dan aturan status
│   └── validasi.js     Validasi isi absen dan pengaturan
├── public/
│   ├── index.html      Halaman absen
│   ├── rekap.html      Halaman admin
│   ├── css/gaya.css    Gaya bersama (palet 1c proyek NEP, font sistem)
│   └── js/
│       ├── absen.js    Izin lokasi, watchPosition, kirim absen
│       └── rekap.js    Tabel, peta SVG, pengaturan kantor, CSV
├── test/               Tes otomatis (node:test)
├── contoh.env          Contoh konfigurasi
└── data/               Database, dibuat otomatis, tidak ikut commit
```

Halaman tidak memuat apa pun dari luar (tanpa CDN, tanpa Google Fonts, tanpa peta online),
jadi tetap jalan tanpa internet di localhost. Peta di halaman rekap digambar sendiri dengan SVG,
berupa posisi relatif terhadap kantor. Tautan koordinat di tabel membuka OpenStreetMap.

---

## 11. Masalah yang sering muncul

| Gejala | Penyebab dan solusi |
|---|---|
| `Modul node:sqlite tidak tersedia` | Node terlalu lama. Pasang Node LTS terbaru |
| Pita merah "GPS diblokir" dan tombol abu abu | Halaman dibuka lewat HTTP di alamat IP. Pakai localhost, tunnel, atau HTTPS (bagian 4) |
| "Izin lokasi ditolak" | Pernah menekan Blokir. Buka pengaturan situs di address bar, ubah Lokasi ke Izinkan, muat ulang |
| Akurasi selalu ratusan meter atau lebih | Wajar di laptop. Di HP, nyalakan lokasi akurat (bagian 4.5) |
| "Waktu habis sebelum lokasi didapat" | Sinyal GPS lemah di dalam ruangan. Coba dekat jendela atau di luar |
| Semua absen "di luar area" | Titik kantor masih contoh. Pakai **Pakai lokasi saya sekarang** di `/rekap` |
| Kunci admin tidak diterima setelah server dijalankan ulang | Kunci acak berganti. Isi `KUNCI_ADMIN` di `.env` |
| `EADDRINUSE` | Port 3000 dipakai program lain. Isi `PORT=3001` |
| HP tidak bisa membuka alamat LAN sama sekali | Firewall laptop memblokir, atau Wi-Fi tamu memisahkan perangkat. Pakai tunnel |
| Kolom CSV menyatu di Excel | Buka lewat Data, From Text/CSV, pilih pemisah koma |

---

## 12. Yang sudah diuji

- `npm test`: 16 tes lulus. Mencakup rumus jarak, tiga jenis status, validasi, absen ganda,
  batas ukuran body, kunci admin, CSV (termasuk penetralan rumus Excel seperti `=HYPERLINK`),
  perubahan lokasi kantor, hapus data, dan upaya membaca berkas di luar folder `public`.
- Chromium lewat Playwright dengan lokasi tiruan: absen valid dari dekat kantor, absen akurasi
  rendah dari jauh, izin ditolak, akses lewat IP LAN dengan HTTP (terdeteksi bukan secure context
  dan tombol dimatikan), login rekap, unduh CSV, dan memindahkan geofence ke lokasi admin.
- Lebar 375 px dan 1280 px tanpa scroll horizontal.

Belum diuji di HP fisik. Itu langkah pertama yang perlu dilakukan dengan cara di bagian 4.

## 13. Langkah berikutnya

1. Uji di HP fisik lewat tunnel, di dalam dan di luar gedung, catat akurasi yang didapat.
2. Tentukan radius dan batas akurasi dari hasil uji itu.
3. Tambah login karyawan dan admin.
4. Tambah foto selfie saat absen.
5. Putuskan: tetap website, atau aplikasi Android bila deteksi Fake GPS dibutuhkan.
