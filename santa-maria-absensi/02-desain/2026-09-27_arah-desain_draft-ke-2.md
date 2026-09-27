# Arah Desain v2: Lima Arah yang Diambil dari Santa Maria

Draft ke-2, 27 September 2026

Menggantikan draft ke-1 atas masukan: desain v1 masih terasa umum, mockup dan teks bercampur, dan belum beranimasi. Draft ke-1 dan pratinjau v1 (`preview/`) tetap disimpan sebagai arsip.

Pratinjau v2 ada di `preview-v2/`. Pintu masuknya `index.html` (galeri visual). Penjelasan lengkap ada di `preview-v2/catatan.html`. Dokumen ini ringkasan untuk repo.

---

## 1. Perubahan dari v1

| Masukan | Jawaban di v2 |
|---|---|
| Masih jauh dari ekspektasi, perlu eksplorasi lebih dalam | Lima arah baru, masing-masing lahir dari identitas Santa Maria atau Bandung, bukan dari benda sekolah yang umum |
| Pisahkan mockup dan teks | Galeri dan lima papan mockup hanya berisi perangkat dan label singkat. Semua alasan dipindah ke `catatan.html` |
| Harus beranimasi | Setiap tema punya animasi yang menandai langkah verifikasi, plus animasi suasana di layar masuk dan rekap |
| Cocok untuk Santa Maria | Sumber ide: Katedral Bandung dan Maria, Stella Maris, karya Wolff Schoemaker, mading kelas, rosario dan Yayasan Salib Suci |

## 2. Lima arah

| No | Arah | Sumber ide | Absen | Rekap | Huruf |
|---|---|---|---|---|---|
| 1 | Kaca Patri | Jendela kaca patri Katedral St. Petrus Bandung (Wolff Schoemaker, 1922) | Dua lengkung jendela menyala, jendela mawar dan berkas cahaya | Jendela mawar 22 kelopak | Grenze + Hanken Grotesk |
| 2 | Fajar | Pagi Bandung, Tangkuban Perahu, Stella Maris | Bintang kamu muncul di lingkar sekolah, matahari terbit | Peta langit, makin pagi makin terang | Gloock + Rethink Sans |
| 3 | Deco Bengawan | Art Deco Bandung: Villa Isola, Preanger, Savoy Homann | Jarum lift ke bel, lampu tombol, pintu kuningan membuka | Cakrawala gedung, makin pagi makin tinggi | Poiret One + Josefin Sans |
| 4 | Mading | Majalah dinding kelas | Kartu dicap OK, kartu nama dipaku, cap HADIR | Kalender stiker | Archivo Black + Caveat + Chivo |
| 5 | Rosario | Rosario, Bulan Rosario (Oktober), salib Yayasan Salib Suci | Dua manik terisi, geser manik sampai ke salib | Untaian melingkar | Castoro + Be Vietnam Pro |

Rekomendasi: Rosario sebagai dasar karena paling bersih, ditambah peta langit dari Fajar untuk rekap orang tua. Alasan lengkap di `catatan.html#rekomendasi`.

## 3. Isi tiap papan

Setiap papan (`m1` sampai `m5`) memuat layar yang sama supaya bisa dibandingkan:

- Layar masuk
- Absen dalam lima keadaan: siap, GPS cocok, siap absen, hadir, gagal di luar area. Ponsel utama berjalan sendiri dan bisa dicoba
- Beranda orang tua dan notifikasi masuk
- Dasbor orang tua di laptop
- Surat izin dan rekap bulanan
- Sistem visual: warna, huruf, contoh gerak

Tata letak papan berbeda per arah: triptik lengkung runcing (1), halaman dari malam ke pagi dengan ponsel sebagai rasi bintang (2), komposisi simetris dengan sinar Deco (3), papan gabus dengan ponsel ditempel (4), benang manik yang menjalar sepanjang halaman (5).

## 4. Pemeriksaan

- Uji otomatis Chromium, 114 cek, 0 gagal: tujuh halaman di lebar 390 dan 1440, dengan dan tanpa kurangi gerak; tanpa scroll samping; tanpa error konsol; tautan lokal lengkap
- Alur absen lima tema dijalankan dengan klik mouse sungguhan sampai hadir. Tombol absen dipastikan tidak tertutup lapisan lain. Rosario: geseran pendek tidak absen, geseran penuh absen, Enter absen
- Mode kurangi gerak: animasi berhenti, alur tetap bisa diselesaikan
- Kontras: 32 pasangan warna teks baru dihitung dengan rumus WCAG, semua minimal 4,5 : 1
- Tanpa em dash di seluruh berkas

Temuan saat uji yang sudah diperbaiki: lapisan dekoratif tak terlihat (tulisan "Hadir" dengan opacity 0) menutup tombol kuningan Deco dan penggeser Rosario, sehingga tidak bisa ditekan dengan jari. Semua lapisan dekoratif sekarang `pointer-events: none`.

## 5. Keputusan terbuka

| Kode | Pertanyaan | Usulan |
|---|---|---|
| K-06 | Pakai simbol religius (salib, rosario, kaca patri) di aplikasi absensi | Konsultasikan bentuknya dengan sekolah atau yayasan sebelum dipilih |
| K-07 | Arah yang dipilih | Uji singkat dengan 5 siswa dan 5 orang tua memakai papan desain |
| K-01 sampai K-05 | Radius, jam pulang, logo, kanal kabar | Tetap seperti draft ke-1 |
