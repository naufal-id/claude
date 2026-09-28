'use strict';

const RADIUS_BUMI_M = 6371008.8;

function keRadian(derajat) {
  return (derajat * Math.PI) / 180;
}

// Jarak garis lurus di permukaan bumi (rumus haversine), hasil dalam meter.
function jarakMeter(lat1, lon1, lat2, lon2) {
  const dLat = keRadian(lat2 - lat1);
  const dLon = keRadian(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(keRadian(lat1)) * Math.cos(keRadian(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIUS_BUMI_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Status dihitung di server, bukan di browser, supaya tidak bisa diakali
// dengan mengubah JavaScript di sisi klien.
function tentukanStatus({ jarak, akurasi, radius, batasAkurasi }) {
  if (akurasi > batasAkurasi) return 'akurasi_rendah';
  if (jarak > radius) return 'di_luar_area';
  return 'valid';
}

module.exports = { jarakMeter, tentukanStatus };
