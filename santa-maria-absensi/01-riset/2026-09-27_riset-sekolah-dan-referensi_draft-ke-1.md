# Riset Sekolah dan Referensi: Web Absensi GPS dan WiFi

Draft ke-1, 27 September 2026

Bahan dasar untuk lima arah desain di `../02-desain/`. Isinya tiga bagian: fakta sekolah yang boleh dipakai di desain, kebutuhan pengguna, dan referensi pola (termasuk pola yang sengaja dihindari).

---

## 1. Fakta sekolah

Hanya data di tabel ini yang ditampilkan sebagai fakta di dalam desain. Sisanya ditandai data contoh.

| Data | Isi | Sumber |
|---|---|---|
| Nama resmi di Dapodik | SMAS St Maria 1 Bandung | Dapodik, Kemdikbud |
| Alamat | Jl. Bengawan No. 6, Cihapit, Bandung Wetan, Kota Bandung 40114 | Situs sekolah, Dapodik |
| Koordinat | Lintang -6,9114, bujur 107,6315 | Sekolahloka |
| Telepon | (022) 7205804 | Situs sekolah |
| NPSN | 20219265 | Dapodik |
| Akreditasi | A (SK 02.00/203/SK/BAN-SM/XII/2018) | Data sekolah Kemdikbud |
| Yayasan | Yayasan Salib Suci Bandung | Wikipedia, situs YSS |
| Sejarah singkat | Kegiatan sekolah dimulai 1967, awalnya bernama SMA Pembangunan, memakai gedung SMPK Providentia pada siang hari. SK pendirian 1970 | Wikipedia, Dapodik |
| Jam masuk | 06.55, Senin sampai Jumat | Profil sekolah |
| Pola belajar | Sehari penuh, 5 hari | Data sekolah Kemdikbud |
| Rombel | 6 kelas per tingkat, rata-rata 30 siswa | Profil sekolah |
| Ekstrakurikuler | Rabu, Kamis, Jumat. Antara lain jurnalistik, fotografi, pemrograman, pramuka, bahasa Jerman dan Mandarin | Profil sekolah |
| Fasilitas terkait | WiFi gratis, CCTV, laboratorium komputer | Data sekolah Kemdikbud |
| Kurikulum | Kurikulum Merdeka | Dapodik |

Catatan:

- Logo sekolah dan warna resmi tidak ditemukan di sumber yang bisa dibaca. Desain tidak meniru logo. Nama sekolah ditulis sebagai teks.
- Lambang Yayasan Salib Suci disebut berupa salib merah dan putih di atas hitam. Hub pembanding memakai merah tua sebagai aksen kecil, bukan sebagai klaim warna resmi sekolah.
- Jam pulang tidak ditemukan. Desain tidak menampilkan jam pulang dan menulis "absen pulang dibuka setelah jam pelajaran selesai".
- Nama SSID WiFi sekolah tidak diketahui dan memang tidak diperlukan (lihat bagian 3).

## 2. Pengguna dan kebutuhannya

| Pengguna | Momen | Yang dibutuhkan | Akibat ke desain |
|---|---|---|---|
| Siswa | Pagi, buru-buru, sebelum bel 06.55 | Absen dalam dua ketukan, tahu kenapa gagal | Satu tombol utama, pesan gagal yang menyebut langkah perbaikan, jam dan sisa menit ke bel selalu terlihat |
| Siswa | GPS mati, HP tidak di WiFi, di luar pagar | Jalan keluar | Empat keadaan dengan pesan berbeda, jalur manual lewat guru piket |
| Orang tua | Pagi di kantor atau rumah | Kepastian anak sudah sampai | Status hari ini sebagai satu kalimat atau satu angka besar, kabar WhatsApp |
| Orang tua | Anak sakit | Kirim izin tanpa datang ke sekolah | Form izin singkat, pilihan hari, lampiran surat dokter tidak wajib |
| Orang tua | Akhir bulan | Pola kehadiran | Rekap bulanan dengan kode H, T, S, I, A yang dikenal dari buku absen |

Kode H (hadir), S (sakit), I (izin), A (alpa) diambil dari kebiasaan buku absen kelas di Indonesia. T (terlambat) ditambahkan karena sistem ini mencatat jam.

## 3. Riset teknis

- **Browser tidak bisa membaca SSID.** Halaman web tidak punya akses ke nama jaringan WiFi. Cara yang dipakai layanan absensi berbasis web adalah mencocokkan alamat IP publik jaringan kantor (contoh: Lark, "Wi-Fi attendance based on public IP address"). Desain menulis "jaringan dikenali dari alamat IP sekolah", bukan menampilkan nama SSID.
- **Radius geofence.** Mekari Talenta memakai radius bawaan 80 m, dengan rentang 50 sampai 1000 m dan pilihan intensitas 10, 50, atau 100 m. Desain mengusulkan 75 m dari titik Jl. Bengawan 6 sebagai titik awal uji lapangan, ditandai sebagai usulan.
- **Alur absen.** Talenta memvalidasi lokasi di peta dulu, baru langkah berikutnya. Desain mengikuti urutan itu: cek dulu, baru tombol absen aktif. Riset absensi sekolah di jurnal (Jamika Unikom, Komtika Unimma) menyebut tombol absen dinonaktifkan di luar area, sama dengan desain ini.
- **Notifikasi orang tua.** Aplikasi absensi sekolah lokal (SchoolMantic, absen.web.id) mengirim kabar lewat WhatsApp atau Telegram. Desain memakai WhatsApp karena paling umum dipakai orang tua.
- **Brightwheel** memisahkan absensi yang dikabarkan ke orang tua dan yang tidak. Desain memberi orang tua empat pilihan kabar yang bisa dimatikan satu per satu.

## 4. Referensi pola dan yang dihindari

Dilihat di Dribbble (tag attendance app, shot "School Attendance Mobile UI") dan Behance (pencarian "attendance app", "parent app school").

Pola yang paling sering muncul, dan karena itu dihindari sebagai bentuk dasar:

- Dasbor ungu atau biru dengan gradasi, kartu statistik empat kotak, dan grafik donat kehadiran
- Tombol bulat besar dengan sidik jari atau ikon lokasi di tengah layar
- Ilustrasi orang 3D atau gaya Undraw di layar kosong
- Kalender tujuh hari penuh, padahal sekolah hanya Senin sampai Jumat

Yang diambil sebagai gantinya: benda nyata dari dunia sekolah di Indonesia. Seragam putih abu-abu dan badge OSIS, buku penghubung dan buku tulis bergaris margin merah, kartu pelajar dan stempel sekolah, papan tulis hijau dan turus, jadwal pelajaran dan bel masuk.

## 5. Sumber

1. Situs resmi SMA Santa Maria 1 Bandung: https://smasantamaria1.sch.id/
2. Wikipedia: https://id.wikipedia.org/wiki/SMA_Santa_Maria_1_Bandung
3. Dapodik: https://dapo.dikdasmen.go.id/sekolah/C5B1427A6684FE23FC08
4. Data sekolah Kemdikbud: https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/f28dd944-a9a2-42b9-8d16-c050775f61a1
5. Sekolahloka: https://sekolahloka.com/data/smas-st-maria-1-bandung/
6. Yayasan Salib Suci: https://yss.my.id/tentang-kami/
7. Mekari Talenta, Live Attendance: https://help-center.talenta.co/hc/en-us/articles/11229563878553-Live-Attendance-Overview
8. Lark, absensi WiFi berdasarkan IP publik: https://www.larksuite.com/hc/en-US/articles/360048487788-admin-set-up-wi-fi-attendance-based-on-public-ip-address
9. Brightwheel, berbagi absensi ke orang tua: https://help.mybrightwheel.com/en/articles/5599812-share-attendance-with-parents
10. Dribbble: https://dribbble.com/tags/attendance_app
11. Behance: https://www.behance.net/search/projects/Parent%20app%20school
12. Koder.ai, membuat aplikasi absensi kelas: https://koder.ai/id/blog/buat-aplikasi-absensi-kelas

Beberapa situs (situs sekolah, Wikipedia, Dapodik Bandung) tidak bisa dibuka langsung dari lingkungan kerja ini. Isinya diambil dari ringkasan hasil pencarian, jadi sebaiknya dicek ulang ke sekolah sebelum dipakai di versi akhir.
