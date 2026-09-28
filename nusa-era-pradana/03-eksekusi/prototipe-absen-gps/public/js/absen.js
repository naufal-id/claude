'use strict';

// Berapa lama maksimal menunggu GPS "mengunci". Selama itu, bacaan terbaik
// (akurasi paling kecil) disimpan. Berhenti lebih cepat kalau akurasi sudah
// memenuhi batas dari server.
const LAMA_TUNGGU_MS = 20000;

const el = (id) => document.getElementById(id);
const form = el('form-absen');
const tombolLokasi = el('tombol-lokasi');
const tombolKirim = el('tombol-kirim');
const statusLokasi = el('status-lokasi');
const meterIsi = el('meter-isi');
const hasil = el('hasil');

let pengaturan = null; // lokasi kantor dari server
let posisiTerbaik = null;
let idPantau = null;
let pewaktu = null;

function simpanLokal(kunci, nilai) {
  try { localStorage.setItem(kunci, nilai); } catch { /* mode privat */ }
}
function bacaLokal(kunci) {
  try { return localStorage.getItem(kunci) || ''; } catch { return ''; }
}

// Sama dengan lib/geo.js di server. Di sini hanya untuk pratinjau.
function jarakMeter(lat1, lon1, lat2, lon2) {
  const r = (d) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function formatMeter(m) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} km`;
}

function formatWaktu(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'medium',
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

// 1. Cek konteks aman. Geolocation API hanya jalan di HTTPS atau localhost.
function periksaKonteks() {
  const pita = el('pita-konteks');
  if (!('geolocation' in navigator)) {
    tampilkanPita(pita, 'bahaya', 'Browser ini tidak mendukung Geolocation API.');
    tombolLokasi.disabled = true;
    return;
  }
  if (!window.isSecureContext) {
    tampilkanPita(pita, 'bahaya', 'GPS diblokir: halaman dibuka lewat HTTP biasa.', [
      `Alamat sekarang: ${location.origin}. Browser hanya mengizinkan lokasi di https:// atau http://localhost.`,
      'Solusi: pakai tunnel HTTPS (cloudflared), port forwarding USB, atau hosting. Lihat README bagian 4.',
    ]);
    tombolLokasi.disabled = true;
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

async function muatPengaturan() {
  try {
    const res = await fetch('/api/pengaturan');
    const json = await res.json();
    pengaturan = json.pengaturan;
  } catch {
    pengaturan = null;
  }
}

function perbaruiTampilanPosisi(pos) {
  const { latitude: lat, longitude: lon, accuracy } = pos.coords;
  el('data-lokasi').hidden = false;
  el('d-lat').textContent = lat.toFixed(6);
  el('d-lon').textContent = lon.toFixed(6);
  el('d-akurasi').textContent = `± ${formatMeter(accuracy)}`;
  el('d-waktu').textContent = formatWaktu(pos.timestamp);
  el('d-peta').href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
  if (pengaturan) {
    const jarak = jarakMeter(lat, lon, pengaturan.lat, pengaturan.lon);
    const di = jarak <= pengaturan.radius_m ? 'di dalam' : 'di luar';
    el('d-jarak').textContent =
      `${formatMeter(jarak)} (perkiraan ${di} radius ${pengaturan.radius_m} m dari ${pengaturan.nama_lokasi})`;
  } else {
    el('d-jarak').textContent = 'lokasi kantor belum termuat';
  }
}

function hentikanPantau() {
  if (idPantau !== null) navigator.geolocation.clearWatch(idPantau);
  idPantau = null;
  clearTimeout(pewaktu);
  pewaktu = null;
  tombolLokasi.disabled = false;
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

function dataForm() {
  const jenis = form.querySelector('input[name="jenis"]:checked');
  return {
    id_karyawan: el('id-karyawan').value.trim(),
    nama: el('nama').value.trim(),
    jenis: jenis ? jenis.value : '',
  };
}

function perbaruiTombolKirim() {
  const d = dataForm();
  let alasan = '';
  if (!d.id_karyawan) alasan = 'Isi ID karyawan.';
  else if (!/^[A-Za-z0-9._-]+$/.test(d.id_karyawan)) alasan = 'ID hanya boleh huruf, angka, titik, strip, garis bawah.';
  else if (!d.nama) alasan = 'Isi nama.';
  else if (!d.jenis) alasan = 'Pilih Masuk atau Pulang.';
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

  const d = dataForm();
  simpanLokal('absen.id_karyawan', d.id_karyawan);
  simpanLokal('absen.nama', d.nama);

  tombolKirim.disabled = true;
  tombolKirim.textContent = 'Mengirim...';
  try {
    const res = await fetch('/api/absen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...d,
        lat: posisiTerbaik.coords.latitude,
        lon: posisiTerbaik.coords.longitude,
        akurasi: posisiTerbaik.coords.accuracy,
        waktu_gps: posisiTerbaik.timestamp,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      tampilkanPita(hasil, 'bahaya', json.pesan || `Gagal (HTTP ${res.status}).`, json.galat);
      return;
    }
    const a = json.absen;
    tampilkanPita(hasil, a.status === 'valid' ? 'aman' : 'waspada', `Absen ${a.jenis} tercatat (#${a.id})`, [
      `Status: ${LABEL_STATUS[a.status] || a.status}`,
      `Jarak ke ${json.lokasi_kantor.nama_lokasi}: ${formatMeter(a.jarak_m)} (radius ${json.lokasi_kantor.radius_m} m)`,
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

// Isi otomatis dari kunjungan sebelumnya, dan tebak jenis absen dari jam.
el('id-karyawan').value = bacaLokal('absen.id_karyawan');
el('nama').value = bacaLokal('absen.nama');
const jamWib = Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }));
form.querySelector(`input[name="jenis"][value="${jamWib < 12 ? 'masuk' : 'pulang'}"]`).checked = true;

form.addEventListener('input', perbaruiTombolKirim);
form.addEventListener('submit', kirimAbsen);
tombolLokasi.addEventListener('click', ambilLokasi);

periksaKonteks();
muatPengaturan();
perbaruiTombolKirim();
