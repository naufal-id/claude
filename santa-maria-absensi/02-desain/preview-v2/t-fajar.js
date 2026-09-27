/* Tema 2, Fajar: pagi di Bandung. Langit dari subuh ke terang mengikuti langkah absen,
   siluet Tangkuban Perahu di cakrawala utara, dan bintang (Stella Maris) sebagai tanda kehadiran.
   Rekap bulanan = peta langit: satu bintang satu hari, makin pagi makin terang. */
(function () {
  var D = SM2.data;
  var MT = 'M0 250 L0 172 C34 164 66 150 104 134 C132 122 152 114 182 111 L286 107 C306 108 322 114 338 122 C356 131 374 143 390 150 L390 250 Z';
  var MT2 = 'M0 250 L0 205 C60 196 110 188 170 190 C230 192 300 184 390 176 L390 250 Z';
  function stars(n, seed, h) {
    var s = seed, out = '';
    function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var i = 0; i < n; i++) {
      var sz = r() < 0.12 ? 3 : r() < 0.5 ? 2 : 1.3;
      out += '<i style="left:' + (r() * 100).toFixed(1) + '%;top:' + (r() * (h || 60)).toFixed(1) + '%;width:' + sz + 'px;height:' + sz + 'px;--t:' + (2 + r() * 4).toFixed(1) + 's;--dl:-' + (r() * 4).toFixed(1) + 's"></i>';
    }
    return '<div class="fj-stars" aria-hidden="true">' + out + '</div>';
  }
  function star8(size, cls) { var c = size / 2, a = size * 0.5, b = size * 0.12; return '<svg class="' + (cls || '') + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><path d="M' + c + ' ' + (c - a) + 'L' + (c + b) + ' ' + (c - b) + 'L' + (c + a) + ' ' + c + 'L' + (c + b) + ' ' + (c + b) + 'L' + c + ' ' + (c + a) + 'L' + (c - b) + ' ' + (c + b) + 'L' + (c - a) + ' ' + c + 'L' + (c - b) + ' ' + (c - b) + 'Z" fill="currentColor"/></svg>'; }
  function mountain(y, dark) { return '<svg class="fj-mt" style="top:' + y + 'px" viewBox="0 0 390 250" preserveAspectRatio="none" aria-hidden="true"><path d="' + MT + '" fill="' + (dark ? '#0D1230' : '#1B1F4A') + '"/><path d="' + MT2 + '" fill="' + (dark ? '#080B22' : '#11153A') + '"/>' + lights() + '</svg>'; }
  function lights() { var s = ''; for (var i = 0; i < 28; i++) s += '<circle class="lt" cx="' + (8 + i * 13.7 + (i % 3) * 3) + '" cy="' + (214 + (i * 7) % 26) + '" r="' + (i % 4 ? 1.3 : 1.8) + '" style="--dl:-' + (i * 0.37).toFixed(2) + 's"/>'; return s; }
  // Peta langit bulanan
  function skymap(w, h, opts) {
    opts = opts || {};
    var cols = 5, rows = 5, px = w / (cols + 0.4), py = (h - 30) / rows, pts = [], s = '', lines = '';
    var dowIdx = { Sen: 0, Sel: 1, Rab: 2, Kam: 3, Jum: 4 }, week = 0, prev = -1;
    D.bulan.forEach(function (x, i) {
      var c = dowIdx[x.h]; if (c <= prev) week++; prev = c;
      var jx = ((x.d * 37) % 13) - 6, jy = ((x.d * 53) % 15) - 7;
      var X = px * (c + 0.7) + jx, Y = py * (week + 0.6) + jy;
      var early = x.j ? SM2.sebelumBel(x.j) : 0;
      pts.push({ x: X, y: Y, d: x, early: early, w: week });
    });
    pts.forEach(function (p, i) {
      if (i > 0 && !p.d.future && !pts[i - 1].d.future && pts[i - 1].w === p.w) { var q = pts[i - 1]; lines += '<line x1="' + q.x.toFixed(1) + '" y1="' + q.y.toFixed(1) + '" x2="' + p.x.toFixed(1) + '" y2="' + p.y.toFixed(1) + '" style="--i:' + i + '"/>'; }
    });
    pts.forEach(function (p, i) {
      var k = p.d.k, r, cls = 'st k' + (k || 'F') + (p.d.today ? ' today' : '');
      if (p.d.future) r = 2;
      else if (k === 'H') r = 3 + p.early * 0.42;
      else if (k === 'T') r = 3.2;
      else r = 6;
      s += '<g class="' + cls + '" style="--i:' + i + '"><circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + r.toFixed(1) + '"/>' + (k === 'H' && p.early >= 14 ? '<circle class="halo" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (r * 2.4).toFixed(1) + '"/>' : '') + '<title>' + p.d.h + ' ' + p.d.d + ' Sep: ' + (p.d.future ? 'belum berjalan' : SM2.label[k] + (p.d.j ? ' ' + p.d.j : '')) + '</title></g>';
      if (opts.labels) s += '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + r + 13).toFixed(1) + '" class="dl">' + p.d.d + '</text>';
    });
    var head = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'].map(function (hh, c) { return '<text x="' + (px * (c + 0.7)).toFixed(1) + '" y="' + (h - 6) + '" class="hd">' + hh + '</text>'; }).join('');
    return '<svg class="skymap" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Peta langit September: ' + D.ringkas.hadir + ' dari ' + D.ringkas.hari + ' hari hadir, bintang lebih terang berarti datang lebih pagi"><g class="ln">' + lines + '</g>' + s + head + '</svg>';
  }
  function sunArc(w, h, opts) {
    // lintasan matahari 06.00 sampai 16.00 sebagai garis waktu sehari
    var x0 = 30, x1 = w - 30, base = h - 26, top = 30;
    function pos(j) { var t = (SM2.menit(j) - 360) / 600; var x = x0 + (x1 - x0) * t; var y = base - (base - top) * Math.sin(Math.PI * t); return [x, y]; }
    var d = '', n = 40; for (var i = 0; i <= n; i++) { var t = i / n, x = x0 + (x1 - x0) * t, y = base - (base - top) * Math.sin(Math.PI * t); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    var m = pos('06.41'), b = pos(D.school.bel), now = pos(D.nowOrtu);
    var lab = ['06', '08', '10', '12', '14', '16'].map(function (hh) { var p = pos(hh + '.00'); return '<text x="' + p[0].toFixed(1) + '" y="' + (base + 20) + '" class="ax">' + hh + '</text>'; }).join('');
    return '<svg class="sunarc" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Lintasan hari ini: masuk 06.41, bel 06.55, sekarang ' + D.nowOrtu + '"><path d="' + d + '" class="arc"/><line x1="' + x0 + '" x2="' + x1 + '" y1="' + base + '" y2="' + base + '" class="hz"/>' +
      '<line x1="' + b[0].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y1="' + (b[1] - 10).toFixed(1) + '" y2="' + base + '" class="bel"/>' +
      '<circle cx="' + m[0].toFixed(1) + '" cy="' + m[1].toFixed(1) + '" r="6" class="mk"/><text x="' + (m[0] + 10).toFixed(1) + '" y="' + (m[1] - 8).toFixed(1) + '" class="ml">Masuk 06.41</text>' +
      '<circle cx="' + now[0].toFixed(1) + '" cy="' + now[1].toFixed(1) + '" r="14" class="sun"/><text x="' + now[0].toFixed(1) + '" y="' + (now[1] - 22).toFixed(1) + '" class="ml" text-anchor="middle">' + D.nowOrtu + '</text>' + lab + '</svg>';
  }

  var css = `
.t-fajar .hadir,.t-fajar .cz,.t-fajar .fj-sun,.t-fajar .fj-mt,.t-fajar .fj-stars{pointer-events:none}
.t-fajar{--malam:#121A3A;--tinta:#1A1D33;--redup:#5B6078;--emas:#F7C45E;--fajar:#E0876A;--pagi:#8FB6F0;--putih:#fff;--langit-redup:#C9CDE6;color:#fff;font:16px/1.45 "Rethink Sans",system-ui,sans-serif;background:#121A3A}
.t-fajar *{box-sizing:border-box}
.t-fajar .gl{font-family:"Gloock",Georgia,serif;font-weight:400}
.t-fajar .fj-night,.t-fajar .fj-day{position:absolute;inset:0}
.t-fajar .fj-night{background:linear-gradient(180deg,#0E1433 0%,#1E2257 45%,#4A3F7E 70%,#A8697C 88%,#E0876A 100%)}
.t-fajar .fj-day{background:linear-gradient(180deg,#5E8FDB 0%,#8FB6F0 40%,#F2C9A0 80%,#F7C45E 100%);opacity:0;transition:opacity 1.4s ease}
.t-fajar .fj-stars{position:absolute;inset:0;transition:opacity 1.4s}
.t-fajar .fj-stars i{position:absolute;border-radius:50%;background:#fff;animation:fjTw var(--t) ease-in-out infinite;animation-delay:var(--dl)}
@keyframes fjTw{50%{opacity:.25}}
.t-fajar .fj-mt{position:absolute;left:0;width:390px;height:250px}
.t-fajar .fj-mt .lt{fill:#FFD98A;animation:fjTw 3s ease-in-out infinite;animation-delay:var(--dl)}
.t-fajar .fj-sun{position:absolute;left:236px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#FFF3C4 0%,#F7C45E 45%,rgba(247,196,94,0) 70%);transition:transform 1.6s cubic-bezier(.2,.8,.2,1)}
.t-fajar .stella{position:absolute;color:#FFF3C4;filter:drop-shadow(0 0 8px #FFE9A8);animation:fjGlow 3s ease-in-out infinite}
@keyframes fjGlow{50%{transform:scale(.8) rotate(12deg);opacity:.8}}
.t-fajar .top{position:absolute;left:26px;right:26px;top:66px}
.t-fajar .date{font-size:15px;color:var(--langit-redup)}
.t-fajar .time{font:400 96px/0.9 "Gloock",serif;margin-top:6px;letter-spacing:-.02em}
.t-fajar .bel{margin-top:8px;font-weight:700;color:var(--emas)}
.t-fajar .sheet{position:absolute;left:0;right:0;bottom:0;background:#fff;color:var(--tinta);border-radius:30px 30px 0 0;padding:22px 24px 34px}
.t-fajar .btn{appearance:none;border:0;border-radius:16px;height:58px;width:100%;font:700 17px "Rethink Sans",sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;background:#1E2257;color:#fff}
.t-fajar .btn.sun{background:linear-gradient(90deg,#F7C45E,#E0876A);color:#1A1204}
.t-fajar .btn.line{background:transparent;color:var(--tinta);box-shadow:inset 0 0 0 1.5px #D5D8E6}
.t-fajar .btn.white{background:#fff;color:#1E2257}
.t-fajar .btn:disabled{opacity:.6}
.t-fajar .btn:focus-visible{outline:3px solid #F7C45E;outline-offset:3px}
.t-fajar .muted{color:var(--redup)}

/* Absen */
.t-fajar .cz{position:absolute;left:0;top:214px;width:390px;height:300px}
.t-fajar .cz svg{width:100%;height:100%;overflow:visible}
.t-fajar .fence{fill:rgba(255,255,255,.05);stroke:rgba(255,255,255,.55);stroke-width:1.5;stroke-dasharray:4 6;transform-origin:262px 150px;animation:fjRot 30s linear infinite}
@keyframes fjRot{to{transform:rotate(360deg)}}
.t-fajar .sch{color:#FFF3C4}
.t-fajar .me{opacity:0;transform:scale(.2);transform-origin:190px 170px;transform-box:view-box;transition:opacity .6s,transform .8s cubic-bezier(.2,1.6,.4,1)}
.t-fajar .me circle{fill:#fff}
.t-fajar .ping{fill:none;stroke:#fff;stroke-width:1.5;opacity:0}
.t-fajar .link{stroke:#FFE9A8;stroke-width:2;stroke-dasharray:90;stroke-dashoffset:90;transition:stroke-dashoffset 1s ease}
.t-fajar .wave{fill:none;stroke:#FFE9A8;stroke-width:2;opacity:0}
.t-fajar .cz text{font:600 13px "Rethink Sans",sans-serif;fill:#fff}
.t-fajar .cz .sub{font-weight:500;fill:#C9CDE6}
.t-fajar[data-state="gps"] .ping{animation:fjPing 1.6s ease-out infinite}
@keyframes fjPing{from{opacity:.9;r:4}to{opacity:0;r:60}}
.t-fajar[data-state="gps"] .me,.t-fajar[data-state="wifi"] .me,.t-fajar[data-state="ready"] .me,.t-fajar[data-state="done"] .me{opacity:1;transform:none}
.t-fajar[data-state="wifi"] .wave{animation:fjWave 1.4s ease-out infinite}
.t-fajar[data-state="wifi"] .wave.w2{animation-delay:.45s}
@keyframes fjWave{from{opacity:.9;transform:scale(.4)}to{opacity:0;transform:scale(1.6)}}
.t-fajar .wave{transform-origin:262px 150px;transform-box:view-box}
.t-fajar[data-state="ready"] .link,.t-fajar[data-state="done"] .link{stroke-dashoffset:0}
.t-fajar[data-state="gps"] .fj-day{opacity:.12}.t-fajar[data-state="wifi"] .fj-day{opacity:.28}.t-fajar[data-state="ready"] .fj-day{opacity:.45}.t-fajar[data-state="done"] .fj-day{opacity:1}
.t-fajar[data-state="done"] .fj-stars{opacity:0}
.t-fajar .ab .fj-sun{top:410px;transform:translateY(90px)}
.t-fajar[data-state="ready"] .ab .fj-sun{transform:translateY(40px)}
.t-fajar[data-state="done"] .ab .fj-sun{transform:translateY(-110px) scale(1.25)}
.t-fajar[data-state="done"] .cz{opacity:0;transition:opacity .6s}
.t-fajar .hadir{position:absolute;left:26px;right:26px;top:300px;opacity:0;transform:translateY(16px);transition:opacity .9s .4s,transform .9s .4s;color:#1A1D33}
.t-fajar .hadir b{display:block;font:400 76px/0.95 "Gloock",serif}
.t-fajar .hadir span{font-weight:700;font-size:17px}
.t-fajar[data-state="done"] .hadir{opacity:1;transform:none}
.t-fajar[data-state="done"] .top{color:#1A1D33}.t-fajar[data-state="done"] .date{color:#3A3F5C}.t-fajar[data-state="done"] .bel{color:#8A4B12}
.t-fajar .top,.t-fajar .date,.t-fajar .bel{transition:color 1.2s}
.t-fajar .ck{display:grid;gap:10px;margin-bottom:16px}
.t-fajar .ck div{display:grid;grid-template-columns:36px 1fr auto;gap:12px;align-items:center}
.t-fajar .ck .ic{width:36px;height:36px;border-radius:50%;background:#EEF0F8;display:grid;place-items:center;color:#1E2257}
.t-fajar .ck .ic svg{width:18px}
.t-fajar .ck b{display:block;font-size:15.5px}
.t-fajar .ck small{display:block;color:var(--redup);font-size:13.5px}
.t-fajar .ck em{font-style:normal;font-size:13px;font-weight:700;padding:4px 10px;border-radius:20px;background:#EEF0F8;color:#5B6078}
.t-fajar .ck em.ok{display:none;background:#FFF1D2;color:#8A4B12}
.t-fajar[data-state="wifi"] .ck .g em.wait,.t-fajar[data-state="ready"] .ck em.wait,.t-fajar[data-state="done"] .ck em.wait{display:none}
.t-fajar[data-state="wifi"] .ck .g em.ok,.t-fajar[data-state="ready"] .ck em.ok,.t-fajar[data-state="done"] .ck em.ok{display:inline-block}
.t-fajar .act>*{display:none}
.t-fajar[data-state="idle"] .act [data-show~="idle"],.t-fajar[data-state="gps"] .act [data-show~="scan"],.t-fajar[data-state="wifi"] .act [data-show~="scan"],.t-fajar[data-state="ready"] .act [data-show~="ready"],.t-fajar[data-state="done"] .act [data-show~="done"],.t-fajar[data-state="fail"] .act [data-show~="fail"]{display:flex}
.t-fajar[data-state="ready"] .act .btn{animation:fjBtn 1.8s ease-in-out infinite}
@keyframes fjBtn{50%{box-shadow:0 10px 30px -6px rgba(224,135,106,.8)}}
.t-fajar .say{font-size:13.5px;color:var(--redup);margin:10px 0 0;text-align:center}
.t-fajar .fail{display:none;background:#FDECEA;color:#9B2C22;border-radius:14px;padding:12px 14px;margin-bottom:14px;font-size:14.5px}
.t-fajar .fail b{display:block}
.t-fajar[data-state="fail"] .fail{display:block}
.t-fajar[data-state="fail"] .ck{display:none}
.t-fajar[data-state="fail"] .me{opacity:1;transform:translate(-150px,-90px)}
.t-fajar[data-state="fail"] .link{display:none}

/* Sambut */
.t-fajar .sm-copy{position:absolute;left:26px;right:26px;top:120px}
.t-fajar .sm-copy h1{font:400 58px/0.98 "Gloock",serif;margin:0}
.t-fajar .sm-copy p{margin:14px 0 0;color:var(--langit-redup);font-size:16px}
.t-fajar .sm-act{position:absolute;left:26px;right:26px;bottom:44px;display:grid;gap:12px}
.t-fajar .sm-act span{text-align:center;font-weight:600;color:#fff;padding:6px}
.t-fajar .shoot{position:absolute;top:120px;left:60px;width:120px;height:2px;background:linear-gradient(90deg,transparent,#fff);transform:rotate(-24deg);opacity:0;animation:fjShoot 7s ease-in 2s infinite}
@keyframes fjShoot{0%{opacity:0;transform:rotate(-24deg) translateX(0)}3%{opacity:1}9%{opacity:0;transform:rotate(-24deg) translateX(220px)}100%{opacity:0}}

/* Orang tua */
.t-fajar .or-sky{position:absolute;left:0;right:0;top:0;height:360px;background:linear-gradient(180deg,#5E8FDB,#8FB6F0 55%,#F2D7B6)}
.t-fajar .sunarc{position:absolute;left:0;top:150px;width:390px;height:190px;overflow:visible}
.t-fajar .sunarc .arc{fill:none;stroke:rgba(255,255,255,.8);stroke-width:2;stroke-dasharray:3 6}
.t-fajar .sunarc .hz{stroke:rgba(26,29,51,.35);stroke-width:1.5}
.t-fajar .sunarc .bel{stroke:#C2410C;stroke-width:2.5}
.t-fajar .sunarc .mk{fill:#1E2257;stroke:#fff;stroke-width:3}
.t-fajar .sunarc .sun{fill:#F7C45E;filter:drop-shadow(0 0 12px #FFE39A);animation:fjGlow 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.t-fajar .sunarc .ml{font:700 12.5px "Rethink Sans",sans-serif;fill:#1A1D33}
.t-fajar .sunarc .ax{font:500 12px "Rethink Sans",sans-serif;fill:#3A3F5C;text-anchor:middle}
.t-fajar .or-card{position:absolute;left:0;right:0;top:340px;bottom:0;background:#fff;color:var(--tinta);border-radius:30px 30px 0 0;padding:24px}
.t-fajar .or-card h2{font:400 36px/1.05 "Gloock",serif;margin:4px 0 6px}
.t-fajar .suns{display:flex;justify-content:space-between;margin-top:20px}
.t-fajar .suns figure{margin:0;display:grid;justify-items:center;gap:4px;font-size:12.5px;color:var(--redup)}
.t-fajar .suns b{color:var(--tinta);font-size:13px}
.t-fajar .suns .ball{width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FFE39A,#F7C45E 60%,#E0876A);position:relative;overflow:hidden}
.t-fajar .suns .T .ball::after{content:"";position:absolute;left:0;right:0;bottom:0;height:45%;background:#fff;border-top:2px solid #1A1D33}
.t-fajar .suns .today .ball{box-shadow:0 0 0 4px #FFF1D2,0 0 20px #F7C45E;animation:fjGlow 3s infinite}
.t-fajar .tgl{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #ECEEF4;font-size:15px}
.t-fajar .sw{width:46px;height:28px;border-radius:14px;background:#1E2257;position:relative}
.t-fajar .sw::after{content:"";position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:#F7C45E}
.t-fajar .fj-nav{position:absolute;left:0;right:0;bottom:0;height:82px;display:flex;justify-content:space-around;padding:10px 0 24px;background:#fff;border-top:1px solid #ECEEF4;color:#5B6078;font-size:12.5px;font-weight:600}
.t-fajar .fj-nav span{display:grid;justify-items:center;gap:3px}
.t-fajar .fj-nav .on{color:#1E2257}
.t-fajar .fj-nav svg{width:24px;height:24px}

/* Notifikasi */
.t-fajar .nt-clock{position:absolute;left:0;right:0;top:110px;text-align:center}
.t-fajar .nt-clock b{display:block;font:400 100px/1 "Gloock",serif}
.t-fajar .nt{position:absolute;left:14px;right:14px;top:420px;background:rgba(255,255,255,.88);color:var(--tinta);border-radius:22px;padding:14px 16px;display:grid;grid-template-columns:40px 1fr;gap:3px 12px;animation:fjDrop 5.5s cubic-bezier(.2,.9,.3,1.2) infinite}
.t-fajar .nt.b{top:530px;animation:none;opacity:.8}
.t-fajar .nt .ic{grid-row:span 3;width:40px;height:40px;border-radius:10px;background:#1E2257;color:#FFE39A;display:grid;place-items:center}
.t-fajar .nt .ic svg{width:22px}
.t-fajar .nt .ap{font-size:13px;color:var(--redup);display:flex;justify-content:space-between}
.t-fajar .nt b{font-size:15.5px}
.t-fajar .nt span{font-size:14.5px}
@keyframes fjDrop{0%{transform:translateY(-110px);opacity:0}10%,85%{transform:none;opacity:1}100%{transform:translateY(-16px);opacity:0}}

/* Izin */
.t-fajar .iz-sheet{position:absolute;left:0;right:0;top:150px;bottom:0;background:#fff;color:var(--tinta);border-radius:30px 30px 0 0;padding:26px 24px}
.t-fajar .iz-sheet h2{font:400 40px/1 "Gloock",serif;margin:0 0 4px}
.t-fajar .lab{font-size:13px;font-weight:700;color:var(--redup);margin:18px 0 8px}
.t-fajar .seg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t-fajar .seg div{height:62px;border-radius:16px;border:1.5px solid #D5D8E6;display:flex;align-items:center;gap:10px;padding:0 14px;font-weight:700}
.t-fajar .seg div.on{border-color:#1E2257;background:#1E2257;color:#fff}
.t-fajar .seg svg{width:26px;height:26px}
.t-fajar .moons{display:flex;justify-content:space-between}
.t-fajar .moons div{width:58px;height:58px;border-radius:50%;border:1.5px solid #D5D8E6;display:grid;place-items:center;align-content:center;line-height:1.15;font-size:12px;color:var(--redup);text-align:center}
.t-fajar .moons b{display:block;color:var(--tinta);font-size:14px}
.t-fajar .moons .on{background:radial-gradient(circle at 70% 30%,#1E2257 0 55%,#FFE39A 56%);color:#fff;border-color:#1E2257}
.t-fajar .moons .on b{color:#fff}
.t-fajar .ta{height:86px;border-radius:16px;background:#F4F5FA;padding:12px 14px;font-size:15px}

/* Rekap */
.t-fajar .rk-top{position:absolute;left:26px;right:26px;top:66px}
.t-fajar .rk-top h2{font:400 44px/1 "Gloock",serif;margin:4px 0 0}
.t-fajar .skymap{position:absolute;left:12px;top:170px;width:366px;height:360px;overflow:visible}
.t-fajar .skymap .ln line{stroke:rgba(255,233,168,.55);stroke-width:1.2;stroke-dasharray:400;stroke-dashoffset:400;animation:fjLine 1.2s ease forwards;animation-delay:calc(var(--i) * 90ms + .3s)}
@keyframes fjLine{to{stroke-dashoffset:0}}
.t-fajar .skymap .st{opacity:0;animation:fjIn .6s ease forwards,fjTw 3.5s ease-in-out infinite;animation-delay:calc(var(--i) * 90ms),calc(var(--i) * 170ms + 2s)}
@keyframes fjIn{from{opacity:0}to{opacity:1}}
.t-fajar .skymap .kH circle{fill:#FFF6D8}
.t-fajar .skymap .kH .halo{fill:rgba(255,233,168,.14)}
.t-fajar .skymap .kT circle{fill:#F2A14B}
.t-fajar .skymap .kS circle,.t-fajar .skymap .kI circle{fill:none;stroke:#9DB8F2;stroke-width:1.8}
.t-fajar .skymap .kA circle{fill:#F07A6E}
.t-fajar .skymap .kF circle{fill:rgba(255,255,255,.25)}
.t-fajar .skymap .today circle:first-child{stroke:#FFE39A;stroke-width:3;paint-order:stroke}
.t-fajar .skymap .hd{font:600 12.5px "Rethink Sans",sans-serif;fill:#C9CDE6;text-anchor:middle}
.t-fajar .skymap .dl{font:500 10px "Rethink Sans",sans-serif;fill:#8E93B8;text-anchor:middle}
.t-fajar .rk-card{position:absolute;left:14px;right:14px;bottom:98px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:14px 18px;display:grid;grid-template-columns:repeat(3,1fr);text-align:center}
.t-fajar .rk-card b{display:block;font:400 30px/1.1 "Gloock",serif}
.t-fajar .rk-card span{font-size:12.5px;color:#C9CDE6}
.t-fajar .rk-key{position:absolute;left:24px;right:24px;top:540px;display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:#C9CDE6}
.t-fajar .rk-key i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:0}

/* Laptop */
.t-fajar .lp-sky{position:absolute;left:0;right:0;top:0;height:330px;background:linear-gradient(180deg,#5E8FDB,#8FB6F0 60%,#F2D7B6);overflow:hidden}
.t-fajar .lp-sky .sunarc{position:absolute;left:340px;top:40px;width:900px;height:270px}
.t-fajar .lp-top{position:absolute;left:44px;top:34px;color:#1A1D33}
.t-fajar .lp-top b{font:400 34px/1 "Gloock",serif}
.t-fajar .lp-top p{margin:8px 0 0;font-weight:600}
.t-fajar .lp-body{position:absolute;left:0;right:0;top:300px;bottom:0;background:#F4F5FA;border-radius:30px 30px 0 0;padding:34px 44px;display:grid;grid-template-columns:1.1fr 1fr;gap:26px;color:var(--tinta)}
.t-fajar .lp-card{background:#fff;border-radius:22px;padding:22px 24px}
.t-fajar .lp-night{background:#121A3A;color:#fff;border-radius:22px;padding:18px 20px;position:relative;overflow:hidden}
.t-fajar .lp-night .skymap{position:static;width:100%;height:300px}
`;
  var I = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9.5a13 13 0 0 1 18 0M6.2 12.8a8.5 8.5 0 0 1 11.6 0M9.4 16a4 4 0 0 1 5.2 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>',
    env: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
    stars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><circle cx="19" cy="18" r="1.4" fill="currentColor"/><circle cx="6" cy="18.5" r="1" fill="currentColor"/></svg>',
    house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11l8-6.5 8 6.5V20H4z"/><path d="M10 20v-5h4v5"/></svg>'
  };
  function nav(a) { return '<nav class="fj-nav">' + [['sun', 'Hari ini'], ['env', 'Izin'], ['stars', 'Rekap']].map(function (x, i) { return '<span class="' + (i === a ? 'on' : '') + '">' + I[x[0]] + x[1] + '</span>'; }).join('') + '</nav>'; }
  function suns() { return '<div class="suns">' + D.minggu.map(function (x) { return '<figure class="' + x.k + (x.today ? ' today' : '') + '"><span class="ball" aria-hidden="true"></span><b>' + x.h + '</b><span>' + x.j + '</span></figure>'; }).join('') + '</div>'; }

  SM2.register('fajar', {
    name: 'Fajar',
    fonts: 'https://fonts.googleapis.com/css2?family=Gloock&family=Rethink+Sans:wght@400;500;600;700;800&display=swap',
    css: css, skymap: skymap, sunArc: sunArc, stars: stars, mountainPath: MT, mountainPath2: MT2, star8: star8,
    screens: {
      sambut: {
        tone: 'light',
        html: function () {
          return '<div class="fj-night"></div>' + stars(70, 7, 70) + '<div class="shoot"></div><span class="stella" style="left:300px;top:92px;width:34px">' + star8(34) + '</span>' +
            mountain(560, true) + '<div class="sm-copy"><h1>Selamat<br>pagi.</h1><p>SMA Santa Maria 1 · Jl. Bengawan No. 6, Bandung</p></div>' +
            '<div class="sm-act"><button class="btn white">Masuk dengan akun sekolah</button><span>Saya orang tua / wali</span></div>';
        }
      },
      absen: {
        tone: function (o) { return o.state === 'done' ? 'dark' : 'light'; },
        html: function (o) {
          return '<div class="ab"><div class="fj-night"></div><div class="fj-day"></div>' + stars(50, 3, 55) + '<div class="fj-sun"></div>' + mountain(340) +
            '<div class="top"><div class="date">' + D.tanggal + '</div><div class="time">' + D.now + '</div><div class="bel">Bel ' + D.school.bel + ' · ' + SM2.sebelumBel(D.now) + ' menit lagi</div></div>' +
            '<div class="cz"><svg viewBox="0 0 390 300" aria-hidden="true"><circle class="fence" cx="262" cy="150" r="96"/><circle class="wave" cx="262" cy="150" r="30"/><circle class="wave w2" cx="262" cy="150" r="30"/>' +
            '<line class="link" x1="196" y1="172" x2="256" y2="152"/><g class="me"><circle class="ping" cx="190" cy="170" r="4"/><circle cx="190" cy="170" r="6"/><text x="150" y="200">Kamu</text><text x="150" y="216" class="sub">23 m</text></g>' +
            '<g class="sch" transform="translate(246 134)"><path d="M16 0L20 12L32 16L20 20L16 32L12 20L0 16L12 12Z" fill="#FFF3C4"/></g><text x="282" y="140">Sekolah</text><text x="282" y="156" class="sub">radius 75 m</text></svg></div>' +
            '<div class="hadir"><b>Hadir.</b><span>Tercatat 06.41, tepat waktu.</span></div>' +
            '<div class="sheet"><div class="fail"><b>Di luar area sekolah</b>Posisimu 1,4 km dari Jl. Bengawan 6. Absen hanya bisa dalam radius 75 m.</div>' +
            '<div class="ck"><div class="g"><span class="ic">' + I.pin + '</span><span><b>Lokasi GPS</b><small>23 m dari titik sekolah, akurasi ±9 m</small></span><em class="wait">Cek</em><em class="ok">Cocok</em></div>' +
            '<div class="w"><span class="ic">' + I.wifi + '</span><span><b>WiFi sekolah</b><small>Dikenali dari alamat IP sekolah</small></span><em class="wait">Cek</em><em class="ok">Cocok</em></div></div>' +
            '<div class="act"><button class="btn" data-show="idle" data-go="gps">Cek lokasi dan WiFi</button><button class="btn" data-show="scan" disabled>Mencari bintangmu...</button><button class="btn sun" data-show="ready" data-go="done">Absen masuk</button><button class="btn line" data-show="done" data-go="idle">Orang tua sudah dikabari</button><button class="btn line" data-show="fail">Cek ulang</button></div>' +
            '<p class="say" data-live-text aria-live="polite"></p></div></div>';
        },
        mount: function (root, o) { SM2.flow(root, { auto: o.live, state: o.state, say: SM2.sayDefault }); }
      },
      ortu: {
        tone: 'dark',
        html: function () {
          return '<div class="or-sky"></div><div class="top" style="color:#1A1D33"><div class="date" style="color:#2E3350">Orang tua · ' + D.siswa.nama + ', ' + D.siswa.kelas + '</div><div style="font:400 30px/1.1 Gloock,serif;margin-top:6px">Jumat, 25 September</div></div>' + sunArc(390, 190) +
            '<div class="or-card"><div class="muted" style="font-size:14px">Hari ini</div><h2>Tiba 06.41, sebelum bel.</h2><div class="muted" style="font-size:14.5px">Tercatat lewat GPS dan WiFi sekolah. Belum absen pulang.</div>' + suns() +
            '<div style="margin-top:14px"><div class="tgl">Kabari saat masuk dan pulang<span class="sw"></span></div><div class="tgl">Kabari kalau belum absen 07.15<span class="sw"></span></div></div></div>' + nav(0);
        }
      },
      notif: {
        tone: 'light',
        html: function () {
          return '<div class="fj-night" style="background:linear-gradient(180deg,#0E1433,#2A2D6A 50%,#C27A7E 82%,#F2B66A)"></div>' + stars(40, 11, 45) + mountain(600, true) +
            '<div class="nt-clock"><span style="font-weight:600;font-size:17px">Jumat, 25 September</span><b>06.41</b></div>' +
            '<div class="nt"><span class="ic">' + I.sun + '</span><span class="ap"><span>ABSENSI SM1</span><span>sekarang</span></span><b>' + D.siswa.nama + ' sudah tiba</b><span>Masuk 06.41, 14 menit sebelum bel.</span></div>' +
            '<div class="nt b"><span class="ic">' + I.sun + '</span><span class="ap"><span>ABSENSI SM1</span><span>kemarin</span></span><b>Masuk 06.40</b><span>Kamis, 24 September. Tepat waktu.</span></div>';
        }
      },
      izin: {
        tone: 'light',
        html: function () {
          return '<div class="fj-night"></div>' + stars(30, 5, 16) + '<div class="top"><div class="date">Surat izin untuk wali kelas XI-3</div></div>' +
            '<div class="iz-sheet"><h2>Anak tidak masuk</h2><div class="muted" style="font-size:14.5px">Pilih alasan dan hari di minggu depan.</div>' +
            '<div class="lab">ALASAN</div><div class="seg"><div class="on">' + I.moon + 'Sakit</div><div>' + I.house + 'Izin keluarga</div></div>' +
            '<div class="lab">HARI</div><div class="moons">' + D.hariIzin.map(function (h, i) { return '<div class="' + (i < 2 ? 'on' : '') + '"><b>' + h[0] + '</b>' + h[1] + '</div>'; }).join('') + '</div>' +
            '<div class="lab">KETERANGAN</div><div class="ta">Demam sejak semalam, perlu istirahat dua hari.</div>' +
            '<div style="margin-top:12px;font-size:14px" class="muted">+ Foto surat dokter (tidak wajib)</div><div style="margin-top:16px"><button class="btn">Kirim ke wali kelas</button></div></div>';
        }
      },
      rekap: {
        tone: 'light',
        html: function () {
          var r = D.ringkas;
          return '<div class="fj-night" style="background:linear-gradient(180deg,#0B1030,#1B1F4F 70%,#2E2B63)"></div>' + stars(40, 13, 100) +
            '<div class="rk-top"><div class="date">Langit bulan ini</div><h2>September</h2></div>' + skymap(366, 360, { labels: true }) +
            '<div class="rk-key"><span><i style="background:#FFF6D8"></i>Hadir, makin terang makin pagi</span><span><i style="background:#F2A14B"></i>Terlambat</span><span><i style="border:1.8px solid #9DB8F2"></i>Sakit</span></div>' +
            '<div class="rk-card"><div><b>' + r.hadir + '/' + r.hari + '</b><span>hari hadir</span></div><div><b>' + r.rata + '</b><span>rata-rata</span></div><div><b>' + r.pagi + '</b><span>paling pagi</span></div></div>' + nav(2).replace('class="fj-nav"', 'class="fj-nav" style="background:#0B1030;border-color:#252A5A;color:#8E93B8"').replace('class="on"', 'class="on" style="color:#FFE39A"');
        }
      },
      laptop: {
        html: function () {
          return '<div class="lp-sky">' + sunArc(900, 270) + '</div><div class="lp-top"><b>Tiba 06.41, sebelum bel.</b><p>' + D.siswa.nama + ' · ' + D.siswa.kelas + ' · Jumat, 25 September</p></div>' +
            '<div class="lp-body"><div class="lp-night"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font:400 28px Gloock,serif">Langit September</b><span style="color:#C9CDE6">' + D.ringkas.hadir + ' dari ' + D.ringkas.hari + ' hari hadir</span></div>' + skymap(560, 300) + '</div>' +
            '<div style="display:grid;gap:18px;align-content:start"><div class="lp-card"><div class="muted">Minggu ini</div>' + suns() + '</div><div class="lp-card"><div class="muted">Izin terakhir</div><b style="display:block;margin-top:4px">Sakit · Rab 9 Sep</b><span style="color:#1F6B3A;font-weight:600">Disetujui wali kelas</span></div><div class="lp-card"><div class="muted">Tata Usaha</div><b style="display:block;margin-top:4px">' + D.school.telp + '</b></div></div></div>';
        }
      }
    }
  });
})();
