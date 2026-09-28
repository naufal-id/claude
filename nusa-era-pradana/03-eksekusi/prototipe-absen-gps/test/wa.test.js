'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { buatWa, normalkanTujuan } = require('../lib/wa');

test('nomor admin dinormalkan ke format internasional', () => {
  assert.equal(normalkanTujuan('0812-3456-7890'), '6281234567890');
  assert.equal(normalkanTujuan('+62 812 3456 7890'), '6281234567890');
  assert.equal(normalkanTujuan('120363000000000000@g.us'), '120363000000000000@g.us');
  assert.equal(normalkanTujuan('123'), null);
});

// Klien tiruan dengan bentuk API yang sama seperti whatsapp-web.js.
function wwebjsTiruan() {
  const terkirim = [];
  class Client extends EventEmitter {
    constructor(opsi) { super(); this.opsi = opsi; Client.terakhir = this; }
    async initialize() {}
    async getNumberId(nomor) { return nomor.startsWith('62') ? { _serialized: `${nomor}@c.us` } : null; }
    async sendMessage(chatId, teks) { terkirim.push({ chatId, teks }); }
    async destroy() {}
  }
  class LocalAuth { constructor(opsi) { this.opsi = opsi; } }
  return { Client, LocalAuth, terkirim };
}

const konfigDasar = {
  waAktif: true, waTujuan: ['081234567890', '120363@g.us'], waFolderSesi: '/tmp/wa-uji', waChromePath: '',
};

test('status mengikuti peristiwa klien: qr, authenticated, ready', async () => {
  const w = wwebjsTiruan();
  const wa = buatWa(konfigDasar, { wwebjs: w, qrcode: { toDataURL: async () => 'data:image/png;base64,QR' }, qrTerminal: null });
  wa.mulai();
  assert.equal(wa.status().status, 'memulai');
  assert.equal(w.Client.terakhir.opsi.authStrategy.opsi.dataPath, '/tmp/wa-uji');

  w.Client.terakhir.emit('qr', 'kode-qr');
  await new Promise((r) => setImmediate(r));
  assert.equal(wa.status().status, 'menunggu_qr');
  assert.equal(wa.status().qr_gambar, 'data:image/png;base64,QR');

  // Sebelum siap, pesan dilewati tanpa melempar galat.
  assert.deepEqual(await wa.kirimKeAdmin('halo'), { terkirim: 0, alasan: 'menunggu_qr' });

  w.Client.terakhir.emit('authenticated');
  w.Client.terakhir.info = { wid: { user: '628000' } };
  w.Client.terakhir.emit('ready');
  assert.equal(wa.status().status, 'siap');
  assert.equal(wa.status().qr_gambar, null);
  assert.equal(wa.status().nomor_terhubung, '628000');

  const hasil = await wa.kirimKeAdmin('Absen masuk');
  assert.equal(hasil.terkirim, 2);
  assert.deepEqual(w.terkirim.map((k) => k.chatId), ['6281234567890@c.us', '120363@g.us']);
});

test('WA nonaktif atau paket belum terpasang tidak menghentikan server', async () => {
  const mati = buatWa({ ...konfigDasar, waAktif: false });
  mati.mulai();
  assert.equal(mati.status().status, 'nonaktif');
  assert.deepEqual(await mati.kirimKeAdmin('x'), { terkirim: 0, alasan: 'nonaktif' });

  const tanpaPaket = buatWa(konfigDasar, { wwebjs: null });
  tanpaPaket.mulai();
  assert.equal(tanpaPaket.status().status, 'modul_belum_dipasang');
  assert.match(tanpaPaket.status().pesan, /npm install/);
  await tanpaPaket.tutup();
});
