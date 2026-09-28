'use strict';

const el = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const KUNCI_SESI = 'absen.kunci_admin';

let kunci = '';
let pewaktuOtomatis = null;

function bacaSesi() {
  try { return sessionStorage.getItem(KUNCI_SESI) || ''; } catch { return ''; }
}
function simpanSesi(nilai) {
  try {
    if (nilai) sessionStorage.setItem(KUNCI_SESI, nilai);
    else sessionStorage.removeItem(KUNCI_SESI);
  } catch { /* mode privat */ }
}

function warnaToken(nama) {
  return getComputedStyle(document.documentElement).getPropertyValue(nama).trim();
}

function tampilkanPesan(jenis, judul, isi) {
  const node = el('pesan');
  node.className = `pita ${jenis}`;
  node.replaceChildren();
  const s = document.createElement('strong');
  s.textContent = judul;
  node.append(s);
  for (const baris of [].concat(isi || [])) {
    const d = document.createElement('div');
    d.textContent = baris;
    node.append(d);
  }
  node.hidden = false;
}

function formatWaktu(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatMeter(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} km`;
}

function ringkasPerangkat(ua) {
  const os = /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux' : 'Lainnya';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari' : 'Browser lain';
  return `${browser}, ${os}`;
}

async function api(jalur, opsi = {}) {
  const res = await fetch(jalur, {
    ...opsi,
    headers: { ...(opsi.headers || {}), 'X-Kunci-Admin': kunci },
  });
  if (res.status === 401) {
    keluar('Kunci admin salah atau server sudah dijalankan ulang dengan kunci baru.');
    throw new Error('401');
  }
  return res;
}

function tampilkanLogin(tampil) {
  el('panel-kunci').hidden = !tampil;
  el('panel-utama').hidden = tampil;
}

function keluar(alasan) {
  kunci = '';
  simpanSesi('');
  clearInterval(pewaktuOtomatis);
  pewaktuOtomatis = null;
  tampilkanLogin(true);
  if (alasan) tampilkanPesan('bahaya', alasan);
}

// Proyeksi ekuirektangular sederhana di sekitar kantor. Cukup akurat untuk
// jarak beberapa kilometer, yang memang skala absen.
function keMeterRelatif(lat, lon, lat0, lon0) {
  const x = (lon - lon0) * 111320 * Math.cos((lat0 * Math.PI) / 180);
  const y = (lat - lat0) * 110574;
  return { x, y };
}

function elemenSvg(nama, atribut, induk) {
  const node = document.createElementNS(SVG_NS, nama);
  for (const [k, v] of Object.entries(atribut)) node.setAttribute(k, v);
  if (induk) induk.append(node);
  return node;
}

function gambarPeta(data, p) {
  const svg = el('peta');
  svg.replaceChildren();
  const warna = {
    valid: warnaToken('--utama'),
    di_luar_area: warnaToken('--terakota'),
    akurasi_rendah: warnaToken('--oker'),
    garis: warnaToken('--garis'),
    meta: warnaToken('--meta'),
    teks: warnaToken('--teks'),
  };
  const PUSAT = 200;
  const TEPI = 185;

  // Skala dibatasi 5x radius supaya lingkaran geofence tetap terbaca.
  // Titik yang lebih jauh ditempel di tepi.
  const jarakTerjauh = data.reduce((m, a) => Math.max(m, a.jarak_m), 0);
  const jangkauan = Math.min(Math.max(jarakTerjauh * 1.15, p.radius_m * 1.5), p.radius_m * 5);
  const skala = TEPI / jangkauan;

  elemenSvg('circle', { cx: PUSAT, cy: PUSAT, r: TEPI, fill: 'none', stroke: warna.garis, 'stroke-dasharray': '4 4' }, svg);
  elemenSvg('line', { x1: PUSAT, y1: PUSAT - TEPI, x2: PUSAT, y2: PUSAT + TEPI, stroke: warna.garis }, svg);
  elemenSvg('line', { x1: PUSAT - TEPI, y1: PUSAT, x2: PUSAT + TEPI, y2: PUSAT, stroke: warna.garis }, svg);
  const u = elemenSvg('text', { x: PUSAT + 6, y: 20, fill: warna.meta, 'font-size': 12 }, svg);
  u.textContent = 'U';

  elemenSvg('circle', {
    cx: PUSAT, cy: PUSAT, r: p.radius_m * skala,
    fill: warna.valid, 'fill-opacity': 0.1, stroke: warna.valid, 'stroke-width': 2,
  }, svg);
  const labelRadius = elemenSvg('text', {
    x: PUSAT, y: PUSAT - p.radius_m * skala - 6, fill: warna.valid, 'font-size': 11, 'text-anchor': 'middle',
  }, svg);
  labelRadius.textContent = `radius ${formatMeter(p.radius_m)}`;

  // Titik terlama digambar dulu supaya yang terbaru ada di atas.
  for (const a of [...data].reverse()) {
    let { x, y } = keMeterRelatif(a.lat, a.lon, p.lat, p.lon);
    const jarakM = Math.hypot(x, y);
    const diTepi = jarakM * skala > TEPI;
    if (diTepi) {
      x = (x / jarakM) * (TEPI / skala);
      y = (y / jarakM) * (TEPI / skala);
    }
    const cx = PUSAT + x * skala;
    const cy = PUSAT - y * skala;
    const c = warna[a.status] || warna.meta;
    const g = elemenSvg('g', {}, svg);
    if (!diTepi) {
      elemenSvg('circle', { cx, cy, r: Math.max(a.akurasi_m * skala, 0), fill: c, 'fill-opacity': 0.08, stroke: 'none' }, g);
    }
    elemenSvg('circle', {
      cx, cy, r: 6,
      fill: diTepi ? '#FFFFFF' : c, stroke: c, 'stroke-width': 2,
    }, g);
    const judul = elemenSvg('title', {}, g);
    judul.textContent = `#${a.id} ${a.id_karyawan} ${a.nama}, ${a.jenis}, ${formatMeter(a.jarak_m)} ` +
      `(akurasi ${formatMeter(a.akurasi_m)}), ${formatWaktu(a.waktu_server)} WIB`;
  }
  elemenSvg('rect', { x: PUSAT - 4, y: PUSAT - 4, width: 8, height: 8, fill: warna.teks }, svg);
  el('skala-peta').textContent = `Kotak hitam = kantor. Tepi lingkaran luar = ${formatMeter(jangkauan)}`;
}

function sel(teks, kelas) {
  const td = document.createElement('td');
  if (kelas) td.className = kelas;
  if (teks !== undefined) td.textContent = teks;
  return td;
}

const LABEL_STATUS = { valid: 'Valid', di_luar_area: 'Di luar area', akurasi_rendah: 'Akurasi rendah' };

function isiTabel(data, total) {
  const tbody = el('isi-tabel');
  tbody.replaceChildren();
  for (const a of data) {
    const tr = document.createElement('tr');
    tr.append(sel(String(a.id), 'angka'));
    tr.append(sel(formatWaktu(a.waktu_server), 'angka'));
    tr.append(sel(a.id_karyawan, 'tanpa-putus'));
    tr.append(sel(a.nama));
    tr.append(sel(a.jenis));

    const tdStatus = sel();
    const lencana = document.createElement('span');
    lencana.className = `lencana ${a.status}`;
    lencana.textContent = LABEL_STATUS[a.status] || a.status;
    tdStatus.append(lencana);
    tr.append(tdStatus);

    tr.append(sel(formatMeter(a.jarak_m), 'angka'));
    tr.append(sel(`± ${formatMeter(a.akurasi_m)}`, 'angka'));

    const tdKoordinat = sel(undefined, 'angka');
    const link = document.createElement('a');
    link.href = `https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lon}#map=18/${a.lat}/${a.lon}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}`;
    tdKoordinat.append(link);
    tr.append(tdKoordinat);

    tr.append(sel(a.ip || '-', 'angka'));
    const tdPerangkat = sel(ringkasPerangkat(a.perangkat || ''), 'perangkat');
    tdPerangkat.title = a.perangkat || '';
    tr.append(tdPerangkat);
    tbody.append(tr);
  }
  el('tabel-kosong').hidden = data.length > 0;
  el('keterangan-tabel').textContent = total > data.length
    ? `(${data.length} terbaru dari ${total})`
    : `(${total})`;
}

function isiFormKantor(p) {
  // Jangan timpa isian yang sedang diketik admin.
  if (el('form-kantor').contains(document.activeElement)) return;
  el('k-nama').value = p.nama_lokasi;
  el('k-lat').value = p.lat;
  el('k-lon').value = p.lon;
  el('k-radius').value = p.radius_m;
  el('k-akurasi').value = p.batas_akurasi_m;
}

async function muat() {
  const res = await api('/api/absen?batas=500');
  const json = await res.json();
  const hitung = (s) => json.data.filter((a) => a.status === s).length;
  el('r-total').textContent = json.total;
  el('r-valid').textContent = hitung('valid');
  el('r-luar').textContent = hitung('di_luar_area');
  el('r-akurasi').textContent = hitung('akurasi_rendah');
  isiTabel(json.data, json.total);
  gambarPeta(json.data, json.pengaturan);
  isiFormKantor(json.pengaturan);
}

function aturOtomatis() {
  clearInterval(pewaktuOtomatis);
  pewaktuOtomatis = null;
  if (el('otomatis').checked && kunci) {
    pewaktuOtomatis = setInterval(() => muat().catch(() => {}), 10000);
  }
}

async function masuk(nilaiKunci) {
  kunci = nilaiKunci;
  try {
    await muat();
  } catch (err) {
    if (err.message !== '401') tampilkanPesan('bahaya', 'Tidak bisa menghubungi server.');
    return;
  }
  simpanSesi(kunci);
  tampilkanLogin(false);
  el('pesan').hidden = true;
  aturOtomatis();
}

el('form-kunci').addEventListener('submit', (e) => {
  e.preventDefault();
  const nilai = el('kunci').value.trim();
  if (nilai) masuk(nilai);
});

el('tombol-muat').addEventListener('click', () => muat().catch(() => {}));
el('otomatis').addEventListener('change', aturOtomatis);
el('tombol-keluar').addEventListener('click', () => keluar());

el('tombol-csv').addEventListener('click', async () => {
  try {
    const res = await api('/api/absen.csv');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch { /* pesan 401 sudah tampil */ }
});

el('tombol-hapus').addEventListener('click', async () => {
  if (!confirm('Hapus SEMUA data absen? Tindakan ini tidak bisa dibatalkan.')) return;
  try {
    const res = await api('/api/absen', { method: 'DELETE' });
    const json = await res.json();
    tampilkanPesan('aman', `${json.terhapus} data absen dihapus.`);
    await muat();
  } catch { /* pesan 401 sudah tampil */ }
});

el('tombol-lokasi-saya').addEventListener('click', () => {
  const tombol = el('tombol-lokasi-saya');
  if (!window.isSecureContext || !('geolocation' in navigator)) {
    tampilkanPesan('bahaya', 'GPS tidak tersedia di halaman ini.', 'Buka rekap lewat localhost atau HTTPS.');
    return;
  }
  tombol.disabled = true;
  tombol.textContent = 'Mencari lokasi...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      el('k-lat').value = pos.coords.latitude.toFixed(6);
      el('k-lon').value = pos.coords.longitude.toFixed(6);
      tampilkanPesan('aman', `Lokasimu terisi (akurasi ± ${Math.round(pos.coords.accuracy)} m).`,
        'Tekan "Simpan lokasi kantor" untuk menerapkan.');
      tombol.disabled = false;
      tombol.textContent = 'Pakai lokasi saya sekarang';
    },
    (err) => {
      tampilkanPesan('bahaya', 'Gagal mengambil lokasi.', err.message);
      tombol.disabled = false;
      tombol.textContent = 'Pakai lokasi saya sekarang';
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
});

el('form-kantor').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    nama_lokasi: el('k-nama').value,
    lat: Number(el('k-lat').value),
    lon: Number(el('k-lon').value),
    radius_m: Number(el('k-radius').value),
    batas_akurasi_m: Number(el('k-akurasi').value),
  };
  try {
    const res = await api('/api/pengaturan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      tampilkanPesan('bahaya', json.pesan, json.galat);
      return;
    }
    document.activeElement.blur();
    tampilkanPesan('aman', 'Lokasi kantor disimpan.', `${json.pengaturan.nama_lokasi}, radius ${json.pengaturan.radius_m} m.`);
    await muat();
  } catch { /* pesan 401 sudah tampil */ }
});

const kunciTersimpan = bacaSesi();
if (kunciTersimpan) masuk(kunciTersimpan);
