'use strict';

// Notifikasi WhatsApp lewat whatsapp-web.js. Opsional: server tetap jalan
// tanpa paket ini. whatsapp-web.js menjalankan WhatsApp Web di Chromium
// (puppeteer) dan login dengan memindai QR dari HP, seperti WhatsApp Web biasa.

const path = require('node:path');

function cobaRequire(nama) {
  try {
    return require(nama);
  } catch {
    return null;
  }
}

// 0812-3456-789 -> 628123456789. ID grup (…@g.us) dibiarkan apa adanya.
function normalkanTujuan(teks) {
  const t = String(teks).trim();
  if (!t) return null;
  if (t.endsWith('@g.us') || t.endsWith('@c.us')) return t;
  let angka = t.replace(/\D/g, '');
  if (angka.startsWith('0')) angka = '62' + angka.slice(1);
  return angka.length >= 10 ? angka : null;
}

function buatWa(konfig, cadangan = {}) {
  const keadaan = {
    aktif: konfig.waAktif,
    status: konfig.waAktif ? 'memulai' : 'nonaktif',
    pesan: konfig.waAktif ? '' : 'Isi WA_AKTIF=1 di .env untuk menyalakan notifikasi WhatsApp.',
    qrGambar: null,
    nomorTerhubung: null,
    tujuan: konfig.waTujuan.map(normalkanTujuan).filter(Boolean),
    riwayat: [],
  };
  let klien = null;

  function catat(jenis, teks) {
    keadaan.riwayat.unshift({ waktu: new Date().toISOString(), jenis, teks: teks.slice(0, 300) });
    keadaan.riwayat.length = Math.min(keadaan.riwayat.length, 20);
  }

  function status() {
    return {
      aktif: keadaan.aktif,
      status: keadaan.status,
      pesan: keadaan.pesan,
      qr_gambar: keadaan.status === 'menunggu_qr' ? keadaan.qrGambar : null,
      nomor_terhubung: keadaan.nomorTerhubung,
      tujuan: keadaan.tujuan,
      riwayat: keadaan.riwayat,
    };
  }

  async function kirimKe(tujuan, teks) {
    let chatId = tujuan;
    if (!tujuan.includes('@')) {
      const wid = await klien.getNumberId(tujuan);
      if (!wid) throw new Error(`Nomor ${tujuan} tidak terdaftar di WhatsApp`);
      chatId = wid._serialized;
    }
    await klien.sendMessage(chatId, teks);
  }

  // Tidak pernah melempar galat: notifikasi gagal tidak boleh menggagalkan absen.
  async function kirimKeAdmin(teks) {
    if (!keadaan.aktif) return { terkirim: 0, alasan: 'nonaktif' };
    if (keadaan.status !== 'siap') {
      catat('dilewati', `WA belum siap (${keadaan.status}): ${teks}`);
      return { terkirim: 0, alasan: keadaan.status };
    }
    if (!keadaan.tujuan.length) {
      catat('dilewati', 'WA_NOMOR_ADMIN kosong');
      return { terkirim: 0, alasan: 'tanpa_tujuan' };
    }
    let terkirim = 0;
    for (const tujuan of keadaan.tujuan) {
      try {
        await kirimKe(tujuan, teks);
        terkirim += 1;
        catat('terkirim', `ke ${tujuan}: ${teks}`);
      } catch (err) {
        catat('gagal', `ke ${tujuan}: ${err.message}`);
      }
    }
    return { terkirim };
  }

  function mulai() {
    if (!keadaan.aktif) return;
    const wwebjs = 'wwebjs' in cadangan ? cadangan.wwebjs : cobaRequire('whatsapp-web.js');
    if (!wwebjs) {
      keadaan.status = 'modul_belum_dipasang';
      keadaan.pesan = 'Paket whatsapp-web.js belum terpasang. Jalankan: npm install';
      console.log(`[WA] ${keadaan.pesan}`);
      return;
    }
    const qrcode = 'qrcode' in cadangan ? cadangan.qrcode : cobaRequire('qrcode');
    const qrTerminal = 'qrTerminal' in cadangan ? cadangan.qrTerminal : cobaRequire('qrcode-terminal');

    klien = new wwebjs.Client({
      authStrategy: new wwebjs.LocalAuth({ dataPath: konfig.waFolderSesi }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...(konfig.waChromePath ? { executablePath: konfig.waChromePath } : {}),
      },
    });

    klien.on('qr', async (qr) => {
      keadaan.status = 'menunggu_qr';
      keadaan.pesan = 'Pindai QR dengan WhatsApp di HP: Perangkat tertaut, Tautkan perangkat.';
      keadaan.qrGambar = qrcode ? await qrcode.toDataURL(qr, { margin: 1, width: 280 }) : null;
      console.log('[WA] Pindai QR ini dengan WhatsApp (Perangkat tertaut), atau buka tab WhatsApp di /rekap:');
      if (qrTerminal) qrTerminal.generate(qr, { small: true });
    });
    klien.on('authenticated', () => {
      keadaan.status = 'terautentikasi';
      keadaan.pesan = 'Login berhasil, memuat WhatsApp...';
      keadaan.qrGambar = null;
    });
    klien.on('ready', () => {
      keadaan.status = 'siap';
      keadaan.nomorTerhubung = klien.info && klien.info.wid ? klien.info.wid.user : null;
      keadaan.pesan = 'Terhubung. Notifikasi akan dikirim ke nomor admin.';
      console.log(`[WA] Siap, terhubung sebagai ${keadaan.nomorTerhubung || '(tidak diketahui)'}`);
    });
    klien.on('auth_failure', (pesan) => {
      keadaan.status = 'gagal';
      keadaan.pesan = `Login WhatsApp gagal: ${pesan}. Hapus folder ${konfig.waFolderSesi} lalu jalankan ulang.`;
      console.log(`[WA] ${keadaan.pesan}`);
    });
    klien.on('disconnected', (alasan) => {
      keadaan.status = 'terputus';
      keadaan.pesan = `Terputus (${alasan}). Jalankan ulang server untuk memindai QR lagi.`;
      console.log(`[WA] ${keadaan.pesan}`);
    });

    klien.initialize().catch((err) => {
      keadaan.status = 'gagal';
      keadaan.pesan = `Gagal menjalankan WhatsApp Web: ${err.message}`;
      console.log(`[WA] ${keadaan.pesan}`);
    });
  }

  async function tutup() {
    if (klien) await klien.destroy().catch(() => {});
  }

  return { mulai, status, kirimKeAdmin, tutup };
}

function folderSesiBawaan() {
  return path.join(__dirname, '..', 'data', 'wa-sesi');
}

module.exports = { buatWa, normalkanTujuan, folderSesiBawaan };
