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

  function gambarGeofence(peta, p, lapisan) {
    const grup = lapisan || L.layerGroup().addTo(peta);
    grup.clearLayers();
    const hijau = warna('--utama');
    const lingkar = L.circle([p.lat, p.lon], {
      radius: p.radius_m, color: '#FFFFFF', weight: 3, opacity: 0.9, fill: false, interactive: false,
    });
    const isi = L.circle([p.lat, p.lon], {
      radius: p.radius_m, color: hijau, weight: 2, fillColor: hijau, fillOpacity: 0.18, dashArray: '6 4',
    });
    grup.addLayer(lingkar);
    grup.addLayer(isi);
    return { grup, lingkar, isi };
  }

  return { buat, warna, ikonKantor, ikonSaya, gambarGeofence };
})();
