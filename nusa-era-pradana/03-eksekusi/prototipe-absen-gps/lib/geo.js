'use strict';

// Geometri ada di public/js/geofence.js supaya browser dan server memakai rumus yang sama.
const Geofence = require('../public/js/geofence.js');

// Status dihitung di server, bukan di browser, supaya tidak bisa diakali
// dengan mengubah JavaScript di sisi klien.
function tentukanStatus({ diDalam, akurasi, batasAkurasi }) {
  if (akurasi > batasAkurasi) return 'akurasi_rendah';
  if (!diDalam) return 'di_luar_area';
  return 'valid';
}

module.exports = { ...Geofence, tentukanStatus };
