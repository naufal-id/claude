'use strict';

// Berapa lama maksimal menunggu GPS "mengunci". Selama itu, bacaan terbaik
// (akurasi paling kecil) disimpan. Berhenti lebih cepat kalau akurasi sudah
// memenuhi batas dari server.
const LAMA_TUNGGU_MS = 20000;
const KUNCI_TOKEN = 'absen.token_sesi';

const el = (id) => document.getElementById(id);
const formAbsen = el('form-absen');
const tombolLokasi = el('tombol-lokasi');
const tombolKirim = el('tombol-kirim');
const statusLokasi = el('status-lokasi');
const meterIsi = el('meter-isi');
const hasil = el('hasil');

let token = '';
let pengaturan = null; // lokasi kantor dari server
let posisiTerbaik = null;
let idPantau = null;
let pewaktu = null;
let gpsDiizinkan = true;

// Peta
let peta = null;
let lapisanGeofence = null;
let penandaKantor = null;
let penandaSaya = null;
let lingkarAkurasi = null;

function simpanLokal(kunci, nilai) {
  try {
    if (nilai) localStorage.setItem(kunci, nilai);
    else localStorage.removeItem(kunci);
  } catch { /* mode privat */ }
}
function bacaLokal(kunci) {
  try { return localStorage.getItem(kunci) || ''; } catch { return ''; }
}

function formatMeter(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} km`;
}

function formatWaktu(iso, gaya = 'medium') {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta', dateStyle: gaya === 'jam' ? undefined : 'medium', timeStyle: gaya === 'jam' ? 'short' : 'medium',
  }) + ' WIB';
}

function tampilkanPita(node, jenis, judul, isi) {
  node.className = `pita ${jenis}`;
  node.replaceChildren();
  const s = document.createElement('strong');
  s.textContent = judul;
  node.append(s);
  for (const baris of [].concat(isi || [])) {
    const p = document.createElement('div');
    p.textContent = baris;
    node.append(p);
  }
  node.hidden = false;
}

async function panggil(jalur, { method = 'GET', body } = {}) {
  const res = await fetch(jalur, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'X-Token-Sesi': token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

// ---------- 1. Konteks aman ----------

function periksaKonteks() {
  const pita = el('pita-konteks');
  if (!('geolocation' in navigator)) {
    tampilkanPita(pita, 'bahaya', 'Browser ini tidak mendukung Geolocation API.');
    gpsDiizinkan = false;
    return;
  }
  if (!window.isSecureContext) {
    tampilkanPita(pita, 'bahaya', 'GPS diblokir: halaman dibuka lewat HTTP biasa.', [
      `Alamat sekarang: ${location.origin}. Browser hanya mengizinkan lokasi di https:// atau http://localhost.`,
      'Solusi: pakai tunnel HTTPS (cloudflared atau Ports di VS Code), port forwarding USB, atau hosting. Lihat README bagian 4.',
    ]);
    gpsDiizinkan = false;
    return;
  }
  const penjelasan = location.protocol === 'https:'
    ? 'Koneksi HTTPS. Browser boleh meminta izin lokasi.'
    : 'Dibuka di localhost. Browser menganggapnya aman, jadi izin lokasi boleh diminta.';
  tampilkanPita(pita, 'aman', 'Konteks aman', penjelasan);

  // Permissions API memberi tahu status izin tanpa memunculkan dialog.
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then((izin) => {
      const tulis = () => {
        const arti = {
          granted: 'Izin lokasi: sudah diberikan.',
          prompt: 'Izin lokasi: akan ditanyakan saat tombol ditekan.',
          denied: 'Izin lokasi: DITOLAK. Buka izin situs di browser untuk mengizinkan lagi.',
        }[izin.state];
        tampilkanPita(pita, izin.state === 'denied' ? 'waspada' : 'aman', 'Konteks aman', [penjelasan, arti]);
      };
      tulis();
      izin.onchange = tulis;
    }).catch(() => { /* Safari lama belum mendukung query geolocation */ });
  }
}

// ---------- 2. Login dan logout dengan kode admin ----------

function tampilkanLogin() {
  el('panel-login').hidden = false;
  el('panel-absen').hidden = true;
  el('panel-logout').hidden = true;
  el('id-karyawan').value = bacaLokal('absen.id_karyawan');
  el('nama').value = bacaLokal('absen.nama');
}

function tampilkanAbsen(sesi) {
  el('panel-login').hidden = true;
  el('panel-absen').hidden = false;
  el('login-id').textContent = sesi.id_karyawan;
  el('login-nama').textContent = sesi.nama;
  if (sesi.logout_menunggu) tampilkanFormKode(sesi.logout_menunggu.kedaluwarsa);
  siapkanPeta();
  perbaruiTombolKirim();
}

function sesiBerakhir(pesan) {
  token = '';
  simpanLokal(KUNCI_TOKEN, '');
  hentikanPantau();
  posisiTerbaik = null;
  tampilkanLogin();
  if (pesan) tampilkanPita(hasil, 'waspada', pesan);
}

async function cekSesi() {
  token = bacaLokal(KUNCI_TOKEN);
  if (!token) return tampilkanLogin();
  try {
    const { res, json } = await panggil('/api/sesi');
    if (res.status === 401) return sesiBerakhir('Sesi login kamu sudah diakhiri admin. Silakan login lagi.');
    tampilkanAbsen(json.sesi);
  } catch {
    tampilkanPita(hasil, 'bahaya', 'Tidak bisa menghubungi server.');
  }
}

el('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { id_karyawan: el('id-karyawan').value.trim(), nama: el('nama').value.trim() };
  try {
    const { res, json } = await panggil('/api/sesi', { method: 'POST', body });
    if (!res.ok) return tampilkanPita(hasil, 'bahaya', json.pesan || 'Login gagal.', json.galat);
    token = json.token;
    simpanLokal(KUNCI_TOKEN, token);
    simpanLokal('absen.id_karyawan', json.sesi.id_karyawan);
    simpanLokal('absen.nama', json.sesi.nama);
    hasil.hidden = true;
    tampilkanAbsen(json.sesi);
  } catch {
    tampilkanPita(hasil, 'bahaya', 'Tidak bisa menghubungi server.');
  }
});

function tampilkanFormKode(kedaluwarsa) {
  el('panel-logout').hidden = false;
  el('batas-kode').textContent = `Kode berlaku sampai ${formatWaktu(kedaluwarsa, 'jam')}.`;
  el('kode-logout').value = '';
  el('kode-logout').focus();
}

el('tombol-logout').addEventListener('click', async () => {
  try {
    const { res, json } = await panggil('/api/sesi/logout', { method: 'POST', body: {} });
    if (res.status === 401) return sesiBerakhir('Sesi sudah berakhir.');
    if (!res.ok) return tampilkanPita(hasil, 'bahaya', json.pesan || 'Gagal meminta kode.');
    hasil.hidden = true;
    tampilkanFormKode(json.kedaluwarsa);
  } catch {
    tampilkanPita(hasil, 'bahaya', 'Tidak bisa menghubungi server.');
  }
});

el('tombol-batal-logout').addEventListener('click', () => {
  el('panel-logout').hidden = true;
});

el('kode-logout').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});

el('form-kode').addEventListener('submit', async (e) => {
  e.preventDefault();
  const kode = el('kode-logout').value.trim();
  if (!/^\d{6}$/.test(kode)) return tampilkanPita(hasil, 'bahaya', 'Kode harus 6 angka.');
  try {
    const { res, json } = await panggil('/api/sesi/logout/konfirmasi', { method: 'POST', body: { kode } });
    if (res.ok) return sesiBerakhir('Logout berhasil. Perangkat ini bisa dipakai login lagi.');
    if (res.status === 401) return sesiBerakhir('Sesi sudah berakhir.');
    tampilkanPita(hasil, 'bahaya', json.pesan || 'Kode ditolak.');
    if (res.status === 410 || res.status === 429 || res.status === 404) el('panel-logout').hidden = true;
  } catch {
    tampilkanPita(hasil, 'bahaya', 'Tidak bisa menghubungi server.');
  }
});

// ---------- 3. Peta ----------

async function muatPengaturan() {
  try {
    const res = await fetch('/api/pengaturan');
    pengaturan = (await res.json()).pengaturan;
  } catch {
    pengaturan = null;
  }
}

function siapkanPeta() {
  if (typeof L === 'undefined' || !pengaturan) return;
  if (!peta) {
    peta = PetaAbsen.buat('peta-absen', { pusat: [pengaturan.lat, pengaturan.lon], zoom: 17 });
    penandaKantor = L.marker([pengaturan.lat, pengaturan.lon], { icon: PetaAbsen.ikonKantor(), keyboard: false })
      .bindTooltip(pengaturan.nama_lokasi)
      .addTo(peta);
    lapisanGeofence = PetaAbsen.gambarGeofence(peta, pengaturan).grup;
  }
  // Leaflet perlu tahu ukuran wadah setelah panel yang tadinya tersembunyi ditampilkan.
  setTimeout(() => peta.invalidateSize(), 0);
}

function gambarPosisiSaya(pos) {
  if (!peta) return;
  const titik = [pos.coords.latitude, pos.coords.longitude];
  if (!penandaSaya) {
    penandaSaya = L.marker(titik, { icon: PetaAbsen.ikonSaya(), keyboard: false, zIndexOffset: 1000 }).addTo(peta);
    lingkarAkurasi = L.circle(titik, {
      radius: pos.coords.accuracy, color: '#2F6FD6', weight: 1, fillColor: '#2F6FD6', fillOpacity: 0.15,
      interactive: false,
    }).addTo(peta);
  } else {
    penandaSaya.setLatLng(titik);
    lingkarAkurasi.setLatLng(titik).setRadius(pos.coords.accuracy);
  }
  penandaSaya.bindTooltip(`Kamu, akurasi ± ${formatMeter(pos.coords.accuracy)}`);

  // Kalau dekat kantor, tampilkan keduanya. Kalau jauh, fokus ke posisi sendiri.
  const jarak = pengaturan ? Geofence.evaluasi(pengaturan, titik[0], titik[1]).jarakLuar : Infinity;
  if (jarak < 3000) {
    const batas = lingkarAkurasi.getBounds().extend(lapisanGeofence.getLayers()[0].getBounds());
    peta.fitBounds(batas, { padding: [24, 24], maxZoom: 19 });
  } else {
    peta.fitBounds(lingkarAkurasi.getBounds(), { padding: [24, 24], maxZoom: 18 });
  }
}

// ---------- 4. Ambil lokasi ----------

function perbaruiTampilanPosisi(pos) {
  const { latitude: lat, longitude: lon, accuracy } = pos.coords;
  el('data-lokasi').hidden = false;
  el('d-lat').textContent = lat.toFixed(6);
  el('d-lon').textContent = lon.toFixed(6);
  el('d-akurasi').textContent = `± ${formatMeter(accuracy)}`;
  el('d-waktu').textContent = formatWaktu(pos.timestamp);
  if (pengaturan) {
    // Rumus sama dengan server (geofence.js), tapi keputusan akhir tetap di server.
    const area = Geofence.evaluasi(pengaturan, lat, lon);
    el('d-jarak').textContent = area.diDalam
      ? `Perkiraan DI DALAM area ${pengaturan.nama_lokasi} (${Geofence.ringkas(pengaturan)})`
      : `Perkiraan ${formatMeter(area.jarakLuar)} DI LUAR batas area ${pengaturan.nama_lokasi}`;
  } else {
    el('d-jarak').textContent = 'lokasi kantor belum termuat';
  }
  gambarPosisiSaya(pos);
}

function hentikanPantau() {
  if (idPantau !== null) navigator.geolocation.clearWatch(idPantau);
  idPantau = null;
  clearTimeout(pewaktu);
  pewaktu = null;
  tombolLokasi.disabled = !gpsDiizinkan;
  tombolLokasi.textContent = posisiTerbaik ? 'Ambil ulang lokasi' : 'Ambil lokasi saya';
}

function selesaiMencari(alasan) {
  hentikanPantau();
  meterIsi.style.transform = 'scaleX(1)';
  if (!posisiTerbaik) return;
  const akurasi = Math.round(posisiTerbaik.coords.accuracy);
  const batas = pengaturan ? pengaturan.batas_akurasi_m : null;
  let teks = `Lokasi terkunci (${alasan}). Akurasi ± ${akurasi} m.`;
  if (batas && akurasi > batas) {
    teks += ` Masih di atas batas ${batas} m, absen akan ditandai "akurasi rendah". ` +
      'Coba di tempat terbuka, nyalakan GPS/Wi-Fi, atau pakai HP.';
  }
  statusLokasi.textContent = teks;
  perbaruiTombolKirim();
}

// Kode galat GeolocationPositionError: 1 izin ditolak, 2 posisi tidak tersedia, 3 waktu habis.
function pesanGalatGeo(kode, pesan) {
  switch (kode) {
    case 1:
      return 'Izin lokasi ditolak. Klik ikon gembok/pengaturan situs di address bar, ubah Lokasi menjadi Izinkan, ' +
        'lalu muat ulang halaman. Di HP, pastikan juga lokasi perangkat menyala dan browser diizinkan memakai lokasi.';
    case 2:
      return 'Lokasi tidak tersedia. Nyalakan GPS/Layanan Lokasi di perangkat, lalu coba di tempat terbuka.';
    case 3:
      return 'Waktu habis sebelum lokasi didapat. Coba lagi, sebaiknya dekat jendela atau di luar ruangan.';
    default:
      return `Gagal mengambil lokasi: ${pesan}`;
  }
}

function ambilLokasi() {
  hasil.hidden = true;
  posisiTerbaik = null;
  perbaruiTombolKirim();
  tombolLokasi.disabled = true;
  tombolLokasi.textContent = 'Mencari lokasi...';
  statusLokasi.textContent = 'Meminta lokasi. Kalau muncul dialog izin, pilih Izinkan.';
  meterIsi.style.transform = 'scaleX(0)';

  const mulai = Date.now();
  const batas = pengaturan ? pengaturan.batas_akurasi_m : 50;

  idPantau = navigator.geolocation.watchPosition(
    (pos) => {
      if (!posisiTerbaik || pos.coords.accuracy < posisiTerbaik.coords.accuracy) {
        posisiTerbaik = pos;
        perbaruiTampilanPosisi(pos);
      }
      const akurasi = Math.round(posisiTerbaik.coords.accuracy);
      const sisa = Math.max(0, Math.ceil((LAMA_TUNGGU_MS - (Date.now() - mulai)) / 1000));
      statusLokasi.textContent =
        `Mempertajam lokasi... akurasi terbaik ± ${akurasi} m (target ${batas} m), sisa ${sisa} detik.`;
      meterIsi.style.transform = `scaleX(${Math.min(1, batas / posisiTerbaik.coords.accuracy)})`;
      if (posisiTerbaik.coords.accuracy <= batas) selesaiMencari('akurasi tercapai');
    },
    (err) => {
      // TIMEOUT bisa muncul di tengah pemantauan. Kalau sudah ada bacaan, pakai itu.
      if (posisiTerbaik && err.code === 3) {
        selesaiMencari('batas waktu');
        return;
      }
      hentikanPantau();
      statusLokasi.textContent = pesanGalatGeo(err.code, err.message);
    },
    // maximumAge 0: jangan pakai lokasi lama dari cache.
    { enableHighAccuracy: true, maximumAge: 0, timeout: LAMA_TUNGGU_MS }
  );

  pewaktu = setTimeout(() => {
    if (posisiTerbaik) {
      selesaiMencari('batas waktu');
    } else {
      hentikanPantau();
      statusLokasi.textContent = pesanGalatGeo(3);
    }
  }, LAMA_TUNGGU_MS);
}

// ---------- 5. Kirim absen ----------

function jenisTerpilih() {
  const jenis = formAbsen.querySelector('input[name="jenis"]:checked');
  return jenis ? jenis.value : '';
}

function perbaruiTombolKirim() {
  let alasan = '';
  if (!jenisTerpilih()) alasan = 'Pilih Masuk atau Pulang.';
  else if (!posisiTerbaik) alasan = 'Ambil lokasi dulu.';
  else if (idPantau !== null) alasan = 'Tunggu pencarian lokasi selesai.';
  tombolKirim.disabled = Boolean(alasan);
  el('alasan-kirim').textContent = alasan || 'Siap dikirim.';
}

const LABEL_STATUS = {
  valid: 'Valid, di dalam area',
  di_luar_area: 'Di luar area kantor',
  akurasi_rendah: 'Akurasi GPS terlalu rendah',
};

async function kirimAbsen(e) {
  e.preventDefault();
  perbaruiTombolKirim();
  if (tombolKirim.disabled) return;

  tombolKirim.disabled = true;
  tombolKirim.textContent = 'Mengirim...';
  try {
    const { res, json } = await panggil('/api/absen', {
      method: 'POST',
      body: {
        jenis: jenisTerpilih(),
        lat: posisiTerbaik.coords.latitude,
        lon: posisiTerbaik.coords.longitude,
        akurasi: posisiTerbaik.coords.accuracy,
        waktu_gps: posisiTerbaik.timestamp,
      },
    });
    if (res.status === 401) return sesiBerakhir('Sesi login kamu sudah diakhiri admin. Silakan login lagi.');
    if (!res.ok) {
      tampilkanPita(hasil, 'bahaya', json.pesan || `Gagal (HTTP ${res.status}).`, json.galat);
      return;
    }
    const a = json.absen;
    tampilkanPita(hasil, a.status === 'valid' ? 'aman' : 'waspada', `Absen ${a.jenis} tercatat (#${a.id})`, [
      `Status: ${LABEL_STATUS[a.status] || a.status}`,
      a.jarak_luar_m > 0
        ? `Posisi: ${formatMeter(a.jarak_luar_m)} di luar batas area ${json.lokasi_kantor.nama_lokasi}`
        : `Posisi: di dalam area ${json.lokasi_kantor.nama_lokasi}`,
      `Akurasi: ± ${formatMeter(a.akurasi_m)}`,
      `Waktu server: ${formatWaktu(a.waktu_server)}`,
    ]);
    hasil.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch {
    tampilkanPita(hasil, 'bahaya', 'Tidak bisa menghubungi server.', 'Periksa koneksi, lalu kirim ulang.');
  } finally {
    tombolKirim.textContent = 'Kirim absen';
    perbaruiTombolKirim();
  }
}

// Tebak jenis absen dari jam WIB.
const jamWib = Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }));
formAbsen.querySelector(`input[name="jenis"][value="${jamWib < 12 ? 'masuk' : 'pulang'}"]`).checked = true;

formAbsen.addEventListener('input', perbaruiTombolKirim);
formAbsen.addEventListener('submit', kirimAbsen);
tombolLokasi.addEventListener('click', ambilLokasi);

periksaKonteks();
tombolLokasi.disabled = !gpsDiizinkan;
muatPengaturan().then(cekSesi);
