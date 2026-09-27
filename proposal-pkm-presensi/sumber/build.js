// Membangun proposal .docx dan .md dari isi.js.
// Pemakaian: node build.js [halaman.json]
// halaman.json (opsional) berisi nomor halaman hasil render lintasan pertama, untuk daftar isi.

const fs = require('fs');
const path = require('path');
const D = require('docx');
const { judul, inti, tim, jadwal, fitur } = require('./isi');
const { hitung, rpAngka } = require('./anggaran');

const OUT_DIR = path.join(__dirname, '..');
const NAMA = '2026-09-27_proposal-pkm-kc-presensi_draft-ke-1';
const halaman = process.argv[2] && fs.existsSync(process.argv[2]) ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : {};

// ---------- ukuran (DXA) ----------
const CM = 567;
const PAGE = { w: 11906, h: 16838 };
const MARGIN = { left: 4 * CM, right: 3 * CM, top: 3 * CM, bottom: 3 * CM };
const TEXT_W = PAGE.w - MARGIN.left - MARGIN.right;
const LINE = { line: 276, lineRule: D.LineRuleType.AUTO }; // spasi 1,15
const FONT = 'Times New Roman';

// ---------- markup sebaris ----------
const verifikasi = [];
let konteks = 'Umum';
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\[V:[^\]]*\]\])/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new D.TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new D.TextRun({ text: tok.slice(2, -2), bold: true, ...base }));
    else if (tok.startsWith('[[')) {
      const isi = tok.slice(4, -2).trim();
      verifikasi.push(`${konteks}: ${isi}`);
      out.push(new D.TextRun({ text: `[VERIFIKASI: ${isi}]`, highlight: 'yellow', ...base }));
    } else out.push(new D.TextRun({ text: tok.slice(1, -1), italics: true, ...base }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new D.TextRun({ text: text.slice(last), ...base }));
  return out;
}
const md = (t) => t.replace(/\[\[V:\s*([^\]]*)\]\]/g, (_, x) => `**[VERIFIKASI: ${x.trim()}]**`);

// ---------- penampung daftar ----------
const daftarIsi = []; // {key, text, level}
const daftarGambar = [];
const daftarTabel = [];
const daftarLampiran = [];
let numCounter = 0;
const numberingConfigs = [];

function newNumbering(format = D.LevelFormat.DECIMAL, text = '%1.') {
  const ref = 'num-' + ++numCounter;
  numberingConfigs.push({
    reference: ref,
    levels: [{ level: 0, format, text, alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 426, hanging: 426 } } } }],
  });
  return ref;
}

// ---------- blok dasar ----------
const P = (text, opt = {}) =>
  new D.Paragraph({
    children: runs(text, opt.run || {}),
    alignment: opt.align ?? D.AlignmentType.JUSTIFIED,
    spacing: { ...LINE, before: opt.before ?? 0, after: opt.after ?? 0 },
    indent: opt.indent ?? { firstLine: opt.noIndent ? 0 : 567 },
    keepNext: opt.keepNext,
    pageBreakBefore: opt.pageBreakBefore,
  });

function heading(text, level, key, opt = {}) {
  daftarIsi.push({ key, text, level });
  return new D.Paragraph({
    heading: level === 1 ? D.HeadingLevel.HEADING_1 : D.HeadingLevel.HEADING_2,
    alignment: level === 1 ? D.AlignmentType.CENTER : D.AlignmentType.LEFT,
    spacing: { ...LINE, before: level === 1 ? (opt.first ? 0 : 240) : 120, after: level === 1 ? 120 : 60 },
    keepNext: true,
    pageBreakBefore: opt.pageBreakBefore,
    children: [new D.TextRun({ text, bold: true, font: FONT, size: 24 })],
  });
}

function caption(text, list) {
  list.push({ key: 'cap:' + text, text });
  return new D.Paragraph({
    alignment: D.AlignmentType.CENTER,
    spacing: { ...LINE, before: 60, after: 60 },
    keepNext: list === daftarTabel,
    children: runs(text, { bold: false }),
  });
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function figure(file, cap, widthCm) {
  const f = path.join(__dirname, 'gambar', file);
  const { w, h } = pngSize(f);
  const pxW = Math.round((widthCm / 2.54) * 96);
  const pxH = Math.round((pxW * h) / w);
  return [
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      keepNext: true,
      children: [new D.ImageRun({ type: 'png', data: fs.readFileSync(f), transformation: { width: pxW, height: pxH } })],
    }),
    caption(cap, daftarGambar),
  ];
}

const border = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map(
    (t) =>
      new D.Paragraph({
        alignment: o.align ?? D.AlignmentType.LEFT,
        spacing: { line: 240, before: 0, after: 0 },
        children: typeof t === 'string' ? runs(t, { size: o.size ?? 20, bold: o.bold, italics: o.italics }) : t,
      })
  );
  return new D.TableCell({
    borders,
    width: { size: width, type: D.WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: D.VerticalAlign.CENTER,
    shading: o.fill ? { type: D.ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    rowSpan: o.rowSpan,
    columnSpan: o.columnSpan,
    children: paras,
  });
}

function table(cols, head, rows, o = {}) {
  const widths = cols.map((c) => Math.round(c * TEXT_W));
  widths[widths.length - 1] += TEXT_W - widths.reduce((a, b) => a + b, 0);
  const size = (o.font ?? 10) * 2;
  const hdr = new D.TableRow({
    tableHeader: true,
    children: head.map((h, i) => cell(h, widths[i], { bold: true, fill: 'D9D9D9', align: D.AlignmentType.CENTER, size })),
  });
  const body = rows.map(
    (r) =>
      new D.TableRow({
        cantSplit: true,
        children: r.map((c, i) => cell(c, widths[i], { size, align: o.align?.[i] })),
      })
  );
  return new D.Table({ width: { size: TEXT_W, type: D.WidthType.DXA }, columnWidths: widths, rows: [hdr, ...body] });
}

const spacer = (after = 120) => new D.Paragraph({ spacing: { before: 0, after }, children: [] });

// ---------- blok khusus ----------
const ang = hitung();
const persen = (x) => (x * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 });

function budgetRekap() {
  const out = [];
  out.push(
    P(
      `Tim mengajukan dana Belmawa sebesar Rp${rpAngka(ang.totalBelmawa)} dan dana pendamping perguruan tinggi sebesar Rp${rpAngka(ang.totalPT)}. Porsi dana Belmawa per pos: bahan habis pakai ${persen(ang.pos[0].persen)}% (batas 60%), sewa dan jasa ${persen(ang.pos[1].persen)}% (batas 15%), transportasi lokal ${persen(ang.pos[2].persen)}% (batas 30%), dan lain-lain ${persen(ang.pos[3].persen)}% (batas 15%). Harga satuan merupakan estimasi harga pasar September 2026; rincian ada di Lampiran 2.`
    )
  );
  out.push(caption('Tabel 4.1 Rekapitulasi rencana anggaran biaya', daftarTabel));
  const widths = [0.07, 0.33, 0.3, 0.3].map((c) => Math.round(c * TEXT_W));
  widths[3] += TEXT_W - widths.reduce((a, b) => a + b, 0);
  const R = D.AlignmentType.RIGHT;
  const rows = [
    new D.TableRow({
      tableHeader: true,
      children: ['No', 'Jenis Pengeluaran', 'Sumber Dana', 'Besaran Dana (Rp)'].map((h, i) =>
        cell(h, widths[i], { bold: true, fill: 'D9D9D9', align: D.AlignmentType.CENTER })
      ),
    }),
  ];
  ang.pos.forEach((p, i) => {
    const sumber = [
      ['Belmawa', p.sub.belmawa],
      ['Perguruan Tinggi', p.sub.pt],
    ];
    sumber.forEach(([s, v], j) => {
      const children = [];
      if (j === 0) {
        children.push(cell(String(i + 1), widths[0], { rowSpan: 2, align: D.AlignmentType.CENTER }));
        children.push(cell(p.nama, widths[1], { rowSpan: 2 }));
      }
      children.push(cell(s, widths[2]));
      children.push(cell(v ? rpAngka(v) : '-', widths[3], { align: R }));
      rows.push(new D.TableRow({ cantSplit: true, children }));
    });
  });
  rows.push(
    new D.TableRow({
      children: [
        cell('Jumlah', widths[0] + widths[1] + widths[2], { columnSpan: 3, bold: true, align: D.AlignmentType.CENTER }),
        cell(rpAngka(ang.totalBelmawa + ang.totalPT), widths[3], { bold: true, align: R }),
      ],
    })
  );
  const rekap = [
    ['Belmawa', ang.totalBelmawa],
    ['Perguruan Tinggi', ang.totalPT],
    ['Instansi Lain', 0],
  ];
  rekap.forEach(([s, v], j) => {
    const children = [];
    if (j === 0) children.push(cell('Rekap Sumber Dana', widths[0] + widths[1], { columnSpan: 2, rowSpan: 4, bold: true, align: D.AlignmentType.CENTER }));
    children.push(cell(s, widths[2]));
    children.push(cell(v ? rpAngka(v) : '-', widths[3], { align: R }));
    rows.push(new D.TableRow({ cantSplit: true, children }));
  });
  rows.push(
    new D.TableRow({
      children: [cell('Jumlah', widths[2], { bold: true }), cell(rpAngka(ang.totalBelmawa + ang.totalPT), widths[3], { bold: true, align: R })],
    })
  );
  out.push(new D.Table({ width: { size: TEXT_W, type: D.WidthType.DXA }, columnWidths: widths, rows }));
  out.push(spacer());
  return out;
}

function jadwalTabel() {
  const out = [caption('Tabel 4.2 Jadwal kegiatan', daftarTabel)];
  const cols = [0.06, 0.53, 0.06, 0.06, 0.06, 0.06, 0.17];
  const widths = cols.map((c) => Math.round(c * TEXT_W));
  widths[6] += TEXT_W - widths.reduce((a, b) => a + b, 0);
  const C = D.AlignmentType.CENTER;
  const rows = [
    new D.TableRow({
      tableHeader: true,
      children: [
        cell('No', widths[0], { bold: true, fill: 'D9D9D9', align: C, rowSpan: 2 }),
        cell('Jenis Kegiatan', widths[1], { bold: true, fill: 'D9D9D9', align: C, rowSpan: 2 }),
        cell('Bulan', widths[2] * 4, { bold: true, fill: 'D9D9D9', align: C, columnSpan: 4 }),
        cell('Penanggung Jawab', widths[6], { bold: true, fill: 'D9D9D9', align: C, rowSpan: 2 }),
      ],
    }),
    new D.TableRow({
      tableHeader: true,
      children: [1, 2, 3, 4].map((b) => cell(String(b), widths[2], { bold: true, fill: 'D9D9D9', align: C })),
    }),
  ];
  jadwal.forEach(([k, bulan, pj], i) => {
    rows.push(
      new D.TableRow({
        cantSplit: true,
        children: [
          cell(String(i + 1), widths[0], { align: C }),
          cell(k, widths[1]),
          ...[1, 2, 3, 4].map((b) => cell('', widths[2], { fill: bulan.includes(b) ? '595959' : undefined })),
          cell(pj, widths[6]),
        ],
      })
    );
  });
  out.push(new D.Table({ width: { size: TEXT_W, type: D.WidthType.DXA }, columnWidths: widths, rows }));
  out.push(spacer());
  return out;
}

function refs(items) {
  return items.map(
    (t) =>
      new D.Paragraph({
        alignment: D.AlignmentType.JUSTIFIED,
        spacing: { ...LINE, before: 0, after: 60 },
        indent: { left: 567, hanging: 567 },
        children: runs(t),
      })
  );
}

// ---------- konversi blok inti ----------
function renderBlocks(blocks) {
  const out = [];
  let firstBab = true;
  for (const b of blocks) {
    switch (b.t) {
      case 'bab':
        konteks = b.text;
        out.push(heading(b.text, 1, 'h:' + b.text, { first: firstBab }));
        firstBab = false;
        break;
      case 'sub':
        konteks = b.text;
        out.push(heading(b.text, 2, 'h:' + b.text));
        break;
      case 'p':
        out.push(P(b.text));
        break;
      case 'ol': {
        const ref = newNumbering();
        for (const it of b.items)
          out.push(
            new D.Paragraph({
              numbering: { reference: ref, level: 0 },
              alignment: D.AlignmentType.JUSTIFIED,
              spacing: { ...LINE, before: 0, after: 0 },
              children: runs(it),
            })
          );
        break;
      }
      case 'table':
        out.push(caption(b.caption, daftarTabel));
        out.push(table(b.cols, b.head, b.rows, { font: b.font ?? 10 }));
        out.push(spacer());
        break;
      case 'fig':
        out.push(...figure(b.file, b.caption, b.widthCm));
        break;
      case 'budgetRekap':
        out.push(...budgetRekap());
        break;
      case 'jadwal':
        out.push(...jadwalTabel());
        break;
      case 'refs':
        out.push(...refs(b.items));
        break;
      default:
        throw new Error('Blok tidak dikenal: ' + b.t);
    }
  }
  return out;
}

// ---------- lampiran ----------
function lampiranJudul(no, text) {
  const full = `Lampiran ${no}. ${text}`;
  konteks = `Lampiran ${no}`;
  daftarLampiran.push({ key: 'h:' + full, text: full });
  return heading(full, 2, 'h:' + full, { pageBreakBefore: true });
}

function ttd(tempat, jabatan) {
  return [
    spacer(120),
    new D.Paragraph({ alignment: D.AlignmentType.RIGHT, spacing: LINE, children: runs(`${tempat}, [[V: tanggal-bulan-tahun]]`) }),
    new D.Paragraph({ alignment: D.AlignmentType.RIGHT, spacing: LINE, children: runs(jabatan) }),
    spacer(900),
    new D.Paragraph({ alignment: D.AlignmentType.RIGHT, spacing: LINE, children: runs('([[V: nama lengkap]])') }),
  ];
}

function lampiran() {
  const out = [];
  const W = (arr) => arr;

  // Lampiran 1
  out.push(lampiranJudul(1, 'Biodata Ketua, Anggota, serta Dosen Pendamping'));
  out.push(P('Salin format ini untuk ketua, setiap anggota, dan dosen pendamping. Dosen pendamping mengisi NIDN/NUPTK, riwayat pendidikan, rekam jejak tridharma, dan pengalaman membimbing sesuai format resmi.', { noIndent: true, run: { italics: true } }));
  out.push(P('**A. Identitas Diri**', { noIndent: true, before: 120 }));
  out.push(
    table(W([0.08, 0.42, 0.5]), ['No', 'Item', 'Isian'], [
      ['1', 'Nama Lengkap', '[[V: isi]]'],
      ['2', 'Jenis Kelamin', '[[V: isi]]'],
      ['3', 'Program Studi', '[[V: isi]]'],
      ['4', 'NIM', '[[V: isi]]'],
      ['5', 'Tempat dan Tanggal Lahir', '[[V: isi]]'],
      ['6', 'Alamat Surel', '[[V: isi]]'],
      ['7', 'Nomor Telepon/HP', '[[V: isi]]'],
    ])
  );
  out.push(P('**B. Kegiatan Kemahasiswaan yang Sedang/Pernah Diikuti**', { noIndent: true, before: 120 }));
  out.push(table(W([0.08, 0.37, 0.25, 0.3]), ['No', 'Jenis Kegiatan', 'Status dalam Kegiatan', 'Waktu dan Tempat'], [['1', '', '', ''], ['2', '', '', '']]));
  out.push(P('**C. Penghargaan yang Pernah Diterima**', { noIndent: true, before: 120 }));
  out.push(table(W([0.08, 0.42, 0.3, 0.2]), ['No', 'Jenis Penghargaan', 'Pihak Pemberi', 'Tahun'], [['1', '', '', ''], ['2', '', '', '']]));
  out.push(
    P(
      'Semua data yang saya isikan dan tercantum dalam biodata ini adalah benar dan dapat dipertanggungjawabkan secara hukum. Apabila di kemudian hari ternyata dijumpai ketidaksesuaian dengan kenyataan, saya sanggup menerima sanksi. Demikian biodata ini saya buat dengan sebenarnya untuk memenuhi salah satu persyaratan dalam pengajuan PKM-KC. [[V: cocokkan dengan redaksi resmi panduan terbaru]]',
      { before: 120 }
    )
  );
  out.push(...ttd('[[V: kota]]', 'Pengusul,'));

  // Lampiran 2
  out.push(lampiranJudul(2, 'Justifikasi Anggaran Kegiatan'));
  const cols = [0.44, 0.13, 0.12, 0.14, 0.17];
  const widths = cols.map((c) => Math.round(c * TEXT_W));
  widths[4] += TEXT_W - widths.reduce((a, b) => a + b, 0);
  const R = D.AlignmentType.RIGHT;
  const C = D.AlignmentType.CENTER;
  const rows = [
    new D.TableRow({
      tableHeader: true,
      children: ['Jenis Pengeluaran', 'Sumber Dana', 'Volume', 'Harga Satuan (Rp)', 'Nilai (Rp)'].map((h, i) =>
        cell(h, widths[i], { bold: true, fill: 'D9D9D9', align: C })
      ),
    }),
  ];
  const labelSumber = { belmawa: 'Belmawa', pt: 'Perguruan Tinggi' };
  ang.pos.forEach((p, i) => {
    rows.push(
      new D.TableRow({
        children: [cell(`${i + 1}. ${p.nama} (maks ${p.batas * 100}% dana Belmawa)`, TEXT_W, { columnSpan: 5, bold: true, fill: 'F2F2F2' })],
      })
    );
    for (const it of p.item) {
      const [nama, ket, vol, sat, harga, sumber] = it;
      rows.push(
        new D.TableRow({
          cantSplit: true,
          children: [
            cell([nama, [new D.TextRun({ text: ket, italics: true, size: 18 })]], widths[0]),
            cell(labelSumber[sumber], widths[1]),
            cell(`${vol} ${sat}`, widths[2], { align: C }),
            cell(rpAngka(harga), widths[3], { align: R }),
            cell(rpAngka(vol * harga), widths[4], { align: R }),
          ],
        })
      );
    }
    for (const s of ['belmawa', 'pt']) {
      if (!p.sub[s]) continue;
      rows.push(
        new D.TableRow({
          children: [
            cell(`Subtotal ${p.nama} (${labelSumber[s]})`, widths[0] + widths[1] + widths[2] + widths[3], { columnSpan: 4, bold: true }),
            cell(rpAngka(p.sub[s]), widths[4], { bold: true, align: R }),
          ],
        })
      );
    }
  });
  rows.push(
    new D.TableRow({
      children: [
        cell('Grand total (Belmawa + Perguruan Tinggi)', widths[0] + widths[1] + widths[2] + widths[3], { columnSpan: 4, bold: true, fill: 'D9D9D9' }),
        cell(rpAngka(ang.totalBelmawa + ang.totalPT), widths[4], { bold: true, align: R, fill: 'D9D9D9' }),
      ],
    })
  );
  out.push(new D.Table({ width: { size: TEXT_W, type: D.WidthType.DXA }, columnWidths: widths, rows }));
  out.push(
    P(
      'Catatan: harga satuan merupakan estimasi dari penelusuran toko daring (September 2026). Tim wajib menggantinya dengan harga toko yang dipilih dan menyimpan bukti harga. Biaya transportasi lokal mengasumsikan [[V: jarak kampus ke Jl. Bengawan No. 6 dan tarif per perjalanan pulang-pergi]].',
      { noIndent: true, before: 120, run: { size: 20 } }
    )
  );

  // Lampiran 3
  out.push(lampiranJudul(3, 'Susunan Tim Pengusul dan Pembagian Tugas'));
  out.push(
    table(
      [0.05, 0.19, 0.15, 0.16, 0.12, 0.33],
      ['No', 'Nama / NIM', 'Program Studi', 'Bidang Ilmu', 'Alokasi Waktu (jam/minggu)', 'Uraian Tugas'],
      tim.map((r, i) => [String(i + 1), `${r[0]}: ${r[1]}`, r[2], r[3], String(r[4]), r[5]]),
      { align: [C, undefined, undefined, undefined, C, undefined] }
    )
  );

  // Lampiran 4
  out.push(lampiranJudul(4, 'Surat Pernyataan Ketua Tim Pengusul'));
  out.push(P('Gunakan redaksi resmi dari panduan terbaru, termasuk butir pernyataan penggunaan kecerdasan artifisial. Isian di bawah adalah contoh susunan. [[V: salin format resmi]]', { noIndent: true, run: { italics: true } }));
  out.push(P('Yang bertanda tangan di bawah ini:', { noIndent: true, before: 120 }));
  out.push(
    table([0.35, 0.65], ['Data', 'Isian'], [
      ['Nama', '[[V: isi]]'],
      ['NIM', '[[V: isi]]'],
      ['Program Studi', '[[V: isi]]'],
      ['Bidang Kegiatan', 'PKM-KC'],
    ])
  );
  out.push(
    P(
      `Dengan ini menyatakan bahwa proposal PKM-KC saya dengan judul "${judul}" yang diusulkan untuk tahun anggaran [[V: tahun]] adalah asli karya kami dan belum pernah dibiayai oleh lembaga atau sumber dana lain. Bilamana di kemudian hari ditemukan ketidaksesuaian dengan pernyataan ini, saya bersedia dituntut dan diproses sesuai ketentuan yang berlaku dan mengembalikan seluruh biaya yang sudah diterima ke kas negara. Demikian pernyataan ini dibuat dengan sesungguhnya dan dengan sebenar-benarnya.`,
      { before: 120 }
    )
  );
  out.push(...ttd('[[V: kota]]', 'Yang menyatakan,'));

  // Lampiran 5
  out.push(lampiranJudul(5, 'Gambaran Teknologi yang akan Dikembangkan'));
  out.push(
    P(
      'Hadirku terdiri atas tiga bagian. Titik presensi di gerbang membaca kartu dan memotret siswa. Server menyimpan data, menjalankan aturan anomali, dan mengirim notifikasi. Aplikasi web dan bot Telegram melayani sekolah dan orang tua. Gambar L5.1 memperlihatkan arsitektur, Gambar L5.2 alur presensi berlapis, dan Gambar L5.3 susunan perangkat keras.'
    )
  );
  out.push(...figure('arsitektur.png', 'Gambar L5.1 Arsitektur sistem Hadirku', 14));
  out.push(...figure('berlapis.png', 'Gambar L5.2 Alur presensi berlapis', 14));
  out.push(...figure('perangkat.png', 'Gambar L5.3 Diagram blok titik presensi', 14));
  out.push(caption('Tabel L5.1 Fitur per peran pengguna', daftarTabel));
  out.push(table([0.25, 0.75], ['Peran', 'Fitur'], fitur));
  out.push(spacer());
  out.push(caption('Tabel L5.2 Data yang diproses dan pengamanannya', daftarTabel));
  out.push(
    table(
      [0.26, 0.37, 0.37],
      ['Data', 'Tujuan', 'Pengamanan dan retensi'],
      [
        ['Nama, NIS, rombel, UID kartu', 'Identifikasi siswa dan rekap', 'Akses berbasis peran; dihapus atau dianonimkan saat siswa lulus/pindah'],
        ['Foto saat penempelan kartu', 'Bukti kehadiran untuk audit', 'Hanya wali kelas, BK, admin; dihapus otomatis setelah 30 hari; tidak diproses pengenalan wajah'],
        ['Waktu masuk, pulang, status kelas', 'Presensi dan ringkasan orang tua', 'Log audit untuk setiap perubahan; cadangan terenkripsi'],
        ['ID Telegram orang tua', 'Pengiriman notifikasi', 'Hanya dihubungkan setelah orang tua memberi persetujuan dan kode tautan'],
      ]
    )
  );

  // Lampiran 6
  out.push(lampiranJudul(6, 'Hasil Uji Similaritas Proposal'));
  out.push(P('Tempelkan hasil uji similaritas (Turnitin, iThenticate, atau perangkat lain yang ditetapkan perguruan tinggi). Batas maksimal 25%. [[V: tempel hasil]]', { noIndent: true }));

  // Lampiran 7 (anjuran)
  out.push(lampiranJudul(7, 'Surat Kesediaan Sekolah Mitra Uji Coba'));
  out.push(
    P(
      'Tidak wajib untuk PKM-KC, tetapi menguatkan bukti bahwa masalah dan lokasi uji coba nyata. Surat memuat kesediaan SMA Santa Maria 1 Bandung menjadi lokasi pengembangan dan uji coba, rombel yang terlibat, serta izin pemasangan perangkat di gerbang. [[V: tempel surat bertanda tangan kepala sekolah]]',
      { noIndent: true }
    )
  );
  return out;
}

// ---------- daftar (front matter) ----------
function entri(text, pg, level = 1) {
  return new D.Paragraph({
    spacing: { ...LINE, before: 0, after: 40 },
    indent: { left: level === 2 ? 426 : 0 },
    tabStops: [{ type: D.TabStopType.RIGHT, position: TEXT_W, leader: 'dot' }],
    children: [
      new D.TextRun({ text, font: FONT, size: 24, bold: level === 1 && /^(BAB|DAFTAR|LAMPIRAN)/.test(text) }),
      new D.TextRun({ children: [new D.Tab(), halaman[text] ?? '0'], font: FONT, size: 24 }),
    ],
  });
}
const judulDaftar = (text, first) =>
  new D.Paragraph({
    alignment: D.AlignmentType.CENTER,
    pageBreakBefore: !first,
    spacing: { ...LINE, after: 240 },
    children: [new D.TextRun({ text, bold: true, font: FONT, size: 24 })],
  });

function frontMatter() {
  const out = [];
  out.push(judulDaftar('DAFTAR ISI', true));
  for (const e of [{ text: 'DAFTAR GAMBAR', level: 1 }, { text: 'DAFTAR TABEL', level: 1 }, { text: 'DAFTAR LAMPIRAN', level: 1 }]) out.push(entri(e.text, null, 1));
  for (const e of daftarIsi) {
    if (e.text.startsWith('Lampiran')) continue;
    out.push(entri(e.text, null, e.level));
  }
  out.push(entri('LAMPIRAN', null, 1));
  out.push(judulDaftar('DAFTAR GAMBAR'));
  for (const e of daftarGambar) out.push(entri(e.text, null, 1));
  out.push(judulDaftar('DAFTAR TABEL'));
  for (const e of daftarTabel) out.push(entri(e.text, null, 1));
  out.push(judulDaftar('DAFTAR LAMPIRAN'));
  for (const e of daftarLampiran) out.push(entri(e.text, null, 1));
  return out;
}

// ---------- lembar kerja tim (dihapus sebelum unggah) ----------
function lembarKerja() {
  const unik = [...new Set(verifikasi)];
  const out = [
    new D.Paragraph({
      alignment: D.AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new D.TextRun({ text: 'LEMBAR KERJA TIM: HAPUS HALAMAN INI SEBELUM MENGUNGGAH', bold: true, color: 'C00000', font: FONT, size: 24 })],
    }),
    P(`**Judul (${judul.split(/\s+/).length} kata):** ${judul}`, { noIndent: true }),
    P('**Skema:** PKM Karsa Cipta (PKM-KC). **Lokasi uji coba:** SMA Santa Maria 1 Bandung.', { noIndent: true }),
    P('Panduan melarang halaman sampul, halaman pengesahan, dan ringkasan di dalam isi utama proposal. Sampul dan pengesahan dibuat melalui laman Simbelmawa. Bagian inti (Bab 1 sampai Daftar Pustaka) maksimal 10 halaman.', { noIndent: true, before: 60 }),
    P(`**Isian yang wajib dilengkapi atau diverifikasi (${unik.length} butir, ditandai stabilo kuning di dokumen):**`, { noIndent: true, before: 120 }),
  ];
  const ref = newNumbering();
  for (const v of unik)
    out.push(new D.Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { line: 240, after: 0 }, children: [new D.TextRun({ text: v, size: 20, font: FONT })] }));
  out.push(
    P('Setelah semua isian lengkap: perbarui nomor halaman di daftar isi, cek batas 10 halaman, jalankan uji similaritas, lalu hapus halaman ini.', { noIndent: true, before: 120 })
  );
  return out;
}

// ---------- rakit dokumen ----------
const isiInti = renderBlocks(inti);
const isiLampiran = lampiran();
const halamanDepan = frontMatter();
const lembar = lembarKerja();

const footer = (fmt) =>
  new D.Footer({
    children: [
      new D.Paragraph({
        alignment: D.AlignmentType.CENTER,
        children: [new D.TextRun({ children: [D.PageNumber.CURRENT], font: FONT, size: 24 })],
      }),
    ],
  });

const pageProps = (fmt, start) => ({
  page: {
    size: { width: PAGE.w, height: PAGE.h },
    margin: { ...MARGIN, header: 708, footer: 708 },
    pageNumbers: fmt ? { start, formatType: fmt } : undefined,
  },
});

const doc = new D.Document({
  creator: 'Tim PKM-KC Hadirku',
  title: judul,
  description: 'Proposal PKM-KC sistem presensi berlapis',
  styles: {
    default: { document: { run: { font: FONT, size: 24 }, paragraph: { spacing: LINE } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: '000000' }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: '000000' }, paragraph: { outlineLevel: 1 } },
    ],
  },
  numbering: { config: numberingConfigs },
  sections: [
    { properties: pageProps(), children: lembar },
    { properties: pageProps(D.NumberFormat.LOWER_ROMAN, 1), footers: { default: footer() }, children: halamanDepan },
    { properties: pageProps(D.NumberFormat.DECIMAL, 1), footers: { default: footer() }, children: [...isiInti, ...isiLampiran] },
  ],
});

// ---------- keluaran ----------
D.Packer.toBuffer(doc)
  .then(async (buf) => {
    // docx-js menulis <w:highlightCs>, elemen yang tidak ada di skema OOXML; buang agar Word tidak memprotes.
    const JSZip = require('jszip');
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('word/document.xml').async('string');
    zip.file('word/document.xml', xml.replace(/<w:highlightCs [^>]*\/>/g, ''));
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  })
  .then((buf) => {
  fs.writeFileSync(path.join(OUT_DIR, NAMA + '.docx'), buf);
  // daftar entri untuk pencari nomor halaman
  const entries = [
    ...daftarIsi.map((e) => e.text),
    ...daftarGambar.map((e) => e.text),
    ...daftarTabel.map((e) => e.text),
  ];
  fs.writeFileSync(path.join(__dirname, 'entri.json'), JSON.stringify({ entries, depan: ['DAFTAR ISI', 'DAFTAR GAMBAR', 'DAFTAR TABEL', 'DAFTAR LAMPIRAN'] }, null, 1));
  console.log('docx ok;', verifikasi.length, 'penanda verifikasi');
});

// ---------- Markdown ----------
function toMarkdown() {
  const L = [];
  L.push(`# ${judul}`, '', '*Proposal PKM Karsa Cipta (PKM-KC). Draf ke-1, 27 September 2026. Teks yang sama dengan berkas .docx; penanda **[VERIFIKASI: ...]** wajib dilengkapi tim.*', '');
  const mdTable = (head, rows) => {
    L.push('| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|');
    for (const r of rows) L.push('| ' + r.map((c) => md(String(c)).replace(/\|/g, '\\|')).join(' | ') + ' |');
    L.push('');
  };
  for (const b of inti) {
    if (b.t === 'bab') L.push(`## ${b.text}`, '');
    else if (b.t === 'sub') L.push(`### ${b.text}`, '');
    else if (b.t === 'p') L.push(md(b.text), '');
    else if (b.t === 'ol') {
      b.items.forEach((it, i) => L.push(`${i + 1}. ${md(it)}`));
      L.push('');
    } else if (b.t === 'table') {
      L.push(`**${b.caption}**`, '');
      mdTable(b.head, b.rows);
    } else if (b.t === 'fig') L.push(`![${b.caption}](sumber/gambar/${b.file})`, '', `*${b.caption}*`, '');
    else if (b.t === 'budgetRekap') {
      L.push(
        `Dana Belmawa Rp${rpAngka(ang.totalBelmawa)}, dana perguruan tinggi Rp${rpAngka(ang.totalPT)}. Porsi dana Belmawa: bahan habis pakai ${persen(ang.pos[0].persen)}% (maks 60%), sewa dan jasa ${persen(ang.pos[1].persen)}% (maks 15%), transportasi lokal ${persen(ang.pos[2].persen)}% (maks 30%), lain-lain ${persen(ang.pos[3].persen)}% (maks 15%). Harga satuan estimasi September 2026.`,
        '',
        '**Tabel 4.1 Rekapitulasi rencana anggaran biaya**',
        ''
      );
      mdTable(
        ['No', 'Jenis Pengeluaran', 'Belmawa (Rp)', 'Perguruan Tinggi (Rp)', 'Jumlah (Rp)'],
        [
          ...ang.pos.map((p, i) => [i + 1, p.nama, rpAngka(p.sub.belmawa), p.sub.pt ? rpAngka(p.sub.pt) : '-', rpAngka(p.sub.belmawa + p.sub.pt)]),
          ['', '**Jumlah**', `**${rpAngka(ang.totalBelmawa)}**`, `**${rpAngka(ang.totalPT)}**`, `**${rpAngka(ang.totalBelmawa + ang.totalPT)}**`],
        ]
      );
    } else if (b.t === 'jadwal') {
      L.push('**Tabel 4.2 Jadwal kegiatan**', '');
      mdTable(
        ['No', 'Jenis Kegiatan', 'B1', 'B2', 'B3', 'B4', 'Penanggung Jawab'],
        jadwal.map(([k, bl, pj], i) => [i + 1, k, ...[1, 2, 3, 4].map((x) => (bl.includes(x) ? '■' : '')), pj])
      );
    } else if (b.t === 'refs') {
      for (const r of b.items) L.push(`- ${md(r)}`);
      L.push('');
    }
  }
  L.push('## LAMPIRAN', '', '### Lampiran 2. Justifikasi Anggaran Kegiatan', '');
  const lab = { belmawa: 'Belmawa', pt: 'PT' };
  mdTable(
    ['Pos', 'Jenis Pengeluaran', 'Sumber', 'Volume', 'Harga Satuan (Rp)', 'Nilai (Rp)'],
    ang.pos.flatMap((p) => p.item.map((it) => [p.nama, `${it[0]} (${it[1]})`, lab[it[5]], `${it[2]} ${it[3]}`, rpAngka(it[4]), rpAngka(it[2] * it[4])]))
  );
  L.push('### Lampiran 3. Susunan Tim Pengusul dan Pembagian Tugas', '');
  mdTable(['No', 'Nama / NIM', 'Program Studi', 'Bidang Ilmu', 'Jam/minggu', 'Uraian Tugas'], tim.map((r, i) => [i + 1, `${r[0]}: ${r[1]}`, r[2], r[3], r[4], r[5]]));
  L.push('### Lampiran 5. Gambaran Teknologi', '');
  for (const [f, c] of [
    ['arsitektur.png', 'Gambar L5.1 Arsitektur sistem Hadirku'],
    ['berlapis.png', 'Gambar L5.2 Alur presensi berlapis'],
    ['perangkat.png', 'Gambar L5.3 Diagram blok titik presensi'],
  ])
    L.push(`![${c}](sumber/gambar/${f})`, '', `*${c}*`, '');
  L.push('**Tabel L5.1 Fitur per peran pengguna**', '');
  mdTable(['Peran', 'Fitur'], fitur);
  L.push('Lampiran 1 (biodata), 4 (surat pernyataan), 6 (uji similaritas), dan 7 (surat kesediaan sekolah) berupa formulir; lihat berkas .docx.', '');
  fs.writeFileSync(path.join(OUT_DIR, '2026-09-27_isi-proposal_draft-ke-1.md'), L.join('\n'));
}
toMarkdown();
