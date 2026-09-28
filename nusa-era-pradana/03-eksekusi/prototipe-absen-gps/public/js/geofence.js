'use strict';

// Geometri area absen (geofence). Satu berkas dipakai dua tempat:
// server (require dari lib/geo.js) dan browser (window.Geofence),
// supaya pratinjau di HP dan keputusan server selalu sama.
//
// Bentuk area:
//   lingkaran : titik kantor (lat, lon) + radius_m
//   poligon   : daftar sudut titik = [[lat, lon], ...], minimal 3. Persegi = poligon 4 sudut.

(function (akar, pabrik) {
  if (typeof module === 'object' && module.exports) module.exports = pabrik();
  else akar.Geofence = pabrik();
})(typeof self !== 'undefined' ? self : this, function () {
  const RADIUS_BUMI_M = 6371008.8;
  const M_PER_DERAJAT_LAT = 110574;
  const M_PER_DERAJAT_LON_EKUATOR = 111320;

  const keRadian = (d) => (d * Math.PI) / 180;

  // Jarak garis lurus di permukaan bumi (rumus haversine), hasil dalam meter.
  function jarakMeter(lat1, lon1, lat2, lon2) {
    const a = Math.sin(keRadian(lat2 - lat1) / 2) ** 2 +
      Math.cos(keRadian(lat1)) * Math.cos(keRadian(lat2)) * Math.sin(keRadian(lon2 - lon1) / 2) ** 2;
    return 2 * RADIUS_BUMI_M * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  // Proyeksi datar sederhana di sekitar titik acuan. Akurat untuk area selebar
  // beberapa kilometer, yang memang skala area absen.
  function keMeter(lat, lon, lat0, lon0) {
    return {
      x: (lon - lon0) * M_PER_DERAJAT_LON_EKUATOR * Math.cos(keRadian(lat0)),
      y: (lat - lat0) * M_PER_DERAJAT_LAT,
    };
  }

  function keDerajat(x, y, lat0, lon0) {
    return [lat0 + y / M_PER_DERAJAT_LAT, lon0 + x / (M_PER_DERAJAT_LON_EKUATOR * Math.cos(keRadian(lat0)))];
  }

  // Ray casting: tarik garis ke kanan dari titik, hitung berapa kali memotong sisi.
  function dalamPoligon(lat, lon, titik) {
    const [lat0, lon0] = titik[0];
    const p = keMeter(lat, lon, lat0, lon0);
    const s = titik.map(([a, b]) => keMeter(a, b, lat0, lon0));
    let dalam = false;
    for (let i = 0, j = s.length - 1; i < s.length; j = i++) {
      const potong = (s[i].y > p.y) !== (s[j].y > p.y) &&
        p.x < ((s[j].x - s[i].x) * (p.y - s[i].y)) / (s[j].y - s[i].y) + s[i].x;
      if (potong) dalam = !dalam;
    }
    return dalam;
  }

  function jarakKeRuas(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const panjang2 = dx * dx + dy * dy;
    const t = panjang2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / panjang2)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  function jarakKeTepi(lat, lon, titik) {
    const p = keMeter(lat, lon, lat, lon);
    const s = titik.map(([a, b]) => keMeter(a, b, lat, lon));
    let min = Infinity;
    for (let i = 0; i < s.length; i += 1) min = Math.min(min, jarakKeRuas(p, s[i], s[(i + 1) % s.length]));
    return min;
  }

  function adalahPoligon(p) {
    return p.bentuk === 'poligon' && Array.isArray(p.titik) && p.titik.length >= 3;
  }

  // Hasil untuk satu posisi: jarak ke titik kantor, di dalam area atau tidak,
  // dan berapa meter di luar batas area (0 kalau di dalam).
  function evaluasi(p, lat, lon) {
    const jarakKantor = jarakMeter(lat, lon, p.lat, p.lon);
    if (adalahPoligon(p)) {
      const diDalam = dalamPoligon(lat, lon, p.titik);
      return { jarakKantor, diDalam, jarakLuar: diDalam ? 0 : jarakKeTepi(lat, lon, p.titik) };
    }
    const diDalam = jarakKantor <= p.radius_m;
    return { jarakKantor, diDalam, jarakLuar: diDalam ? 0 : jarakKantor - p.radius_m };
  }

  // Persegi dengan pusat di (lat, lon), sisi = 2 x setengahSisi meter. Urutan: barat laut, timur laut,
  // tenggara, barat daya.
  function persegi(lat, lon, setengahSisi) {
    const h = setengahSisi;
    return [[-h, h], [h, h], [h, -h], [-h, -h]].map(([x, y]) => {
      const [a, b] = keDerajat(x, y, lat, lon);
      return [Number(a.toFixed(7)), Number(b.toFixed(7))];
    });
  }

  function geser(titik, dLat, dLon) {
    return titik.map(([a, b]) => [Number((a + dLat).toFixed(7)), Number((b + dLon).toFixed(7))]);
  }

  function ukuran(titik) {
    const [lat0, lon0] = titik[0];
    const s = titik.map(([a, b]) => keMeter(a, b, lat0, lon0));
    let luas = 0;
    let keliling = 0;
    for (let i = 0; i < s.length; i += 1) {
      const a = s[i];
      const b = s[(i + 1) % s.length];
      luas += a.x * b.y - b.x * a.y;
      keliling += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return { luas_m2: Math.abs(luas) / 2, keliling_m: keliling };
  }

  // Sisi yang saling bersilang (bentuk "pita") membuat hasil di dalam/luar membingungkan.
  function bersilang(titik) {
    const [lat0, lon0] = titik[0];
    const s = titik.map(([a, b]) => keMeter(a, b, lat0, lon0));
    const n = s.length;
    const orientasi = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (j === i + 1 || (i === 0 && j === n - 1)) continue; // sisi bertetangga
        const [a, b, c, d] = [s[i], s[(i + 1) % n], s[j], s[(j + 1) % n]];
        if (orientasi(a, b, c) !== orientasi(a, b, d) && orientasi(c, d, a) !== orientasi(c, d, b)) return true;
      }
    }
    return false;
  }

  function formatLuas(m2) {
    return m2 >= 10000
      ? `${(m2 / 10000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ha`
      : `${Math.round(m2).toLocaleString('id-ID')} m²`;
  }

  function ringkas(p) {
    if (adalahPoligon(p)) {
      const u = ukuran(p.titik);
      const nama = p.titik.length === 4 ? 'area 4 sudut' : `area ${p.titik.length} sudut`;
      return `${nama}, luas ${formatLuas(u.luas_m2)}`;
    }
    return `radius ${p.radius_m} m`;
  }

  return {
    jarakMeter, keMeter, dalamPoligon, jarakKeTepi, evaluasi, persegi, geser, ukuran, bersilang,
    formatLuas, ringkas, adalahPoligon,
  };
});
