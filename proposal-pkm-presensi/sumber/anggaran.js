// Rincian anggaran. Harga satuan adalah estimasi harga pasar daring (September 2026)
// dan wajib dicocokkan ulang dengan toko yang dipilih tim sebelum proposal dikirim.
// Batas persentase per pos berlaku terhadap dana Belmawa.

const pos = [
  {
    kode: 'bahan',
    nama: 'Bahan habis pakai',
    batas: 0.60,
    item: [
      ['Access point Wi-Fi dual-band', 'Memperkuat sinyal Wi-Fi sekolah di area presensi (gerbang/lobi) bila survei menemukan titik lemah', 2, 'unit', 450000, 'belmawa'],
      ['Kabel LAN Cat6, konektor, dan aksesori pemasangan', 'Menghubungkan access point ke jaringan sekolah', 1, 'paket', 200000, 'belmawa'],
      ['Ponsel Android kelas bawah', 'Uji kompatibilitas; setelah program menjadi perangkat presensi manual guru piket', 1, 'unit', 1200000, 'belmawa'],
      ['Cetak poster panduan presensi dan kode QR tautan halaman', 'Dipasang di 15 kelas, gerbang, dan ruang guru', 20, 'lembar', 15000, 'belmawa'],
      ['ATK dan cetak formulir persetujuan orang tua serta kuesioner', 'Perizinan dan evaluasi', 1, 'paket', 250000, 'belmawa'],
    ],
  },
  {
    kode: 'sewa',
    nama: 'Sewa dan jasa',
    batas: 0.15,
    item: [
      ['Sewa VPS 2 vCPU, 4 GB RAM (pusat data Indonesia)', 'Server aplikasi web dan basis data', 4, 'bulan', 150000, 'belmawa'],
      ['Nama domain .id', 'Alamat aplikasi web dan sertifikat HTTPS', 1, 'tahun', 250000, 'belmawa'],
      ['Penggunaan laboratorium komputer kampus (in kind)', 'Pengembangan dan uji beban aplikasi', 1, 'paket', 500000, 'pt'],
    ],
  },
  {
    kode: 'transport',
    nama: 'Transportasi lokal',
    batas: 0.30,
    item: [
      ['Perjalanan ke sekolah: observasi dan wawancara', '4 kali x 2 orang', 8, 'orang-kali', 30000, 'belmawa'],
      ['Perjalanan ke sekolah: survei Wi-Fi dan akurasi GPS', '3 kali x 2 orang', 6, 'orang-kali', 30000, 'belmawa'],
      ['Perjalanan ke sekolah: validasi rancangan antarmuka', '2 kali x 2 orang', 4, 'orang-kali', 30000, 'belmawa'],
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
      ['Cetak laporan dan dokumentasi', 'Laporan kemajuan dan laporan akhir', 1, 'paket', 100000, 'belmawa'],
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
