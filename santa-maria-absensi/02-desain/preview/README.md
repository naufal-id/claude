# Pratinjau Lima Arah Desain

Berkas HTML mandiri. Buka `index.html` untuk pintu masuk dan fitur pembanding.

| Berkas | Arah | Huruf | Cara absen |
|---|---|---|---|
| `d1-putih-abu.html` | 1 Putih Abu-Abu | Onest | Satu tombol kuning, badge HADIR |
| `d2-buku-penghubung.html` | 2 Buku Penghubung | Newsreader + Figtree | Kabar ditulis sebagai kalimat |
| `d3-kartu-pelajar.html` | 3 Kartu Pelajar | Lexend + Red Hat Mono | Tekan dan tahan kartu 1 detik |
| `d4-papan-tulis.html` | 4 Papan Tulis | Archivo | Tombol kapur, turus untuk jumlah hadir |
| `d5-jam-pelajaran.html` | 5 Jam Pelajaran | Bricolage Grotesque + Albert Sans | Pita waktu dengan garis bel 06.55 |
| `shared.js` | Data sekolah, data contoh, simulasi GPS dan WiFi, form izin, panel demo | | |
| `shots/` | 40 tangkapan layar (5 desain, 4 layar, HP dan laptop) untuk halaman pembanding | | |

Layar di tiap desain: `#absen` dan `#riwayat-siswa` untuk siswa, `#pantau`,
`#izin`, dan `#riwayat-ortu` untuk orang tua.

## Yang sudah diperiksa

- Uji klik otomatis Chromium di 375 px dan 1280 px: 274 cek, 0 gagal
- Tanpa scroll horizontal di 375 px pada semua layar
- Kontras 46 pasangan warna, semua minimal 4,5 : 1
- Mode gelap Arah 1, 2, 3, 5 dan halaman pembanding. Arah 4 sengaja satu tema gelap
- Gerak berhenti di `prefers-reduced-motion`
- Tanpa em dash

## Catatan

- Font dimuat dari Google Fonts. Kalau diblokir, halaman jatuh ke font sistem tanpa merusak tata letak
- Lokasi, jaringan, dan kabar WhatsApp disimulasikan. Tidak ada data yang dikirim ke mana pun
