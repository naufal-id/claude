# Proposal PKM-KC: Sistem Presensi Siswa Berlapis (Hadirku)

Paket proposal Program Kreativitas Mahasiswa skema Karsa Cipta untuk sistem presensi digital dengan lokasi uji coba SMA Santa Maria 1 Bandung.

| Berkas | Isi |
|---|---|
| `2026-09-27_analisis-kerangka-dan-rencana_draft-ke-1.md` | Analisis kerangka berpikir awal, keputusan skema dan desain, daftar isian yang wajib dilengkapi tim |
| `2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.docx` | Proposal lengkap format PKM (A4, Times New Roman 12, spasi 1,15, margin 4-3-3-3) |
| `2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.pdf` | Pratinjau render proposal |
| `2026-09-27_isi-proposal_draft-ke-1.md` | Teks proposal dalam Markdown untuk ditinjau cepat |
| `sumber/` | Sumber tunggal isi (`isi.js`), anggaran (`anggaran.js`), diagram, dan skrip pembangun |

Teks bertanda **[VERIFIKASI: ...]** (stabilo kuning di .docx) wajib dilengkapi tim sebelum proposal dikirim.

## Membangun ulang

Ubah isi di `sumber/isi.js` atau harga di `sumber/anggaran.js`, lalu jalankan `sumber/build.sh`. Skrip merender diagram, membangun .docx dua kali agar nomor halaman daftar isi benar, dan melaporkan jumlah halaman bagian inti.

Kebutuhan: Node.js dengan paket npm `docx` dan `playwright`, LibreOffice Writer, Python dengan `pymupdf`.

Kalau tim lebih nyaman menyunting langsung di Word, sunting .docx saja dan abaikan folder `sumber/`; perbarui daftar isi secara manual.
