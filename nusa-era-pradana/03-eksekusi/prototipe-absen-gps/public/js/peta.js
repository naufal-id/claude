'use strict';

// Pembantu peta bersama untuk halaman absen dan rekap. Butuh Leaflet (vendor/leaflet).
// Ubin satelit dari Esri World Imagery, ubin jalan dari OpenStreetMap.
// Keduanya diizinkan di Content-Security-Policy server (img-src).

window.PetaAbsen = (function () {
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
  const ATRIBUSI_ESRI = 'Citra &copy; Esri, Maxar, Earthstar Geographics';

  function lapisanDasar() {
    const opsiSatelit = { maxZoom: 20, maxNativeZoom: 18, attribution: ATRIBUSI_ESRI };
    const satelit = () => L.tileLayer(`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, opsiSatelit);
    const label = () => L.tileLayer(
      `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
      { maxZoom: 20, maxNativeZoom: 18, pane: 'overlayPane' }
    );
    const jalanEsri = () => L.tileLayer(
      `${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`,
      { maxZoom: 20, maxNativeZoom: 18, pane: 'overlayPane', opacity: 0.8 }
    );
    return {
      'Satelit + label': L.layerGroup([satelit(), jalanEsri(), label()]),
      'Satelit polos': satelit(),
      'Peta jalan': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, maxNativeZoom: 19, attribution: '&copy; OpenStreetMap contributors',
      }),
    };
  }

  function warna(nama) {
    return getComputedStyle(document.documentElement).getPropertyValue(nama).trim();
  }

  function buat(elemen, { pusat, zoom = 17, overlay = {} } = {}) {
    const peta = L.map(elemen, { zoomControl: true, attributionControl: true });
    const dasar = lapisanDasar();
    dasar['Satelit + label'].addTo(peta);
    L.control.layers(dasar, overlay, { collapsed: true }).addTo(peta);
    L.control.scale({ imperial: false }).addTo(peta);
    peta.setView(pusat, zoom);
    return peta;
  }

  // Penanda berbentuk HTML (divIcon), jadi tidak butuh berkas gambar marker.
  function ikonKantor() {
    return L.divIcon({ className: 'penanda-kantor', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] });
  }
  function ikonSaya() {
    return L.divIcon({ className: 'penanda-saya', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
  }

  function ikonSudut(nomor) {
    return L.divIcon({ className: 'penanda-sudut', html: `<span>${nomor}</span>`, iconSize: [26, 26], iconAnchor: [13, 13] });
  }
  function ikonTengah() {
    return L.divIcon({ className: 'penanda-tengah', html: '<span>+</span>', iconSize: [20, 20], iconAnchor: [10, 10] });
  }

  // Menggambar area absen: lingkaran atau poligon. Garis putih tebal di bawah garis hijau
  // supaya batasnya tetap terlihat di atas citra satelit yang gelap maupun terang.
  function gambarGeofence(peta, p, lapisan) {
    const grup = lapisan || L.layerGroup().addTo(peta);
    grup.clearLayers();
    const hijau = warna('--utama');
    const gayaLatar = { color: '#FFFFFF', weight: 4, opacity: 0.9, fill: false, interactive: false };
    const gayaIsi = { color: hijau, weight: 2, fillColor: hijau, fillOpacity: 0.18, dashArray: '6 4', interactive: false };
    let latar;
    let isi;
    if (Geofence.adalahPoligon(p)) {
      latar = L.polygon(p.titik, gayaLatar);
      isi = L.polygon(p.titik, gayaIsi);
    } else {
      latar = L.circle([p.lat, p.lon], { ...gayaLatar, radius: p.radius_m });
      isi = L.circle([p.lat, p.lon], { ...gayaIsi, radius: p.radius_m });
    }
    grup.addLayer(latar);
    grup.addLayer(isi);
    return { grup, latar, isi };
  }

  return { buat, warna, ikonKantor, ikonSaya, ikonSudut, ikonTengah, gambarGeofence };
})();
