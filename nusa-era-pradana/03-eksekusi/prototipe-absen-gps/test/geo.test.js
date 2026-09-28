'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { jarakMeter, tentukanStatus } = require('../lib/geo');

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

test('status mengutamakan akurasi, lalu radius', () => {
  const dasar = { radius: 100, batasAkurasi: 50 };
  assert.equal(tentukanStatus({ ...dasar, jarak: 20, akurasi: 10 }), 'valid');
  assert.equal(tentukanStatus({ ...dasar, jarak: 100, akurasi: 50 }), 'valid');
  assert.equal(tentukanStatus({ ...dasar, jarak: 150, akurasi: 10 }), 'di_luar_area');
  assert.equal(tentukanStatus({ ...dasar, jarak: 20, akurasi: 800 }), 'akurasi_rendah');
});
