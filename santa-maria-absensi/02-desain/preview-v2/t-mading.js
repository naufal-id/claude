/* Tema 4, Mading: majalah dinding di koridor kelas. Papan gabus, kertas, selotip, paku payung, cap, stiker.
   Kartu GPS dan WiFi dicap OK, kartu nama siswa jatuh dan dipaku, lalu dicap HADIR.
   Rekap bulanan = kalender dinding dengan stiker: bintang, jam, plester, amplop. */
(function () {
  var D = SM2.data;
  var ST = {
    H: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l5 10.5 11.5 1.5-8.4 8 2.1 11.5L20 29l-10.2 5.5L11.9 23 3.5 15l11.5-1.5z" fill="#F5B82E" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>',
    T: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="#F08A3C" stroke="#fff" stroke-width="3"/><path d="M20 11v9l6 4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    S: '<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(-35 20 20)"><rect x="3" y="13" width="34" height="14" rx="7" fill="#F2C9A6" stroke="#fff" stroke-width="2.5"/><rect x="14" y="13" width="12" height="14" fill="#E6B089"/><circle cx="17" cy="17" r="1" fill="#C98E62"/><circle cx="23" cy="17" r="1" fill="#C98E62"/><circle cx="17" cy="23" r="1" fill="#C98E62"/><circle cx="23" cy="23" r="1" fill="#C98E62"/></g></svg>',
    I: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="10" width="30" height="21" rx="3" fill="#6FA3F2" stroke="#fff" stroke-width="3"/><path d="M6 12l14 10 14-10" fill="none" stroke="#fff" stroke-width="2.5"/></svg>',
    A: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 9l22 22M31 9L9 31" stroke="#E0413A" stroke-width="6" stroke-linecap="round"/></svg>'
  };
  function pin(color) { return '<span class="pin" style="--pc:' + (color || '#E0413A') + '" aria-hidden="true"></span>'; }
  function tape(rot, w) { return '<span class="tape" style="--r:' + (rot || -4) + 'deg;width:' + (w || 90) + 'px" aria-hidden="true"></span>'; }
  function calendar(w, opts) {
    opts = opts || {};
    var cols = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'], rows = [], week = -1, prev = 9;
    D.bulan.forEach(function (x) { var c = cols.indexOf(x.h); if (c <= prev) { week++; rows[week] = [null, null, null, null, null]; } prev = c; rows[week][c] = x; });
    var cell = (w - 20) / 5, i = 0, s = '';
    s += '<div class="cal-h">' + cols.map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div><div class="cal-g">';
    rows.forEach(function (r) {
      r.forEach(function (x) {
        if (!x) { s += '<span class="cl out"></span>'; return; }
        s += '<span class="cl' + (x.today ? ' today' : '') + (x.future ? ' fut' : '') + '" title="' + x.h + ' ' + x.d + ' Sep: ' + (x.future ? 'belum berjalan' : SM2.label[x.k] + (x.j ? ' ' + x.j : '')) + '"><b>' + x.d + '</b>' + (x.k ? '<i class="stk" style="--i:' + (i++) + ';--r:' + (((x.d * 37) % 30) - 15) + 'deg">' + ST[x.k] + '</i>' : '') + (opts.times && x.j ? '<em>' + x.j + '</em>' : '') + '</span>';
      });
    });
    return '<div class="cal" style="width:' + w + 'px" role="img" aria-label="Kalender September dengan stiker: ' + D.ringkas.H + ' bintang hadir, ' + D.ringkas.T + ' jam terlambat, ' + D.ringkas.S + ' plester sakit">' + s + '</div></div>';
  }

  var css = `
.t-mading .say,.t-mading .slot,.t-mading .arrow,.t-mading .name,.t-mading .failnote{pointer-events:none}
.t-mading{--gabus:#C89B68;--kertas:#fff;--tinta:#1D1D1F;--redup:#55524C;--kuning:#FFE066;--biru:#2F5FD0;--merah:#E0413A;color:var(--tinta);font:16px/1.4 "Chivo",system-ui,sans-serif;background-color:var(--gabus);background-image:radial-gradient(rgba(96,58,24,.35) 1px,transparent 1.5px),radial-gradient(rgba(255,238,206,.28) 1px,transparent 1.5px),radial-gradient(rgba(96,58,24,.18) 1.5px,transparent 2px);background-size:7px 7px,11px 11px,17px 17px;background-position:0 0,3px 5px,8px 2px}
.t-mading *{box-sizing:border-box}
.t-mading .hw{font-family:"Caveat",cursive}
.t-mading .ps{font-family:"Archivo Black",sans-serif;font-weight:400}
.t-mading .paper{position:absolute;background:var(--kertas);box-shadow:0 1px 1px rgba(0,0,0,.12),0 8px 16px -8px rgba(60,30,5,.55);transform:rotate(var(--r,0deg))}
.t-mading .pin{position:absolute;left:50%;top:-9px;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 12%,var(--pc) 32%,color-mix(in srgb,var(--pc) 70%,#000) 100%);box-shadow:2px 4px 3px rgba(40,20,0,.35);z-index:3}
.t-mading .tape{position:absolute;left:50%;top:-12px;height:26px;margin-left:-45px;background:rgba(246,231,168,.78);transform:rotate(var(--r));box-shadow:0 1px 2px rgba(0,0,0,.08);z-index:3}
.t-mading .note{background:var(--kuning)}
.t-mading .stamp{position:absolute;border:3px solid var(--biru);color:var(--biru);border-radius:6px;padding:4px 10px;font:400 22px/1 "Archivo Black",sans-serif;letter-spacing:.06em;transform:rotate(var(--r,-12deg));opacity:.9;mix-blend-mode:multiply}
.t-mading .stamp small{display:block;font:700 11px "Chivo",sans-serif;letter-spacing:.08em;margin-top:3px}
.t-mading .mbtn{appearance:none;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;width:100%;height:62px;font:400 18px "Archivo Black",sans-serif;letter-spacing:.02em;color:var(--tinta);background:var(--kuning);box-shadow:0 8px 14px -8px rgba(60,30,5,.6);transform:rotate(-1.2deg)}
.t-mading .mbtn.blue{background:var(--biru);color:#fff}
.t-mading .mbtn.paper-b{background:#fff}
.t-mading .mbtn:disabled{opacity:.75;cursor:progress}
.t-mading .mbtn:focus-visible{outline:3px solid var(--biru);outline-offset:4px}

/* Sambut */
.t-mading .poster{left:22px;right:22px;top:84px;padding:26px 22px 22px;--r:-1.5deg;clip-path:polygon(0 2%,6% 0,14% 1.5%,22% 0,31% 1.2%,40% 0,52% 1.6%,63% 0,74% 1.4%,85% 0,94% 1.5%,100% 0,100% 100%,0 100%)}
.t-mading .poster h1{font:400 64px/0.92 "Archivo Black",sans-serif;margin:0;letter-spacing:-.01em}
.t-mading .poster h1 span{color:var(--biru)}
.t-mading .poster p{margin:12px 0 0;color:var(--redup);font-size:15px}
.t-mading .sm-note{left:196px;top:392px;width:160px;padding:14px 14px 18px;--r:4deg;font:600 25px/1.05 "Caveat",cursive}
.t-mading .sm-star{position:absolute;left:56px;top:400px;width:74px;transform:rotate(-12deg)}
.t-mading .sm-act{position:absolute;left:24px;right:24px;bottom:42px;display:grid;gap:14px}
.t-mading .sm-act span{text-align:center;font:600 22px "Caveat",cursive;color:var(--tinta)}

/* Absen */
.t-mading .hd{left:18px;right:18px;top:60px;padding:14px 18px 12px;--r:-.8deg;display:flex;justify-content:space-between;align-items:flex-end}
.t-mading .hd b{font:400 64px/0.9 "Archivo Black",sans-serif}
.t-mading .hd span{font:600 22px/1 "Caveat",cursive;text-align:right;color:var(--redup)}
.t-mading .hd span em{font-style:normal;display:block;color:#B3261E;font-size:26px}
.t-mading .card{top:218px;width:158px;height:150px;padding:14px 14px}
.t-mading .card.g{left:22px;--r:-3deg}
.t-mading .card.w{right:22px;--r:2.5deg}
.t-mading .card h3{margin:0;font:400 20px "Archivo Black",sans-serif}
.t-mading .card p{margin:4px 0 0;font:600 20px/1.05 "Caveat",cursive;color:var(--redup)}
.t-mading .card .stamp{right:10px;bottom:12px;--r:-14deg;opacity:0;transform:rotate(var(--r)) scale(2)}
.t-mading .card .scrib{position:absolute;left:14px;right:14px;bottom:22px;height:3px;background:repeating-linear-gradient(90deg,var(--tinta) 0 10px,transparent 10px 16px);opacity:0}
.t-mading[data-state="gps"] .card.g .scrib,.t-mading[data-state="wifi"] .card.w .scrib{opacity:.5;animation:mScrib .7s linear infinite}
@keyframes mScrib{to{background-position:32px 0}}
.t-mading[data-state="wifi"] .card.g .stamp,.t-mading[data-state="ready"] .card .stamp,.t-mading[data-state="done"] .card .stamp{animation:mThump .35s cubic-bezier(.3,1.6,.5,1) forwards}
@keyframes mThump{from{opacity:0;transform:rotate(var(--r)) scale(2)}to{opacity:.9;transform:rotate(var(--r)) scale(1)}}
.t-mading .card .x{position:absolute;inset:18px;opacity:0}
.t-mading .card .x path{stroke:var(--merah);stroke-width:5;fill:none;stroke-linecap:round}
.t-mading[data-state="fail"] .card.g .x{opacity:1}
.t-mading .name{left:60px;right:60px;top:396px;height:196px;padding:20px 18px;--r:-2deg;opacity:0;transform:translateY(-500px) rotate(18deg)}
.t-mading[data-state="done"] .name{animation:mDrop .9s cubic-bezier(.3,1.35,.5,1) forwards}
@keyframes mDrop{0%{opacity:1;transform:translateY(-500px) rotate(18deg)}70%{transform:translateY(8px) rotate(-4deg)}85%{transform:translateY(-3px) rotate(1deg)}100%{opacity:1;transform:rotate(-2deg)}}
.t-mading .name .pin{animation:mPin .3s .8s both}
@keyframes mPin{from{transform:translateY(-30px) scale(1.4);opacity:0}}
.t-mading .name h3{margin:0;font:400 28px/1 "Archivo Black",sans-serif}
.t-mading .name p{margin:6px 0 0;color:var(--redup);font-size:15px}
.t-mading .name .stamp{left:40px;bottom:18px;--r:-9deg;opacity:0;font-size:36px;padding:6px 14px}
.t-mading[data-state="done"] .name .stamp{animation:mThump .4s 1.1s cubic-bezier(.3,1.6,.5,1) forwards}
.t-mading .slot{position:absolute;left:60px;right:60px;top:396px;height:196px;border:3px dashed rgba(42,26,8,.45);border-radius:6px;transform:rotate(-2deg)}
.t-mading[data-state="done"] .slot,.t-mading[data-state="fail"] .slot{opacity:0}
.t-mading .say{position:absolute;left:24px;right:24px;top:478px;text-align:center;font:600 26px/1.1 "Caveat",cursive;color:#2A1A08}
.t-mading[data-state="done"] .say{opacity:0}
.t-mading .arrow{position:absolute;left:150px;top:386px;width:70px;opacity:.85}
.t-mading .arrow path{fill:none;stroke:#2A1A08;stroke-width:2.5;stroke-linecap:round}
.t-mading[data-state="done"] .arrow,.t-mading[data-state="fail"] .arrow{opacity:0}
.t-mading .act{position:absolute;left:24px;right:24px;bottom:40px}
.t-mading .act>*{display:none}
.t-mading[data-state="idle"] .act [data-show~="idle"],.t-mading[data-state="gps"] .act [data-show~="scan"],.t-mading[data-state="wifi"] .act [data-show~="scan"],.t-mading[data-state="ready"] .act [data-show~="ready"],.t-mading[data-state="done"] .act [data-show~="done"],.t-mading[data-state="fail"] .act [data-show~="fail"]{display:flex}
.t-mading[data-state="ready"] .act .mbtn{animation:mWig 1.2s ease-in-out infinite}
@keyframes mWig{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.2deg) scale(1.02)}}
.t-mading .failnote{left:40px;right:40px;top:420px;padding:14px 16px;--r:2deg;display:none;font:600 25px/1.05 "Caveat",cursive;color:#A11D15}
.t-mading[data-state="fail"] .failnote{display:block}
.t-mading[data-state="fail"] .say{display:none}

/* Orang tua */
.t-mading .bignote{left:26px;right:26px;top:74px;padding:22px 20px 24px;--r:-2deg}
.t-mading .bignote b{display:block;font:700 44px/0.98 "Caveat",cursive}
.t-mading .bignote span{display:block;margin-top:8px;font-size:15px;color:#4A4636}
.t-mading .tix{position:absolute;left:14px;right:14px;top:338px;display:flex;justify-content:space-between}
.t-mading .tk{position:relative;width:66px;height:104px;background:#fff;padding:10px 6px;text-align:center;box-shadow:0 6px 12px -6px rgba(60,30,5,.6);-webkit-mask:radial-gradient(circle at 50% 100%,transparent 7px,#000 7.5px);mask:radial-gradient(circle at 50% 100%,transparent 7px,#000 7.5px)}
.t-mading .tk:nth-child(odd){transform:rotate(-3deg)}.t-mading .tk:nth-child(even){transform:rotate(2deg)}
.t-mading .tk b{display:block;font:400 15px "Archivo Black",sans-serif}
.t-mading .tk small{color:var(--redup);font-size:12px}
.t-mading .tk i{display:block;width:34px;margin:6px auto 0}
.t-mading .tk.today{outline:3px solid var(--biru)}
.t-mading .list{left:22px;right:22px;top:480px;padding:14px 18px;--r:1deg;background:#fff;background-image:repeating-linear-gradient(transparent 0 33px,#C9D8F2 33px 34px)}
.t-mading .list div{display:flex;align-items:center;gap:10px;height:34px;font:600 22px "Caveat",cursive}
.t-mading .list svg{width:22px;flex:none}
.t-mading .m-nav{position:absolute;left:0;right:0;bottom:0;height:84px;background:#2A1A08;display:flex;justify-content:space-around;padding:12px 0 26px;color:#E8D3B2;font:700 12.5px "Chivo",sans-serif}
.t-mading .m-nav span{display:grid;justify-items:center;gap:3px}
.t-mading .m-nav .on{color:var(--kuning)}
.t-mading .m-nav svg{width:24px;height:24px}

/* Notifikasi */
.t-mading .nt-clock{position:absolute;left:0;right:0;top:110px;text-align:center;color:#fff;text-shadow:0 2px 12px rgba(40,20,0,.5)}
.t-mading .nt-clock b{display:block;font:400 92px/1 "Archivo Black",sans-serif}
.t-mading .nt{left:16px;right:16px;top:420px;padding:14px 16px;display:grid;grid-template-columns:42px 1fr;gap:3px 12px;--r:-1deg;animation:mNt 5.5s cubic-bezier(.3,1.35,.5,1) infinite}
.t-mading .nt.b{top:540px;--r:1.2deg;animation:none;opacity:.9}
.t-mading .nt .ic{grid-row:span 3;width:42px}
.t-mading .nt .ap{font-size:12.5px;color:var(--redup);display:flex;justify-content:space-between;font-weight:700}
.t-mading .nt b{font-size:15.5px}
.t-mading .nt span{font-size:14.5px}
@keyframes mNt{0%{transform:translateY(-120px) rotate(8deg);opacity:0}10%{transform:rotate(-1deg);opacity:1}85%{opacity:1;transform:rotate(-1deg)}100%{opacity:0;transform:translateY(-20px) rotate(-1deg)}}

/* Izin */
.t-mading .form{left:18px;right:18px;top:78px;bottom:26px;padding:34px 22px 20px;--r:.6deg;background:#fff;background-image:linear-gradient(90deg,transparent 40px,#F2B6B0 40px 41.5px,transparent 41.5px),repeating-linear-gradient(transparent 0 35px,#C9D8F2 35px 36px);background-position:0 0,0 22px}
.t-mading .clip{position:absolute;left:50%;top:-18px;width:96px;height:34px;margin-left:-48px;border-radius:6px 6px 3px 3px;background:linear-gradient(#3B3B40,#1D1D22);box-shadow:0 3px 4px rgba(0,0,0,.3)}
.t-mading .form h2{margin:0 0 6px 30px;font:400 30px "Archivo Black",sans-serif}
.t-mading .row{margin-left:30px;min-height:36px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:15px}
.t-mading .cb{display:inline-flex;align-items:center;gap:6px;font-weight:600}
.t-mading .cb svg{width:24px}
.t-mading .hand{font:600 24px/36px "Caveat",cursive;color:var(--biru)}
.t-mading .circle{position:relative;padding:0 4px}
.t-mading .circle::after{content:"";position:absolute;inset:-4px -8px;border:2.5px solid var(--biru);border-radius:50%;transform:rotate(-4deg)}

/* Rekap */
.t-mading .cal-sheet{left:18px;right:18px;top:74px;padding:30px 12px 14px;--r:-.8deg}
.t-mading .spiral{position:absolute;left:14px;right:14px;top:-10px;height:22px;background:radial-gradient(circle at 50% 60%,#2A2A2E 0 4px,transparent 4.5px) 0 0/22px 22px repeat-x}
.t-mading .cal-sheet h2{margin:0 0 10px;text-align:center;font:400 30px "Archivo Black",sans-serif}
.t-mading .cal-h{display:grid;grid-template-columns:repeat(5,1fr);font:700 12px "Chivo",sans-serif;color:var(--redup);text-align:center;border-bottom:2px solid var(--tinta);padding-bottom:4px}
.t-mading .cal-g{display:grid;grid-template-columns:repeat(5,1fr)}
.t-mading .cl{position:relative;height:66px;border-right:1px solid #E1DCD2;border-bottom:1px solid #E1DCD2;padding:3px 5px}
.t-mading .cl:nth-child(5n){border-right:0}
.t-mading .cl b{font:700 12px "Chivo",sans-serif;color:var(--redup)}
.t-mading .cl em{position:absolute;right:4px;bottom:3px;font:600 14px "Caveat",cursive;font-style:normal;color:var(--redup)}
.t-mading .cl.today{background:#FFF7CC}
.t-mading .cl.fut b{opacity:.5}
.t-mading .stk{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-17px 0 0 -19px;transform:rotate(var(--r));animation:mStick .45s cubic-bezier(.3,1.6,.5,1) both;animation-delay:calc(var(--i) * 80ms + .2s)}
@keyframes mStick{from{opacity:0;transform:rotate(var(--r)) scale(2.2) translateY(-20px)}to{opacity:1}}
.t-mading .rk-note{left:190px;top:560px;width:170px;padding:14px 14px 16px;--r:3deg;font:600 24px/1.05 "Caveat",cursive}
.t-mading .rk-note b{display:block;font:400 34px/1 "Archivo Black",sans-serif}
.t-mading .rk-key{left:22px;top:572px;width:156px;padding:10px 12px;--r:-2.5deg;font:600 19px/1.15 "Caveat",cursive}
.t-mading .rk-key div{display:flex;align-items:center;gap:6px}
.t-mading .rk-key svg{width:24px}

/* Laptop */
.t-mading .lp-title{left:44px;top:34px;padding:16px 22px;--r:-1.5deg}
.t-mading .lp-title b{font:400 28px/1 "Archivo Black",sans-serif}
`;
  var I = {
    pinI: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4.5"/><path d="M12 12.5V21"/></svg>',
    env: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="6" width="17" height="12" rx="1"/><path d="M4 7l8 6 8-6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="5" width="17" height="15"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="18" height="18" fill="none" stroke="#1D1D1F" stroke-width="1.8" transform="rotate(-3 11 12)"/><path d="M5 12c2 2 3 4 4 6 3-7 7-12 12-15" fill="none" stroke="#2F5FD0" stroke-width="2.8" stroke-linecap="round"/></svg>',
    box: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="18" height="18" fill="none" stroke="#1D1D1F" stroke-width="1.8" transform="rotate(2 11 12)"/></svg>'
  };
  function nav(a) { return '<nav class="m-nav">' + [['pinI', 'Hari ini'], ['env', 'Izin'], ['cal', 'Rekap']].map(function (x, i) { return '<span class="' + (i === a ? 'on' : '') + '">' + I[x[0]] + x[1] + '</span>'; }).join('') + '</nav>'; }
  function tickets() {
    return '<div class="tix">' + D.minggu.map(function (x) { return '<div class="tk' + (x.today ? ' today' : '') + '"><b>' + x.h + '</b><small>' + x.d + ' Sep</small><i>' + ST[x.k] + '</i><small>' + x.j + '</small></div>'; }).join('') + '</div>';
  }

  SM2.register('mading', {
    name: 'Mading',
    fonts: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Caveat:wght@500;600;700&family=Chivo:wght@400;700&display=swap',
    css: css, stickers: ST, calendar: calendar,
    screens: {
      sambut: {
        tone: 'dark',
        html: function () {
          return '<div class="paper poster">' + pin('#2F5FD0') + '<h1>ABSEN<br><span>PAGI</span><br>XI-3</h1><p>SMA Santa Maria 1 · Jl. Bengawan No. 6, Bandung</p></div>' +
            '<span class="sm-star">' + ST.H + '</span><div class="paper note sm-note">' + tape(6, 70) + 'Bel 06.55. Absen dulu sebelum masuk kelas!</div>' +
            '<div class="sm-act"><button class="mbtn paper-b">Masuk dengan akun sekolah</button><span>atau masuk sebagai orang tua</span></div>';
        }
      },
      absen: {
        tone: 'dark',
        html: function () {
          return '<div class="paper hd">' + tape(-3, 110) + '<b>' + D.now + '</b><span>Jum, 25 Sep<em>bel ' + D.school.bel + '!</em></span></div>' +
            '<div class="paper card g">' + pin() + '<h3>GPS</h3><p>23 m dari Jl. Bengawan 6</p><span class="scrib"></span><span class="stamp">OK</span><svg class="x" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M10 10 L90 90 M90 12 L12 88"/></svg></div>' +
            '<div class="paper card w">' + pin('#2F5FD0') + '<h3>WiFi</h3><p>jaringan sekolah</p><span class="scrib"></span><span class="stamp">OK</span></div>' +
            '<span class="slot" aria-hidden="true"></span><svg class="arrow" viewBox="0 0 90 60" aria-hidden="true"><path d="M8 6c20 4 40 20 52 44M60 50l-12-4M60 50l4-12"/></svg>' +
            '<p class="say" data-live-text aria-live="polite"></p>' +
            '<div class="paper note failnote">Di luar area! 1,4 km dari sekolah. Absen hanya dalam 75 m.</div>' +
            '<div class="paper name">' + pin() + '<h3>' + D.siswa.nama + '</h3><p>' + D.siswa.kelas + ' · masuk ' + D.now + ' · tepat waktu</p><span class="stamp">HADIR<small>25.09.2026</small></span></div>' +
            '<div class="act"><button class="mbtn blue" data-show="idle" data-go="gps">Cek lokasi dan WiFi</button><button class="mbtn" data-show="scan" disabled>Mengecek...</button><button class="mbtn" data-show="ready" data-go="done">Tempel kartu hadirku</button><button class="mbtn paper-b" data-show="done" data-go="idle">Orang tua sudah dikabari</button><button class="mbtn paper-b" data-show="fail">Cek ulang</button></div>';
        },
        mount: function (root, o) {
          SM2.flow(root, { auto: o.live, state: o.state, say: function (s) { return { idle: 'Tempel kartumu di sini', gps: 'Cek lokasi...', wifi: 'Lokasi OK! Cek WiFi...', ready: 'Semua OK, tempel kartunya!', done: '', fail: '' }[s] || ''; } });
        }
      },
      ortu: {
        tone: 'dark',
        html: function () {
          return '<div class="paper note bignote">' + pin('#2F5FD0') + '<b>' + D.siswa.nama + ' sudah sampai jam 06.41</b><span>Tepat waktu, 14 menit sebelum bel. Tercatat lewat GPS dan WiFi sekolah.</span></div>' +
            tickets() + '<div class="paper list">' + tape(2, 80) + '<div>' + I.tick + 'Kabari saat masuk</div><div>' + I.tick + 'Kabari saat pulang</div><div>' + I.tick + 'Kabari kalau belum absen 07.15</div></div>' + nav(0);
        }
      },
      notif: {
        tone: 'light',
        html: function () {
          var ic = '<svg viewBox="0 0 42 42" aria-hidden="true"><rect x="3" y="5" width="36" height="32" fill="#FFE066" transform="rotate(-6 21 21)"/><circle cx="21" cy="9" r="5" fill="#E0413A"/></svg>';
          return '<div class="nt-clock"><span style="font-weight:700;font-size:17px">Jumat, 25 September</span><b>06.41</b></div>' +
            '<div class="paper nt"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>sekarang</span></span><b>' + D.siswa.nama + ' sudah sampai</b><span>06.41, 14 menit sebelum bel.</span></div>' +
            '<div class="paper nt b"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>kemarin</span></span><b>Masuk 06.40</b><span>Kamis, 24 September. Tepat waktu.</span></div>';
        }
      },
      izin: {
        tone: 'dark',
        html: function () {
          return '<div class="paper form"><span class="clip"></span><h2>Surat izin</h2>' +
            '<div class="row">Kepada wali kelas XI-3,</div><div class="row">anak saya tidak masuk karena:</div>' +
            '<div class="row"><span class="cb">' + I.tick + 'Sakit</span><span class="cb">' + I.box + 'Izin keluarga</span></div>' +
            '<div class="row">pada hari:</div><div class="row hand"><span class="circle">Sen 28</span><span class="circle">Sel 29</span><span style="color:#8A8578">Rab 30 · Kam 1 · Jum 2</span></div>' +
            '<div class="row">keterangan:</div><div class="row hand">Demam sejak semalam,</div><div class="row hand">perlu istirahat dua hari.</div>' +
            '<div class="row" style="color:#55524C">+ foto surat dokter (tidak wajib)</div>' +
            '<div style="position:absolute;left:24px;right:24px;bottom:26px"><button class="mbtn blue">Kirim ke wali kelas</button></div></div>';
        }
      },
      rekap: {
        tone: 'dark',
        html: function () {
          var r = D.ringkas;
          return '<div class="paper cal-sheet"><span class="spiral"></span><h2>SEPTEMBER</h2>' + calendar(330) + '</div>' +
            '<div class="paper rk-key">' + tape(-8, 60) + '<div>' + ST.H + 'hadir</div><div>' + ST.T + 'telat</div><div>' + ST.S + 'sakit</div></div>' +
            '<div class="paper note rk-note">' + pin() + '<b>' + r.hadir + '/' + r.hari + '</b>hari hadir. Rata-rata ' + r.rata + '!</div>' + nav(2);
        }
      },
      laptop: {
        html: function () {
          return '<div class="paper lp-title">' + pin() + '<b>Mading ' + D.siswa.nama + ' · XI-3</b></div>' +
            '<div class="paper note bignote" style="left:44px;right:auto;width:400px;top:120px">' + pin('#2F5FD0') + '<b>Sudah sampai jam 06.41</b><span>Jumat, 25 September. Tepat waktu, 14 menit sebelum bel.</span></div>' +
            '<div class="paper list" style="left:52px;right:auto;width:380px;top:560px">' + tape(2, 80) + '<div>' + I.tick + 'Kabari saat masuk</div><div>' + I.tick + 'Kabari saat pulang</div><div>' + I.tick + 'Kabari kalau belum absen 07.15</div></div>' +
            '<div style="position:absolute;left:44px;top:390px;width:400px"><div class="tix" style="position:static;left:auto;right:auto;top:auto">' + D.minggu.map(function (x) { return '<div class="tk' + (x.today ? ' today' : '') + '"><b>' + x.h + '</b><small>' + x.d + ' Sep</small><i>' + ST[x.k] + '</i><small>' + x.j + '</small></div>'; }).join('') + '</div></div>' +
            '<div class="paper cal-sheet" style="left:500px;right:auto;width:420px;top:74px">' + '<span class="spiral"></span><h2>SEPTEMBER</h2>' + calendar(396, { times: true }) + '</div>' +
            '<div class="paper note rk-note" style="left:970px;top:90px;width:250px">' + pin() + '<b>' + D.ringkas.hadir + '/' + D.ringkas.hari + '</b>hari hadir bulan ini</div>' +
            '<div class="paper" style="left:970px;top:300px;width:250px;padding:18px 18px;--r:2deg">' + tape(-5, 80) + '<b style="font:400 18px Archivo Black,sans-serif">Izin terakhir</b><p style="margin:6px 0 0">Sakit · Rab 9 Sep</p><p class="hw" style="margin:2px 0 0;font-size:24px;color:#2F5FD0">disetujui wali kelas</p></div>' +
            '<div class="paper" style="left:970px;top:500px;width:250px;padding:18px;--r:-1.5deg">' + pin('#2F5FD0') + '<b style="font:400 18px Archivo Black,sans-serif">Tata Usaha</b><p style="margin:6px 0 0">' + D.school.telp + '</p></div>';
        }
      }
    }
  });
})();
