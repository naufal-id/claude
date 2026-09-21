# Preview Varian Desain, Set Arah Baru (11 sampai 16)

Enam berkas HTML mandiri, hasil dari `../2026-09-20_arah-desain-baru_draft-ke-1.md`.
Buka `spesimen-arah-baru.html` untuk pintu masuk ke keenamnya, atau buka tiap
berkas langsung di browser. Sesuai K-09, berkas ini bahan seleksi, bukan fondasi
kode produksi.

## Daftar berkas

| Berkas | Arah | Palet | Gerak khas | Font |
|---|---|---|---|---|
| `varian-11-papan-penempatan-2d.html` | G Papan Penempatan | 2d | Bilah papan membalik | Schibsted Grotesk + Atkinson Hyperlegible |
| `varian-12-rak-penempatan-1c.html` | H Rak Penempatan | 1c | Pintu kompartemen bergeser buka | Gantari + Public Sans |
| `varian-13-daftar-periksa-2d.html` | I Daftar Periksa | 2d | Tanda centang tergambar | Familjen Grotesk |
| `varian-14-perlengkapan-lapangan-1c.html` | J Perlengkapan Lapangan | 1c | Benda merapat ke posisi | Hubot Sans |
| `varian-15-kolam-pelamar-2d.html` | K Kolam Pelamar | 2d | Token mengalir ke penempatan | Mona Sans + Onest |
| `varian-16-berkas-pekerja-1c.html` | L Berkas Pekerja | 1c | Respons tekan, tab membuka | Karla + Public Sans |

Palet bergantian 2d, 1c, 2d, 1c, 2d, 1c. Tiga dan tiga.

## Yang sudah diperiksa

Diuji dengan Chromium (Playwright) di 375px, 834px, dan 1440px.

- Delapan section wajib ada di tiap berkas: header, hero, segmen, alur, kapasitas, legalitas, lowongan, kontak dan footer
- Pintu pelamar dan pernyataan tanpa biaya terlihat di layar pertama pada tiga lebar
- Kotak cek kode punya tiga keadaan: kosong, ditemukan (NEP-2026-0001), dan tidak terdaftar. Diuji otomatis, semua berfungsi
- Tanpa scroll horizontal di 375px pada keenam berkas
- Semua nilai hex ada di dua palet terkunci. Warna turunan di atas blok gelap memakai `color-mix()` dari token palet, bukan hex baru
- Tanpa em dash di seluruh teks
- Ikon lima segmen digambar sendiri sebagai SVG inline, bukan dari pustaka
- Slot foto memakai blok berlabel dua baris huruf kecil, bukan foto stok
- Angka asli saja (4 wilayah, 5 segmen, 4 tahap, Rp0). Sisanya bingkai "Menunggu data"
- Bar bawah dua tombol muncul di mobile. Sasaran sentuh minimal 44px
- Gerak hanya `transform`, `opacity`, dan `clip-path`. Berhenti penuh di `prefers-reduced-motion`
- Fallback `<noscript>`: kalau JavaScript mati, semua konten tetap tampil (tanpa `!important`)

## Catatan

- Font ditarik dari Google Fonts lewat `<link>` khusus untuk preview. Di produksi, font dihosting sendiri sesuai `tech-stack-elemen`. Kalau jaringan memblokir Google Fonts, halaman jatuh ke font sistem tanpa merusak tata letak
- Anggaran gerak yang diperluas mengikuti usulan K-38 di dokumen arah. Perlu persetujuan tertulis sebelum dibawa ke produksi
- Langkah berikutnya sesuai protokol varian: nilai dengan rubrik bagian 5, isi kolom Status, lalu saring bersama klien
