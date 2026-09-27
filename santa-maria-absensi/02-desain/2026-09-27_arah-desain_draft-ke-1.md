# Arah Desain: Lima Pilihan untuk Web Absensi SMA Santa Maria 1

Draft ke-1, 27 September 2026

Lima arah desain untuk web absensi berbasis GPS dan WiFi. Bahan riset ada di `../01-riset/`. Pratinjau yang bisa dicoba ada di `preview/`, pintu masuknya `preview/index.html`.

---

## 0. Pembacaan brief

Permintaan: beberapa desain web absensi GPS dan WiFi untuk SMA Santa Maria 1 Bandung. Tidak generik, unik, modern, fungsional, mudah untuk orang tua dan siswa, tidak terasa buatan AI. Huruf dan tata letak berbeda di tiap desain. Eksplorasi boleh, tapi desain bersih diutamakan.

Pembacaan: web app responsif untuk siswa SMA dan orang tua, bahasa visual bersih dengan satu elemen khas per arah, dial rata-rata Energi 2, Ritme 2, Gerak 1.

Keputusan supaya lima desain bisa dibandingkan dengan adil:

1. Fitur, isi, dan data contoh identik di kelima desain (satu berkas `shared.js`).
2. Yang berbeda hanya huruf, warna, tata letak, dan cara absen.
3. Tiap arah diambil dari satu benda nyata di sekolah, bukan dari template aplikasi.

## 1. Ringkasan

| No | Arah | Sumber ide | Huruf | Dial (E/R/G) | Tema |
|---|---|---|---|---|---|
| 1 | Putih Abu-Abu | Seragam SMA dan badge OSIS | Onest | 1 / 1 / 1 | Terang dan gelap |
| 2 | Buku Penghubung | Buku penghubung, buku tulis margin merah | Newsreader + Figtree | 1 / 2 / 1 | Terang dan gelap |
| 3 | Kartu Pelajar | Kartu pelajar ID-1 dan stempel sekolah | Lexend + Red Hat Mono | 2 / 2 / 2 | Terang dan gelap |
| 4 | Papan Tulis | Papan hijau, kapur, turus | Archivo (sumbu lebar) | 3 / 2 / 1 | Satu tema gelap, disengaja |
| 5 | Jam Pelajaran | Jadwal dan bel 06.55 | Bricolage Grotesque + Albert Sans | 2 / 3 / 2 | Terang dan gelap |

Rekomendasi kalau harus memilih satu untuk dikembangkan: **Arah 1 sebagai dasar**, dengan grafik jam masuk dari Arah 5 untuk layar riwayat orang tua. Arah 1 paling bersih dan paling mudah dibangun. Grafik Arah 5 memberi informasi yang tidak dimiliki kalender biasa: pola jam datang anak terhadap bel.

## 2. Fitur yang sama di kelima desain

- Absen masuk dengan dua cek: GPS dalam radius 75 m (usulan) dari Jl. Bengawan 6, dan jaringan dikenali dari IP WiFi sekolah
- Empat keadaan simulasi: di sekolah, tanpa WiFi sekolah, di luar area, izin lokasi ditolak. Masing-masing punya pesan yang menyebut langkah perbaikan
- Jam demo 06.41 (tepat waktu) dan 07.03 (terlambat 8 menit)
- Orang tua: status hari ini dalam tiga keadaan (sudah masuk, belum absen, sakit), jam masuk minggu ini, empat pilihan kabar WhatsApp, nomor Tata Usaha yang bisa disalin
- Form izin: jenis, hari, keterangan minimal 10 huruf, lampiran tidak wajib. Pesan salah per isian, fokus pindah ke isian pertama yang salah
- Rekap bulanan: memuat, gagal lalu coba lagi (Agustus), kosong (Oktober), klik tanggal untuk detail
- Jalur manual lewat guru piket kalau semua cek gagal
- Panel demo netral di atas tiap desain: pindah desain dengan layar tetap sama, ganti peran, ganti skenario

## 3. Alasan per keputusan (satu baris per keputusan)

### Arah 1, Putih Abu-Abu

- **Warna:** putih, abu-abu, dan kuning diambil dari kemeja, bawahan, dan badge OSIS seragam SMA, jadi identitasnya terbaca tanpa logo.
- **Tata letak:** bagian putih di atas memuat aksi utama, bagian abu di bawah memuat penjelasan, meniru susunan seragam dan memisahkan yang harus dilakukan dari yang boleh dibaca nanti.
- **Huruf:** Onest dipilih karena angka lebar dan jelas, penting untuk jam 06.41 yang jadi fokus layar.
- **Jarak:** blok putih lebih rapat dan blok abu lebih lega, supaya mata berhenti dulu di aksi utama.
- **Kartu:** hanya badge HADIR yang berbentuk blok berwarna, karena itu satu-satunya status yang perlu menonjol.
- **Ikon:** digambar sendiri (pin dengan centang, gelombang WiFi, kalender, amplop), masing-masing mewakili isi yang nyata.

### Arah 2, Buku Penghubung

- **Warna:** kertas putih, garis margin merah, dan tinta pulpen biru diambil dari buku tulis sekolah, bukan krem dan terakota.
- **Tata letak:** tanggal di kolom margin kiri dan isi di kanan garis merah, cara orang tua biasa menulis di buku penghubung.
- **Huruf:** Newsreader untuk kalimat kabar karena nyaman dibaca panjang oleh orang tua, Figtree untuk tombol dan isian.
- **Jarak:** antarcatatan dipisah garis biru tipis, tanpa kartu, supaya terbaca seperti halaman buku.
- **Kartu:** tidak ada kartu, karena buku penghubung adalah satu lembar yang terus ditulisi.
- **Form izin:** berbentuk surat izin (Kepada Yth. Wali Kelas...), format yang sudah dikenal orang tua.

### Arah 3, Kartu Pelajar

- **Warna:** biru tua kartu dan ungu tinta stempel, dua benda resmi yang dikenal siswa. Ungu hanya untuk cap.
- **Tata letak:** kartu ID-1 (rasio 85,6 : 54) jadi pusat layar dan menempel di kiri pada laptop, karena kartu adalah identitas siswa.
- **Huruf:** Lexend dirancang untuk kelancaran membaca, cocok untuk pengguna dari umur beragam. Red Hat Mono untuk NIS dan jam karena memang angka resmi.
- **Gerak:** cap HADIR tercetak sekali dengan efek tekan singkat, untuk menandai momen absen berhasil.
- **Cara absen:** tekan dan tahan 1 detik mencegah absen tidak sengaja. Keyboard dan pembaca layar cukup menekan Enter.

### Arah 4, Papan Tulis

- **Warna:** hijau papan, kapur putih, kapur kuning untuk bel dan tombol. Tema gelap karena papan memang gelap, bukan karena gaya teknologi.
- **Tata letak:** jam raksasa di papan dan panel di samping, seperti papan pengumuman di depan kelas. Menu ada di baki kapur kayu di bawah.
- **Huruf:** Archivo dengan sumbu lebar: sangat lebar untuk angka jam, sempit untuk label, seperti tulisan kapur besar dan catatan kecil.
- **Turus:** jumlah hadir digambar sebagai tanda hitung lima-lima, cara menghitung yang diajarkan di sekolah, dengan angka di sampingnya untuk kejelasan.
- **Gerak:** satu garis bawah kapur tergambar di kata HADIR. Tidak ada gerak lain.
- **Tekstur:** dua bekas hapusan yang sangat samar di latar, satu-satunya tekstur, untuk rasa papan.

### Arah 5, Jam Pelajaran

- **Warna:** latar putih, biru untuk jejak absen, jingga hanya untuk garis bel 06.55 karena bel adalah patokan terlambat atau tidak.
- **Tata letak:** sumbu waktu jadi tulang semua layar: pita pagi 06.30 sampai 07.15 di layar absen, pita sehari di layar orang tua, plot titik di riwayat.
- **Huruf:** Bricolage Grotesque untuk jam besar karena berkarakter dan tegas di ukuran besar, Albert Sans untuk teks biasa karena tenang.
- **Grafik:** plot titik jam masuk per hari dengan garis bel, ditambah rata-rata dan jam paling pagi yang dihitung dari data.
- **Form izin:** hari dipilih dari lima kotak Senin sampai Jumat, lebih cepat dari memilih tanggal di kalender.

## 4. Laporan Delivery Gate (antislop)

Mode: selama pengerjaan. Arah desain dibaca dari brief pengguna, lalu dial dan alasan ditulis di atas.

### Blok 1, Hard Gate (semua jawaban harus "tidak")

| Aturan | Hasil | Bukti |
|---|---|---|
| R-02 em dash | PASS | Pencarian karakter em dash dan en dash di semua berkas: 0 hasil |
| R-03 mobile | PASS | Uji otomatis di 375 px: selisih lebar halaman 0 di layar absen, hari ini, izin, riwayat, kelima desain. Tombol minimal 44 px |
| R-17 angka tanpa sumber | PASS | Angka sekolah dari sumber di dokumen riset. Angka kehadiran ditandai data contoh di panel demo dan di hub |
| R-18 testimoni | PASS | Tidak ada testimoni |
| R-23 aset | PASS | Tidak ada logo, foto, atau avatar buatan. Nama sekolah ditulis sebagai teks, foto diganti inisial NS, nomor WhatsApp dan NIS ditulis [nomor ...] |
| R-24 navigasi | PASS | Semua menu menuju layar yang ada, diuji klik |
| R-25 kontras | PASS | 46 pasangan warna dihitung dengan rumus WCAG, semua minimal 4,5 : 1 (terendah 4,57) |
| R-26 elemen interaktif | PASS | Semua tombol punya aksi, lihat R-35 |
| R-27 keadaan | PASS | Kosong (Oktober, belum ada pengajuan), memuat (rekap, kirim izin, cek lokasi), gagal (Agustus, GPS ditolak, di luar area) |
| R-28 FAQ | PASS | Tidak ada FAQ |
| R-32 keyboard | PASS | Semua kontrol berupa button, a, atau input. Fokus terlihat 3 px, diuji otomatis. Kartu Arah 3 bisa diaktifkan dengan Enter |
| R-33 patch skrip | PASS | Semua fitur ditulis di sumbernya |
| R-34 tema | PASS | Mode gelap Arah 1, 2, 3, 5 dan hub dirender dan dicek. Arah 4 satu tema, disengaja |
| R-35 dijalankan | PASS | Uji klik otomatis Chromium, 274 cek, 0 gagal (lihat di bawah) |
| R-36 klaim palsu | PASS | Tidak ada klaim keamanan atau performa |
| R-37 arah | PASS | Arah dari brief pengguna, dial ditulis |
| R-38 konten | PASS | Semua data contoh diberi label |

Uji klik yang dijalankan di tiap desain, di lebar 375 px dan 1280 px:

- Empat skenario posisi, lalu absen: pesan sesuai skenario muncul
- Jam 07.03: tercatat terlambat 8 menit
- Arah 3: tahan 0,25 detik tidak absen, tahan 1 detik absen
- Menu desain ke Riwayat, panel demo ganti peran ke orang tua
- Status anak sudah masuk, belum absen, sakit
- Sakelar kabar WhatsApp berubah, tombol salin memberi umpan balik
- Form izin kosong: 3 pesan salah dan fokus pindah. Diisi lengkap dengan lampiran: terkirim dan muncul di daftar
- Riwayat: Agustus gagal, coba lagi berhasil, Oktober kosong, klik tanggal 23 menampilkan terlambat 4 menit
- Tautan pindah desain membawa layar yang sama
- Tanpa error di konsol

### Blok 2, Purpose-Gate

| Aturan | Hasil | Catatan |
|---|---|---|
| R-01 gradasi | PASS | Tidak ada gradasi hiasan. Baki kayu Arah 4 memakai gradasi dua nada kayu untuk bentuk baki |
| R-04 ikon | PASS | Ikon Arah 1 digambar sendiri dan relevan, arah lain memakai teks |
| R-06 huruf | PASS | Alasan tiap huruf di bagian 3. Monospace hanya untuk NIS dan jam di Arah 3 |
| R-07 latar | PASS | Tidak ada grid latar |
| R-08 panah | PASS | Panah hanya di tombol bulan sebelumnya dan berikutnya |
| R-09 badge | PASS | Badge hanya untuk status nyata (HADIR, Cocok, Disetujui) |
| R-10, R-12, R-13 | PASS | Tidak ada blur. Bayangan hanya di lembar kertas Arah 2 dan kartu Arah 3 sebagai tanda benda fisik |
| R-14 kartu fitur | PASS | Tidak ada deret kartu fitur |
| R-19 gerak | PASS | Hanya: indikator memuat, cap HADIR Arah 3, garis kapur Arah 4. Semua berhenti di prefers-reduced-motion |
| R-22 ilustrasi | PASS | Tidak ada ilustrasi |

### Blok 3, Liveliness

Dial ditulis per arah. Tiap layar punya satu fokus (jam atau status hari ini). Satu aksen per arah (kuning OSIS, tinta pulpen, stempel ungu, kapur kuning, garis bel jingga). Motif identitas per arah: badge saku, garis margin, kartu dan cap, turus, sumbu waktu.

### Blok 4, Craftsmanship

Tidak ada template landing page, tidak ada bento, tidak ada tiga kolom harga, tidak ada kata buzzword. Palet tiap arah dua atau tiga warna inti plus satu aksen. Tidak meniru produk populer.

## 5. Keputusan yang masih terbuka

| Kode | Pertanyaan | Usulan |
|---|---|---|
| K-01 | Radius absen | Mulai 75 m, ukur batas pagar, uji dengan beberapa HP |
| K-02 | Jam pulang dan absen pulang | Tanyakan jadwal ke sekolah, lalu tambahkan layar absen pulang |
| K-03 | Logo dan warna resmi | Minta berkas logo dan izin pakai dari sekolah |
| K-04 | Kanal kabar | WhatsApp butuh layanan pengirim resmi (WhatsApp Business API). Alternatif: notifikasi browser |
| K-05 | Arah yang dipilih | Nilai bersama guru atau klien dengan halaman pembanding |
