# Arah Desain Baru: Enam Pilihan untuk Varian 11 sampai 16

Draft ke-1, 20 September 2026

Set arah kedua, dibuat atas permintaan: enam arah yang benar-benar baru, bukan turunan dari `arah-desain` draft ke-1 (arah A sampai F). Tujuannya sama, yaitu bahan seleksi klien, tapi dengan penekanan pada gerak dan interaksi yang lebih hidup, tanpa mengorbankan HP kelas bawah.

Berkas ini tunduk pada aturan yang sama dengan set pertama. Palet, teks placeholder, delapan section wajib, lima lapis keamanan, dan larangan visual tidak berubah. Yang baru hanya enam gagasan, enam elemen khas, dan satu anggaran gerak yang diperluas.

Berkas pendamping wajib dilampirkan saat generate: `brief-desain` draft ke-2, `token-warna` draft ke-2, `riset-referensi-tipografi` draft ke-1, `protokol-varian` draft ke-2, skill `nep-desain`.

---

## 0. Kenapa set kedua ini ada

Permintaan klien lewat kamu: sesuatu yang baru, modern, minimalis, tapi lebih banyak animasi dan efek, tidak monoton. Warna wajib tetap dua palet terkunci (K-01), dipakai bergantian.

Dua hal yang saya jaga supaya permintaan itu tidak merusak proyek:

1. **Baru bukan berarti membuang disiplin.** Semua arah di sini tetap lolos rubrik anti generik di `protokol-varian` bagian 5. Tidak ada gradasi hiasan, tidak ada kit kartu SaaS, tidak ada aksesori template. Perbedaannya, keberanian ditaruh di gerak dan di satu elemen khas, bukan di warna atau ornamen.
2. **Animasi lebih banyak butuh anggaran baru yang tertulis.** Aturan lama membatasi gerak ke satu momen per halaman (tech-stack §11, rubrik G10). Permintaan ini melanggar aturan itu. Sesuai aturan pertentangan di README, saya tidak diam-diam memilih. Saya ajukan anggaran gerak baru di bagian 2 dan usulan keputusan K-38 di bagian 9. Perlu persetujuan tertulis sebelum dipakai.

Enam arah lama tidak dibatalkan. Set ini menambah kolam pilihan. Kalau klien akhirnya menyukai gerak, arah G sampai L jadi kandidat utama. Kalau klien memilih ketenangan, arah A sampai F tetap tersedia.

---

## 1. Ringkasan

| Kode | Varian | Nama | Kelompok | Palet | Elemen khas | Gerak khas | Keluarga huruf |
|---|---|---|---|---|---|---|---|
| G | 11 | Papan Penempatan | Berani | 2d | Papan flip berisi penempatan dan kode | Bilah membalik satu per satu | Schibsted Grotesk + Atkinson Hyperlegible Next |
| H | 12 | Rak Penempatan | Menengah | 1c | Rak kompartemen lima segmen | Pintu kompartemen bergeser buka | Gantari + Public Sans |
| I | 13 | Daftar Periksa | Aman | 2d | Ledger verifikasi dengan tanda centang | Garis centang tergambar saat tergulir | Familjen Grotesk |
| J | 14 | Perlengkapan Lapangan | Menengah | 1c | Susunan perlengkapan lapangan tertata | Benda merapat ke posisi sekali | Hubot Sans |
| K | 15 | Kolam Pelamar | Berani | 2d | Ladang token pelamar menuju penempatan | Token mengalir dan mengendap | Mona Sans + Onest |
| L | 16 | Berkas Pekerja | Aman | 1c | Tab berkas pekerja dan berkas perusahaan | Respons tekan, tanpa gerak otomatis | Karla + Public Sans |

Palet bergantian 2d, 1c, 2d, 1c, 2d, 1c. Tiga dan tiga, seimbang, sesuai aturan seleksi.

Setiap arah lahir dari benda atau proses nyata di dunia alih daya: papan pengumuman penempatan, rak loker pekerja, lembar seleksi, perlengkapan lapangan, kolam pelamar, dan berkas pekerja. Itu yang membuatnya sulit ditiru generator yang tidak membaca brief, dan itu yang membuatnya lolos uji kembar di `protokol-varian` bagian 5.3.

Empat dari enam memakai font yang belum dipakai varian mana pun (Schibsted Grotesk, Gantari, Familjen Grotesk, Karla), supaya set ini terasa segar berdampingan dengan varian 1 sampai 10. Gantari (Lafontype) dan Mona Sans (Degarism, dengan jejak Medan) membawa cerita perancang Indonesia yang dicatat di `riset-referensi-tipografi`.

---

## 2. Prinsip: minimalis, gerak yang jadi ornamen

Minimalis dan banyak animasi bukan lawan. Justru pasangan. Kalau permukaan tenang, gerak punya ruang untuk terbaca. Kalau permukaan ramai, gerak menambah kebisingan.

Aturan pegangan untuk keenam arah:

1. **Bidang tetap sepi.** Satu warna dominan per section, satu blok berat, banyak ruang kosong. Warna aksen dipakai hemat.
2. **Gerak yang membawa arti, bukan hiasan.** Bilah membalik memberi tahu kode berubah. Pintu terbuka memberi tahu isi segmen. Token mengalir memberi tahu pelamar jadi penempatan. Gerak tanpa arti dibuang.
3. **Satu elemen khas jadi bintang.** Sisanya diam dan disiplin. Menggabungkan dua elemen khas dalam satu situs menghapus alasan masing masing ada.
4. **Umpan balik saat ditekan lebih penting dari animasi yang jalan sendiri.** Ini yang membuat situs terasa cepat untuk pelamar muda, sesuai arti "muda" di `brief-desain` bagian 2.1.

### 2.1 Anggaran gerak yang diperluas

Menggantikan aturan satu momen per halaman untuk set arah ini. Butuh persetujuan (lihat K-38 di bagian 9).

| Boleh | Tidak boleh |
|---|---|
| Gerak lebih dari satu tempat, asal tiap tempat punya alasan | Gerak di setiap section tanpa alasan |
| Hanya `transform`, `opacity`, dan `clip-path` | `height`, `top`, `width`, `margin`, `filter: blur` |
| CSS scroll-driven animation dengan fallback IntersectionObserver | Animasi yang menahan gulir atau parallax yang melawan gulir |
| Satu pustaka gerak ringan di bawah 5KB lewat impor dinamis, kalau CSS tidak cukup | Dua pustaka, atau pustaka di layout akar |
| Jumlah node bergerak dibatasi, dan diturunkan lagi di layar kecil | Ratusan node bergerak di HP kelas bawah |
| Setiap gerak punya keadaan diam penuh untuk `prefers-reduced-motion` | Gerak yang tidak bisa dimatikan |
| Kursor dan fokus tetap terlihat selama gerak | Kursor kustom, teks muncul huruf per huruf, video latar |

Ambang yang tidak berubah: LCP di bawah 2,5 detik di Android kelas menengah 4G lambat, pergeseran layout di bawah 0,05, nol permintaan lintas domain saat muat. Gerak yang menyentuh properti non komposit otomatis melanggar pergeseran layout, jadi batasan properti di atas sekaligus menjaga ambang itu.

**Preview lebih kaya dari produksi.** Berkas preview dibuang setelah seleksi (K-09). Di preview, gerak boleh lebih ekspresif untuk memancing reaksi klien. Saat varian dipilih, tandai gerak mana yang masuk anggaran produksi dan mana yang hanya untuk memikat di seleksi. Catat itu di `tech-stack` bagian 11 saat pemetaan keputusan.

---

## 3. Cara memakai

### 3.1 Skill dan alat

Kalau digenerate di Claude Code atau Claude Design, muat skill ini sebelum menulis satu baris HTML:

| Skill | Dipakai untuk |
|---|---|
| `nep-desain` | Aturan generator utama. Palet, section wajib, teks placeholder, lima klaster AI, sebelas sumbu |
| `artifact-design` | Dasar tata letak, tipografi, tema terang, ukuran preview satu berkas |
| `artifact-diagramming` | SVG inline: ikon lima segmen buatan sendiri, papan flip, ladang token, peta kompartemen |
| `antislop`, `antislop-ui`, `antislop-human` | Penyaring anti generik. `antislop-human` punya pemeriksa kontras yang sejalan dengan `token-warna` bagian 3 |
| `dataviz` | Hanya untuk arah K, saat menggambar kolam pelamar dan kapasitas. Angka asli saja, sisanya bingkai "Menunggu data" |

Aturan alat lain tetap sama dengan `arah-desain` draft ke-1 bagian "Catatan per alat": v0, Lovable, dan Bolt condong ke Tailwind, shadcn, dan Geist, jadi larang ketiganya secara eksplisit. ChatGPT dan Gemini sering menambah abu abu sendiri, jadi periksa setiap hex dengan `grep -o '#[0-9a-fA-F]\{3,6\}'`.

### 3.2 Satu arah per percakapan

Meminta enam sekaligus menghasilkan enam yang saling mirip. Kerjakan satu, nilai dengan rubrik, baru lanjut.

### 3.3 Pembungkus prompt

Sama dengan set pertama, dengan satu tambahan tentang gerak. Tempel ini, lalu tempel Blok arah yang dipilih tepat di bawahnya.

```text
Kamu desainer utama untuk preview website PT Nusa Era Pradana, penyedia tenaga
kerja alih daya di Sumatera Utara.

Baca lima lampiran sampai habis: brief-desain draft ke-2, token-warna draft ke-2,
skill nep-desain, riset-referensi-tipografi, dan arah-desain-baru draft ke-1
bagian 2 tentang anggaran gerak. Kalau ada pertentangan, brief dan skill yang
menang, kecuali soal jumlah momen gerak, yang mengikuti bagian 2 arah-desain-baru.

Buat SATU berkas HTML mandiri untuk arah di bawah. Pakai nilai sumbu persis
seperti tertulis. Pakai teks placeholder resmi dari skill, jangan mengarang.

Gerak: boleh lebih dari satu tempat, tapi hanya transform, opacity, dan clip-path.
Tidak ada animasi pada height, top, width, atau blur. Semua gerak berhenti penuh
di prefers-reduced-motion dan menampilkan keadaan akhirnya langsung. Tidak ada
parallax, tidak ada penahan gulir, tidak ada kursor kustom.

Kerjakan dalam dua langkah.

Langkah 1, rencana. Tulis: warna yang dipakai beserta perannya, peran tiap font
dan beratnya, wireframe ASCII untuk 1440px dan 375px, cara elemen khas muncul,
dan daftar tiap gerak beserta properti CSS-nya dan keadaan reduced-motion-nya.
Bandingkan rencana dengan lima klaster AI di skill. Sebutkan bagian yang mirip
dan apa yang kamu ubah.

Langkah 2, kode. Tulis berkasnya. Setelah itu isi checklist skill sebagai tabel
lulus atau gagal, tambah baris untuk anggaran gerak, dan tulis daftar hal yang
masih kamu ragukan.

[TEMPEL BLOK ARAH DI SINI]
```

---

## G. Papan Penempatan

**Varian 11, kelompok berani, palet 2d.** Nama berkas: `varian-11-papan-penempatan-2d.html`

### Gagasan

Perusahaan alih daya memindahkan orang ke lokasi. Papan penempatan yang membalik bilah, seperti papan jadwal di stasiun lama, adalah bentuk paling jujur untuk "setiap orang punya tujuan yang tercatat". Papan menampilkan posisi, wilayah, dan kode verifikasi. Saat pelamar mengetik kode di kotak cek, papan membalik untuk menjawab, ditemukan atau tidak terdaftar. Gerak membalik jadi bukti bahwa alat verifikasi hidup, bukan hiasan.

Beranda tetap milik calon klien (K-02). Papan muncul di hero sebagai diagram kanan, dan di section Lowongan sebagai kotak cek kode. Sisa halaman rata kiri dan tenang.

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | 12 kolom |
| Lebar | 1440px |
| Hero | Teks kiri, papan flip kanan |
| Font | Schibsted Grotesk + Atkinson Hyperlegible Next |
| Sudut | 4px |
| Segmen | Strip horizontal, tiap segmen satu baris di papan |
| Navigasi | Bar dengan topbar berisi status kanal resmi |
| Irama | Padat |
| Elemen khas | Papan flip penempatan |
| Skala huruf | Kontras ukuran ekstrem |
| Gerak | Bilah membalik satu per satu, sekali saat masuk layar dan sekali saat kotak cek kode dijawab |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Judul hero, judul section | Schibsted Grotesk | 700 | 32 sampai 56px | Tinggi baris 1,05, jarak huruf -0,02em |
| Isi | Atkinson Hyperlegible Next | 400 | 17px | Lebar maksimal 66ch |
| Teks bilah papan, kode, posisi | Atkinson Hyperlegible Next | 600 | 18 sampai 28px | `font-variant-numeric: tabular-nums`, membedakan O dan 0 |

Dua keluarga, tiga berat. Atkinson wajib untuk kode karena membedakan O dan 0, I dan 1. Kode yang salah baca dari poster Instagram menghasilkan "tidak terdaftar" untuk lowongan asli.

### Elemen khas

Papan berisi baris bilah. Tiap bilah punya kolom: posisi, wilayah, jenis penempatan, kode. Bilah membalik dengan `transform: rotateX()` pada dua bagian atas dan bawah. Warna papan `--ink`, teks `--latar`. Baris berhasil memakai `--utama` plus ikon centang. Baris tidak terdaftar memakai teks `--ink`, tepi `--sekunder` 2px, ikon peringatan, dan kalimat, sesuai K-35, tanpa warna merah baru.

Batas. Papan hanya di hero dan section Lowongan. Papan tidak dipakai untuk legalitas, alur, atau kontak. Tidak ada suara, tidak ada tekstur logam.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Bilah hero membalik saat masuk layar | `transform: rotateX`, `opacity`, bertahap antar bilah maksimal 8 bilah | Papan tampil sudah terbaca penuh |
| Bilah kode membalik saat kotak cek dijawab | `transform: rotateX` pada bilah kode saja | Teks hasil berganti tanpa membalik |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| Situs resmi, IG @ptnusaerapradana, WA menunggu data   [topbar]     |
+--------------------------------------------------------------------+
| NEP   Layanan  Cara Kerja  Legalitas  Lowongan  Kontak  [Ajukan]   |
+---------------------------------+----------------------------------+
| Satu vendor untuk               |  PAPAN PENEMPATAN                |
| tenaga lapangan Anda            |  Satpam   Medan   ritel  NEP-...1|
|                                 |  Kurir    Binjai  logistik NEP-2|
| Kami merekrut dan menempatkan,  |  Kasir    Medan   ritel  NEP-..3|
| lalu memegang kontrak dan       |  [bilah membalik satu per satu] |
| payroll-nya.                    |                                 |
| [Ajukan Kebutuhan]              |  Sedang cari kerja?             |
|                                 |  [Lihat Lowongan]               |
+---------------------------------+----------------------------------+
| Strip lima segmen sebagai baris papan yang tenang                  |
+--------------------------------------------------------------------+

375px: teks B2B dulu, papan flip penuh lebar di bawahnya tetap di
layar pertama. Pintu pelamar dan pernyataan tanpa biaya di layar
pertama. Topbar jadi satu baris geser.
```

### Jebakan

- Papan jadi mainan dengan efek logam, bayangan, dan suara. Dilarang. Bilah polos, warna palet.
- Membalik terus menerus jadi latar animasi. Hanya sekali masuk dan sekali saat menjawab kode.
- Biru dan hijau seimbang di satu section. Salah satu harus dominan (aturan 2d).

### Blok arah

```text
ARAH G, PAPAN PENEMPATAN. Varian 11. Palet 2d.
Nama berkas: varian-11-papan-penempatan-2d.html

Sumbu: grid 12 kolom; lebar 1440px; hero teks kiri dan papan flip kanan; font
Schibsted Grotesk 700 untuk judul, Atkinson Hyperlegible Next 400 untuk isi dan
600 untuk teks bilah, kode, posisi dengan tabular-nums; sudut 4px; lima segmen
sebagai strip baris papan; navigasi bar dengan topbar kanal resmi; irama padat;
skala kontras ukuran ekstrem.

Elemen khas: papan flip. Bilah dengan kolom posisi, wilayah, jenis penempatan,
kode NEP-2026-0001. Papan --ink, teks --latar. Baris berhasil --utama plus
centang. Baris tidak terdaftar teks --ink, tepi --sekunder 2px, ikon dan kalimat,
tanpa merah baru. Papan HANYA di hero dan Lowongan.

Gerak: bilah hero membalik bertahap sekali saat masuk layar, maksimal 8 bilah,
transform rotateX dan opacity. Bilah kode membalik sekali saat kotak cek dijawab.
prefers-reduced-motion: papan tampil terbaca penuh, hasil kode berganti tanpa
membalik. Tanpa logam, tanpa suara, tanpa bayangan.

Skala: judul clamp 32px sampai 56px tinggi baris 1,05, isi 17px lebar 66ch,
teks bilah 18px sampai 28px.
```

---

## H. Rak Penempatan

**Varian 12, kelompok menengah, palet 1c.** Nama berkas: `varian-12-rak-penempatan-1c.html`

### Gagasan

Pekerja lapangan punya loker dan kompartemen. Rak kompartemen adalah bentuk untuk "kami menata orang ke perannya masing masing". Lima segmen jasa jadi lima kompartemen di dinding rak. Kompartemen terbuka saat ditekan atau saat tergulir masuk, menampilkan posisi dan satu kalimat. Pintu pelamar adalah satu kompartemen besar yang berbeda warna, selalu terbuka, sebagai jalan cepat ke lowongan.

Beranda milik calon klien (K-02). Blok `--deep` besar di layar pertama memenuhi penangkal klaster krem (K-36).

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | Asimetris 8+4, rak delapan kolom plus sidebar empat |
| Lebar | 1180px |
| Hero | Teks bertumpuk di atas blok `--deep` |
| Font | Gantari + Public Sans |
| Sudut | Campuran, siku pada kompartemen, bulat pada gagang dan tombol |
| Segmen | Grid kartu dengan lebar berbeda, tiap kompartemen ukuran sesuai bobot |
| Navigasi | Bar atas |
| Irama | Selang-seling |
| Elemen khas | Rak kompartemen |
| Skala huruf | Moderat |
| Gerak | Pintu kompartemen bergeser buka saat interaksi, plus satu pengendapan rak saat muat |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Judul hero, judul section | Gantari | 700 | 32 sampai 52px | Tinggi baris 1,1. Gantari hanya untuk judul, bukan angka |
| Isi | Public Sans | 400 | 17px | Lebar maksimal 68ch |
| Label kompartemen, kode, tombol | Public Sans | 600 | 15 sampai 18px | Angka tabular untuk kode |

Gantari dirancang Anugrah Pasau dari Lafontype, foundry Indonesia. Cocok jadi cerita merek untuk perusahaan Medan. Gantari tidak punya angka tabular, jadi semua angka dan kode memakai Public Sans.

### Elemen khas

Rak adalah grid kompartemen sudut siku. Tiap kompartemen punya pintu tipis. Saat ditekan atau tergulir masuk, pintu bergeser dengan `transform: translateX` dan isi muncul dengan `opacity`. Ikon segmen digambar sendiri sebagai SVG, tebal garis sama dengan tebal garis judul. Kompartemen pintu pelamar berwarna `--utama`, lebih besar, selalu terbuka.

Batas. Kompartemen bukan bento trendi dengan sudut membulat besar. Sudut siku, ukuran mengikuti bobot isi, bukan hiasan. Tidak ada bayangan bertumpuk.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Rak mengendap saat muat | `transform: translateY` kecil, `opacity`, sekali | Rak tampil di posisi akhir |
| Pintu kompartemen bergeser buka | `transform: translateX`, `opacity` pada isi | Kompartemen sudah terbuka, isi terlihat |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| NEP        Layanan  Cara Kerja  Legalitas  Lowongan  Kontak [Ajukan]|
+--------------------------------------------------------------------+
|############### blok --deep ########################################|
|##  Satu vendor untuk tenaga lapangan Anda                        ##|
|##  [Ajukan Kebutuhan]                                            ##|
|####################################################################|
| RAK PENEMPATAN                             | Pintu pelamar --utama |
| +----------+ +--------+ +-----------+      | Sedang cari kerja?    |
| | Keamanan | | Trans  | | Ritel     |      | [Lihat Lowongan]      |
| | [buka]   | | [tutup]| | [tutup]   |      | (selalu terbuka)      |
| +----------+ +--------+ +-----------+      |                       |
| +--------------+ +-----------+             |                       |
| | Pemasaran    | | HRD       |             |                       |
| +--------------+ +-----------+             |                       |
+--------------------------------------------------------------------+

375px: blok --deep dulu, pintu pelamar --utama tetap di layar pertama
di bawah tombol Ajukan. Rak jadi satu kolom, kompartemen menumpuk.
Bar bawah dua tombol.
```

### Jebakan

- Kompartemen jadi bento membulat identik dengan bayangan sama. Itu klaster K4. Sudut siku, ukuran berbeda.
- Terakota lebih dari satu elemen per layar. Aturan 1c: maksimal satu.
- Judul serif. Dilarang di 1c. Gantari adalah sans.
- Pintu terbuka semua sekaligus jadi latar animasi. Hanya yang aktif atau tergulir masuk.

### Blok arah

```text
ARAH H, RAK PENEMPATAN. Varian 12. Palet 1c.
Nama berkas: varian-12-rak-penempatan-1c.html

Sumbu: grid asimetris 8+4; lebar 1180px; hero teks bertumpuk di atas blok --deep;
font Gantari 700 untuk judul, Public Sans 400 untuk isi dan 600 untuk label dan
kode dengan tabular-nums; sudut campuran siku pada kompartemen bulat pada gagang;
lima segmen sebagai grid kompartemen lebar berbeda; navigasi bar atas; irama
selang-seling; skala moderat.

Elemen khas: rak kompartemen sudut siku, tiap segmen satu kompartemen berpintu,
ikon segmen digambar sendiri sebagai SVG setebal garis judul. Kompartemen pintu
pelamar --utama, lebih besar, selalu terbuka. BUKAN bento membulat.

Gerak: rak mengendap sekali saat muat dengan translateY dan opacity. Pintu buka
dengan translateX dan opacity saat ditekan atau tergulir masuk. prefers-reduced-
motion: rak dan kompartemen tampil di keadaan akhir. Tanpa bayangan bertumpuk.

Aturan 1c: judul tanpa serif, terakota maksimal satu elemen per layar, blok
--deep besar di layar pertama, tanpa tekstur kertas.

Skala: judul clamp 32px sampai 52px, isi 17px lebar 68ch.
```

---

## I. Daftar Periksa

**Varian 13, kelompok aman, palet 2d.** Nama berkas: `varian-13-daftar-periksa-2d.html`

### Gagasan

Rekrutmen adalah proses menyaring. Ledger dengan tanda centang adalah bentuk untuk "kami memeriksa, Anda bisa ikut memeriksa". Verifikasi keaslian lowongan jadi bintang. Kotak cek kode ada di hero sebagai diagram kanan, bukan tersembunyi di bawah. Tiap baris ledger punya tanda centang yang tergambar garisnya saat baris masuk layar. Ini arah paling tenang di set kedua, cocok untuk verifikator dan HRD.

Beranda milik calon klien (K-02). Bahasa bisnis di ledger utama, bahasa pelamar hanya di kotak cek kode dan pintu pelamar.

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | Dua kolom penuh, kolom perkara dan kolom keadaan |
| Lebar | 1180px |
| Hero | Teks kiri, kotak cek kode kanan |
| Font | Familjen Grotesk, satu keluarga |
| Sudut | 4px |
| Segmen | Tabel, tiap segmen satu baris ledger |
| Navigasi | Daftar isi melekat yang menandai section terbaca |
| Irama | Lapang |
| Elemen khas | Ledger verifikasi dengan tanda centang |
| Skala huruf | Moderat |
| Gerak | Garis centang tergambar saat baris tergulir masuk, di dalam section verifikasi saja |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Judul hero, judul section | Familjen Grotesk | 700 | 30 sampai 48px | Tinggi baris 1,1 |
| Isi, sel ledger | Familjen Grotesk | 400 | 17px | Angka tabular untuk kode dan nomor |
| Label, tombol | Familjen Grotesk | 600 | 15 sampai 16px | Huruf kecil biasa |

Satu keluarga, tiga berat. Familjen Grotesk paling ringan di katalog, 18KB, punya angka tabular, cocok untuk ledger yang penuh baris dan angka.

### Elemen khas

Ledger dua kolom: perkara di kiri, keadaan di kanan. Keadaan digambar dengan tanda centang SVG yang tergambar lewat `stroke-dashoffset`. Baris legalitas yang datanya belum ada memakai kotak "Menunggu data" dengan tepi putus-putus `--meta`, bukan centang. Kotak cek kode adalah baris ledger yang bisa diisi, dengan tiga keadaan: kosong, ditemukan, tidak terdaftar, di dalam wadah `aria-live="polite"`.

Batas. Tanda centang hanya di section verifikasi dan kapasitas, bukan di setiap section. Tidak ada garis rambut di setiap baris (itu klaster K3 koran). Pemisah tipis `--garis` hanya antar kelompok.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Garis centang tergambar | `stroke-dashoffset`, dipicu IntersectionObserver | Centang tampil penuh |
| Baris menyala saat terbaca | `opacity`, `transform: translateX` kecil | Baris tampil di keadaan akhir |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| NEP        Layanan  Cara Kerja  Legalitas  Lowongan  Kontak [Ajukan]|
+---------+------------------------------------+---------------------+
| Daftar  | Satu vendor untuk tenaga lapangan  |  Cek keaslian loker |
| isi     | Anda                               |  Kode lowongan      |
| melekat | Kami merekrut dan menempatkan.     |  [ NEP-______ ]     |
| Hero    | [Ajukan Kebutuhan]                 |  [Cek]              |
| Segmen  |                                    |  Sedang cari kerja? |
| Alur    |                                    |  [Lihat Lowongan]   |
| Legal   +------------------------------------+---------------------+
| Lowongan| Ledger lima segmen                                       |
| Kontak  |  Keamanan dan Fasilitas          v  Satpam, cleaning     |
|         |  Transportasi dan Logistik       v  Pengemudi, kurir    |
|         |  Ritel dan Operasional Toko      v  Kasir, crew store   |
+--------------------------------------------------------------------+

375px: daftar isi jadi bilah geser atas. Hero teks dulu, kotak cek
kode tepat di bawahnya tetap di layar pertama, lalu ledger satu kolom.
```

### Jebakan

- Garis rambut di mana mana, kolom rapat. Itu klaster K3. Pakai ruang lapang.
- Centang di setiap section jadi latar animasi. Hanya di verifikasi dan kapasitas.
- Titik tengah sebagai pemisah di sel ledger. Pakai koma atau baris baru.
- `--sekunder` untuk teks di bawah 16px. Dilarang, naikkan ke `--ink`.

### Blok arah

```text
ARAH I, DAFTAR PERIKSA. Varian 13. Palet 2d.
Nama berkas: varian-13-daftar-periksa-2d.html

Sumbu: grid dua kolom penuh perkara dan keadaan; lebar 1180px; hero teks kiri
dan kotak cek kode kanan; font Familjen Grotesk satu keluarga, 700 judul, 400
isi dan sel dengan tabular-nums, 600 label; sudut 4px; lima segmen sebagai tabel
ledger; navigasi daftar isi melekat yang menandai section terbaca; irama lapang;
skala moderat.

Elemen khas: ledger dua kolom dengan tanda centang SVG yang tergambar lewat
stroke-dashoffset. Baris data belum ada memakai kotak Menunggu data tepi
putus-putus --meta. Kotak cek kode adalah baris ledger dengan tiga keadaan
kosong, ditemukan, tidak terdaftar dalam aria-live polite.

Gerak: centang tergambar saat baris masuk layar, dibatasi ke section verifikasi
dan kapasitas. Baris menyala dengan opacity dan translateX kecil. prefers-
reduced-motion: centang dan baris tampil penuh. Tanpa garis rambut di setiap
baris, tanpa kolom rapat.

Skala: judul clamp 30px sampai 48px, isi 17px.
```

---

## J. Perlengkapan Lapangan

**Varian 14, kelompok menengah, palet 1c.** Nama berkas: `varian-14-perlengkapan-lapangan-1c.html`

### Gagasan

Pekerjaan NEP terjadi dengan perlengkapan: rompi, sarung tangan, senter, papan jalan, radio. Susunan perlengkapan yang tertata rapi di atas bidang, seperti foto knolling, adalah bentuk untuk "kami menyiapkan orang yang siap kerja". Ini membuat ikon lima segmen yang wajib digambar sendiri (brief §7.3) jadi bintang halaman, bukan tempelan pustaka. Perlengkapan merapat ke posisinya sekali saat masuk layar, memberi kesan penataan.

Beranda milik calon klien (K-02). Blok `--deep` selebar layar sebagai bidang penataan memenuhi penangkal klaster krem (K-36).

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | Kanvas bebas, benda diletakkan pada kisi tak terlihat |
| Lebar | Penuh dengan padding besar |
| Hero | Gambar penuh dengan panel teks padat `--permukaan` |
| Font | Hubot Sans, satu keluarga |
| Sudut | 0 |
| Segmen | Grid kartu dengan lebar berbeda, tiap segmen satu benda perlengkapan |
| Navigasi | Bar atas |
| Irama | Selang-seling |
| Elemen khas | Susunan perlengkapan lapangan tertata, ikon segmen jadi benda |
| Skala huruf | Lebar tinggi, Hubot Sans lebar 125 |
| Gerak | Benda merapat ke posisi sekali saat masuk layar, bertahap |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Judul hero | Hubot Sans, `font-stretch: 125%` | 800 | 36 sampai 60px | Tinggi baris 1,05 |
| Judul section | Hubot Sans, lebar 112 | 800 | 24 sampai 36px | |
| Isi | Hubot Sans, lebar 100 | 400 | 17px | |
| Label benda, ukuran, tombol | Hubot Sans, lebar 100 | 600 | 14 sampai 16px | Angka tabular untuk ukuran dan kode |

Satu keluarga, tiga berat. Hubot Sans lebih kotak dan teknis dari Mona Sans, cocok untuk kesan gambar teknik dan penataan terukur.

### Elemen khas

Perlengkapan digambar sebagai SVG garis, tebal garis sama dengan tebal garis judul. Lima benda mewakili lima segmen, digambar sendiri, bukan perisai, sapu, setir, keranjang, megafon dari pustaka. Tiap benda punya label ukuran kecil di sampingnya, seperti keterangan katalog teknik. Benda tersusun pada kisi tak terlihat, sudut siku, jarak seragam.

Slot foto memakai blok berlabel dua baris huruf kecil biasa, warna blok bergantian `--tint` dan `--deep`, sesuai K-08 dan K-34.

Batas. Bukan ilustrasi 3D, bukan isometrik, bukan benda realistis berbayang. Garis datar, warna palet. Tidak ada benda yang miring atau berbayang plastik.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Benda merapat ke posisi | `transform: translate`, `opacity`, bertahap antar benda | Benda tampil sudah tertata |
| Tombol dan tautan saat ditekan | `transform: scale` kecil | Tetap ada umpan balik warna tanpa skala |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| NEP        Layanan  Cara Kerja  Legalitas  Lowongan  Kontak [Ajukan]|
+--------------------------------------------------------------------+
|/////////////////// bidang --deep, penataan ////////////////////////|
|//  [rompi]   [radio]   [papan jalan]                             //|
|//     +---------------------------------------------+            //|
|//     | Satu vendor untuk tenaga lapangan Anda      |            //|
|//     | [Ajukan Kebutuhan]  [Lihat Lowongan]        |            //|
|//     +---------------------------------------------+            //|
|//  [senter]  [sarung tangan]   [id card]                        //|
|////////////////////////////////////////////////////////////////////|
| Lima segmen sebagai benda terukur                                  |
|  [ikon keamanan]  Keamanan dan Fasilitas   Satpam, cleaning        |
|  [ikon transport] Transportasi             Pengemudi, kurir        |
+--------------------------------------------------------------------+

375px: judul dan dua tombol dulu di panel padat, tetap di layar
pertama. Benda perlengkapan jadi dua kolom di bawahnya. Bar bawah
dua tombol.
```

### Jebakan

- Ilustrasi 3D atau isometrik. Dilarang. Garis datar saja.
- Benda diberi bayangan plastik atau dimiringkan. Dilarang.
- Panel teks di atas bidang memakai kaca buram. Dilarang, pakai `--permukaan` padat.
- Terakota lebih dari satu elemen per layar. Judul serif. Keduanya dilarang di 1c.
- Merapat terus tiap section. Hanya sekali saat hero dan sekali saat strip segmen masuk layar.

### Blok arah

```text
ARAH J, PERLENGKAPAN LAPANGAN. Varian 14. Palet 1c.
Nama berkas: varian-14-perlengkapan-lapangan-1c.html

Sumbu: grid kanvas bebas pada kisi tak terlihat; lebar penuh dengan padding
besar; hero gambar penuh bidang --deep dengan panel teks --permukaan padat; font
Hubot Sans satu keluarga, font-stretch 125% berat 800 judul hero, 112% judul
section, 100% berat 400 isi dan 600 label dengan tabular-nums; sudut 0; lima
segmen sebagai grid benda lebar berbeda; navigasi bar atas; irama selang-seling;
skala lebar tinggi.

Elemen khas: perlengkapan lapangan digambar SVG garis setebal garis judul, lima
benda untuk lima segmen digambar sendiri bukan dari pustaka, tiap benda punya
label ukuran kecil, tersusun pada kisi sudut siku jarak seragam. Slot foto blok
berlabel dua baris huruf kecil bergantian --tint dan --deep.

Gerak: benda merapat ke posisi sekali saat masuk layar, bertahap, transform
translate dan opacity. Tombol scale kecil saat ditekan. prefers-reduced-motion:
benda tampil tertata, tombol tetap beri umpan balik warna. Tanpa 3D, tanpa
isometrik, tanpa bayangan plastik, tanpa kaca buram.

Aturan 1c: judul tanpa serif, terakota maksimal satu elemen per layar, bidang
--deep besar di layar pertama.

Skala: judul hero clamp 36px sampai 60px, judul section 24px sampai 36px, isi 17px.
```

---

## K. Kolam Pelamar

**Varian 15, kelompok berani, palet 2d.** Nama berkas: `varian-15-kolam-pelamar-2d.html`

### Gagasan

Kolam pelamar adalah bukti kapasitas NEP untuk calon klien B2B (konteks-proyek §3.1). Ladang token yang mengalir dari kolam pelamar menuju penempatan adalah bentuk untuk "kami punya orang, dan kami menempatkannya". Token tidak berwajah, sesuai UU PDP dan privasi. Angka asli tampil hemat: 4 wilayah, 5 segmen, 4 tahap, Rp0 biaya melamar. Angka yang belum ada, yaitu pekerja ditempatkan, klien aktif, tahun beroperasi, tampil sebagai kolam berlabel "Menunggu data", jujur, tidak dikarang.

Beranda milik calon klien (K-02). Ini arah paling berani soal gerak, jadi jumlah token dibatasi keras dan diturunkan di layar kecil.

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | 12 kolom dengan elemen menembus kolom |
| Lebar | 1440px |
| Hero | Tipografi sebagai gambar, angka wilayah plus ladang token |
| Font | Mona Sans + Onest |
| Sudut | 999px hanya pada tombol, token berbentuk titik |
| Segmen | Tab, tiap tab menunjukkan kolam segmen itu menuju penempatan |
| Navigasi | Bar atas |
| Irama | Lapang |
| Elemen khas | Ladang token pelamar menuju penempatan |
| Skala huruf | Kontras keluarga, Mona display dan Onest tenang |
| Gerak | Token mengalir dan mengendap sekali saat masuk layar, jumlah dibatasi |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Angka dan judul hero | Mona Sans, `font-stretch: 125%` | 800 | 48 sampai 96px | Tinggi baris 0,95, angka tabular |
| Judul section | Mona Sans, lebar 100 | 700 | 24 sampai 36px | |
| Isi, label token | Onest | 400 | 17px | Kalimat utuh, bukan label kapital |

Dua keluarga, tiga berat. Mona Sans membawa jejak perancang Medan (cek sumber primer sebelum disampaikan ke klien). Onest tenang di bawah angka yang ramai.

### Elemen khas

Ladang token adalah kumpulan titik `--sekunder` di sisi kolam pelamar, mengalir ke sisi penempatan yang berwarna `--utama`. Jumlah token dibatasi, misalnya 60 di desktop dan 24 di layar kecil, digambar sebagai SVG atau div kecil dengan `transform`. Angka asli tampil besar di dekat kolam. Kolam kosong untuk data yang belum ada tampil sebagai bingkai tepi putus-putus `--meta` berlabel "Menunggu data".

Batas. Bukan counter berputar. Bukan grafik statistik warna warni. Token tidak berwajah, tidak berfoto. Tidak ada angka 0 selain Rp0.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Token mengalir dari kolam ke penempatan | `transform: translate`, `opacity`, sekali, jumlah dibatasi | Token tampil sudah di posisi akhir, sebagian di sisi penempatan |
| Angka hero muncul dan naik | `transform: translateY`, `opacity`, sekali | Angka tampil di posisi akhir |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| NEP        Layanan  Cara Kerja  Legalitas  Lowongan  Kontak [Ajukan]|
+--------------------------------------------------------------------+
|  4 wilayah        . . . . . .            o o o                     |
|  penempatan       . . . . .    -->      o o o o   penempatan       |
|  di Sumatera      . . . . . .            o o o                     |
|  Utara            kolam pelamar          (token mengendap)         |
|  [Ajukan Kebutuhan]                                                |
|  Sedang cari kerja?  [Lihat Lowongan]                              |
+--------------------------------------------------------------------+
| 5 segmen (tab) | 4 tahap | [Menunggu data] | [Menunggu data]       |
|  Rp0 biaya melamar. Rekrutmen kami tidak memungut biaya apa pun.   |
+--------------------------------------------------------------------+

375px: angka 4 dan kalimat wilayah dulu, pintu pelamar tetap di layar
pertama. Ladang token turun ke 24 token, satu arah aliran. Rp0 dan
pintu pelamar di layar pertama.
```

### Jebakan

- Counter berputar naik. Dilarang. Angka muncul dan naik sekali.
- Ratusan token di HP kelas bawah. Batasi keras, turunkan di layar kecil.
- Token berwajah atau berfoto. Dilarang, langgar privasi.
- Biru dan hijau seimbang di satu section. Kolam pelamar `--sekunder`, penempatan `--utama` dominan.
- Angka statistik karangan. Hanya empat angka asli, sisanya "Menunggu data".

### Blok arah

```text
ARAH K, KOLAM PELAMAR. Varian 15. Palet 2d.
Nama berkas: varian-15-kolam-pelamar-2d.html

Sumbu: grid 12 kolom dengan elemen menembus kolom; lebar 1440px; hero tipografi
sebagai gambar dengan angka wilayah dan ladang token; font Mona Sans font-stretch
125% berat 800 untuk angka dan judul hero dengan tabular-nums, lebar 100 berat
700 judul section, Onest 400 isi dan label token; sudut 999px hanya pada tombol,
token berupa titik; lima segmen sebagai tab; navigasi bar atas; irama lapang;
skala kontras keluarga.

Elemen khas: ladang token, titik --sekunder di kolam pelamar mengalir ke sisi
penempatan --utama. Jumlah token dibatasi 60 desktop dan 24 layar kecil. Angka
ASLI saja: 4 wilayah, 5 segmen, 4 tahap, Rp0 biaya melamar. Kolam kosong untuk
pekerja ditempatkan, klien aktif, tahun beroperasi tampil bingkai putus-putus
--meta Menunggu data. Token tidak berwajah.

Gerak: token mengalir dari kolam ke penempatan sekali saat masuk layar, transform
translate dan opacity, jumlah dibatasi. Angka hero muncul dan naik sekali.
prefers-reduced-motion: token dan angka tampil di posisi akhir. Tanpa counter
berputar, tanpa angka 0 selain Rp0, tanpa gradasi di belakang angka.

Skala: angka dan judul hero clamp 48px sampai 96px tinggi baris 0,95, judul
section 24px sampai 36px, isi 17px.
```

---

## L. Berkas Pekerja

**Varian 16, kelompok aman, palet 1c.** Nama berkas: `varian-16-berkas-pekerja-1c.html`

### Gagasan

Alih daya berjalan di atas berkas: kontrak, data pekerja, berkas perusahaan. Tab berkas seperti map arsip adalah bentuk untuk "semua tercatat dan rapi". Tiap segmen dan halaman legalitas jadi satu tab berkas. Ini arah paling tenang di set kedua dan sengaja hemat gerak otomatis, sebagai penyeimbang lima arah lain yang ramai gerak. Nilai jualnya justru ketenangan, cocok untuk verifikator dan HRD yang membuka dari laptop kantor.

Beranda milik calon klien (K-02). Sampul berkas perusahaan sebagai blok `--deep` di layar pertama memenuhi penangkal klaster krem (K-36).

### Sumbu

| Sumbu | Nilai |
|---|---|
| Grid | Kolom tunggal lebar dengan pembatas tab |
| Lebar | 880px |
| Hero | Teks bertumpuk di atas blok `--deep`, sampul berkas perusahaan |
| Font | Karla + Public Sans |
| Sudut | Lembut 8px pada tab |
| Segmen | Akordeon berbentuk tab berkas |
| Navigasi | Sidebar kiri berupa rel tab arsip |
| Irama | Lapang |
| Elemen khas | Tab berkas pekerja dan berkas perusahaan |
| Skala huruf | Moderat |
| Gerak | Respons tekan saja, tab membuka isi, plus satu pengendapan tumpukan berkas saat muat |

### Tipografi

| Peran | Font | Berat | Ukuran | Catatan |
|---|---|---|---|---|
| Judul hero, judul tab | Karla | 700 | 30 sampai 46px | Tinggi baris 1,1. Karla sans, aman untuk 1c |
| Isi | Public Sans | 400 | 17px | Lebar maksimal 66ch |
| Label tab, kode, tombol | Public Sans | 600 | 15 sampai 16px | Angka tabular untuk kode dan nomor |

Dua keluarga, tiga berat. Karla ramah tapi tetap serius, cocok untuk arsip yang tidak kaku. Public Sans untuk isi dan angka.

### Elemen khas

Tab berkas seperti map arsip, sudut atas membulat 8px. Rel tab di sidebar kiri, isi di kolom tunggal. Tiap tab satu segmen atau satu halaman. Legalitas jadi tab "Berkas Perusahaan" berisi bentuk badan hukum, status, dan kartu "Menunggu data" untuk nomor SK, NIB, KBLI. Kotak cek kode ada di tab Lowongan.

Batas. Bukan meterai, stempel, tanda tangan, kop surat (K-37). Tab polos, warna palet. Tidak meniru dokumen resmi.

### Gerak, rinci

| Gerak | Properti | Reduced motion |
|---|---|---|
| Tumpukan berkas mengendap saat muat | `transform: translateY` kecil, `opacity`, sekali | Tampil di posisi akhir |
| Tab membuka isi saat ditekan | `transform: translateY`, `opacity` pada isi | Isi langsung terlihat |

### Wireframe

```text
1440px
+--------------------------------------------------------------------+
| NEP        Layanan  Cara Kerja  Legalitas  Lowongan  Kontak [Ajukan]|
+-----------+--------------------------------------------------------+
| Rel tab   |############### blok --deep ##########################|
| Layanan   |##  Satu vendor untuk tenaga lapangan Anda           ##|
| Cara Kerja|##  [Ajukan Kebutuhan]   Sedang cari kerja? [Lihat]  ##|
| Berkas    |######################################################|
| Perusahaan|  Tab: Keamanan dan Fasilitas                  [buka] |
| Lowongan  |    Satpam, cleaning service                          |
| Kontak    |    Penjagaan dan kebersihan untuk gedung dan gerai   |
|           |  Tab: Transportasi dan Logistik               [tutup]|
|           |  Tab: Berkas Perusahaan                       [tutup]|
+-----------+--------------------------------------------------------+

375px: rel tab jadi bilah geser atas. Blok --deep dan pintu pelamar
tetap di layar pertama. Tab menumpuk satu kolom. Bar bawah dua tombol.
```

### Jebakan

- Meniru dokumen resmi dengan stempel atau kop. Dilarang (K-37).
- Judul serif di 1c. Karla adalah sans.
- Terakota lebih dari satu elemen per layar.
- Menambah gerak otomatis supaya ramai. Arah ini sengaja tenang, gerak hanya respons tekan.

### Blok arah

```text
ARAH L, BERKAS PEKERJA. Varian 16. Palet 1c.
Nama berkas: varian-16-berkas-pekerja-1c.html

Sumbu: grid kolom tunggal lebar dengan pembatas tab; lebar 880px; hero teks
bertumpuk di atas blok --deep sebagai sampul berkas perusahaan; font Karla 700
judul, Public Sans 400 isi dan 600 label dan kode dengan tabular-nums; sudut
lembut 8px pada tab; lima segmen sebagai akordeon tab berkas; navigasi sidebar
kiri rel tab arsip; irama lapang; skala moderat.

Elemen khas: tab berkas seperti map arsip sudut atas membulat 8px, rel tab di
sidebar kiri, isi di kolom tunggal. Legalitas jadi tab Berkas Perusahaan dengan
bentuk badan hukum, status, dan kartu Menunggu data untuk nomor SK, NIB, KBLI.
Kotak cek kode di tab Lowongan. TANPA meterai, stempel, kop surat.

Gerak: tumpukan berkas mengendap sekali saat muat dengan translateY dan opacity.
Tab membuka isi dengan translateY dan opacity saat ditekan. Tanpa gerak otomatis
lain. prefers-reduced-motion: semua tampil di keadaan akhir.

Aturan 1c: judul tanpa serif, terakota maksimal satu elemen per layar, blok
--deep besar di layar pertama.

Skala: judul clamp 30px sampai 46px, isi 17px lebar 66ch.
```

---

## 4. Tabel pelacakan

Sebelas sumbu. Minimal enam berbeda dari varian sebelumnya di urutan ini.

| Var | Palet | Grid | Lebar | Hero | Font | Sudut | Segmen | Nav | Irama | Elemen khas | Skala | Gerak |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 Papan Penempatan | 2d | 12 kolom | 1440 | teks+papan flip | Schibsted+Atkinson | 4 | strip | topbar | padat | papan flip | kontras ekstrem | bilah membalik |
| 12 Rak Penempatan | 1c | 8+4 | 1180 | bertumpuk di blok | Gantari+Public | campuran | grid lebar beda | bar atas | selang-seling | rak kompartemen | moderat | pintu geser |
| 13 Daftar Periksa | 2d | dua kolom penuh | 1180 | teks+kotak kode | Familjen | 4 | tabel | daftar isi melekat | lapang | ledger centang | moderat | centang tergambar |
| 14 Perlengkapan | 1c | kanvas bebas | penuh | gambar penuh+panel | Hubot | 0 | grid lebar beda | bar atas | selang-seling | susunan perlengkapan | lebar tinggi | benda merapat |
| 15 Kolam Pelamar | 2d | 12 kolom tembus | 1440 | tipografi gambar | Mona+Onest | 999 tombol | tab | bar atas | lapang | ladang token | kontras keluarga | token mengalir |
| 16 Berkas Pekerja | 1c | kolom tunggal | 880 | bertumpuk di blok | Karla+Public | 8 | akordeon | sidebar kiri | lapang | tab berkas | moderat | respons saja |

Jumlah sumbu berbeda dari varian sebelumnya: 11 vs 12 = 11, 12 vs 13 = 9, 13 vs 14 = 11, 14 vs 15 = 10, 15 vs 16 = 10. Semua di atas batas enam.

Perbandingan dengan set pertama juga aman. Tidak ada elemen khas yang berulang: kartu pengenal, sobekan poster, catatan tepi, garis rute, angka raksasa, dan blok foto berlabel semua berbeda dari papan flip, rak kompartemen, ledger centang, susunan perlengkapan, ladang token, dan tab berkas.

Kolom Status diisi setelah generate: Lulus rubrik, Gagal rubrik butir N, atau Dibuang.

---

## 5. Setelah generate

Jalankan rubrik di `protokol-varian` draft ke-2 bagian 5, lalu tambahan gerak di bawah. Buka berkas di 375, 834, dan 1440px.

### 5.1 Butir wajib gerak, tambahan set ini

Satu gagal berarti varian gagal.

| # | Butir |
|---|---|
| WG1 | Setiap gerak hanya memakai `transform`, `opacity`, atau `clip-path`. Cari `height`, `top`, `width`, `margin`, `filter` di dalam aturan animasi |
| WG2 | Setiap gerak berhenti penuh di `prefers-reduced-motion: reduce` dan menampilkan keadaan akhir |
| WG3 | Tidak ada parallax, penahan gulir, kursor kustom, teks huruf per huruf, video latar |
| WG4 | Pergeseran layout di bawah 0,05. Uji dengan gerak berjalan |
| WG5 | Node bergerak dibatasi jumlahnya, dan lebih sedikit di 375px |
| WG6 | Fokus keyboard tetap terlihat selama dan sesudah gerak |

### 5.2 Uji kembar dan uji nada

Tetap wajib. Tempel `brief-desain` saja tanpa blok arah, minta satu halaman, letakkan berdampingan. Kalau harus dilihat dua kali untuk membedakan, varian gagal. Untuk ujian pelamar, pakai stopwatch dan HP sungguhan.

---

## 6. Sumber referensi

Dipakai untuk mencuri prinsip, bukan menyalin tampilan. Ini melengkapi `riset-referensi-tipografi` bagian 6.

### 6.1 Gerak dan interaksi

| Sumber | Alamat | Yang diambil |
|---|---|---|
| Godly | https://godly.website | Satu momen gerak per situs, bukan semuanya. Lihat bagian interaksi dan micro motion |
| Mobbin | https://mobbin.com | Pola mobile untuk bar bawah, lembar geser, akordeon, tab |
| Refero | https://refero.design | Pola form, tabel, ledger, status kosong dari produk nyata |
| MDN, CSS scroll-driven animations | https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline | `animation-timeline: view()` untuk gerak saat tergulir tanpa JavaScript berat |
| MDN, prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | Cara mematikan gerak dengan benar |
| Motion One | https://motion.dev | Pustaka gerak di bawah 5KB kalau CSS tidak cukup, impor dinamis |

### 6.2 Tata letak dan tipografi

| Sumber | Alamat | Yang diambil |
|---|---|---|
| Siteinspire | https://www.siteinspire.com | Saring kategori Business dan Typography |
| Minimal Gallery | https://minimal.gallery | Tata letak minimalis tanpa ilustrasi |
| Typewolf | https://www.typewolf.com | Pasangan font dan situs contoh |
| Fonts In Use | https://fontsinuse.com | Pemakaian nyata font katalog, termasuk cerita Mona Sans dan Gantari |
| GOV.UK Design System | https://design-system.service.gov.uk | Pesan galat, halaman konfirmasi, pola periksa jawaban Anda |

### 6.3 Anti generik

| Sumber | Alamat |
|---|---|
| 925 Studios, AI Slop Fonts and Gradients | https://www.925studios.co/blog/ai-slop-design-tells |
| Sailop, AI Slop Definitive 2026 Guide | https://www.sailop.com/blog/ai-slop-definitive-guide-2026 |
| VibeCodeKit, AI Slop Design | https://vibecodekit.dev/ai-slop-design |

Ketiganya sampai di kesimpulan yang sama: generator memilih rata rata data latihnya kalau tidak ada keputusan yang dipaksakan. Obatnya mengunci keputusan per sumbu sebelum generate, bukan meminta lebih kreatif.

---

## 7. Yang tidak berubah dari set pertama

Diulang di sini supaya berkas ini bisa disalin mentah ke AI desain mana pun tanpa membuka berkas lain.

- Dua palet terkunci, satu palet per berkas, tidak ada hex di luar daftar (K-01, `token-warna`)
- Delapan section wajib (`brief-desain` bagian 8)
- Lima lapis keamanan yang terlihat, kotak cek kode tiga keadaan (`brief-desain` bagian 4)
- Beranda milik calon klien, pelamar dapat pintu terpisah, tanpa modal pemilihan audiens (K-02)
- Pintu pelamar dan pernyataan tanpa biaya terlihat tanpa scroll di 375, 834, 1440px
- Teks placeholder resmi, jangan mengarang, jangan lorem (`nep-desain`)
- Ikon lima segmen digambar sendiri sebagai SVG (`brief-desain` bagian 7.3)
- Slot foto blok berlabel dua baris huruf kecil biasa (K-08, K-34)
- Penangkal klaster krem untuk palet 1c: judul tanpa serif, terakota maksimal satu per layar, blok `--deep` atau `--utama` besar di layar awal, tanpa tekstur kertas (K-36)
- Larangan keras: harga, testimoni karangan, logo klien, nama orang, angka karangan, nomor agregator, foto stok, meterai dan stempel, nomor kontak karangan, em dash

---

## 8. Batas gabungan

Sama dengan `protokol-varian` bagian 7.4. Kalau klien menyukai dua arah, elemen khas tidak boleh dipindah lebih dari satu. Menggabungkan papan flip, rak kompartemen, dan ladang token dalam satu situs menghapus alasan masing masing ada dan membuat halaman ramai. Ambil struktur dan gerak dari satu arah, elemen khas dari satu arah, jangan menumpuk.

---

## 9. Pertentangan yang harus diputuskan

Sesuai aturan pertentangan di README, saya tidak memilih diam diam. Dua hal butuh keputusan tertulis sebelum set ini dipakai.

### K-38 · Anggaran gerak diperluas untuk set arah G sampai L

**Diajukan:** 20 Sep 2026 · **Status:** Usulan, menunggu persetujuan · **Menyentuh tech-stack §11, rubrik G10, dan K-33**

Set arah G sampai L memakai anggaran gerak yang lebih luas dari satu momen per halaman. Boleh gerak di lebih dari satu tempat, asal tiap gerak hanya memakai `transform`, `opacity`, dan `clip-path`, berhenti penuh di `prefers-reduced-motion`, tidak menggeser layout di atas 0,05, tidak menahan gulir, dan jumlah node bergeraknya dibatasi serta diturunkan di layar kecil. Satu pustaka gerak ringan di bawah 5KB lewat impor dinamis, atau CSS scroll-driven animation dengan fallback IntersectionObserver.

**Alasan.** Klien meminta situs dengan animasi dan interaksi sebagai ciri khas, sejalan dengan K-11 yang sudah menyebut animasi sebagai alasan memilih Next.js. Aturan satu momen di draft lama membatasi itu. Perangkat kelas bawah tetap terlindungi karena gerak dibatasi ke properti komposit dan punya keadaan diam.

**Ditolak.** Mempertahankan satu momen per halaman. Animasi bebas tanpa batas properti.

**Kalau dilanggar.** Situs terasa lambat di HP audiens terbesar, atau kembali monoton dan klien merasa permintaannya tidak dipenuhi.

**Konsekuensi kalau disetujui.** Rubrik G10 diberi pengecualian untuk set G sampai L. Tambahan butir WG1 sampai WG6 di bagian 5.1 masuk rubrik. Tech-stack §11 diperbarui dari empat tempat gerak jadi anggaran berbasis properti dan ambang, bukan berbasis jumlah tempat.

### Pertanyaan terbuka

Kalau klien memilih palet 1c untuk salah satu arah, apakah `--latar` digeser ke putih netral seperti pertanyaan terbuka di K-36? Itu mengubah K-01 dan butuh blok keputusan baru.

---

## 10. Urutan kerja yang saya sarankan

1. Setujui atau tolak K-38. Kalau ditolak, set ini turun ke satu momen gerak per halaman dan sebagian gagasan gerak dipangkas
2. Pilih dua atau tiga arah dari enam untuk digenerate lebih dulu. Saran: satu berani (G atau K), satu menengah (H atau J), satu aman (I atau L)
3. Generate satu arah per percakapan dengan pembungkus di bagian 3.3
4. Nilai dengan rubrik bagian 5 dan tambahan gerak WG1 sampai WG6
5. Isi kolom Status di tabel pelacakan bagian 4
6. Gabung dengan kandidat set pertama, saring bersama klien pakai lembar di `protokol-varian` bagian 7.3
