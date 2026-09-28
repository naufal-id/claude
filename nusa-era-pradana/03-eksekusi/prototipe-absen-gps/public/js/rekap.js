'use strict';

const el = (id) => document.getElementById(id);
const KUNCI_SESI = 'absen.kunci_admin';
const INTERVAL_MUAT_MS = 5000;

let kunci = '';
let pewaktuMuat = null;
let pewaktuHitungMundur = null;
let selisihJamServer = 0; // waktu server - waktu browser, untuk hitung mundur kode
let kodeTerlihat = null; // id permintaan logout yang sudah pernah tampil

// Keadaan peta
let peta = null;
let lapisanStatus = {};
let lapisanAkurasi = null;
let lapisanGeofence = null;
let penandaKantor = null;
let penandaPerId = new Map();
let tandaTanganData = '';
let sudahDipaskan = false;
let pengaturanServer = null;
let kantorDraf = null; // perubahan area yang belum disimpan
let modeKlikPeta = false;
let lapisanSudut = null;
let lapisanGambar = null;
let sedangGeserSudut = false;
let modeGambar = false;
let titikGambar = [];

// ---------- Utilitas ----------

function bacaSesi() {
  try { return sessionStorage.getItem(KUNCI_SESI) || ''; } catch { return ''; }
}
function simpanSesi(nilai) {
  try {
    if (nilai) sessionStorage.setItem(KUNCI_SESI, nilai);
    else sessionStorage.removeItem(KUNCI_SESI);
  } catch { /* mode privat */ }
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

function buatElemen(tag, { kelas, teks, judul } = {}) {
  const node = document.createElement(tag);
  if (kelas) node.className = kelas;
  if (teks !== undefined) node.textContent = teks;
  if (judul) node.title = judul;
  return node;
}

function sel(teks, kelas) {
  return buatElemen('td', { kelas, teks });
}

const LABEL_STATUS = { valid: 'Valid', di_luar_area: 'Di luar area', akurasi_rendah: 'Akurasi rendah' };

function lencanaStatus(status) {
  return buatElemen('span', { kelas: `lencana ${status}`, teks: LABEL_STATUS[status] || status });
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

// ---------- Login admin dan tab ----------

function tampilkanLogin(tampil) {
  el('panel-kunci').hidden = !tampil;
  el('panel-utama').hidden = tampil;
}

function keluar(alasan) {
  kunci = '';
  simpanSesi('');
  clearInterval(pewaktuMuat);
  clearInterval(pewaktuHitungMundur);
  pewaktuMuat = null;
  tampilkanLogin(true);
  if (alasan) tampilkanPesan('bahaya', alasan);
}

function bukaTab(nama) {
  if (!el(`isi-${nama}`)) nama = 'peta';
  for (const tombol of document.querySelectorAll('.tab [role="tab"]')) {
    const aktif = tombol.dataset.tab === nama;
    tombol.setAttribute('aria-selected', String(aktif));
    tombol.tabIndex = aktif ? 0 : -1;
    el(`isi-${tombol.dataset.tab}`).hidden = !aktif;
  }
  if (location.hash !== `#${nama}`) history.replaceState(null, '', `#${nama}`);
  if (nama === 'peta' && peta) setTimeout(() => peta.invalidateSize(), 0);
}

for (const tombol of document.querySelectorAll('.tab [role="tab"]')) {
  tombol.addEventListener('click', () => bukaTab(tombol.dataset.tab));
}

// ---------- Peta ----------

function siapkanPeta(p) {
  if (peta || typeof L === 'undefined') return;
  lapisanStatus = {
    valid: L.layerGroup(),
    di_luar_area: L.layerGroup(),
    akurasi_rendah: L.layerGroup(),
  };
  lapisanAkurasi = L.layerGroup();
  const overlay = {
    'Valid': lapisanStatus.valid,
    'Di luar area': lapisanStatus.di_luar_area,
    'Akurasi rendah': lapisanStatus.akurasi_rendah,
    'Lingkar akurasi GPS': lapisanAkurasi,
  };
  peta = PetaAbsen.buat('peta-rekap', { pusat: [p.lat, p.lon], zoom: 17, overlay });
  peta.doubleClickZoom.disable(); // klik dua kali dipakai untuk menghapus sudut
  lapisanAkurasi.addTo(peta);
  lapisanGeofence = L.layerGroup().addTo(peta);
  Object.values(lapisanStatus).forEach((g) => g.addTo(peta));
  lapisanSudut = L.layerGroup().addTo(peta);
  lapisanGambar = L.layerGroup().addTo(peta);

  // Menggeser kotak kantor memindahkan seluruh area, termasuk semua sudut poligon.
  let awalGeser = null;
  penandaKantor = L.marker([p.lat, p.lon], {
    icon: PetaAbsen.ikonKantor(), draggable: true, zIndexOffset: 2000, title: 'Kantor, geser untuk memindahkan area',
  }).addTo(peta);
  penandaKantor.on('dragstart', () => { awalGeser = { ...kantorAktif() }; });
  penandaKantor.on('drag', (e) => pindahkanArea(awalGeser, e.latlng.lat, e.latlng.lng, false));
  penandaKantor.on('dragend', () => { awalGeser = null; ubahDraf({}, { isiForm: true }); });

  peta.on('click', (e) => {
    if (modeGambar) return tambahTitikGambar(e.latlng);
    if (!modeKlikPeta) return;
    pindahkanArea(kantorAktif(), e.latlng.lat, e.latlng.lng, true);
    aturModeKlik(false);
  });
}

function kantorAktif() {
  return kantorDraf || pengaturanServer;
}

function pindahkanArea(asal, lat, lon, isiForm) {
  const perubahan = { lat, lon };
  if (Geofence.adalahPoligon(asal)) perubahan.titik = Geofence.geser(asal.titik, lat - asal.lat, lon - asal.lon);
  ubahDraf(perubahan, { isiForm });
}

function gambarKantor() {
  const p = kantorAktif();
  if (!peta || !p) return;
  PetaAbsen.gambarGeofence(peta, p, lapisanGeofence);
  penandaKantor.setLatLng([p.lat, p.lon]);
  penandaKantor.unbindTooltip().bindTooltip(`${p.nama_lokasi}, ${Geofence.ringkas(p)}`);
  if (!sedangGeserSudut) gambarSudut(p);
  perbaruiInfoArea(p);
}

// Penanda sudut (bernomor, bisa digeser) dan penanda "+" di tengah tiap sisi.
function gambarSudut(p) {
  lapisanSudut.clearLayers();
  if (!Geofence.adalahPoligon(p) || modeGambar) return;
  const n = p.titik.length;
  p.titik.forEach((t, i) => {
    const sudut = L.marker(t, {
      icon: PetaAbsen.ikonSudut(i + 1), draggable: true, zIndexOffset: 3000,
      title: `Sudut ${i + 1}: geser untuk mengubah, klik dua kali untuk menghapus`,
    }).addTo(lapisanSudut);
    sudut.on('dragstart', () => { sedangGeserSudut = true; });
    sudut.on('drag', (e) => {
      const titik = kantorAktif().titik.map((x) => x.slice());
      titik[i] = [e.latlng.lat, e.latlng.lng];
      ubahDraf({ titik });
    });
    sudut.on('dragend', () => { sedangGeserSudut = false; gambarKantor(); });
    const hapus = (e) => { L.DomEvent.stop(e); hapusSudut(i); };
    sudut.on('dblclick', hapus);
    sudut.on('contextmenu', hapus); // klik kanan, atau tekan lama di HP
  });
  p.titik.forEach((t, i) => {
    const b = p.titik[(i + 1) % n];
    const tengah = [(t[0] + b[0]) / 2, (t[1] + b[1]) / 2];
    L.marker(tengah, { icon: PetaAbsen.ikonTengah(), zIndexOffset: 2500, title: 'Klik untuk menambah sudut di sini' })
      .on('click', (e) => { L.DomEvent.stop(e); tambahSudut(i + 1, tengah); })
      .addTo(lapisanSudut);
  });
}

function tambahSudut(posisi, titikBaru) {
  const titik = kantorAktif().titik.map((x) => x.slice());
  if (titik.length >= 30) return tampilkanPesan('waspada', 'Maksimal 30 sudut.');
  titik.splice(posisi, 0, titikBaru);
  ubahDraf({ titik });
}

function hapusSudut(i) {
  const titik = kantorAktif().titik.map((x) => x.slice());
  if (titik.length <= 3) return tampilkanPesan('waspada', 'Area minimal punya 3 sudut.');
  titik.splice(i, 1);
  ubahDraf({ titik });
}

function perbaruiInfoArea(p) {
  const info = el('info-area');
  if (Geofence.adalahPoligon(p)) {
    const u = Geofence.ukuran(p.titik);
    info.textContent = `${p.titik.length} sudut · luas ${Geofence.formatLuas(u.luas_m2)} · keliling ${formatMeter(u.keliling_m)}`;
    info.classList.toggle('peringatan', Geofence.bersilang(p.titik));
    if (Geofence.bersilang(p.titik)) info.textContent += ' · SISI BERSILANG, perbaiki sebelum disimpan';
  } else {
    info.textContent = `Luas ${Geofence.formatLuas(Math.PI * p.radius_m ** 2)}`;
    info.classList.remove('peringatan');
  }
}

function isiPopup(a) {
  const wadah = buatElemen('div', { kelas: 'popup-absen' });
  wadah.append(buatElemen('strong', { teks: `#${a.id} ${a.id_karyawan} · ${a.nama}` }));
  const baris = [
    `Absen ${a.jenis}, ${formatWaktu(a.waktu_server)} WIB`,
    `Posisi: ${teksPosisi(a)}`,
    `Jarak ke titik kantor: ${formatMeter(a.jarak_m)}`,
    `Akurasi GPS: ± ${formatMeter(a.akurasi_m)}`,
    ringkasPerangkat(a.perangkat || ''),
  ];
  const status = buatElemen('div');
  status.append(lencanaStatus(a.status));
  wadah.append(status);
  for (const b of baris) wadah.append(buatElemen('div', { teks: b }));
  const tautan = buatElemen('a', { teks: 'Buka di Google Maps' });
  tautan.href = `https://www.google.com/maps?q=${a.lat},${a.lon}`;
  tautan.target = '_blank';
  tautan.rel = 'noopener';
  wadah.append(tautan);
  return wadah;
}

// Absen dari versi lama belum punya jarak_luar_m.
function teksPosisi(a) {
  if (a.jarak_luar_m === null || a.jarak_luar_m === undefined) return '-';
  return a.jarak_luar_m > 0 ? `${formatMeter(a.jarak_luar_m)} di luar` : 'di dalam area';
}

function gambarTitik(data) {
  if (!peta) return;
  Object.values(lapisanStatus).forEach((g) => g.clearLayers());
  lapisanAkurasi.clearLayers();
  penandaPerId = new Map();
  const warna = {
    valid: PetaAbsen.warna('--utama'),
    di_luar_area: PetaAbsen.warna('--terakota'),
    akurasi_rendah: PetaAbsen.warna('--oker'),
  };
  // Titik terlama digambar dulu supaya yang terbaru ada di atas.
  for (const a of [...data].reverse()) {
    const c = warna[a.status] || '#888888';
    const titik = [a.lat, a.lon];
    L.circle(titik, {
      radius: a.akurasi_m, color: c, weight: 1, opacity: 0.6, fillColor: c, fillOpacity: 0.08, interactive: false,
    }).addTo(lapisanAkurasi);
    const penanda = L.circleMarker(titik, {
      radius: 8, color: '#FFFFFF', weight: 2, fillColor: c, fillOpacity: 1,
    }).bindPopup(() => isiPopup(a)).bindTooltip(`${a.id_karyawan} · ${a.jenis}`);
    penanda.addTo(lapisanStatus[a.status] || lapisanStatus.valid);
    penandaPerId.set(a.id, penanda);
  }
}

function batasArea() {
  // Salin: getBounds() poligon mengembalikan objek internal Leaflet yang tidak boleh diubah.
  const b = lapisanGeofence.getLayers()[0].getBounds();
  return L.latLngBounds(b.getSouthWest(), b.getNorthEast());
}

function paskanSemua() {
  if (!peta) return;
  const batas = batasArea();
  for (const p of penandaPerId.values()) batas.extend(p.getLatLng());
  peta.fitBounds(batas, { padding: [30, 30], maxZoom: 19 });
}

function fokusKeAbsen(id) {
  const penanda = penandaPerId.get(id);
  if (!penanda) return;
  bukaTab('peta');
  el('peta-rekap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  peta.flyTo(penanda.getLatLng(), 19, { duration: 0.6 });
  peta.once('moveend', () => penanda.openPopup());
}

// ---------- Edit area absen ----------

const PETUNJUK_AREA = {
  poligon: 'Geser sudut bernomor atau kotak kantor di peta. Semua perubahan baru berlaku setelah "Simpan area".',
  lingkaran: 'Geser kotak kantor di peta dan atur radiusnya. Perubahan baru berlaku setelah "Simpan area".',
};

function tampilkanAlatBentuk(bentuk) {
  el('alat-poligon').hidden = bentuk !== 'poligon';
  el('baris-radius').hidden = bentuk === 'poligon';
  for (const r of document.querySelectorAll('input[name="bentuk"]')) r.checked = r.value === bentuk;
}

function isiFormKantor(p) {
  el('k-nama').value = p.nama_lokasi;
  el('k-lat').value = Number(p.lat).toFixed(6);
  el('k-lon').value = Number(p.lon).toFixed(6);
  el('k-radius').value = p.radius_m;
  el('k-akurasi').value = p.batas_akurasi_m;
  tampilkanAlatBentuk(p.bentuk);
  if (!kantorDraf && !modeGambar) el('status-kantor').textContent = PETUNJUK_AREA[p.bentuk] || '';
}

function ubahDraf(perubahan, { isiForm = false } = {}) {
  kantorDraf = { ...kantorAktif(), ...perubahan };
  if (isiForm) isiFormKantor(kantorDraf);
  el('tombol-batal-kantor').hidden = false;
  el('status-kantor').textContent = 'Ada perubahan yang BELUM disimpan. Tekan "Simpan area" untuk menerapkan.';
  gambarKantor();
}

function batalkanDraf() {
  kantorDraf = null;
  if (modeGambar) bersihkanGambar();
  el('tombol-batal-kantor').hidden = true;
  if (pengaturanServer) isiFormKantor(pengaturanServer);
  gambarKantor();
}

function aturModeKlik(aktif) {
  if (aktif && modeGambar) hentikanGambar();
  modeKlikPeta = aktif;
  el('tombol-klik-peta').setAttribute('aria-pressed', String(aktif));
  el('tombol-klik-peta').textContent = aktif ? 'Klik lokasi di peta...' : 'Pindahkan ke titik di peta';
  el('peta-rekap').classList.toggle('mode-pilih', aktif);
}

// Setengah sisi persegi baru: ikut ukuran area sekarang supaya tidak tiba tiba mengecil atau membesar.
function setengahSisiDariArea(p) {
  if (Geofence.adalahPoligon(p)) return Math.max(10, Math.round(Math.sqrt(Geofence.ukuran(p.titik).luas_m2) / 2));
  return p.radius_m;
}

function pilihBentuk(bentuk) {
  const p = kantorAktif();
  if (bentuk === p.bentuk) return;
  if (bentuk === 'poligon') {
    const titik = p.titik && p.titik.length >= 3 ? p.titik : Geofence.persegi(p.lat, p.lon, p.radius_m);
    ubahDraf({ bentuk, titik }, { isiForm: true });
  } else {
    ubahDraf({ bentuk, radius_m: setengahSisiDariArea(p) }, { isiForm: true });
  }
}

// Mode gambar: klik sudut satu per satu di peta, lalu "Selesai".
function mulaiGambar() {
  aturModeKlik(false);
  modeGambar = true;
  titikGambar = [];
  lapisanSudut.clearLayers();
  el('tombol-gambar-area').setAttribute('aria-pressed', 'true');
  el('tombol-gambar-area').textContent = 'Batal menggambar';
  el('tombol-selesai-gambar').hidden = false;
  el('peta-rekap').classList.add('mode-pilih');
  perbaruiGambar();
  el('peta-rekap').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function bersihkanGambar() {
  modeGambar = false;
  titikGambar = [];
  lapisanGambar.clearLayers();
  el('tombol-gambar-area').setAttribute('aria-pressed', 'false');
  el('tombol-gambar-area').textContent = 'Gambar area baru';
  el('tombol-selesai-gambar').hidden = true;
  el('peta-rekap').classList.remove('mode-pilih');
}

function hentikanGambar() {
  if (!modeGambar) return;
  bersihkanGambar();
  if (kantorDraf) ubahDraf({});
  else batalkanDraf();
}

function tambahTitikGambar(latlng) {
  if (titikGambar.length >= 30) return;
  titikGambar.push([latlng.lat, latlng.lng]);
  perbaruiGambar();
}

function perbaruiGambar() {
  lapisanGambar.clearLayers();
  const oker = PetaAbsen.warna('--oker');
  if (titikGambar.length >= 2) {
    L.polyline([...titikGambar, titikGambar[0]], { color: oker, weight: 3, dashArray: '4 6', interactive: false })
      .addTo(lapisanGambar);
  }
  titikGambar.forEach((t, i) => L.marker(t, { icon: PetaAbsen.ikonSudut(i + 1), interactive: false }).addTo(lapisanGambar));
  const n = titikGambar.length;
  el('tombol-selesai-gambar').disabled = n < 3;
  el('tombol-selesai-gambar').textContent = `Selesai (${n} sudut)`;
  el('status-kantor').textContent = n < 3
    ? `Klik sudut area satu per satu di peta, berurutan mengelilingi area. Sudah ${n}, minimal 3.`
    : `${n} sudut. Tambah lagi, atau tekan "Selesai".`;
}

function selesaiGambar() {
  if (titikGambar.length < 3) return;
  const titik = titikGambar.map(([a, b]) => [Number(a.toFixed(7)), Number(b.toFixed(7))]);
  const p = kantorAktif();
  const perubahan = { bentuk: 'poligon', titik };
  // Kalau titik kantor tertinggal di luar area baru, pindahkan ke tengah area.
  if (!Geofence.dalamPoligon(p.lat, p.lon, titik)) {
    perubahan.lat = titik.reduce((s, t) => s + t[0], 0) / titik.length;
    perubahan.lon = titik.reduce((s, t) => s + t[1], 0) / titik.length;
  }
  bersihkanGambar();
  ubahDraf(perubahan, { isiForm: true });
}

for (const r of document.querySelectorAll('input[name="bentuk"]')) {
  r.addEventListener('change', () => pilihBentuk(r.value));
}
el('k-lat').addEventListener('input', () => {
  const lat = Number(el('k-lat').value);
  if (el('k-lat').value !== '' && Number.isFinite(lat)) pindahkanArea(kantorAktif(), lat, kantorAktif().lon, false);
});
el('k-lon').addEventListener('input', () => {
  const lon = Number(el('k-lon').value);
  if (el('k-lon').value !== '' && Number.isFinite(lon)) pindahkanArea(kantorAktif(), kantorAktif().lat, lon, false);
});
for (const [id, kolom] of [['k-radius', 'radius_m'], ['k-akurasi', 'batas_akurasi_m']]) {
  el(id).addEventListener('input', () => {
    const nilai = Number(el(id).value);
    if (el(id).value !== '' && Number.isFinite(nilai)) ubahDraf({ [kolom]: nilai });
  });
}
el('k-nama').addEventListener('input', () => ubahDraf({ nama_lokasi: el('k-nama').value }));
el('tombol-gambar-area').addEventListener('click', () => (modeGambar ? hentikanGambar() : mulaiGambar()));
el('tombol-selesai-gambar').addEventListener('click', selesaiGambar);
el('tombol-reset-persegi').addEventListener('click', () => {
  const p = kantorAktif();
  ubahDraf({ bentuk: 'poligon', titik: Geofence.persegi(p.lat, p.lon, setengahSisiDariArea(p)) }, { isiForm: true });
});
el('tombol-klik-peta').addEventListener('click', () => {
  aturModeKlik(!modeKlikPeta);
  if (modeKlikPeta) el('peta-rekap').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
el('tombol-batal-kantor').addEventListener('click', batalkanDraf);
el('tombol-semua-titik').addEventListener('click', paskanSemua);
el('tombol-ke-kantor').addEventListener('click', () => {
  if (peta && kantorAktif()) peta.flyToBounds(batasArea(), { padding: [40, 40], maxZoom: 19, duration: 0.6 });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modeGambar) hentikanGambar();
  if (modeKlikPeta) aturModeKlik(false);
});

el('tombol-lokasi-saya').addEventListener('click', () => {
  const tombol = el('tombol-lokasi-saya');
  const teksAsli = tombol.textContent;
  if (!window.isSecureContext || !('geolocation' in navigator)) {
    tampilkanPesan('bahaya', 'GPS tidak tersedia di halaman ini.', 'Buka rekap lewat localhost atau HTTPS.');
    return;
  }
  tombol.disabled = true;
  tombol.textContent = 'Mencari lokasi...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      pindahkanArea(kantorAktif(), pos.coords.latitude, pos.coords.longitude, true);
      if (peta) peta.flyTo([pos.coords.latitude, pos.coords.longitude], 18, { duration: 0.6 });
      tampilkanPesan('aman', `Area dipindah ke lokasimu (akurasi ± ${Math.round(pos.coords.accuracy)} m).`,
        'Tekan "Simpan area" untuk menerapkan.');
      tombol.disabled = false;
      tombol.textContent = teksAsli;
    },
    (err) => {
      tampilkanPesan('bahaya', 'Gagal mengambil lokasi.', err.message);
      tombol.disabled = false;
      tombol.textContent = teksAsli;
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
});

el('form-kantor').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = kantorAktif();
  if (Geofence.adalahPoligon(p) && Geofence.bersilang(p.titik)) {
    tampilkanPesan('bahaya', 'Sisi area saling bersilang.', 'Geser sudutnya supaya bentuknya tidak seperti pita, lalu simpan lagi.');
    return;
  }
  const body = {
    nama_lokasi: el('k-nama').value,
    lat: Number(el('k-lat').value),
    lon: Number(el('k-lon').value),
    radius_m: Number(el('k-radius').value),
    batas_akurasi_m: Number(el('k-akurasi').value),
    bentuk: p.bentuk,
    titik: p.bentuk === 'poligon' ? p.titik : [],
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
    pengaturanServer = json.pengaturan;
    batalkanDraf();
    tampilkanPesan('aman', 'Area absen disimpan.',
      `${json.pengaturan.nama_lokasi}, ${Geofence.ringkas(json.pengaturan)}. Berlaku untuk absen berikutnya.`);
  } catch { /* pesan 401 sudah tampil */ }
});

// ---------- Tab Peta & Data ----------

function isiTabel(data, total) {
  const tbody = el('isi-tabel');
  tbody.replaceChildren();
  for (const a of data) {
    const tr = document.createElement('tr');
    tr.className = 'bisa-diklik';
    tr.tabIndex = 0;
    tr.title = 'Klik untuk melihat di peta';
    tr.addEventListener('click', (e) => { if (e.target.tagName !== 'A') fokusKeAbsen(a.id); });
    tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') fokusKeAbsen(a.id); });
    tr.append(sel(String(a.id), 'angka'));
    tr.append(sel(formatWaktu(a.waktu_server), 'angka'));
    tr.append(sel(a.id_karyawan, 'tanpa-putus'));
    tr.append(sel(a.nama));
    tr.append(sel(a.jenis));
    const tdStatus = sel();
    tdStatus.append(lencanaStatus(a.status));
    tr.append(tdStatus);
    tr.append(sel(teksPosisi(a), 'tanpa-putus'));
    tr.append(sel(formatMeter(a.jarak_m), 'angka'));
    tr.append(sel(`± ${formatMeter(a.akurasi_m)}`, 'angka'));
    const tdKoordinat = sel(undefined, 'angka');
    const link = buatElemen('a', { teks: `${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}` });
    link.href = `https://www.google.com/maps?q=${a.lat},${a.lon}`;
    link.target = '_blank';
    link.rel = 'noopener';
    tdKoordinat.append(link);
    tr.append(tdKoordinat);
    tr.append(sel(a.ip || '-', 'angka'));
    const tdPerangkat = sel(ringkasPerangkat(a.perangkat || ''), 'perangkat');
    tdPerangkat.title = a.perangkat || '';
    tr.append(tdPerangkat);
    tbody.append(tr);
  }
  el('tabel-kosong').hidden = data.length > 0;
  el('keterangan-tabel').textContent = total > data.length ? `(${data.length} terbaru dari ${total})` : `(${total})`;
}

function renderAbsen(json) {
  pengaturanServer = json.pengaturan;
  siapkanPeta(json.pengaturan);
  const hitung = (s) => json.data.filter((a) => a.status === s).length;
  el('r-total').textContent = json.total;
  el('r-valid').textContent = hitung('valid');
  el('r-luar').textContent = hitung('di_luar_area');
  el('r-akurasi').textContent = hitung('akurasi_rendah');

  // Gambar ulang hanya kalau data berubah, supaya zoom dan popup admin tidak terganggu.
  const tanda = `${json.total}:${json.data.length ? json.data[0].id : 0}:${JSON.stringify(json.pengaturan)}`;
  if (tanda === tandaTanganData) return;
  tandaTanganData = tanda;
  isiTabel(json.data, json.total);
  gambarTitik(json.data);
  if (!kantorDraf) {
    const fokus = el('form-kantor').contains(document.activeElement);
    if (!fokus) isiFormKantor(json.pengaturan);
    gambarKantor();
  }
  if (!sudahDipaskan && peta) {
    sudahDipaskan = true;
    setTimeout(() => { peta.invalidateSize(); paskanSemua(); }, 0);
  }
}

el('tombol-csv').addEventListener('click', async () => {
  try {
    const res = await api('/api/absen.csv');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = buatElemen('a');
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
    await muatSemua();
  } catch { /* pesan 401 sudah tampil */ }
});

// ---------- Tab Kode Logout ----------

function sisaWaktu(kedaluwarsa) {
  const ms = new Date(kedaluwarsa).getTime() - (Date.now() + selisihJamServer);
  if (ms <= 0) return 'kedaluwarsa';
  const menit = Math.floor(ms / 60000);
  const detik = Math.floor((ms % 60000) / 1000);
  return `berlaku ${menit}:${String(detik).padStart(2, '0')} lagi`;
}

function perbaruiHitungMundur() {
  for (const node of document.querySelectorAll('[data-kedaluwarsa]')) {
    node.textContent = sisaWaktu(node.dataset.kedaluwarsa);
  }
}

const LABEL_HASIL_LOGOUT = {
  dipakai: 'Berhasil logout',
  kedaluwarsa: 'Kedaluwarsa',
  diblokir: 'Diblokir (5x salah)',
  diganti: 'Diganti kode baru',
  dipaksa_admin: 'Dipaksa admin',
};

function renderLogout(json) {
  selisihJamServer = new Date(json.waktu_server).getTime() - Date.now();
  const wadah = el('daftar-kode');
  wadah.replaceChildren();
  for (const p of json.menunggu) {
    const kartu = buatElemen('article', { kelas: 'kartu-kode' });
    kartu.append(buatElemen('div', { kelas: 'kode-besar', teks: `${p.kode.slice(0, 3)} ${p.kode.slice(3)}` }));
    kartu.append(buatElemen('div', { kelas: 'nama-login', teks: `${p.id_karyawan} · ${p.nama}` }));
    kartu.append(buatElemen('div', { kelas: 'catatan', teks: `Diminta ${formatWaktu(p.dibuat)} WIB` }));
    const mundur = buatElemen('div', { kelas: 'catatan tebal' });
    mundur.dataset.kedaluwarsa = p.kedaluwarsa;
    kartu.append(mundur);
    if (p.percobaan > 0) {
      kartu.append(buatElemen('div', { kelas: 'catatan peringatan', teks: `Kode salah diketik ${p.percobaan} dari 5 kali` }));
    }
    wadah.append(kartu);
  }
  perbaruiHitungMundur();
  el('kode-kosong').hidden = json.menunggu.length > 0;

  const lencana = el('lencana-logout');
  lencana.textContent = json.menunggu.length;
  lencana.hidden = json.menunggu.length === 0;
  document.title = json.menunggu.length ? `(${json.menunggu.length}) Rekap Absen` : 'Rekap Absen';

  // Beri tahu admin kalau ada permintaan baru saat sedang membuka tab lain.
  // Pemuatan pertama tidak dianggap baru.
  if (kodeTerlihat) {
    const baru = json.menunggu.filter((p) => !kodeTerlihat.has(p.id));
    if (baru.length && el('isi-logout').hidden) {
      tampilkanPesan('waspada', `Permintaan logout dari ${baru[0].id_karyawan} · ${baru[0].nama}`,
        'Buka tab Kode Logout untuk melihat kodenya.');
    }
  }
  kodeTerlihat = new Set(json.menunggu.map((p) => p.id));

  const tbody = el('isi-riwayat-logout');
  tbody.replaceChildren();
  for (const p of json.riwayat) {
    const tr = document.createElement('tr');
    tr.append(sel(formatWaktu(p.dibuat), 'angka'));
    tr.append(sel(p.id_karyawan, 'tanpa-putus'));
    tr.append(sel(p.nama));
    tr.append(sel(p.kode, 'angka'));
    tr.append(sel(String(p.percobaan), 'angka'));
    tr.append(sel(LABEL_HASIL_LOGOUT[p.status] || p.status));
    tbody.append(tr);
  }
}

// ---------- Tab Perangkat Login ----------

function renderSesi(json) {
  const perId = {};
  for (const s of json.data) perId[s.id_karyawan] = (perId[s.id_karyawan] || 0) + 1;
  el('lencana-sesi').textContent = json.data.length;
  const tbody = el('isi-sesi-tabel');
  tbody.replaceChildren();
  for (const s of json.data) {
    const tr = document.createElement('tr');
    const tdId = sel(s.id_karyawan, 'tanpa-putus');
    if (perId[s.id_karyawan] > 1) {
      tdId.append(' ', buatElemen('span', { kelas: 'lencana akurasi_rendah', teks: `${perId[s.id_karyawan]} perangkat` }));
    }
    tr.append(tdId);
    tr.append(sel(s.nama));
    tr.append(sel(formatWaktu(s.dibuat), 'angka'));
    const tdPerangkat = sel(ringkasPerangkat(s.perangkat || ''), 'perangkat');
    tdPerangkat.title = s.perangkat || '';
    tr.append(tdPerangkat);
    tr.append(sel(s.ip || '-', 'angka'));
    const tdAksi = sel();
    const tombol = buatElemen('button', { kelas: 'bahaya kecil', teks: 'Paksa logout' });
    tombol.type = 'button';
    tombol.addEventListener('click', async () => {
      if (!confirm(`Paksa logout ${s.id_karyawan} · ${s.nama} dari perangkat ini?`)) return;
      try {
        await api(`/api/admin/sesi?token=${encodeURIComponent(s.token)}`, { method: 'DELETE' });
        tampilkanPesan('aman', `${s.id_karyawan} dipaksa logout.`);
        await muatSemua();
      } catch { /* pesan 401 sudah tampil */ }
    });
    tdAksi.append(tombol);
    tr.append(tdAksi);
    tbody.append(tr);
  }
  el('sesi-kosong').hidden = json.data.length > 0;
}

// ---------- Tab WhatsApp ----------

const STATUS_WA = {
  nonaktif: ['Nonaktif', 'di_luar_area'],
  modul_belum_dipasang: ['Paket belum dipasang', 'di_luar_area'],
  memulai: ['Memulai...', 'akurasi_rendah'],
  menunggu_qr: ['Menunggu pindai QR', 'akurasi_rendah'],
  terautentikasi: ['Memuat...', 'akurasi_rendah'],
  siap: ['Terhubung', 'valid'],
  gagal: ['Gagal', 'di_luar_area'],
  terputus: ['Terputus', 'di_luar_area'],
};

const MODE_NOTIF = {
  semua: 'Setiap absen',
  bermasalah: 'Hanya di luar area / akurasi rendah',
  mati: 'Mati (hanya kode logout)',
};

function renderWa(json) {
  const w = json.wa;
  const [label, kelas] = STATUS_WA[w.status] || [w.status, 'akurasi_rendah'];
  el('wa-status').textContent = label;
  el('wa-status').className = `lencana ${kelas}`;
  el('titik-wa').className = `titik-status ${kelas}`;
  el('wa-pesan').textContent = w.pesan || '';
  const qr = el('wa-qr');
  if (w.qr_gambar) {
    if (qr.src !== w.qr_gambar) qr.src = w.qr_gambar;
    qr.hidden = false;
  } else {
    qr.hidden = true;
  }
  el('wa-nomor').textContent = w.nomor_terhubung || '-';
  el('wa-tujuan').textContent = w.tujuan.length ? w.tujuan.join(', ') : 'WA_NOMOR_ADMIN belum diisi';
  el('wa-mode').textContent = MODE_NOTIF[json.mode_notif_absen] || json.mode_notif_absen;
  el('tombol-tes-wa').disabled = w.status !== 'siap';

  const daftar = el('wa-riwayat');
  daftar.replaceChildren();
  for (const r of w.riwayat) {
    const li = buatElemen('li');
    li.append(buatElemen('span', { kelas: `lencana ${r.jenis === 'terkirim' ? 'valid' : r.jenis === 'gagal' ? 'di_luar_area' : 'akurasi_rendah'}`, teks: r.jenis }));
    li.append(buatElemen('span', { kelas: 'catatan', teks: ` ${formatWaktu(r.waktu)} ` }));
    li.append(buatElemen('div', { kelas: 'teks-pesan', teks: r.teks }));
    daftar.append(li);
  }
  el('wa-riwayat-kosong').hidden = w.riwayat.length > 0;
}

el('tombol-tes-wa').addEventListener('click', async () => {
  try {
    const res = await api('/api/admin/wa/tes', { method: 'POST' });
    const json = await res.json();
    if (json.terkirim) tampilkanPesan('aman', `Pesan tes terkirim ke ${json.terkirim} tujuan.`);
    else tampilkanPesan('waspada', 'Pesan tes tidak terkirim.', `Alasan: ${json.alasan || 'lihat riwayat pesan'}`);
    await muatSemua();
  } catch { /* pesan 401 sudah tampil */ }
});

// ---------- Muat data ----------

async function muatSemua() {
  const [absen, logout, sesi, wa] = await Promise.all([
    api('/api/absen?batas=500').then((r) => r.json()),
    api('/api/admin/logout').then((r) => r.json()),
    api('/api/admin/sesi').then((r) => r.json()),
    api('/api/admin/wa').then((r) => r.json()),
  ]);
  renderAbsen(absen);
  renderLogout(logout);
  renderSesi(sesi);
  renderWa(wa);
}

async function masuk(nilaiKunci) {
  kunci = nilaiKunci;
  tampilkanLogin(false);
  bukaTab(location.hash.slice(1) || 'peta');
  try {
    await muatSemua();
  } catch (err) {
    if (err.message !== '401') {
      console.error(err);
      tampilkanPesan('bahaya', 'Tidak bisa menghubungi server.');
    }
    return;
  }
  simpanSesi(kunci);
  el('pesan').hidden = true;
  clearInterval(pewaktuMuat);
  pewaktuMuat = setInterval(() => muatSemua().catch(() => {}), INTERVAL_MUAT_MS);
  clearInterval(pewaktuHitungMundur);
  pewaktuHitungMundur = setInterval(perbaruiHitungMundur, 1000);
}

el('form-kunci').addEventListener('submit', (e) => {
  e.preventDefault();
  const nilai = el('kunci').value.trim();
  if (nilai) masuk(nilai);
});

el('tombol-muat').addEventListener('click', () => muatSemua().catch(() => {}));
el('tombol-keluar').addEventListener('click', () => keluar());

const kunciTersimpan = bacaSesi();
if (kunciTersimpan) masuk(kunciTersimpan);
