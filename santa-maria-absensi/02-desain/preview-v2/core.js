/* Mesin bersama untuk lima papan mockup: data contoh, bingkai perangkat (HP dan laptop),
   alur absen yang berjalan sendiri, dan bilah navigasi papan.
   Tiap tema mendaftarkan layarnya lewat SM2.register(). */
(function () {
  var SM2 = (window.SM2 = { themes: {} });
  SM2.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Data ----------
  // Fakta sekolah dari sumber publik. Selain blok school, semuanya data contoh.
  var bulan = [
    [1, 'Sel', 'H', '06.39'], [2, 'Rab', 'H', '06.42'], [3, 'Kam', 'H', '06.36'], [4, 'Jum', 'H', '06.45'],
    [7, 'Sen', 'H', '06.41'], [8, 'Sel', 'T', '06.58'], [9, 'Rab', 'S', ''], [10, 'Kam', 'H', '06.37'], [11, 'Jum', 'H', '06.44'],
    [14, 'Sen', 'H', '06.40'], [15, 'Sel', 'H', '06.43'], [16, 'Rab', 'H', '06.38'], [17, 'Kam', 'H', '06.46'], [18, 'Jum', 'H', '06.41'],
    [21, 'Sen', 'H', '06.38'], [22, 'Sel', 'H', '06.44'], [23, 'Rab', 'T', '06.59'], [24, 'Kam', 'H', '06.40'], [25, 'Jum', 'H', '06.41'],
    [28, 'Sen', '', ''], [29, 'Sel', '', ''], [30, 'Rab', '', '']
  ].map(function (r) { return { d: r[0], h: r[1], k: r[2], j: r[3], today: r[0] === 25, future: r[0] > 25 }; });

  function menit(j) { var p = j.split('.'); return +p[0] * 60 + +p[1]; }
  function fmt(m) { m = Math.round(m); return ('0' + Math.floor(m / 60)).slice(-2) + '.' + ('0' + (m % 60)).slice(-2); }
  var lewat = bulan.filter(function (x) { return !x.future; });
  var jams = lewat.filter(function (x) { return x.j; }).map(function (x) { return menit(x.j); });
  var ringkas = { H: 0, T: 0, S: 0, I: 0, A: 0 };
  lewat.forEach(function (x) { ringkas[x.k]++; });
  ringkas.hari = lewat.length;
  ringkas.hadir = ringkas.H + ringkas.T;
  ringkas.rata = fmt(jams.reduce(function (a, b) { return a + b; }, 0) / jams.length);
  ringkas.pagi = fmt(Math.min.apply(null, jams));

  SM2.data = {
    school: { nama: 'SMA Santa Maria 1', kota: 'Bandung', alamat: 'Jl. Bengawan No. 6', bel: '06.55', telp: '(022) 7205804', radius: 75, yayasan: 'Yayasan Salib Suci' },
    siswa: { nama: 'Nama Siswa', inisial: 'NS', kelas: 'XI-3' },
    now: '06.41', nowOrtu: '10.15',
    tanggal: 'Jumat, 25 September 2026', tglPendek: 'Jum, 25 Sep',
    minggu: bulan.filter(function (x) { return x.d >= 21 && x.d <= 25; }),
    bulan: bulan, ringkas: ringkas,
    izin: [{ jenis: 'Sakit', hari: 'Rab, 9 Sep', status: 'Disetujui wali kelas' }],
    hariIzin: [['Sen', '28'], ['Sel', '29'], ['Rab', '30'], ['Kam', '1'], ['Jum', '2']]
  };
  SM2.menit = menit; SM2.fmt = fmt;
  SM2.sebelumBel = function (j) { return menit(SM2.data.school.bel) - menit(j); };
  SM2.label = { H: 'Hadir', T: 'Terlambat', S: 'Sakit', I: 'Izin', A: 'Alpa', '': 'Belum' };

  // ---------- Tema ----------
  SM2.register = function (id, def) { def.id = id; SM2.themes[id] = def; };
  var loaded = {};
  SM2.ensure = function (id) {
    if (loaded[id]) return; loaded[id] = 1;
    var t = SM2.themes[id];
    if (t.fonts) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = t.fonts; document.head.appendChild(l); }
    var s = document.createElement('style'); s.textContent = t.css; document.head.appendChild(s);
  };

  // ---------- Bingkai perangkat ----------
  var frameCss = '' +
    '.dev{display:block;position:relative}' +
    '.dev-body{position:relative;background:#141519;box-shadow:inset 0 0 0 1.5px #2c2e35,0 30px 60px -30px rgba(0,0,0,.55),0 10px 22px -12px rgba(0,0,0,.35)}' +
    '.dev-phone .dev-body{padding:3.4%;border-radius:15% / 7%}' +
    '.dev-phone .dev-view{border-radius:12.5% / 5.8%;aspect-ratio:390/844}' +
    '.dev-view{position:relative;overflow:hidden;width:100%;background:#000;isolation:isolate}' +
    '.dev .scr{position:absolute;left:0;top:0;transform:scale(var(--s,1));transform-origin:0 0;overflow:hidden}' +
    '.dev-phone .scr{width:390px;height:844px}' +
    '.dev-island{position:absolute;z-index:30;top:1.3%;left:50%;width:31%;height:3.7%;transform:translateX(-50%);background:#050507;border-radius:999px;pointer-events:none}' +
    '.dev-laptop .dev-body{padding:2.4% 2.4% 2.6%;border-radius:3.2% / 5%}' +
    '.dev-laptop .dev-view{aspect-ratio:1280/800;border-radius:.6%}' +
    '.dev-laptop .scr{width:1280px;height:800px}' +
    '.dev-base{position:relative;height:0;padding-bottom:3.4%;width:112%;margin-left:-6%;background:linear-gradient(#c9ccd3,#8e929b);border-radius:0 0 40% 40% / 0 0 100% 100%}' +
    '.dev-base::after{content:"";position:absolute;left:42%;right:42%;top:0;height:35%;background:#9ca0a8;border-radius:0 0 8px 8px}' +
    '.sb{position:absolute;z-index:25;top:0;left:0;right:0;height:50px;display:flex;align-items:center;justify-content:space-between;padding:6px 34px 0 40px;font:600 16px/1 system-ui,-apple-system,sans-serif;pointer-events:none}' +
    '.sb svg{height:13px;width:auto;margin-left:6px}' +
    '.sb-light{color:#fff}.sb-dark{color:#111}' +
    '.dev-cap{margin-top:14px;text-align:center}' +
    '@media (prefers-reduced-motion:reduce){.scr *,.scr *::before,.scr *::after{animation-duration:0s!important;animation-iteration-count:1!important;transition:none!important}}';
  var fs = document.createElement('style'); fs.textContent = frameCss; document.head.appendChild(fs);

  var sbIcons = '<svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>' +
    '<svg viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.6 6.6 0 0 1 9.2 0l-1.5 1.5a4.5 4.5 0 0 0-6.2 0zM1 4.4a10 10 0 0 1 14 0l-1.5 1.5a7.9 7.9 0 0 0-11 0z" fill="currentColor"/></svg>' +
    '<svg viewBox="0 0 27 12" aria-hidden="true"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2.2" y="2.2" width="17" height="7.6" rx="1.6" fill="currentColor"/><rect x="24.6" y="4" width="1.8" height="4" rx=".8" fill="currentColor" opacity=".5"/></svg>';

  var ro = ('ResizeObserver' in window) ? new ResizeObserver(function (es) {
    es.forEach(function (e) { var v = e.target; if (e.contentRect.width) v.style.setProperty('--s', e.contentRect.width / v._base); });
  }) : null;
  function fit(v, base) { v._base = base; if (v.clientWidth) v.style.setProperty('--s', v.clientWidth / base); if (ro) ro.observe(v); }

  function mount(host, themeId, screen, opts, kind) {
    opts = opts || {};
    SM2.ensure(themeId);
    var t = SM2.themes[themeId], sc = t.screens[screen];
    if (!sc) throw new Error('Layar ' + screen + ' tidak ada di tema ' + themeId);
    var tone = typeof sc.tone === 'function' ? sc.tone(opts) : (sc.tone || 'dark');
    host.classList.add('dev', 'dev-' + kind);
    var inner = '<div class="scr t-' + themeId + '" data-screen="' + screen + '">' + sc.html(opts) + (kind === 'phone' ? '<div class="sb sb-' + tone + '"><span>' + (opts.time || SM2.data.now) + '</span><span>' + sbIcons + '</span></div>' : '') + '</div>';
    host.innerHTML = '<div class="dev-body"><div class="dev-view">' + inner + (kind === 'phone' ? '<span class="dev-island" aria-hidden="true"></span>' : '') + '</div></div>' + (kind === 'laptop' ? '<div class="dev-base" aria-hidden="true"></div>' : '');
    var view = host.querySelector('.dev-view'), root = host.querySelector('.scr');
    fit(view, kind === 'phone' ? 390 : 1280);
    if (!opts.live) { root.setAttribute('inert', ''); root.setAttribute('aria-hidden', 'true'); if (opts.label) { host.setAttribute('role', 'img'); host.setAttribute('aria-label', opts.label); } }
    if (sc.mount) sc.mount(root, opts);
    return root;
  }
  SM2.phone = function (host, themeId, screen, opts) { return mount(host, themeId, screen, opts, 'phone'); };
  SM2.laptop = function (host, themeId, screen, opts) { return mount(host, themeId, screen, opts, 'laptop'); };

  // Pasang semua [data-dev] di halaman: data-dev="phone|laptop", data-theme, data-screen, data-state, data-live
  SM2.mountAll = function (scope) {
    (scope || document).querySelectorAll('[data-dev]').forEach(function (el) {
      var o = { state: el.getAttribute('data-state') || undefined, live: el.hasAttribute('data-live'), label: el.getAttribute('data-label') || '', variant: el.getAttribute('data-variant') || undefined };
      (el.getAttribute('data-dev') === 'laptop' ? SM2.laptop : SM2.phone)(el, el.getAttribute('data-theme'), el.getAttribute('data-screen'), o);
    });
  };

  // ---------- Alur absen ----------
  // idle -> gps -> wifi -> ready -> done, berulang kalau auto. Tema menata tampilan lewat [data-state].
  SM2.flow = function (root, opts) {
    opts = opts || {};
    var states = ['idle', 'gps', 'wifi', 'ready', 'done'];
    var dur = { idle: 1800, gps: 2000, wifi: 1600, ready: opts.readyDur || 1900, done: 3600 };
    var start = opts.state || 'idle', i = states.indexOf(start), timer = null, auto = !!opts.auto && !SM2.reduced, api;
    function set(s) {
      root.setAttribute('data-state', s);
      var live = root.querySelector('[data-live-text]');
      if (live && opts.say) live.textContent = opts.say(s);
      if (opts.onState) opts.onState(s, api);
    }
    function schedule() { clearTimeout(timer); if (auto && i >= 0) timer = setTimeout(function () { go(states[(i + 1) % states.length]); }, dur[states[i]]); }
    function go(s) {
      if (SM2.reduced && (s === 'gps' || s === 'wifi')) s = 'ready';
      i = states.indexOf(s); set(s); schedule();
    }
    api = { go: go, get state() { return states[i] || start; }, pause: function () { clearTimeout(timer); }, resume: schedule, auto: auto };
    set(start); schedule();
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b && root.contains(b)) go(b.getAttribute('data-go')); });
    return api;
  };
  SM2.sayDefault = function (s) {
    return { idle: 'Siap mengecek lokasi', gps: 'Mengecek lokasi GPS', wifi: 'Lokasi cocok. Mengecek WiFi sekolah', ready: 'Lokasi dan WiFi cocok. Siap absen', done: 'Hadir, tercatat pukul 06.41', fail: 'Di luar area sekolah' }[s] || '';
  };

  // ---------- Kerangka papan (dipakai kelima halaman mockup) ----------
  var boardCss = '' +
    '.b-sec{position:relative;padding-block:72px;padding-inline:16px}' +
    '.b-in{max-width:1280px;margin:0 auto;position:relative}' +
    '.b-row{display:flex;gap:28px;justify-content:center;align-items:flex-start}' +
    '.b-ph{width:var(--pw,250px);flex:none;position:relative}' +
    '.b-lt{width:min(100%,var(--lw,860px));flex:none;position:relative}' +
    '.b-cap{margin-top:14px;text-align:center;font-size:13px;line-height:1.3}' +
    '.b-lab{font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700}' +
    '@media (max-width:980px){.b-row.scroll{justify-content:flex-start;overflow-x:auto;scroll-snap-type:x mandatory;padding:8px 16px 16px;margin-inline:-16px}.b-row.scroll>*{scroll-snap-align:center}.b-ph{--pw:220px}}' +
    '@media (max-width:560px){.b-sec{padding-block:48px}.b-row.wrap{flex-direction:column;align-items:center}}';
  var bs = document.createElement('style'); bs.textContent = boardCss; document.head.appendChild(bs);

  // ---------- Bilah navigasi papan ----------
  SM2.boards = [
    { no: 1, id: 'kaca', file: 'm1-kaca-patri.html', name: 'Kaca Patri' },
    { no: 2, id: 'fajar', file: 'm2-fajar.html', name: 'Fajar' },
    { no: 3, id: 'deco', file: 'm3-deco-bengawan.html', name: 'Deco Bengawan' },
    { no: 4, id: 'mading', file: 'm4-mading.html', name: 'Mading' },
    { no: 5, id: 'rosario', file: 'm5-rosario.html', name: 'Rosario' }
  ];
  SM2.chrome = function (current) {
    var css = '.smc{position:sticky;top:env(safe-area-inset-top,0px);z-index:100;background:rgba(18,19,22,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#f1f1ef;font:500 13px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;padding:8px 16px}' +
      '.smc-in{max-width:1320px;margin:0 auto;display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap}' +
      '.smc a{color:inherit;text-decoration:none;min-height:36px;display:inline-flex;align-items:center;border-radius:6px}' +
      '.smc-home{font-weight:700;padding-right:6px}' +
      '.smc nav{display:flex;gap:4px;flex-wrap:wrap}' +
      '.smc nav a{padding:4px 10px;border:1px solid #3a3c43;color:#c4c6cc}' +
      '.smc nav a b{color:#f1f1ef;margin-right:6px}' +
      '.smc nav a[aria-current="page"]{background:#f1f1ef;color:#141519;border-color:#f1f1ef}.smc nav a[aria-current="page"] b{color:#141519}' +
      '.smc-r{margin-left:auto;display:flex;gap:14px;align-items:center}' +
      '.smc-note{color:#a9abb2}' +
      '.smc-doc{padding:4px 12px;background:#f1f1ef;color:#141519!important;font-weight:700}' +
      '.smc a:focus-visible{outline:2px solid #ffd257;outline-offset:2px}' +
      '@media (max-width:820px){.smc nav a span{display:none}.smc-note{display:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement('header'); bar.className = 'smc';
    bar.innerHTML = '<div class="smc-in"><a class="smc-home" href="index.html">Absensi SM1</a><nav aria-label="Lima desain">' +
      SM2.boards.map(function (b) { return '<a href="' + b.file + '"' + (b.id === current ? ' aria-current="page"' : '') + ' title="' + b.name + '"><b>' + b.no + '</b><span>' + b.name + '</span></a>'; }).join('') +
      '</nav><div class="smc-r"><span class="smc-note">Data contoh</span><a class="smc-doc" href="catatan.html">Catatan desain</a></div></div>';
    document.body.insertBefore(bar, document.body.firstChild);
  };
})();
