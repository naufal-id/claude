// Rincian anggaran. Harga satuan adalah estimasi harga pasar daring (September 2026)
// dan wajib dicocokkan ulang dengan toko yang dipilih tim sebelum proposal dikirim.
// Batas persentase per pos berlaku terhadap dana Belmawa.

const pos = [
  {
    kode: 'bahan',
    nama: 'Bahan habis pakai',
    batas: 0.60,
    item: [
      ['Papan ESP32-S3 dengan kamera OV2640 dan slot microSD', 'Otak titik presensi dan pemotret bukti (2 terpasang, 1 cadangan)', 3, 'unit', 175000, 'belmawa'],
      ['Modul pembaca RFID RC522 13,56 MHz', 'Membaca UID kartu siswa', 3, 'unit', 30000, 'belmawa'],
      ['Layar TFT 2,4 inci SPI', 'Menampilkan nama dan status presensi', 3, 'unit', 75000, 'belmawa'],
      ['Kartu RFID MIFARE S50 cetak identitas', 'Kartu siswa 3 rombel uji coba, guru, dan cadangan', 120, 'keping', 8500, 'belmawa'],
      ['Kartu microSD 32 GB', 'Antrean luring saat Wi-Fi terputus', 3, 'keping', 60000, 'belmawa'],
      ['Adaptor 5 V 3 A dan kabel daya', 'Catu daya titik presensi', 3, 'set', 60000, 'belmawa'],
      ['Komponen pendukung (buzzer, LED, resistor, PCB, kabel jumper, header)', 'Perakitan rangkaian', 3, 'paket', 60000, 'belmawa'],
      ['Casing akrilik potong laser beserta baut', 'Pelindung perangkat di area gerbang', 3, 'unit', 150000, 'belmawa'],
      ['Braket dinding, kabel ties, dan duct kabel', 'Pemasangan di gerbang', 2, 'set', 50000, 'belmawa'],
      ['Kabel data USB dan modul pemrogram', 'Pemrograman dan pengujian perangkat', 2, 'set', 40000, 'belmawa'],
      ['ATK dan cetak formulir persetujuan orang tua serta kuesioner', 'Perizinan dan evaluasi', 1, 'paket', 200000, 'belmawa'],
    ],
  },
  {
    kode: 'sewa',
    nama: 'Sewa dan jasa',
    batas: 0.15,
    item: [
      ['Sewa VPS 2 vCPU, 4 GB RAM (pusat data Indonesia)', 'Server aplikasi, basis data, penyimpanan foto', 4, 'bulan', 150000, 'belmawa'],
      ['Nama domain .id', 'Alamat aplikasi web dan sertifikat HTTPS', 1, 'tahun', 250000, 'belmawa'],
      ['Penggunaan laboratorium dan peralatan kampus (in kind)', 'Perakitan dan pengujian perangkat', 1, 'paket', 500000, 'pt'],
    ],
  },
  {
    kode: 'transport',
    nama: 'Transportasi lokal',
    batas: 0.30,
    item: [
      ['Perjalanan ke sekolah: observasi dan wawancara', '4 kali x 2 orang', 8, 'orang-kali', 30000, 'belmawa'],
      ['Perjalanan ke sekolah: validasi desain dan instalasi', '4 kali x 2 orang', 8, 'orang-kali', 30000, 'belmawa'],
      ['Perjalanan ke sekolah: pendampingan uji coba lapangan', '12 kali x 2 orang', 24, 'orang-kali', 30000, 'belmawa'],
      ['Perjalanan ke sekolah: pelatihan dan serah terima', '2 kali x 2 orang', 4, 'orang-kali', 30000, 'belmawa'],
    ],
  },
  {
    kode: 'lain',
    nama: 'Lain-lain',
    batas: 0.15,
    item: [
      ['Paket data internet tim', 'Pengembangan dan pemantauan uji coba', 4, 'bulan', 100000, 'belmawa'],
      ['Cetak buku panduan pengguna', 'Pegangan admin, guru, dan wali kelas', 10, 'eksemplar', 25000, 'belmawa'],
      ['Cetak laporan dan dokumentasi', 'Laporan kemajuan dan laporan akhir', 1, 'paket', 150000, 'belmawa'],
      ['Meterai', 'Surat pernyataan dan dokumen kerja sama', 10, 'lembar', 10000, 'belmawa'],
      ['Biaya publikasi artikel ilmiah (estimasi)', 'Luaran tambahan: artikel di jurnal nasional', 1, 'artikel', 750000, 'pt'],
      ['Konsumsi pelatihan guru dan sosialisasi orang tua', '2 kegiatan x 30 orang', 60, 'porsi', 12500, 'pt'],
    ],
  },
];

function hitung() {
  const ringkas = pos.map((p) => {
    const sub = { belmawa: 0, pt: 0 };
    for (const it of p.item) sub[it[5]] += it[2] * it[4];
    return { ...p, sub };
  });
  const totalBelmawa = ringkas.reduce((a, p) => a + p.sub.belmawa, 0);
  const totalPT = ringkas.reduce((a, p) => a + p.sub.pt, 0);
  for (const p of ringkas) {
    p.persen = p.sub.belmawa / totalBelmawa;
    if (p.persen > p.batas + 1e-9) {
      throw new Error(`Pos ${p.nama} ${(p.persen * 100).toFixed(1)}% melebihi batas ${p.batas * 100}%`);
    }
  }
  if (totalBelmawa < 5000000 || totalBelmawa > 8000000) throw new Error('Dana Belmawa di luar Rp5–8 juta: ' + totalBelmawa);
  if (totalPT > 2000000) throw new Error('Dana PT melebihi Rp2 juta: ' + totalPT);
  return { pos: ringkas, totalBelmawa, totalPT };
}

const rp = (n) => 'Rp' + n.toLocaleString('id-ID');
const rpAngka = (n) => n.toLocaleString('id-ID');

module.exports = { hitung, rp, rpAngka };

if (require.main === module) {
  const h = hitung();
  for (const p of h.pos) console.log(p.nama, p.sub, (p.persen * 100).toFixed(1) + '%');
  console.log('Belmawa', h.totalBelmawa, 'PT', h.totalPT, 'Total', h.totalBelmawa + h.totalPT);
}
