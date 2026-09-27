# Pratinjau v2: Lima Arah Desain Santa Maria

Mulai dari `index.html` (galeri). Mockup dan teks sengaja dipisah: galeri dan papan hanya visual, penjelasan ada di `catatan.html`.

| Berkas | Isi |
|---|---|
| `index.html` | Galeri: lima kolom, ponsel absen berjalan berdampingan, rekap tiap desain |
| `m1-kaca-patri.html` | Papan 1, Kaca Patri |
| `m2-fajar.html` | Papan 2, Fajar |
| `m3-deco-bengawan.html` | Papan 3, Deco Bengawan |
| `m4-mading.html` | Papan 4, Mading |
| `m5-rosario.html` | Papan 5, Rosario |
| `catatan.html` | Semua teks: alasan, warna, huruf, gerak, perbandingan, rekomendasi, sumber |
| `core.js` | Data contoh, bingkai HP dan laptop, alur absen, bilah navigasi papan |
| `t-*.js` | Satu berkas per tema: CSS dan layar (masuk, absen, orang tua, notifikasi, izin, rekap, laptop) |

Cara kerja: elemen `data-dev="phone|laptop"` dengan `data-theme`, `data-screen`, `data-state` dipasang oleh `SM2.mountAll()`. Tambahkan `data-live` supaya ponsel berjalan sendiri dan bisa diklik.

Semua nama siswa, jam, dan angka kehadiran adalah data contoh. Lokasi, jaringan, dan notifikasi disimulasikan.
