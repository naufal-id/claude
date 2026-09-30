# Sprint 0: Inventaris Skill, Struktur Kerja, dan Usulan Rencana

Draft ke-1, 1 Oktober 2026. Branch `claude/fomo-esp32-01-10-2026-01`.

Status: **usulan, menunggu persetujuan**. Spesifikasi dan rencana sprint rinci
baru ditulis setelah pertanyaan di bagian 7 terjawab (aturan skill Superpowers
`brainstorming`: desain disetujui dulu, baru spesifikasi, baru rencana).

## 1. Pemahaman tugas

**Yang Anda sampaikan**

- Riset tentang FOMO di ESP32 sudah dipilih dan artikelnya dikumpulkan pada
  Pertemuan 3. Topik baru tidak boleh dibuka.
- Dari riset itu ada dua calon judul. Keduanya dikerjakan.
- Tugas A, untuk setiap judul, mengikuti tujuh tahap:
  1. Menentukan topik, primary KBK, dan alasan.
  2. Memilih 5 paper paling relevan dari minimal 10 paper.
  3. Mengisi SOTA Mapping.
  4. Menemukan pola (pattern) dan keterbatasan yang berulang (repeated limitation).
  5. Merumuskan tiga potential gap.
  6. Memilih satu gap terkuat (one strongest gap) berdasarkan bukti.
  7. Menyusun novelty dan research positioning.
- Tugas B: Bab 1 dan Bab 2 untuk setiap judul.
- Mutu diutamakan. Pekerjaan dibagi ke beberapa sesi, dan setiap akhir sprint
  saya mengevaluasi hasil lalu berhenti menunggu konfirmasi.

**Asumsi saya (mohon dikoreksi kalau salah)**

| Kode | Asumsi |
|---|---|
| A1 | FOMO berarti *Faster Objects, More Objects*, model deteksi objek ringan dari Edge Impulse untuk mikrokontroler, dan ESP32 adalah perangkat targetnya (ESP32-CAM, ESP-EYE, ESP32-S3, atau varian lain). |
| A2 | Kedua judul memakai kumpulan paper yang sama dari Pertemuan 3. Pemilihan 5 paper teratas (Tahap 2) dilakukan terpisah per judul karena fokus judul berbeda. |
| A3 | KBK adalah Kelompok Bidang Keahlian di program studi Anda. Daftarnya berbeda di tiap kampus, jadi saya perlu daftar resminya. |
| A4 | Bab 1 dan Bab 2 memakai struktur proposal/skripsi yang umum (bagian 5.3) kecuali dosen memberi template. |
| A5 | Naskah memakai bahasa Indonesia baku (EYD V). Gaya sitasi belum diketahui; IEEE lazim untuk bidang teknik. |

## 2. Inventaris skill

### 2.1 Skill proses: Superpowers

Plugin Superpowers (obra/Jesse Vincent, lisensi MIT) **belum aktif** di akun
Anda, sehingga tidak bisa dipanggil lewat perintah skill di sesi ini. Saya membaca
isi skill-nya langsung dari repositori GitHub `obra/superpowers` (commit
`8ca22db`, 25 September 2026) dan mengikuti isinya secara manual. Kalau plugin itu
Anda pasang, sesi berikutnya bisa memanggilnya langsung.

Skill Superpowers dirancang untuk pengembangan perangkat lunak (tes otomatis,
TDD, review kode). Tabel berikut mencatat cara saya menyesuaikannya untuk
pekerjaan riset dan penulisan.

| Skill | Dipakai di | Penyesuaian untuk riset |
|---|---|---|
| `using-superpowers` | Awal setiap sesi | Cek skill yang relevan sebelum bertindak. Instruksi Anda dan `CLAUDE.md` tetap di atas skill. |
| `brainstorming` | Sprint 0 dan 1 | Jalur **arsitektural**: klarifikasi, 2 sampai 3 pendekatan, desain, spesifikasi tertulis, persetujuan Anda. |
| `writing-plans` | Sprint 1 | Rencana sprint berisi daftar tugas bercentang. "Tes" diganti **kriteria penerimaan** yang bisa dicek (contoh: setiap sel SOTA menyebut kode paper dan halaman). Lokasi berkas mengikuti repo ini, bukan `docs/superpowers/`. |
| `executing-plans` | Sprint 2 dan seterusnya | Skill ini menyuruh eksekusi tanpa jeda antartugas. Instruksi Anda lebih kuat: satu sprint dieksekusi penuh, lalu saya berhenti. Keputusan yang saya ambil sendiri dicatat sebagai *Ruling* (apa, mengapa, risikonya kalau keliru). |
| `verification-before-completion` | Akhir setiap sprint | "Bukti sebelum klaim": sprint baru dinyatakan selesai setelah daftar cek di bagian 6 dijalankan dan hasilnya tertulis. |
| `requesting-code-review` | Opsional, akhir Sprint 5 dan 8 | Diubah menjadi review naskah oleh reviewer terpisah (subagen dengan konteks segar). Lebih teliti, tetapi menambah biaya. Anda yang memutuskan (pertanyaan P5). |
| `dispatching-parallel-agents`, `subagent-driven-development` | Opsional, Sprint 2 | Bisa dipakai untuk mengekstrak banyak paper sekaligus. Default: tidak dipakai; saya membaca paper sendiri agar konteksnya utuh untuk analisis gap. |
| `test-driven-development`, `systematic-debugging`, `using-git-worktrees`, `writing-skills` | Tidak dipakai | Khusus pengembangan kode. |

### 2.2 Skill yang sudah tersedia di sesi ini

| Skill | Dipakai di | Catatan |
|---|---|---|
| `pdf` | Sprint 2 | Membaca teks dan tabel paper. Pustaka `pypdf` dan `pdfplumber` sudah terpasang dan teruji di kontainer sesi ini. |
| `stop-slop` (dengan `antislop-copywriting`) | Setiap sprint tulisan, terutama 6 sampai 8 | Dipakai sebagian, sama seperti evaluasi bahasa proposal PKM di branch lain: buang frasa pengisi, kontras biner, klaim samar, dan em dash. Aturan "semua kalimat aktif" dan sapaan "Anda" **tidak** dipakai karena bertentangan dengan ragam ilmiah Indonesia. |
| `doc-coauthoring` | Sprint 6 dan 7 | Alur menulis bersama: kumpulkan konteks, susun per bagian, lalu uji apakah pembaca (dosen) bisa mengikuti alur argumen. |
| `docx` | Sprint 8, bila perlu | Ekspor Bab 1 dan 2 ke .docx sesuai format kampus. LibreOffice tersedia untuk pratinjau PDF. |
| `xlsx` | Opsional, Sprint 3 | SOTA Mapping dan matriks skor relevansi sebagai spreadsheet kalau dosen meminta tabel Excel. |
| `dataviz` | Opsional, Sprint 5 | Diagram posisi riset (Tahap 7) bila gambar lebih jelas daripada tabel. |
| `deep-research` | Hanya dengan izin Anda | Dipakai hanya kalau paper Pertemuan 3 kurang dari 10 dan Anda mengizinkan pencarian tambahan **dalam topik yang sama**. Default: tidak dipakai. |

### 2.3 Plugin di katalog yang belum terpasang

| Plugin | Relevansi | Saran |
|---|---|---|
| Superpowers | Diminta Anda | Pasang, supaya sesi berikutnya memanggil skill-nya secara resmi. |
| scriptorium-cowork | Tinjauan pustaka gaya PRISMA: *scope, screen, extract, synthesize, contradictions* | Opsional. Dirancang untuk Cowork; alurnya sudah tercakup oleh rencana di bawah. |
| Thesis Examiner | Bank pertanyaan sidang dan simulasi tanya jawab | Nanti, saat persiapan presentasi atau sidang proposal. |
| read-paper | Analisis paper | Tidak disarankan: keluarannya bahasa Inggris dan Mandarin. |

## 3. Usulan struktur folder

Mengikuti pola repo ini: folder bernomor, README berisi tabel berkas, dan nama
berkas `YYYY-MM-DD_nama-berkas_draft-ke-N.md`.

```
riset-fomo-esp32/
├── README.md                    peta berkas dan status sprint
├── 00-perencanaan/              dokumen ini, spesifikasi, rencana sprint
├── 01-sumber/
│   ├── ..._daftar-paper_...md   semua paper Pertemuan 3, diberi kode P01, P02, ...
│   ├── kartu-ekstraksi/         satu kartu per paper (P01.md, P02.md, ...)
│   └── pdf/                     berkas PDF (lihat pertanyaan P3 soal hak cipta)
├── 02-analisis/
│   ├── judul-a/                 Tahap 1 sampai 7
│   └── judul-b/                 Tahap 1 sampai 7
└── 03-naskah/
    ├── judul-a/                 Bab 1, Bab 2
    └── judul-b/                 Bab 1, Bab 2
```

**Kartu ekstraksi** menjadi satu-satunya sumber data untuk semua tahap. Isinya:
sitasi lengkap, tahun, venue dan indeksasi (Scopus/SINTA), masalah yang
diselesaikan, model dan metode, perangkat keras (varian ESP32, RAM, PSRAM,
kamera), dataset (kelas, jumlah citra, resolusi input), metrik dan angkanya
(presisi, recall, F1, mAP, latensi, FPS, RAM, flash, daya), keterbatasan dan
saran riset lanjutan. Setiap angka dan kutipan membawa nomor halaman.

Keterbatasan dicatat dalam dua kolom terpisah: **yang ditulis penulis paper**
dan **yang saya amati**. Pemisahan ini penting untuk Tahap 6, karena gap yang
didukung pengakuan penulis lebih kuat daripada gap hasil tafsiran.

## 4. Tiga pendekatan

| | Pendekatan | Kelebihan | Kekurangan |
|---|---|---|---|
| A | **Vertikal.** Judul A tuntas (Tahap 1–7, Bab 1–2), baru judul B. | Judul A menjadi contoh untuk judul B. | Paper dibaca dua kali. Gap kedua judul bisa tumpang tindih tanpa ketahuan. |
| B | **Horizontal penuh.** Setiap sprint mengerjakan tahap yang sama untuk kedua judul, termasuk bab. | Perbandingan dua judul terlihat di setiap langkah. | Sprint penulisan terlalu besar (empat bab sekaligus), mutu sulit dijaga. |
| C | **Hibrida (rekomendasi).** Ekstraksi paper sekali. Tahap 1–7 dikerjakan berdampingan untuk kedua judul. Bab ditulis per judul di sprint terpisah. | Setiap paper dibaca sekali dan teliti. Gap dan novelty kedua judul dipastikan berbeda. Sprint penulisan cukup kecil untuk ditinjau. | Hasil pertama berupa naskah baru muncul di Sprint 6. |

Saya merekomendasikan **C**. Risiko terbesar tugas ini adalah dua judul dari
riset yang sama berakhir dengan gap yang mirip. Mengerjakan analisis keduanya
berdampingan membuat perbedaan itu dicek sejak Tahap 5.

## 5. Usulan sprint (pendekatan C)

### 5.1 Tabel sprint

| Sprint | Isi | Keluaran | Kriteria selesai |
|---|---|---|---|
| 0 | Branch, inventaris skill, usulan struktur | Dokumen ini | Anda menyetujui atau mengoreksi |
| 1 | Spesifikasi dan rencana sprint rinci | Spesifikasi dan rencana di `00-perencanaan/` | Anda menyetujui keduanya |
| 2 | Penerimaan paper dan ekstraksi | Daftar paper, kartu ekstraksi per paper | Setiap angka dan kutipan punya halaman; paper yang tidak terbaca dilaporkan |
| 3 | Tahap 1–3, dua judul | Topik, KBK, alasan; matriks skor relevansi; 5 paper per judul; SOTA Mapping | Skor relevansi memakai kriteria tertulis; setiap sel SOTA menyebut sumber |
| 4 | Tahap 4–5, dua judul | Pola dan keterbatasan berulang; tiga potential gap per judul | Keterbatasan dianggap berulang hanya jika muncul di minimal 2 paper, dan paper-nya disebut |
| 5 | Tahap 6–7, dua judul | Satu gap terkuat per judul dengan skor bukti; novelty dan posisi riset | Gap judul A berbeda dari gap judul B; novelty tidak melampaui bukti |
| 6 | Bab 1 dan Bab 2 judul A | Naskah judul A | Rantai gap, rumusan masalah, tujuan, dan novelty konsisten; semua sitasi ada di daftar pustaka |
| 7 | Bab 1 dan Bab 2 judul B | Naskah judul B | Sama seperti Sprint 6 |
| 8 | Review akhir dan ekspor | Evaluasi bahasa, laporan konsistensi, .docx/PDF bila perlu | Daftar cek bagian 6 lolos untuk keempat bab |

### 5.2 Kriteria awal untuk Tahap 2 dan Tahap 6

Kriteria final ditetapkan di spesifikasi (Sprint 1). Usulan awal:

- **Skor relevansi paper (Tahap 2)**, skala 1–3 per kriteria: kesesuaian objek
  (FOMO dan/atau ESP32 secara langsung), kesesuaian masalah dengan judul,
  kebaruan tahun terbit, mutu venue (indeksasi), dan kelengkapan data eksperimen
  di perangkat nyata.
- **Kekuatan gap (Tahap 6)**: jumlah paper yang mendukung, jenis bukti
  (pengakuan penulis lebih kuat dari pengamatan), kelayakan dikerjakan dengan
  ESP32 dalam waktu tugas akhir, keterukuran dengan metrik, dan belum adanya
  paper dalam kumpulan yang menutup gap itu.

### 5.3 Struktur Bab 1 dan Bab 2 (default, diganti bila ada template)

**Bab 1 Pendahuluan**: 1.1 Latar Belakang, 1.2 Rumusan Masalah, 1.3 Tujuan
Penelitian, 1.4 Batasan Masalah, 1.5 Manfaat Penelitian, 1.6 Sistematika
Penulisan.

**Bab 2 Tinjauan Pustaka**: 2.1 Penelitian Terkait (dari SOTA Mapping),
2.2 Landasan Teori (ESP32, TinyML, deteksi objek, FOMO, Edge Impulse,
kuantisasi, metrik evaluasi), 2.3 Analisis Gap dan Posisi Penelitian (dari
Tahap 4–7), 2.4 Kerangka Pemikiran.

Rantai yang wajib konsisten di kedua bab: gap terkuat (Tahap 6) → rumusan
masalah (1.2) → tujuan (1.3) → novelty (Tahap 7) → posisi penelitian (2.3).

## 6. Daftar cek akhir sprint

Sebelum menyatakan sebuah sprint selesai, saya menjalankan dan menuliskan hasil
pengecekan berikut:

1. Setiap klaim faktual menunjuk kode paper dan nomor halaman.
2. Tidak ada teks sementara kecuali penanda **[VERIFIKASI: ...]** yang disengaja
   untuk data yang hanya Anda miliki.
3. Keluaran konsisten dengan sprint sebelumnya (kode paper, istilah, angka).
4. Bahasa lolos cek stop-slop versi ragam ilmiah (bagian 2.2).
5. Commit dan push ke branch ini, lalu laporan evaluasi: apa yang selesai, apa
   yang belum, keputusan yang saya ambil sendiri, dan rencana sprint berikutnya.

## 7. Pertanyaan sebelum Sprint 1

| Kode | Pertanyaan | Dipakai untuk |
|---|---|---|
| P1 | Apa bunyi persis kedua calon judul? | Semua tahap |
| P2 | Apa daftar KBK resmi di program studi Anda? | Tahap 1 |
| P3 | Berapa jumlah paper dari Pertemuan 3 dan dalam format apa (PDF atau tautan)? Kalau kurang dari 10, bolehkah saya mencari tambahan dalam topik yang sama? Bolehkah PDF di-commit ke repo? (Kalau repo ini publik, sebaiknya tidak, karena hak cipta penerbit.) | Sprint 2 |
| P4 | Apakah ada template Bab 1–2, gaya sitasi (IEEE/APA), dan format akhir (Markdown saja, atau juga .docx)? Apakah ada format tabel SOTA Mapping dari dosen? | Sprint 3, 6–8 |
| P5 | Cara eksekusi: saya kerjakan sendiri dengan satu review mandiri di akhir (lebih hemat), atau reviewer terpisah di akhir Sprint 5 dan 8 (lebih teliti, lebih mahal)? | Semua sprint |

## 8. Evaluasi Sprint 0

**Selesai**

- Branch `claude/fomo-esp32-01-10-2026-01` dibuat dari branch sesi sesuai
  `CLAUDE.md`: tema `fomo-esp32`, tanggal WIB 01-10-2026, nomor `01` karena
  belum ada branch `claude/fomo-esp32-*` di remote.
- Skill Superpowers dibaca dari sumbernya: `using-superpowers`,
  `brainstorming`, `writing-plans`, `executing-plans`,
  `verification-before-completion`, `requesting-code-review`,
  `dispatching-parallel-agents`.
- Skill sesi dan katalog plugin dicari dengan kata kunci riset, tinjauan
  pustaka, tesis, dan makalah akademik. Hasilnya tercatat di bagian 2.
- Alat baca PDF dan dokumen diuji: `pypdf` 6.19.0, `pdfplumber`,
  `python-docx`, `openpyxl`, dan LibreOffice berhasil dimuat.

**Kendala dan keputusan**

- *Ruling*: Superpowers belum terpasang, jadi saya memakai salinan dari GitHub
  dan mencatat commit-nya. Risiko kalau keliru: versi di akun Anda nanti bisa
  sedikit berbeda; dampaknya kecil karena alurnya sama.
- *Ruling*: pustaka Python hanya terpasang di kontainer sesi ini. Sesi
  berikutnya perlu menjalankan ulang
  `pip install cffi pypdf pdfplumber python-docx openpyxl`
  (`cffi` diperlukan agar `pypdf` bisa dimuat di kontainer ini).
- *Ruling*: struktur folder dan sprint masih usulan. Folder `01-sumber/` sampai
  `03-naskah/` baru dibuat setelah Anda setuju.

**Belum dikerjakan (menunggu Anda)**: jawaban P1 sampai P5 dan berkas paper.
