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
let kantorDraf = null; // perubahan geofence yang belum disimpan
let modeKlikPeta = false;

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
  lapisanAkurasi.addTo(peta);
  Object.values(lapisanStatus).forEach((g) => g.addTo(peta));
  lapisanGeofence = L.layerGroup().addTo(peta);

  penandaKantor = L.marker([p.lat, p.lon], {
    icon: PetaAbsen.ikonKantor(), draggable: true, zIndexOffset: 2000, title: 'Kantor, geser untuk memindahkan',
  }).addTo(peta);
  penandaKantor.on('drag', (e) => ubahDraf({ lat: e.latlng.lat, lon: e.latlng.lng }, false));
  penandaKantor.on('dragend', () => ubahDraf({}, true));

  peta.on('click', (e) => {
    if (!modeKlikPeta) return;
    ubahDraf({ lat: e.latlng.lat, lon: e.latlng.lng }, true);
    aturModeKlik(false);
  });
}

function kantorAktif() {
  return kantorDraf || pengaturanServer;
}

function gambarKantor() {
  const p = kantorAktif();
  if (!peta || !p) return;
  PetaAbsen.gambarGeofence(peta, p, lapisanGeofence);
  penandaKantor.setLatLng([p.lat, p.lon]);
  penandaKantor.unbindTooltip().bindTooltip(`${p.nama_lokasi}, radius ${p.radius_m} m`);
}

function isiPopup(a) {
  const wadah = buatElemen('div', { kelas: 'popup-absen' });
  wadah.append(buatElemen('strong', { teks: `#${a.id} ${a.id_karyawan} · ${a.nama}` }));
  const baris = [
    `Absen ${a.jenis}, ${formatWaktu(a.waktu_server)} WIB`,
    `Jarak ke kantor: ${formatMeter(a.jarak_m)}`,
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

function paskanSemua() {
  if (!peta) return;
  const batas = lapisanGeofence.getLayers()[0].getBounds();
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

// ---------- Edit geofence ----------

function isiFormKantor(p) {
  el('k-nama').value = p.nama_lokasi;
  el('k-lat').value = Number(p.lat).toFixed(6);
  el('k-lon').value = Number(p.lon).toFixed(6);
  el('k-radius').value = p.radius_m;
  el('k-akurasi').value = p.batas_akurasi_m;
}

function ubahDraf(perubahan, isiForm) {
  kantorDraf = { ...kantorAktif(), ...perubahan };
  if (isiForm) isiFormKantor(kantorDraf);
  el('tombol-batal-kantor').hidden = false;
  el('status-kantor').textContent = 'Ada perubahan yang BELUM disimpan. Tekan "Simpan lokasi kantor" untuk menerapkan.';
  gambarKantor();
}

function batalkanDraf() {
  kantorDraf = null;
  el('tombol-batal-kantor').hidden = true;
  el('status-kantor').textContent = 'Geser penanda kantor di peta, atau tekan "Pilih titik di peta" lalu klik lokasinya.';
  if (pengaturanServer) isiFormKantor(pengaturanServer);
  gambarKantor();
}

function aturModeKlik(aktif) {
  modeKlikPeta = aktif;
  el('tombol-klik-peta').setAttribute('aria-pressed', String(aktif));
  el('tombol-klik-peta').textContent = aktif ? 'Klik lokasi di peta...' : 'Pilih titik di peta';
  el('peta-rekap').classList.toggle('mode-pilih', aktif);
}

for (const [id, kolom] of [['k-lat', 'lat'], ['k-lon', 'lon'], ['k-radius', 'radius_m'], ['k-akurasi', 'batas_akurasi_m']]) {
  el(id).addEventListener('input', () => {
    const nilai = Number(el(id).value);
    if (el(id).value !== '' && Number.isFinite(nilai)) ubahDraf({ [kolom]: nilai }, false);
  });
}
el('k-nama').addEventListener('input', () => ubahDraf({ nama_lokasi: el('k-nama').value }, false));
el('tombol-klik-peta').addEventListener('click', () => {
  aturModeKlik(!modeKlikPeta);
  if (modeKlikPeta) el('peta-rekap').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
el('tombol-batal-kantor').addEventListener('click', batalkanDraf);
el('tombol-semua-titik').addEventListener('click', paskanSemua);
el('tombol-ke-kantor').addEventListener('click', () => {
  const p = kantorAktif();
  if (peta && p) peta.flyTo([p.lat, p.lon], 18, { duration: 0.6 });
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
      ubahDraf({ lat: pos.coords.latitude, lon: pos.coords.longitude }, true);
      if (peta) peta.flyTo([pos.coords.latitude, pos.coords.longitude], 18, { duration: 0.6 });
      tampilkanPesan('aman', `Lokasimu terisi (akurasi ± ${Math.round(pos.coords.accuracy)} m).`,
        'Tekan "Simpan lokasi kantor" untuk menerapkan.');
      tombol.disabled = false;
      tombol.textContent = 'Pakai lokasi saya';
    },
    (err) => {
      tampilkanPesan('bahaya', 'Gagal mengambil lokasi.', err.message);
      tombol.disabled = false;
      tombol.textContent = 'Pakai lokasi saya';
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
    pengaturanServer = json.pengaturan;
    batalkanDraf();
    tampilkanPesan('aman', 'Lokasi kantor disimpan.',
      `${json.pengaturan.nama_lokasi}, radius ${json.pengaturan.radius_m} m. Berlaku untuk absen berikutnya.`);
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
