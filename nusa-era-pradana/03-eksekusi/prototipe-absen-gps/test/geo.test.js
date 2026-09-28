'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { jarakMeter, tentukanStatus, persegi, ukuran, dalamPoligon, bersilang, evaluasi } = require('../lib/geo');

test('jarak titik yang sama adalah 0', () => {
  assert.equal(jarakMeter(3.5906, 98.6779, 3.5906, 98.6779), 0);
});

test('satu derajat lintang kira-kira 111 km', () => {
  const m = jarakMeter(0, 0, 1, 0);
  assert.ok(Math.abs(m - 111195) < 50, `hasil ${m}`);
});

test('jarak Lapangan Merdeka ke Bandara Kualanamu sekitar 23 km', () => {
  const m = jarakMeter(3.5906, 98.6779, 3.6422, 98.8853);
  assert.ok(m > 22000 && m < 25000, `hasil ${m}`);
});

test('status mengutamakan akurasi, lalu posisi di dalam area', () => {
  assert.equal(tentukanStatus({ diDalam: true, akurasi: 10, batasAkurasi: 50 }), 'valid');
  assert.equal(tentukanStatus({ diDalam: false, akurasi: 10, batasAkurasi: 50 }), 'di_luar_area');
  assert.equal(tentukanStatus({ diDalam: true, akurasi: 800, batasAkurasi: 50 }), 'akurasi_rendah');
});

const KANTOR = { lat: 3.5906, lon: 98.6779, radius_m: 100 };

test('persegi: sisi 200 m, luas 4 ha, titik tengah di dalam', () => {
  const titik = persegi(KANTOR.lat, KANTOR.lon, 100);
  assert.equal(titik.length, 4);
  const u = ukuran(titik);
  assert.ok(Math.abs(u.luas_m2 - 40000) < 50, `luas ${u.luas_m2}`);
  assert.ok(Math.abs(u.keliling_m - 800) < 1, `keliling ${u.keliling_m}`);
  assert.ok(dalamPoligon(KANTOR.lat, KANTOR.lon, titik));
  assert.ok(!bersilang(titik));
});

test('poligon: pojok persegi di dalam, di luar lingkaran dengan "radius" sama', () => {
  const p = { ...KANTOR, bentuk: 'poligon', titik: persegi(KANTOR.lat, KANTOR.lon, 100) };
  // 90 m ke timur dan 90 m ke utara: jaraknya 127 m, jadi di luar lingkaran 100 m tapi di dalam persegi.
  const lat = KANTOR.lat + 90 / 110574;
  const lon = KANTOR.lon + 90 / (111320 * Math.cos((KANTOR.lat * Math.PI) / 180));
  const hasilPersegi = evaluasi(p, lat, lon);
  assert.equal(hasilPersegi.diDalam, true);
  assert.equal(hasilPersegi.jarakLuar, 0);
  assert.ok(Math.abs(hasilPersegi.jarakKantor - 127) < 2);
  const hasilLingkaran = evaluasi({ ...KANTOR, bentuk: 'lingkaran' }, lat, lon);
  assert.equal(hasilLingkaran.diDalam, false);
  assert.ok(Math.abs(hasilLingkaran.jarakLuar - 27) < 2);
});

test('poligon: jarak di luar batas dihitung ke sisi terdekat', () => {
  const p = { ...KANTOR, bentuk: 'poligon', titik: persegi(KANTOR.lat, KANTOR.lon, 100) };
  const lat = KANTOR.lat + 150 / 110574; // 150 m ke utara, sisi utara di 100 m
  const hasil = evaluasi(p, lat, KANTOR.lon);
  assert.equal(hasil.diDalam, false);
  assert.ok(Math.abs(hasil.jarakLuar - 50) < 1, `jarak luar ${hasil.jarakLuar}`);
});

test('poligon bentuk L (cekung) dan sisi bersilang terdeteksi', () => {
  const m = (x, y) => [KANTOR.lat + y / 110574, KANTOR.lon + x / (111320 * Math.cos((KANTOR.lat * Math.PI) / 180))];
  const bentukL = [m(0, 0), m(200, 0), m(200, 100), m(100, 100), m(100, 200), m(0, 200)];
  assert.ok(dalamPoligon(...m(50, 150), bentukL));
  assert.ok(!dalamPoligon(...m(150, 150), bentukL), 'lekukan L harus di luar');
  assert.ok(!bersilang(bentukL));
  const pita = [m(0, 0), m(100, 100), m(100, 0), m(0, 100)];
  assert.ok(bersilang(pita));
});
