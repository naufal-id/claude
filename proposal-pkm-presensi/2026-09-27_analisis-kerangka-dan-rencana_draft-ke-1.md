# Analisis Kerangka Berpikir dan Rencana Penyusunan Proposal PKM Presensi Digital

Draft ke-1, 27 September 2026

Dokumen ini membedah kerangka berpikir yang kamu kirim, mencatat apa yang sudah kuat, apa yang perlu diubah agar sesuai panduan PKM, lalu menjabarkan rencana dan keputusan yang saya ambil saat menulis isi proposal. Isi proposal lengkap ada di dua berkas pendamping:

- `2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.docx` (siap sunting di Word, format PKM)
- `2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.pdf` (pratinjau hasil render)
- `2026-09-27_isi-proposal_draft-ke-1.md` (teks yang sama dalam Markdown, untuk ditinjau cepat)
- `sumber/` (isi, anggaran, diagram, dan skrip pembangun .docx)

Semua penanda **[VERIFIKASI: ...]** di proposal adalah data yang belum bisa saya pastikan dari sumber publik, atau data primer yang hanya bisa kalian dapat dari sekolah. Jangan kirim proposal sebelum semua penanda itu terisi.

---

## 1. Skema PKM yang dipilih: PKM-KC

Kerangka kamu memakai Bab 3 "Tahap Pelaksanaan" dan target luaran "prototipe atau produk fungsional". Dua ciri itu milik PKM Karsa Cipta (PKM-KC). Template PKM-KC 2025 memakai sistematika persis: Bab 1 Pendahuluan (1.1 Latar Belakang, 1.2 Rumusan Masalah, 1.3 Tujuan, 1.4 Luaran, 1.5 Manfaat), Bab 2 Tinjauan Pustaka, Bab 3 Tahap Pelaksanaan, Bab 4 Biaya dan Jadwal Kegiatan.

Alternatifnya PKM-PI (Penerapan Iptek). Skema itu cocok kalau fokus kalian menerapkan teknologi yang sudah jadi ke mitra, dan luarannya buku pedoman mitra, bukan prototipe. Karena kalian ingin **merancang dan membangun** sistem baru, PKM-KC lebih tepat. SMA Santa Maria 1 Bandung tetap berperan sebagai lokasi uji coba dan sumber kebutuhan, dan surat kesediaan dari sekolah memperkuat proposal walau tidak wajib di KC.

| Aspek | PKM-KC (dipilih) | PKM-PI |
|---|---|---|
| Inti | Karya cipta baru, prototipe fungsional | Menerapkan iptek untuk menyelesaikan masalah mitra |
| Bab 3 | Tahap Pelaksanaan | Metode Pelaksanaan |
| Luaran wajib (2025) | Laporan kemajuan, laporan akhir, prototipe/produk fungsional, akun media sosial | Laporan kemajuan, laporan akhir, buku pedoman mitra, akun media sosial |
| Mitra | Tidak wajib | Wajib, dengan surat pernyataan mitra dan denah lokasi |

## 2. Ketentuan format yang saya pakai

| Ketentuan | Nilai | Status sumber |
|---|---|---|
| Kertas, huruf | A4, Times New Roman 12 | Template PKM 2025, dikonfirmasi ringkasan panduan PKM-KC 2026 |
| Spasi | 1,15 | Sama |
| Margin | Kiri 4 cm, kanan 3 cm, atas 3 cm, bawah 3 cm | Ringkasan panduan PKM-KC 2026 |
| Bagian inti | Maksimal 10 halaman (Pendahuluan sampai Daftar Pustaka) | Template 2025 dan ringkasan 2026 |
| Isi utama | Tanpa sampul, halaman pengesahan, dan ringkasan (dapat menggugurkan di seleksi tahap 1) | Ringkasan panduan PKM-KC 2026 |
| Judul | Maksimal 20 kata, tanpa akronim tak baku | Panduan PKM 2025 |
| Dana Belmawa | Rp5.000.000 sampai Rp8.000.000 | Template PKM-KC 2025 |
| Dana perguruan tinggi | Wajib, maksimal Rp2.000.000 | Template 2025 dan ringkasan 2026 |
| Batas per pos (dana Belmawa) | Bahan habis pakai maks 60%, sewa dan jasa maks 15%, transportasi lokal maks 30%, lain-lain maks 15% | Ringkasan hasil penelusuran panduan 2026 |
| Daftar pustaka | Harvard, urut abjad, baris kedua menjorok | Template PKM 2025 |
| Similaritas | Maksimal 25% | Template PKM 2025 |

**Catatan penting.** Saya tidak bisa membuka PDF resmi panduan 2026 di simbelmawa.kemdiktisaintek.go.id karena jaringan lingkungan kerja saya memblokir domain itu. Angka di atas saya ambil dari template berbasis panduan 2025 (repositori GitHub `dananghilalkurniawan/Template-Proposal-PKM-Tahun-2025`) dan ringkasan hasil pencarian atas panduan 2026. Satu ringkasan pencarian menyebut dana KC 2026 bisa sampai Rp15.000.000; klaim itu tidak konsisten dengan sumber lain, jadi saya tidak memakainya. **Cocokkan tabel ini dengan Panduan PKM-KC edisi terbaru sebelum mengirim.** Kalau panduan berubah, yang perlu disesuaikan hanya Tabel 4.1, Lampiran 2, dan subbab 1.4.

## 3. Analisis per bagian kerangka

### 3.1 Latar Belakang

Alur kamu sudah benar: digitalisasi pendidikan, lalu mengerucut ke absensi, lalu masalah absensi manual, lalu solusi. Yang kurang:

1. **Data primer sekolah belum ada.** Reviewer PKM-KC menilai kejelasan masalah. Klaim "guru terbebani" dan "ada kecurangan" harus didukung angka dari SMA Santa Maria 1: berapa menit per sesi untuk presensi, berapa rombel, bagaimana rekap dibuat, kasus titip absen atau bolos yang pernah tercatat, bagaimana orang tua tahu anaknya tidak hadir. Saya menaruh penanda di tempat angka itu harus masuk, dan menyiapkan daftar pertanyaan wawancara di bagian 6.
2. **"Coba cari paper efek dari absensi digital"** sudah saya carikan. Bukti terkuat bukan dari absensi digital itu sendiri, tapi dari dua hal yang sistem kalian aktifkan:
   - Kehadiran berhubungan dengan prestasi (Gottfried, 2010; Credé dkk., 2010).
   - Informasi kehadiran yang dikirim ke orang tua menurunkan ketidakhadiran: pesan otomatis mingguan menaikkan kehadiran kelas 12% (Bergman dan Chan, 2021), dan surat berisi total absen anak menurunkan absensi kronis sekitar 10% atau lebih (Rogers dan Feller, 2018).
   Ini memberi alasan ilmiah untuk fitur notifikasi orang tua, bukan sekadar fitur tambahan.
3. **Kebaruan harus eksplisit.** Sistem RFID + notifikasi sudah banyak dibuat di Indonesia (lihat Bab 2). Reviewer akan bertanya "apa bedanya?". Kebaruan yang saya rumuskan: presensi **berlapis** (gerbang + kelas), bukti foto yang diaudit, deteksi anomali berbasis aturan, laporan kumulatif ke orang tua sesuai temuan Rogers dan Feller, dan desain sesuai UU Pelindungan Data Pribadi untuk data anak.
4. **Temuan yang perlu kalian cek: sekolah tampaknya sudah memakai AIMSIS.** Ada subdomain `cbtsmasantamaria.aimsis.com`. AIMSIS adalah sistem informasi sekolah yang punya modul nilai dan absensi. Kalau modul absensinya sudah dipakai, proposal harus memposisikan sistem kalian sebagai **lapisan penangkap dan verifikasi kehadiran** yang hasilnya bisa diekspor ke sistem sekolah, bukan pengganti. Saya menulis proposal dengan posisi itu. Tanyakan ke sekolah modul AIMSIS apa yang aktif.

### 3.2 Rumusan Masalah

| Rumusan asli | Masalah | Rumusan baru |
|---|---|---|
| Bagaimana cara efektif mengimplementasikan digitalisasi absensi yang minim kecurangan? | Sudah baik, tapi "efektif" belum terukur | Bagaimana merancang mekanisme presensi berlapis yang mencatat kehadiran siswa secara otomatis dan menekan kecurangan titip absen serta bolos jam pelajaran? |
| Bagaimana proses perancangan dan pembuatan perangkat lunak absensi digital? | Terlalu umum, dan sistemnya juga punya perangkat keras | Bagaimana membangun prototipe perangkat titik presensi dan aplikasi web yang memenuhi kebutuhan guru, wali kelas, siswa, dan orang tua di SMA Santa Maria 1 Bandung? |
| Apa dampak yang dirasakan guru, murid, maupun orang tua? | Program 4 bulan tidak cukup untuk mengukur dampak jangka panjang (misalnya prestasi) | Bagaimana kinerja teknis, kebergunaan, dan dampak awal sistem terhadap waktu pencatatan presensi guru, akurasi data kehadiran, dan keterlibatan orang tua selama uji coba? |

### 3.3 Tujuan

- Judul subbab "Tujuan Pengujian" saya ganti menjadi **"Tujuan"** sesuai template KC.
- Tujuan dibuat tiga, masing-masing menjawab satu rumusan masalah, dengan indikator terukur (Tabel 3.1 di proposal).

### 3.4 Manfaat

- "Menjadi penjamin antara murid dan orang tua" saya ubah menjadi **sarana transparansi kehadiran bagi orang tua**. Sistem tidak bisa "menjamin"; sistem memberi informasi.
- Template KC meminta manfaat dari beberapa sudut pandang (tim, sekolah, masyarakat, ilmu pengetahuan), minimal tiga. Saya susun empat.

### 3.5 Target Luaran

- Luaran wajib KC 2025: laporan kemajuan, laporan akhir, prototipe atau produk fungsional, **akun media sosial**. Kerangka kamu belum menyebut akun media sosial. Saya menambahkannya.
- Ringkasan panduan 2026 menyebut **video prototipe** diunggah ke laman Simbelmawa sebagai luaran akhir. Saya masukkan.
- Artikel ilmiah saya jadikan **luaran tambahan** (tidak wajib di KC 2025), karena menambah nilai dan kamu memintanya.
- Saya tambahkan buku panduan pengguna singkat untuk sekolah sebagai luaran tambahan, supaya sistem bisa dipakai setelah program selesai.

### 3.6 Tinjauan Pustaka

Dua poin kamu (sistem konvensional, sistem digital terdahulu) sudah benar. Saya tambahkan dua subbab supaya reviewer melihat dasar ilmiah desain:

1. **2.1 Kehadiran siswa dan dampaknya** (Gottfried; Credé dkk.; Balfanz dan Byrnes).
2. **2.2 Presensi konvensional dan kendalanya** (beban administrasi guru: Haeri dan Afriansyah, 2024; titip absen).
3. **2.3 Sistem presensi digital terdahulu** dengan tabel pembanding teknologi dan penelitian (Azmi dan Ujianto, 2025; Nugraha dan Allaami, 2025; Pramesti dan Febrianto, 2024; Winata dkk., 2021) serta celah yang diisi proposal ini.
4. **2.4 Keterlibatan orang tua dan pelindungan data anak** (Bergman dan Chan; Rogers dan Feller; UU 27/2022 Pasal 4, 25, 34; UNESCO 2023; kerentanan kartu MIFARE Classic menurut Garcia dkk., 2008).

### 3.7 Tahap Pelaksanaan

Lima tahap kamu (analisis kebutuhan, perancangan, implementasi, pengujian dan evaluasi, pemeliharaan) cocok dengan model *prototyping* iteratif (Pressman dan Maxim, 2020). Saya tambahkan:

- **Tahap 0: persiapan dan perizinan** (surat kesediaan sekolah, persetujuan orang tua sesuai UU PDP Pasal 25).
- Uji coba lapangan sebagai tahap tersendiri, dengan desain **sebelum-sesudah** di rombel uji coba.
- Tabel indikator dan target: waktu presensi per sesi, akurasi data, waktu tanggap perangkat, keberhasilan pembacaan kartu, keterlambatan notifikasi, skor SUS (acuan rata-rata 68 menurut Lewis dan Sauro, 2018), dan deteksi skenario kecurangan.
- "Pemeliharaan" di PKM 4 bulan realistisnya berupa masa pendampingan dan serah terima, plus rencana keberlanjutan.

### 3.8 Biaya dan Jadwal

- Saya susun anggaran Rp6.300.000 dari Belmawa dan Rp2.000.000 dari perguruan tinggi (total Rp8.300.000). Porsi dana Belmawa: bahan habis pakai 51,3%, sewa dan jasa 13,5%, transportasi lokal 21%, lain-lain 14,3%. Skrip `sumber/anggaran.js` menolak membangun dokumen kalau ada pos yang melewati batas.
- **Harga satuan adalah estimasi** dari penelusuran harga pasar daring September 2026 (misalnya kartu MIFARE S50 cetak Rp6.500 sampai Rp12.000 per keping tergantung jumlah; VPS lokal mulai sekitar Rp87.000 per bulan). Ganti dengan harga toko yang kalian pilih, lalu simpan tangkapan layarnya sebagai bukti.
- Jadwal 4 bulan dalam bentuk *bar chart*, sesuai template.

## 4. Keputusan desain yang saya ambil (boleh kalian ubah)

| Keputusan | Pilihan | Alasan | Alternatif yang ditolak |
|---|---|---|---|
| Identitas siswa di gerbang | Kartu RFID 13,56 MHz (MIFARE) | Murah (±Rp8.000 per kartu), cepat, tidak memerlukan ponsel siswa | QR di ponsel: bergantung aturan ponsel di sekolah. Sidik jari/wajah: data biometrik termasuk data pribadi spesifik (UU PDP Pasal 4), butuh penilaian dampak dan biaya lebih tinggi |
| Anti titip kartu | Foto otomatis saat kartu ditempel + audit acak + verifikasi silang di kelas | Kartu MIFARE Classic bisa dikloning (Garcia dkk., 2008) dan bisa dipinjamkan, jadi kartu saja tidak cukup | Pengenalan wajah otomatis: ditunda ke tahap lanjut karena risiko privasi anak |
| Presensi di kelas | Daftar kelas terisi otomatis dari data gerbang, guru hanya mengoreksi pengecualian | Inti pengurangan beban guru; menangkap siswa yang hadir di sekolah tapi bolos jam pelajaran | Pembaca kartu di setiap kelas: biaya 15 rombel terlalu besar untuk dana PKM |
| Notifikasi orang tua | Bot Telegram (API resmi, gratis) + ringkasan mingguan | Tanpa biaya per pesan; ringkasan kumulatif mengikuti temuan Rogers dan Feller (2018) | WhatsApp Business API: berbayar per percakapan. Gateway WhatsApp tidak resmi: melanggar ketentuan layanan dan rawan diblokir |
| Server | VPS lokal (pusat data di Indonesia) | Data anak tetap di Indonesia, biaya rendah | Server di sekolah: bergantung listrik dan jaringan sekolah |
| Cakupan uji coba | 3 rombel (±100 siswa) | Sesuai dana; tetap cukup untuk desain sebelum-sesudah | Seluruh sekolah: kartu saja ±Rp3,5 juta |

## 5. Rencana kerja penyusunan (yang sudah saya lakukan)

1. Menelusuri panduan PKM 2025 dan 2026: sistematika, format, dana, batas pos, luaran.
2. Memilih skema (KC) dan menyesuaikan kerangka.
3. Menelusuri literatur: kehadiran dan prestasi, notifikasi orang tua, beban administrasi guru, sistem presensi RFID/QR/wajah di Indonesia, kerentanan MIFARE, UU PDP, metode uji kebergunaan.
4. Menelusuri profil mitra (Dapodik, situs sekolah).
5. Menulis isi proposal lengkap, termasuk anggaran, jadwal, dan lampiran 2, 3, 5.
6. Membangun berkas .docx sesuai format, lalu memeriksa tampilannya.

## 6. Yang harus kalian lengkapi sebelum mengirim

### 6.1 Data primer dari sekolah (wawancara dan observasi awal)

Tanyakan ke wakasek kurikulum/kesiswaan, 3 sampai 5 guru, 2 wali kelas, guru BK, dan tata usaha:

1. Bagaimana alur presensi sekarang dari gerbang sampai rekap bulanan? Siapa yang mencatat, di mana (buku, lembar, AIMSIS, Google Form)?
2. Berapa menit rata-rata presensi per sesi pelajaran? (Lebih kuat lagi: ukur dengan stopwatch di 5 sampai 10 sesi.)
3. Berapa lama wali kelas merekap kehadiran per bulan dan per semester?
4. Seberapa sering terjadi titip absen, bolos jam pelajaran, atau selisih data antara guru mapel dan wali kelas? Ada catatan kasus?
5. Bagaimana orang tua diberi tahu jika anaknya tidak hadir? Berapa lama jeda informasinya?
6. Modul AIMSIS apa yang aktif? Apakah bisa impor data kehadiran (CSV/Excel)?
7. Apakah siswa boleh membawa ponsel? Apakah sudah ada kartu pelajar, dan jenis apa?
8. Ada Wi-Fi di area gerbang? Ada stopkontak?
9. Jumlah siswa dan rombel terkini per tingkat.
10. Kebijakan sekolah soal foto siswa dan data pribadi.

### 6.2 Data yang saya temukan tapi perlu dicek ulang

| Data | Nilai yang saya temukan | Sumber | Status |
|---|---|---|---|
| NPSN | 20219265 | Dapodik Kota Bandung (simdik.bandung.go.id), dapo.dikdasmen.go.id | Konsisten di beberapa sumber |
| Alamat | Jl. Bengawan No. 6, Cihapit, Bandung Wetan, Kota Bandung 40114 | Situs sekolah, Dapodik | Konsisten |
| Berdiri | Terdaftar 25 April 1967, di bawah Yayasan Salib Suci | Halaman Sejarah situs sekolah | Konsisten |
| Akreditasi | A | Ringkasan pencarian (Dapodik) | Cek sertifikat BAN-PDM |
| Jumlah siswa | 437 | Ringkasan pencarian, semester tidak jelas | **Wajib diperbarui** dari Dapodik semester terbaru |
| Rombel | 15 (5 per tingkat) | Ringkasan pencarian | **Wajib diperbarui** |

### 6.3 Isian administratif

Nama tim, NIM, program studi, perguruan tinggi, dosen pendamping, biodata, surat pernyataan ketua, surat komitmen dana perguruan tinggi, surat kesediaan sekolah, uji similaritas (maks 25%).

Halaman pertama berkas .docx berisi **lembar kerja tim** yang mendaftar semua penanda verifikasi beserta letaknya. Hapus halaman itu sebelum mengunggah.

### 6.4 Ketentuan penggunaan AI

Template PKM 2025 menyebut surat pernyataan ketua memuat butir kepatuhan terhadap ketentuan penggunaan kecerdasan artifisial. Draf ini saya susun sebagai AI. Sebelum mengirim: baca ketentuan AI di panduan terbaru, tulis ulang bagian yang perlu dengan kata-kata tim, pastikan setiap anggota memahami setiap rujukan (reviewer dan juri PIMNAS bisa bertanya), lalu nyatakan penggunaan AI sesuai ketentuan.

## 7. Risiko proposal dan mitigasinya

| Risiko | Mitigasi di proposal |
|---|---|
| Reviewer menilai "sistem RFID sudah banyak" | Tabel pembanding di Bab 2 dan paragraf kebaruan di 1.1 |
| Melebihi 10 halaman | Hasil render LibreOffice: inti ±9,5 halaman (Bab 1 di halaman 1, daftar pustaka berakhir di tengah halaman 10). Word bisa sedikit berbeda; cek ulang setelah penanda terisi. Kalau lebih, pindahkan Tabel 2.1 atau Tabel 3.1 ke lampiran |
| Data anak dan foto | Persetujuan orang tua, retensi foto 30 hari, akses berbasis peran, tanpa pengenalan wajah otomatis |
| Sekolah sudah punya AIMSIS | Posisi sebagai lapisan penangkap + ekspor data |
| Harga berubah | Harga satuan ditandai estimasi; siapkan bukti harga |
| Panduan berubah | Tabel ketentuan di bagian 2 menjadi daftar cek |

## 8. Sumber yang dipakai untuk analisis ini

- Template PKM 2025 (PKM-KC, PKM-PI): https://github.com/dananghilalkurniawan/Template-Proposal-PKM-Tahun-2025
- Halaman unduhan Panduan PKM 2026 (Belmawa): https://simbelmawa.kemdiktisaintek.go.id/portal/unduh/panduan-pkm-2026/
- Panduan PKM-KC 2026 (PDF): https://simbelmawa.kemdiktisaintek.go.id/portal/wp-content/uploads/2026/03/PKM-KC-2026_fix.pdf
- Profil sekolah (Dapodik Kota Bandung): https://simdik.bandung.go.id/npsn/20219265
- Situs sekolah, Sejarah: https://smasantamaria1.sch.id/?page_id=3434
- AIMSIS: https://aimsis.com/
- Daftar pustaka lengkap dengan DOI/URL ada di akhir `2026-09-27_isi-proposal_draft-ke-1.md`.
