/* Data dan logika bersama untuk lima arah desain absensi SMA Santa Maria 1.
   Tiap halaman desain hanya mengurus tampilan; simulasi, data contoh, dan
   panel demo ada di sini supaya kelimanya dibandingkan dengan isi yang sama. */
(function () {
  var SM = (window.SM = {});

  // Fakta sekolah dari sumber publik (lihat 01-riset). Selain ini, semua data contoh.
  SM.school = {
    nama: 'SMA Santa Maria 1 Bandung',
    pendek: 'SMA Santa Maria 1',
    alamat: 'Jl. Bengawan No. 6, Cihapit, Bandung Wetan',
    kota: 'Kota Bandung 40114',
    telp: '(022) 7205804',
    lat: -6.9114,
    lng: 107.6315,
    yayasan: 'Yayasan Salib Suci',
    bel: '06.55',
    hari: 'Senin sampai Jumat',
    ekskul: 'Rabu, Kamis, Jumat',
    radius: 75 // usulan desain, bukan aturan sekolah
  };

  SM.designs = [
    { id: 'd1', no: 1, file: 'd1-putih-abu.html', name: 'Putih Abu-Abu' },
    { id: 'd2', no: 2, file: 'd2-buku-penghubung.html', name: 'Buku Penghubung' },
    { id: 'd3', no: 3, file: 'd3-kartu-pelajar.html', name: 'Kartu Pelajar' },
    { id: 'd4', no: 4, file: 'd4-papan-tulis.html', name: 'Papan Tulis' },
    { id: 'd5', no: 5, file: 'd5-jam-pelajaran.html', name: 'Jam Pelajaran' }
  ];

  SM.screens = {
    absen: { label: 'Absen', role: 'siswa' },
    'riwayat-siswa': { label: 'Riwayat', role: 'siswa' },
    pantau: { label: 'Hari ini', role: 'ortu' },
    izin: { label: 'Izin', role: 'ortu' },
    'riwayat-ortu': { label: 'Riwayat', role: 'ortu' }
  };
  SM.nav = { siswa: ['absen', 'riwayat-siswa'], ortu: ['pantau', 'izin', 'riwayat-ortu'] };
  SM.roleLabel = { siswa: 'Siswa', ortu: 'Orang tua' };

  // ---------- Hari demo ----------
  SM.today = { y: 2026, m: 9, d: 25, label: 'Jumat, 25 September 2026', pendek: 'Jum 25 Sep' };
  SM.jamDemo = {
    pagi: { jam: '06.41', label: '06.41, sebelum bel' },
    telat: { jam: '07.03', label: '07.03, lewat bel' }
  };
  SM.jamOrtu = '10.15';

  SM.scenarios = {
    sekolah: { label: 'Di sekolah', gps: { s: 'ok', jarak: 23, akurasi: 9 }, net: { s: 'ok' } },
    tanpawifi: { label: 'Tanpa WiFi sekolah', gps: { s: 'ok', jarak: 31, akurasi: 12 }, net: { s: 'fail' } },
    luar: { label: 'Di luar area', gps: { s: 'fail', jarak: 1400, akurasi: 15 }, net: { s: 'fail' } },
    gpsmati: { label: 'Izin lokasi ditolak', gps: { s: 'error' }, net: { s: 'ok' } }
  };

  SM.state = {
    scenario: 'sekolah',
    jam: 'pagi',
    check: { status: 'idle', gps: 'idle', net: 'idle' },
    masuk: null,
    anak: 'masuk',
    notif: { masuk: true, pulang: true, telat: true, belum: true },
    izin: [
      { id: 1, jenis: 'Sakit', hari: ['Rab 9 Sep'], ket: 'Demam, istirahat di rumah.', status: 'Disetujui wali kelas', lampiran: 'surat-dokter.jpg' }
    ]
  };

  // ---------- Event kecil ----------
  var subs = {};
  SM.on = function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); };
  SM.emit = function (ev) { (subs[ev] || []).forEach(function (fn) { fn(); }); if (ev !== 'any') SM.emit('any'); };

  // ---------- Format ----------
  SM.jarak = function (m) { return m >= 1000 ? String((m / 1000).toFixed(1)).replace('.', ',') + ' km' : m + ' m'; };
  SM.menit = function (jam) { var p = jam.split('.'); return +p[0] * 60 + +p[1]; };
  SM.telatMenit = function (jam) { return Math.max(0, SM.menit(jam) - SM.menit(SM.school.bel)); };
  SM.sisaBel = function (jam) { return SM.menit(SM.school.bel) - SM.menit(jam); };
  SM.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };

  // ---------- Pesan verifikasi (dipakai semua desain) ----------
  SM.msg = {
    gps: function () {
      var st = SM.state.check.gps, g = SM.scenarios[SM.state.scenario].gps;
      if (st === 'idle') return { s: 'idle', t: 'Lokasi GPS', d: 'Belum dicek' };
      if (st === 'checking') return { s: 'checking', t: 'Lokasi GPS', d: 'Mencari posisi HP...' };
      if (g.s === 'ok') return { s: 'ok', t: 'Di dalam area sekolah', d: SM.jarak(g.jarak) + ' dari titik Jl. Bengawan 6, akurasi ±' + g.akurasi + ' m' };
      if (g.s === 'fail') return { s: 'fail', t: 'Di luar area sekolah', d: SM.jarak(g.jarak) + ' dari sekolah. Absen hanya bisa dalam radius ' + SM.school.radius + ' m.' };
      return { s: 'error', t: 'Izin lokasi ditolak', d: 'Buka pengaturan browser, izinkan lokasi untuk situs ini, lalu cek ulang.' };
    },
    net: function () {
      var st = SM.state.check.net, n = SM.scenarios[SM.state.scenario].net;
      if (st === 'idle') return { s: 'idle', t: 'Jaringan WiFi', d: 'Belum dicek' };
      if (st === 'waiting') return { s: 'idle', t: 'Jaringan WiFi', d: 'Menunggu cek lokasi' };
      if (st === 'checking') return { s: 'checking', t: 'Jaringan WiFi', d: 'Mencocokkan jaringan sekolah...' };
      if (n.s === 'ok') return { s: 'ok', t: 'Terhubung ke WiFi sekolah', d: 'Jaringan dikenali dari alamat IP sekolah' };
      return { s: 'fail', t: 'Bukan WiFi sekolah', d: 'Sambungkan HP ke WiFi sekolah, lalu cek ulang.' };
    }
  };

  // ---------- Simulasi cek dan absen ----------
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  SM.runCheck = function () {
    clearTimers();
    var c = SM.state.check;
    SM.state.masuk = null;
    c.status = 'checking'; c.gps = 'checking'; c.net = 'waiting';
    SM.emit('check');
    later(function () {
      c.gps = 'done'; c.net = 'checking'; SM.emit('check');
      later(function () {
        c.net = 'done';
        var sc = SM.scenarios[SM.state.scenario];
        c.status = sc.gps.s === 'ok' && sc.net.s === 'ok' ? 'ready' : 'blocked';
        SM.emit('check');
      }, 650);
    }, 900);
  };

  SM.checkIn = function () {
    if (SM.state.check.status !== 'ready') return;
    SM.state.check.status = 'saving';
    SM.emit('check');
    later(function () {
      var jam = SM.jamDemo[SM.state.jam].jam;
      SM.state.masuk = { jam: jam, telat: SM.telatMenit(jam) };
      SM.state.check.status = 'done';
      SM.state.anak = 'masuk';
      SM.emit('check');
    }, 700);
  };

  SM.resetCheck = function () {
    clearTimers();
    SM.state.check = { status: 'idle', gps: 'idle', net: 'idle' };
    SM.state.masuk = null;
    SM.emit('check');
  };

  // Ringkasan status anak untuk layar orang tua
  SM.anakHariIni = function () {
    var a = SM.state.anak;
    if (a === 'belum') return { k: 'belum', t: 'Belum absen', d: 'Bel masuk ' + SM.school.bel + '. Kalau sampai 07.15 belum ada absen, kami kirim pesan WhatsApp.' };
    if (a === 'sakit') return { k: 'S', t: 'Sakit, izin sudah dikirim', d: 'Pengajuan hari ini menunggu persetujuan wali kelas.' };
    var m = SM.state.masuk || { jam: '06.41', telat: 0 };
    return m.telat
      ? { k: 'T', jam: m.jam, t: 'Masuk ' + m.jam + ', terlambat ' + m.telat + ' menit', d: 'Tercatat lewat GPS dan WiFi sekolah.' }
      : { k: 'H', jam: m.jam, t: 'Masuk ' + m.jam + ', tepat waktu', d: 'Tercatat lewat GPS dan WiFi sekolah.' };
  };

  // ---------- Data rekap (contoh) ----------
  SM.kode = {
    H: { label: 'Hadir', panjang: 'Hadir tepat waktu' },
    T: { label: 'Terlambat', panjang: 'Hadir, terlambat' },
    S: { label: 'Sakit', panjang: 'Sakit, dengan surat' },
    I: { label: 'Izin', panjang: 'Izin orang tua' },
    A: { label: 'Alpa', panjang: 'Tanpa keterangan' },
    L: { label: 'Libur', panjang: 'Libur' }
  };

  function rec(k, jam, extra) { var r = { k: k }; if (jam) r.jam = jam; if (extra) r.note = extra; return r; }
  SM.months = {
    '2026-08': {
      label: 'Agustus 2026', y: 2026, m: 8,
      days: {
        3: rec('H', '06.43'), 4: rec('H', '06.40'), 5: rec('H', '06.47'), 6: rec('H', '06.39'), 7: rec('H', '06.44'),
        10: rec('H', '06.41'), 11: rec('H', '06.36'), 12: rec('T', '07.01'), 13: rec('H', '06.45'), 14: rec('I', null, 'Acara keluarga'),
        17: rec('L', null, 'HUT RI ke-81'), 18: rec('H', '06.42'), 19: rec('H', '06.38'), 20: rec('H', '06.44'), 21: rec('H', '06.40'),
        24: rec('H', '06.37'), 25: rec('H', '06.43'), 26: rec('H', '06.46'), 27: rec('H', '06.39'), 28: rec('H', '06.41'),
        31: rec('H', '06.44')
      }
    },
    '2026-09': {
      label: 'September 2026', y: 2026, m: 9,
      days: {
        1: rec('H', '06.39'), 2: rec('H', '06.42'), 3: rec('H', '06.36'), 4: rec('H', '06.45'),
        7: rec('H', '06.41'), 8: rec('T', '06.58'), 9: rec('S', null, 'Demam, surat dokter'), 10: rec('H', '06.37'), 11: rec('H', '06.44'),
        14: rec('H', '06.40'), 15: rec('H', '06.43'), 16: rec('H', '06.38'), 17: rec('H', '06.46'), 18: rec('H', '06.41'),
        21: rec('H', '06.38'), 22: rec('H', '06.44'), 23: rec('T', '06.59'), 24: rec('H', '06.40')
      }
    },
    '2026-10': { label: 'Oktober 2026', y: 2026, m: 10, days: {} }
  };
  SM.monthOrder = ['2026-08', '2026-09', '2026-10'];

  SM.hariNama = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  SM.hariPanjang = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  SM.bulanPendek = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function todayRec() {
    // Siswa melihat hasil simulasinya sendiri; orang tua melihat status dari panel demo
    if (SM.role() === 'siswa') return SM.state.masuk ? rec(SM.state.masuk.telat ? 'T' : 'H', SM.state.masuk.jam) : null;
    if (SM.state.anak === 'sakit') return rec('S', null, 'Izin sakit, menunggu wali kelas');
    if (SM.state.anak === 'belum' && !SM.state.masuk) return null;
    var m = SM.state.masuk || { jam: '06.41', telat: 0 };
    return rec(m.telat ? 'T' : 'H', m.jam);
  }

  SM.record = function (ym, d) {
    var mo = SM.months[ym];
    if (ym === '2026-09' && d === SM.today.d) return todayRec();
    return mo.days[d] || null;
  };

  // Minggu Senin sampai Jumat saja: hari sekolah
  SM.weeks = function (ym) {
    var mo = SM.months[ym], y = mo.y, m = mo.m;
    var lastDate = new Date(y, m, 0);
    var cur = new Date(y, m - 1, 1);
    cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));
    var weeks = [];
    while (cur <= lastDate) {
      var wk = [];
      for (var i = 0; i < 5; i++) {
        var dt = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + i);
        var inMonth = dt.getMonth() === m - 1, d = dt.getDate();
        var isToday = inMonth && y === SM.today.y && m === SM.today.m && d === SM.today.d;
        var future = y > SM.today.y || (y === SM.today.y && (m > SM.today.m || (m === SM.today.m && d > SM.today.d)));
        wk.push({ d: d, inMonth: inMonth, today: isToday, future: inMonth && future, dow: dt.getDay(), rec: inMonth ? SM.record(ym, d) : null });
      }
      if (wk.some(function (x) { return x.inMonth; })) weeks.push(wk);
      cur.setDate(cur.getDate() + 7);
    }
    return weeks;
  };

  SM.summary = function (ym) {
    var c = { H: 0, T: 0, S: 0, I: 0, A: 0, hari: 0 };
    SM.weeks(ym).forEach(function (wk) {
      wk.forEach(function (x) {
        if (!x.inMonth || !x.rec || x.rec.k === 'L') return;
        c[x.rec.k]++; c.hari++;
      });
    });
    c.hadir = c.H + c.T;
    return c;
  };

  SM.tanggalPanjang = function (ym, d) {
    var mo = SM.months[ym], dt = new Date(mo.y, mo.m - 1, d);
    return SM.hariPanjang[dt.getDay()] + ', ' + d + ' ' + mo.label;
  };

  SM.detail = function (ym, x) {
    var tgl = SM.tanggalPanjang(ym, x.d);
    if (x.future) return tgl + ': belum berjalan';
    if (!x.rec) return x.today ? tgl + ': belum ada absen' : tgl + ': tidak ada catatan';
    var r = x.rec, k = SM.kode[r.k];
    if (r.k === 'H') return tgl + ': masuk ' + r.jam + ', tepat waktu, lewat GPS dan WiFi sekolah';
    if (r.k === 'T') return tgl + ': masuk ' + r.jam + ', terlambat ' + SM.telatMenit(r.jam) + ' menit';
    return tgl + ': ' + k.panjang + (r.note ? ' (' + r.note + ')' : '');
  };

  // Muat rekap bulan: loading, lalu ok, kosong, atau gagal (Agustus gagal sekali untuk menunjukkan keadaan error)
  var augustFailed = false;
  SM.loadMonth = function (ym, cb) {
    cb({ status: 'loading' });
    setTimeout(function () {
      if (ym === '2026-08' && !augustFailed) { augustFailed = true; cb({ status: 'error' }); return; }
      var s = SM.summary(ym);
      if (!s.hari && ym === '2026-10') { cb({ status: 'empty' }); return; }
      cb({ status: 'ok', summary: s, weeks: SM.weeks(ym) });
    }, 650);
  };

  // Minggu ini untuk layar orang tua
  SM.mingguIni = function () {
    return [21, 22, 23, 24, 25].map(function (d, i) {
      var x = { d: d, nama: SM.hariNama[i + 1], today: d === SM.today.d };
      x.rec = SM.record('2026-09', d);
      return x;
    });
  };

  // Pilihan hari untuk form izin (minggu depan)
  SM.hariIzin = [
    { id: '2026-09-28', label: 'Sen 28 Sep' }, { id: '2026-09-29', label: 'Sel 29 Sep' }, { id: '2026-09-30', label: 'Rab 30 Sep' },
    { id: '2026-10-01', label: 'Kam 1 Okt' }, { id: '2026-10-02', label: 'Jum 2 Okt' }
  ];

  SM.validateIzin = function (f) {
    var e = {};
    if (!f.jenis) e.jenis = 'Pilih jenis: sakit atau izin.';
    if (!f.hari || !f.hari.length) e.hari = 'Pilih minimal satu hari.';
    if (!f.ket || f.ket.trim().length < 10) e.ket = 'Tulis keterangan minimal 10 huruf, misalnya gejala atau keperluannya.';
    return e;
  };

  SM.submitIzin = function (f, cb) {
    setTimeout(function () {
      SM.state.izin.unshift({ id: Date.now(), jenis: f.jenis, hari: f.hari.slice(), ket: f.ket.trim(), status: 'Menunggu wali kelas', lampiran: f.lampiran || '' });
      cb();
      SM.emit('izin');
    }, 800);
  };

  // Form izin: tiap desain memakai nama field yang sama (jenis, hari, ket, lampiran)
  // dan menaruh pesan error di elemen [data-err="nama"]. Status kirim di [data-status].
  SM.bindIzinForm = function (form, onSent) {
    function read() {
      var fd = new FormData(form), file = form.querySelector('[name="lampiran"]');
      return { jenis: fd.get('jenis') || '', hari: fd.getAll('hari'), ket: fd.get('ket') || '', lampiran: file && file.files[0] ? file.files[0].name : '' };
    }
    function show(errs) {
      ['jenis', 'hari', 'ket'].forEach(function (k) {
        var el = form.querySelector('[data-err="' + k + '"]');
        if (el) { el.textContent = errs[k] || ''; el.hidden = !errs[k]; }
        form.querySelectorAll('[name="' + k + '"]').forEach(function (f) { if (errs[k]) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); });
      });
    }
    var file = form.querySelector('[name="lampiran"]'), fileOut = form.querySelector('[data-file]');
    if (file && fileOut) file.addEventListener('change', function () { fileOut.textContent = file.files[0] ? file.files[0].name : 'Belum ada berkas'; });
    form.addEventListener('change', function () { if (form.getAttribute('data-tried')) show(SM.validateIzin(read())); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.setAttribute('data-tried', '1');
      var f = read(), errs = SM.validateIzin(f), status = form.querySelector('[data-status]'), btn = form.querySelector('[type="submit"]');
      show(errs);
      var keys = Object.keys(errs);
      if (keys.length) {
        if (status) { status.textContent = 'Periksa lagi: ada ' + keys.length + ' isian yang belum benar.'; status.setAttribute('data-kind', 'error'); }
        var first = form.querySelector('[name="' + keys[0] + '"]'); if (first) first.focus();
        return;
      }
      if (btn) { btn.disabled = true; btn.setAttribute('data-label', btn.textContent); btn.textContent = 'Mengirim...'; }
      if (status) { status.textContent = 'Mengirim ke wali kelas...'; status.setAttribute('data-kind', 'loading'); }
      SM.submitIzin(f, function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-label'); }
        form.reset(); form.removeAttribute('data-tried');
        if (fileOut) fileOut.textContent = 'Belum ada berkas';
        if (status) { status.textContent = 'Terkirim. Wali kelas XI-3 akan meninjau, statusnya muncul di daftar bawah.'; status.setAttribute('data-kind', 'ok'); }
        if (onSent) onSent(f);
      });
    });
  };

  // ---------- Salin teks ----------
  SM.copy = function (text, btn) {
    var done = function (ok) {
      if (!btn) return;
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? 'Tersalin' : 'Pilih teks lalu salin';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    try {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } catch (e) { done(false); }
  };

  // ---------- Router lewat hash ----------
  SM.screen = function () {
    var h = (location.hash || '').slice(1);
    return SM.screens[h] ? h : 'absen';
  };
  SM.role = function () { return SM.screens[SM.screen()].role; };
  SM.go = function (s) { if (SM.screens[s]) location.hash = s; };
  window.addEventListener('hashchange', function () { SM.emit('screen'); });

  // ---------- Panel demo (chrome netral di atas tiap desain) ----------
  var css = '' +
    '.smx{--smx-bg:#1c1d20;--smx-fg:#f3f3f1;--smx-mut:#b9bbc0;--smx-line:#3a3c42;--smx-on:#f3f3f1;--smx-onfg:#1c1d20;background:var(--smx-bg);color:var(--smx-fg);font:13px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:8px 16px;position:relative;z-index:50}' +
    '.smx *{box-sizing:border-box}' +
    '.smx a,.smx button{font:inherit;color:inherit}' +
    '.smx-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;max-width:1280px;margin:0 auto}' +
    '.smx-home{text-decoration:none;font-weight:600;padding:8px 10px 8px 0;min-height:36px;display:inline-flex;align-items:center;border-radius:6px}' +
    '.smx-home:hover{text-decoration:underline}' +
    '.smx-designs{display:flex;gap:4px;flex-wrap:wrap}' +
    '.smx-designs a{display:inline-flex;align-items:center;gap:6px;min-height:36px;min-width:36px;justify-content:center;padding:4px 10px;border-radius:6px;border:1px solid var(--smx-line);text-decoration:none;color:var(--smx-mut)}' +
    '.smx-designs a b{font-weight:700;color:var(--smx-fg)}' +
    '.smx-designs a[aria-current="page"]{background:var(--smx-on);color:var(--smx-onfg);border-color:var(--smx-on)}' +
    '.smx-designs a[aria-current="page"] b{color:var(--smx-onfg)}' +
    '.smx-designs a:hover{border-color:var(--smx-mut)}' +
    '.smx-toggle{margin-left:auto;min-height:36px;padding:4px 12px;border-radius:6px;border:1px solid var(--smx-line);background:transparent;cursor:pointer}' +
    '.smx-panel{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;max-width:1280px;margin:6px auto 0;padding-top:8px;border-top:1px solid var(--smx-line)}' +
    '.smx-group{display:flex;align-items:center;gap:4px;flex-wrap:wrap}' +
    '.smx-group>span{color:var(--smx-mut);margin-right:4px}' +
    '.smx-group button{min-height:32px;padding:3px 10px;border-radius:6px;border:1px solid var(--smx-line);background:transparent;cursor:pointer;color:var(--smx-mut)}' +
    '.smx-group button[aria-pressed="true"]{background:var(--smx-on);color:var(--smx-onfg);border-color:var(--smx-on);font-weight:600}' +
    '.smx-group button:hover{border-color:var(--smx-mut)}' +
    '.smx-note{color:var(--smx-mut);margin:0}' +
    '.smx a:focus-visible,.smx button:focus-visible{outline:2px solid #ffd257;outline-offset:2px}' +
    '.smx-name{display:none;color:var(--smx-mut)}' +
    '@media (max-width:760px){.smx-designs a span{display:none}.smx-name{display:inline}.smx-panel[data-open="false"]{display:none}}' +
    '@media (min-width:761px){.smx-toggle{display:none}}';

  function group(label, key, opts, current) {
    return '<div class="smx-group" role="group" aria-label="' + label + '"><span>' + label + '</span>' +
      opts.map(function (o) {
        return '<button type="button" data-smx="' + key + '" data-val="' + o[0] + '" aria-pressed="' + (o[0] === current) + '">' + o[1] + '</button>';
      }).join('') + '</div>';
  }

  SM.toolbar = function (designId) {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'smx'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Panel demo');
    document.body.insertBefore(bar, document.body.firstChild);
    var open = false;
    function draw() {
      var s = SM.screen(), role = SM.role(), cur = SM.designs.filter(function (d) { return d.id === designId; })[0];
      var html = '<div class="smx-row"><a class="smx-home" href="index.html">Semua desain</a>' +
        '<nav class="smx-designs" aria-label="Pindah desain, layar tetap sama">' +
        SM.designs.map(function (d) {
          return '<a href="' + d.file + '#' + s + '"' + (d.id === designId ? ' aria-current="page"' : '') + ' title="' + d.name + '"><b>' + d.no + '</b><span>' + d.name + '</span></a>';
        }).join('') + '</nav><span class="smx-name">' + cur.name + '</span>' +
        '<button type="button" class="smx-toggle" aria-expanded="' + open + '" aria-controls="smx-panel">' + (open ? 'Tutup panel' : 'Panel demo') + '</button></div>' +
        '<div class="smx-panel" id="smx-panel" data-open="' + open + '">' +
        group('Lihat sebagai', 'role', [['siswa', 'Siswa'], ['ortu', 'Orang tua']], role);
      if (s === 'absen') {
        html += group('Posisi', 'scenario', Object.keys(SM.scenarios).map(function (k) { return [k, SM.scenarios[k].label]; }), SM.state.scenario) +
          group('Jam', 'jam', [['pagi', '06.41'], ['telat', '07.03']], SM.state.jam);
      }
      if (s === 'pantau') {
        html += group('Status anak', 'anak', [['masuk', 'Sudah masuk'], ['belum', 'Belum absen'], ['sakit', 'Sakit']], SM.state.anak);
      }
      html += '<p class="smx-note">Nama, jam, dan angka di layar ini data contoh.</p></div>';
      bar.innerHTML = html;
    }
    bar.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.classList.contains('smx-toggle')) { open = !open; draw(); bar.querySelector('.smx-toggle').focus(); return; }
      var k = t.getAttribute('data-smx'), v = t.getAttribute('data-val');
      if (k === 'role') { if (v !== SM.role()) SM.go(SM.nav[v][0]); return; }
      if (k === 'scenario' || k === 'jam') { SM.state[k] = v; SM.resetCheck(); draw(); focusBack(k, v); return; }
      if (k === 'anak') { SM.state.anak = v; if (v !== 'masuk') SM.state.masuk = null; SM.emit('anak'); draw(); focusBack(k, v); }
    });
    function focusBack(k, v) { var b = bar.querySelector('[data-smx="' + k + '"][data-val="' + v + '"]'); if (b) b.focus(); }
    SM.on('screen', draw);
    draw();
  };
})();
