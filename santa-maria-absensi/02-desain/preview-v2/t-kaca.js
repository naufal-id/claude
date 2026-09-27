/* Tema 1, Kaca Patri: jendela kaca patri Katedral St. Petrus Bandung (Wolff Schoemaker, 1922).
   Dua lengkung jendela = dua cek (GPS, WiFi). Kaca menyala saat cek lolos.
   Rekap bulanan = jendela mawar, satu kelopak satu hari sekolah. */
(function () {
  var D = SM2.data;
  var C = { kobalt: ['#2D5BD7', '#2548B0', '#3A6DE8', '#1F3C94', '#4A7BF0'], emas: ['#F0B840', '#E39A2A', '#F6CD62', '#D98A1F'], rubi: ['#C23A4E', '#A82E42', '#D6546A'], zamrud: ['#2F9C7B', '#258466', '#3DB38F'] };
  var KODE = { H: '#2D5BD7', T: '#F0B840', S: '#2F9C7B', I: '#2F9C7B', A: '#C23A4E', '': '#1A2138' };
  var uid = 0;
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function lancetPath(x, y, w, h) { var ys = y + 0.866 * w; return 'M' + x + ' ' + (y + h) + 'L' + x + ' ' + ys + 'A' + w + ' ' + w + ' 0 0 1 ' + (x + w / 2) + ' ' + y + 'A' + w + ' ' + w + ' 0 0 1 ' + (x + w) + ' ' + ys + 'L' + (x + w) + ' ' + (y + h) + 'Z'; }
  // Satu lengkung berisi mosaik kaca. cls dipakai CSS untuk menyalakan per keadaan.
  function lancet(x, y, w, h, set, seed, cls, cell) {
    var id = 'kl' + (++uid), r = rnd(seed), p = lancetPath(x, y, w, h), s = '', n = 0; cell = cell || 26;
    for (var yy = y; yy < y + h; yy += cell) for (var xx = x; xx < x + w; xx += cell) {
      var pal = r() < 0.16 ? (set === C.kobalt ? C.emas : C.kobalt) : set;
      s += '<rect class="pn" x="' + xx.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + cell + '" height="' + cell + '" fill="' + pal[Math.floor(r() * pal.length)] + '" style="--d:' + (n++ * 23 % 900) + 'ms"/>';
    }
    return '<g class="lan ' + cls + '"><clipPath id="' + id + '"><path d="' + p + '"/></clipPath><g clip-path="url(#' + id + ')"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#0B1020"/>' + s + '</g><path d="' + p + '" fill="none" class="lead-o"/></g>';
  }
  function sector(cx, cy, r0, r1, a0, a1) {
    function p(r, a) { return (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2); }
    var lg = a1 - a0 > Math.PI ? 1 : 0;
    return 'M' + p(r1, a0) + 'A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + p(r1, a1) + 'L' + p(r0, a1) + 'A' + r0 + ' ' + r0 + ' 0 ' + lg + ' 0 ' + p(r0, a0) + 'Z';
  }
  // Jendela mawar: 22 hari sekolah September sebagai kelopak luar
  function rose(size, opts) {
    opts = opts || {};
    var c = size / 2, days = D.bulan, n = days.length, s = '', gap = 0.012, a0 = -Math.PI / 2;
    var R = c - 6, r1 = R * 0.66, r0 = R * 0.40;
    for (var i = 0; i < n; i++) {
      var x = days[i], a = a0 + i * 2 * Math.PI / n, b = a0 + (i + 1) * 2 * Math.PI / n;
      s += '<path class="rp' + (x.today ? ' today' : '') + (x.future ? ' fut' : '') + '" d="' + sector(c, c, r1, R, a + gap, b - gap) + '" fill="' + KODE[x.k] + '" style="--i:' + i + '"><title>' + x.h + ' ' + x.d + ' Sep: ' + (x.future ? 'belum berjalan' : SM2.label[x.k] + (x.j ? ' ' + x.j : '')) + '</title></path>';
    }
    for (var k = 0; k < 8; k++) {
      var a2 = a0 + k * Math.PI / 4, b2 = a2 + Math.PI / 4;
      s += '<path class="rt" d="' + sector(c, c, r0, r1 - 6, a2 + 0.03, b2 - 0.03) + '" fill="' + (k % 2 ? '#1F3C94' : '#A82E42') + '" style="--i:' + (k + 22) + '"/>';
    }
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + (r0 - 5) + '" fill="#0B1020" stroke="#05070D" stroke-width="5"/>';
    s += '<circle class="sheen" cx="' + c + '" cy="' + c + '" r="' + R + '" fill="url(#ksheen' + uid + ')"/>';
    var mid = opts.center !== false ? '<text x="' + c + '" y="' + (c - 2) + '" text-anchor="middle" class="rv">' + D.ringkas.hadir + '/' + D.ringkas.hari + '</text><text x="' + c + '" y="' + (c + 24) + '" text-anchor="middle" class="rl">hari hadir</text>' : '';
    return '<svg class="rose" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Jendela mawar September: ' + D.ringkas.hadir + ' dari ' + D.ringkas.hari + ' hari hadir"><defs><radialGradient id="ksheen' + uid + '" cx="30%" cy="25%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="' + c + '" cy="' + c + '" r="' + (R + 4) + '" fill="#05070D"/>' + s + mid + '</svg>';
  }
  var ICON = {
    arch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V11a7 7 0 0 1 14 0v10z"/><path d="M12 4v17"/></svg>',
    env: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="6" width="17" height="12"/><path d="M4 7l8 6 8-6"/></svg>',
    rose: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5"/></svg>'
  };
  function nav(active) {
    return '<nav class="k-nav">' + [['arch', 'Hari ini'], ['env', 'Izin'], ['rose', 'Rekap']].map(function (x, i) { return '<span class="' + (i === active ? 'on' : '') + '">' + ICON[x[0]] + x[1] + '</span>'; }).join('') + '</nav>';
  }
  function ICO() { return '<svg viewBox="0 0 40 40" aria-hidden="true">' + lancet(8, 3, 24, 34, C.kobalt, 17, '', 8) + '</svg>'; }
  function dust(n) { var s = ''; for (var i = 0; i < n; i++) s += '<i style="left:' + (8 + (i * 37) % 84) + '%;top:' + (10 + (i * 53) % 80) + '%;--t:' + (6 + i % 5) + 's;--dl:-' + (i * 0.9).toFixed(1) + 's"></i>'; return '<div class="k-dust" aria-hidden="true">' + s + '</div>'; }

  var css = `
.t-kaca .ab-beams,.t-kaca .ab-floor,.t-kaca .ab-say,.t-kaca .ab-lbl{pointer-events:none}
.t-kaca{--malam:#0E1322;--malam2:#151B30;--timah:#05070D;--cahaya:#EEF0F8;--redup:#A9B0C8;--emas:#F0B840;--kobalt:#2D5BD7;--rubi:#E0667A;--zamrud:#3DB38F;background:var(--malam);color:var(--cahaya);font:16px/1.45 "Hanken Grotesk",system-ui,sans-serif}
.t-kaca *{box-sizing:border-box}
.t-kaca .g{font-family:"Grenze",Georgia,serif}
.t-kaca .lead-o{stroke:var(--timah);stroke-width:6}
.t-kaca .pn{stroke:var(--timah);stroke-width:2.6;fill-opacity:.9}
.t-kaca .rose .rp,.t-kaca .rose .rt{stroke:var(--timah);stroke-width:4}
.t-kaca .rose .rv{font:600 44px "Grenze",serif;fill:var(--cahaya)}
.t-kaca .rose .rl{font:500 14px "Hanken Grotesk",sans-serif;fill:var(--redup)}
.t-kaca .rose .rp{animation:kLight 1.1s both;animation-delay:calc(var(--i) * 70ms)}
.t-kaca .rose .rt{animation:kLight 1.1s both;animation-delay:calc(var(--i) * 70ms)}
.t-kaca .rose .fut{fill-opacity:.35}
.t-kaca .rose .today{animation:kLight 1.1s both,kPulse 2.4s 2s infinite;animation-delay:calc(var(--i) * 70ms),2.2s}
.t-kaca .rose .sheen{transform-origin:center;transform-box:fill-box;animation:kSpin 14s linear infinite;pointer-events:none}
@keyframes kLight{from{fill-opacity:.08;filter:brightness(.4)}to{fill-opacity:1;filter:none}}
@keyframes kPulse{50%{filter:brightness(1.5)}}
@keyframes kSpin{to{transform:rotate(360deg)}}
@keyframes kShim{0%,100%{fill-opacity:.12}50%{fill-opacity:.75}}
.t-kaca .k-dust{position:absolute;inset:0;pointer-events:none}
.t-kaca .k-dust i{position:absolute;width:3px;height:3px;border-radius:50%;background:#FFE7A8;opacity:0;animation:kDust var(--t) linear infinite;animation-delay:var(--dl)}
@keyframes kDust{0%{opacity:0;transform:translate(0,0)}20%{opacity:.8}100%{opacity:0;transform:translate(26px,-60px)}}
.t-kaca .beam{position:absolute;pointer-events:none;background:linear-gradient(180deg,rgba(246,205,98,.34),rgba(45,91,215,.10) 60%,transparent);transform-origin:top center;mix-blend-mode:screen;animation:kSway 7s ease-in-out infinite alternate}
@keyframes kSway{from{transform:skewX(-14deg)}to{transform:skewX(-6deg)}}
.t-kaca .k-btn{appearance:none;border:0;border-radius:14px;height:58px;width:100%;font:700 17px "Hanken Grotesk",sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;color:#1A1204;background:linear-gradient(180deg,#F7CF68,#E3A12E);box-shadow:0 0 0 1px #05070D,0 10px 30px -10px rgba(240,184,64,.7)}
.t-kaca .k-btn.ghost{background:transparent;color:var(--cahaya);box-shadow:inset 0 0 0 1.5px #3B4466}
.t-kaca .k-btn:disabled{opacity:.6;cursor:progress}
.t-kaca .k-btn:focus-visible{outline:3px solid #F7CF68;outline-offset:3px}
.t-kaca .k-nav{position:absolute;left:0;right:0;bottom:0;height:84px;padding:10px 20px 26px;display:flex;justify-content:space-around;background:#0A0E1A;border-top:1px solid #222A44}
.t-kaca .k-nav span{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12.5px;font-weight:600;color:#8F97B2}
.t-kaca .k-nav span.on{color:var(--emas)}
.t-kaca .k-nav svg{width:24px;height:24px}
.t-kaca .top{padding:66px 26px 0}
.t-kaca .muted{color:var(--redup)}

/* Layar sambut */
.t-kaca .sb-win{position:absolute;left:50%;top:92px;transform:translateX(-50%);width:250px}
.t-kaca .sb-win svg{width:100%;display:block;filter:drop-shadow(0 0 40px rgba(45,91,215,.45))}
.t-kaca .sb-win .pn{animation:kShim 5s ease-in-out infinite;animation-delay:var(--d)}
.t-kaca .sb-copy{position:absolute;left:26px;right:26px;bottom:44px;display:grid;gap:14px}
.t-kaca .sb-copy h1{font:600 50px/0.95 "Grenze",serif;margin:0;letter-spacing:-.01em}
.t-kaca .sb-copy p{margin:0;color:var(--redup);font-size:15px}
.t-kaca .sb-copy .link{text-align:center;font-weight:600;font-size:15px;color:var(--cahaya);padding:6px}

/* Layar absen */
.t-kaca .ab-date{font-size:15px;color:var(--redup)}
.t-kaca .ab-time{font:600 92px/0.9 "Grenze",serif;letter-spacing:-.02em;margin-top:6px}
.t-kaca .ab-bel{font-weight:700;color:var(--emas);margin-top:6px}
.t-kaca .ab-win{position:absolute;left:50%;top:246px;width:224px;transform:translateX(-50%)}
.t-kaca .ab-win svg{width:100%;display:block;overflow:visible}
.t-kaca .ab-win .pn{fill-opacity:.12;transition:fill-opacity .6s;transition-delay:var(--d)}
.t-kaca .ab-win .oc .pn{transition-delay:0s}
.t-kaca[data-state="gps"] .ab-win .L .pn{animation:kShim 1.2s ease-in-out infinite;animation-delay:calc(var(--d) * .6)}
.t-kaca[data-state="wifi"] .ab-win .L .pn,.t-kaca[data-state="ready"] .ab-win .L .pn,.t-kaca[data-state="done"] .ab-win .L .pn{fill-opacity:.95}
.t-kaca[data-state="wifi"] .ab-win .R .pn{animation:kShim 1.2s ease-in-out infinite;animation-delay:calc(var(--d) * .6)}
.t-kaca[data-state="ready"] .ab-win .R .pn,.t-kaca[data-state="done"] .ab-win .R .pn{fill-opacity:.95}
.t-kaca[data-state="ready"] .ab-win .oc .pn{animation:kShim 1.6s ease-in-out infinite}
.t-kaca[data-state="done"] .ab-win .oc .pn{fill-opacity:1}
.t-kaca[data-state="wifi"] .ab-win .L,.t-kaca[data-state="ready"] .ab-win .L,.t-kaca[data-state="done"] .ab-win .L{filter:drop-shadow(0 0 14px rgba(58,109,232,.8))}
.t-kaca[data-state="ready"] .ab-win .R,.t-kaca[data-state="done"] .ab-win .R{filter:drop-shadow(0 0 14px rgba(240,184,64,.8))}
.t-kaca[data-state="fail"] .ab-win .L .pn{fill:#5A2230!important;fill-opacity:.8}
.t-kaca .ab-lbl{display:flex;justify-content:space-between;padding:10px 18px 0;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--redup)}
.t-kaca .ab-lbl b{display:block;font-size:13px;letter-spacing:0;font-weight:600;color:var(--cahaya);text-transform:none;margin-top:2px}
.t-kaca .ab-beams{position:absolute;left:0;right:0;top:520px;height:240px;opacity:0;transition:opacity .9s}
.t-kaca[data-state="done"] .ab-beams{opacity:1}
.t-kaca .ab-floor{position:absolute;left:0;right:0;top:612px;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .8s .3s,transform .8s .3s}
.t-kaca[data-state="done"] .ab-floor{opacity:1;transform:none}
.t-kaca .ab-floor b{display:block;font:600 40px/1 "Grenze",serif;color:#FFE3A0;text-shadow:0 0 24px rgba(240,184,64,.6)}
.t-kaca .ab-say{position:absolute;left:26px;right:26px;top:626px;text-align:center;font-size:15px;color:var(--redup);transition:opacity .4s}
.t-kaca[data-state="done"] .ab-say{opacity:0}
.t-kaca .ab-lbl{transition:opacity .5s}.t-kaca[data-state="done"] .ab-lbl{opacity:.35}
.t-kaca .ab-act{position:absolute;left:26px;right:26px;bottom:40px}
.t-kaca .ab-act>*{display:none}
.t-kaca[data-state="idle"] .ab-act [data-show~="idle"],.t-kaca[data-state="gps"] .ab-act [data-show~="scan"],.t-kaca[data-state="wifi"] .ab-act [data-show~="scan"],.t-kaca[data-state="ready"] .ab-act [data-show~="ready"],.t-kaca[data-state="done"] .ab-act [data-show~="done"],.t-kaca[data-state="fail"] .ab-act [data-show~="fail"]{display:flex}
.t-kaca[data-state="ready"] .ab-act .k-btn{animation:kGlow 1.6s ease-in-out infinite}
@keyframes kGlow{50%{box-shadow:0 0 0 1px #05070D,0 10px 44px -6px rgba(240,184,64,1)}}
.t-kaca .ab-fail{position:absolute;left:26px;right:26px;top:614px;display:none;border:1.5px solid #6B2C3B;background:#1C1220;border-radius:14px;padding:12px 14px;font-size:14.5px}
.t-kaca .ab-fail b{color:var(--rubi);display:block;font-size:16px}
.t-kaca[data-state="fail"] .ab-fail{display:block}
.t-kaca[data-state="fail"] .ab-say{display:none}

/* Orang tua */
.t-kaca .or-h{font:600 46px/0.95 "Grenze",serif;margin-top:8px}
.t-kaca .or-s{color:var(--emas);font-weight:700;margin-top:8px;font-size:17px}
.t-kaca .or-week{display:flex;justify-content:space-between;margin:26px 22px 0}
.t-kaca .or-week figure{margin:0;display:grid;justify-items:center;gap:6px;font-size:12.5px;color:var(--redup)}
.t-kaca .or-week svg{width:52px;display:block}
.t-kaca .or-week .today svg{animation:kPulse 2.4s infinite}
.t-kaca .or-week b{color:var(--cahaya);font-size:13px}
.t-kaca .rows{margin:24px 22px 0;border-top:1px solid #222A44}
.t-kaca .rows div{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid #222A44;font-size:15px}
.t-kaca .tg{width:46px;height:28px;border-radius:14px;background:#2A3355;position:relative}
.t-kaca .tg::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#8F97B2}
.t-kaca .tg.on{background:#2D5BD7}.t-kaca .tg.on::after{left:21px;background:#F6CD62}

/* Notifikasi */
.t-kaca .nt-bg{position:absolute;inset:0;background:radial-gradient(40% 30% at 30% 30%,rgba(45,91,215,.75),transparent 70%),radial-gradient(35% 28% at 75% 42%,rgba(240,184,64,.55),transparent 70%),radial-gradient(40% 30% at 45% 75%,rgba(194,58,78,.55),transparent 70%),#0B0F1C;filter:blur(8px);transform:scale(1.1)}
.t-kaca .nt-clock{position:absolute;left:0;right:0;top:120px;text-align:center}
.t-kaca .nt-clock b{display:block;font:600 96px/1 "Grenze",serif}
.t-kaca .nt-clock span{font-size:17px;font-weight:600}
.t-kaca .nt-card{position:absolute;left:16px;right:16px;top:430px;background:rgba(14,19,34,.82);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:14px 16px;display:grid;grid-template-columns:40px 1fr;gap:4px 12px;animation:kDrop 5.5s cubic-bezier(.2,.9,.3,1.2) infinite}
.t-kaca .nt-card.b{top:540px;animation:none;opacity:.75}
.t-kaca .nt-ic{grid-row:span 3;width:40px;height:40px;border-radius:10px;background:#0A0E1A;display:grid;place-items:center}
.t-kaca .nt-ic svg{width:34px}
.t-kaca .nt-app{font-size:13px;color:var(--redup);display:flex;justify-content:space-between}
.t-kaca .nt-t{font-weight:700;font-size:15.5px}
.t-kaca .nt-b{font-size:14.5px;color:#D6DAE8}
@keyframes kDrop{0%{transform:translateY(-120px);opacity:0}10%,85%{transform:none;opacity:1}100%{transform:translateY(-20px);opacity:0}}

/* Izin */
.t-kaca .iz h2{font:600 44px/1 "Grenze",serif;margin:8px 0 18px}
.t-kaca .iz .lab{font-size:13px;font-weight:700;letter-spacing:.06em;color:var(--redup);margin:18px 0 8px}
.t-kaca .tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t-kaca .tile{position:relative;height:92px;border-radius:14px;overflow:hidden;border:2px solid #05070D;display:flex;align-items:flex-end;padding:10px 12px;font-weight:700;font-size:17px}
.t-kaca .tile svg{position:absolute;inset:0;width:100%;height:100%}
.t-kaca .tile span{position:relative;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.t-kaca .tile.on{box-shadow:0 0 0 3px #F6CD62}
.t-kaca .tile.off svg{opacity:.3}
.t-kaca .days{display:flex;gap:8px}
.t-kaca .day{flex:1;height:70px;border-radius:40px 40px 8px 8px;border:1.5px solid #3B4466;display:grid;place-items:center;align-content:center;font-size:12px;color:var(--redup);line-height:1.2;text-align:center}
.t-kaca .day b{display:block;color:var(--cahaya);font-size:15px}
.t-kaca .day.on{background:linear-gradient(180deg,#3A6DE8,#1F3C94);border-color:#F6CD62;color:#DDE6FF}
.t-kaca .ta{height:92px;border-radius:14px;border:1.5px solid #3B4466;padding:12px 14px;color:#D6DAE8;font-size:15px;background:#0B1020}
.t-kaca .att{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:14.5px;color:var(--redup)}
.t-kaca .att i{width:34px;height:34px;border-radius:8px;border:1.5px dashed #3B4466;display:grid;place-items:center;font-style:normal;font-size:20px;color:var(--cahaya)}
.t-kaca .prev{margin-top:14px;font-size:14px;color:var(--redup)}
.t-kaca .prev b{color:var(--zamrud)}

/* Rekap */
.t-kaca .rk h2{font:600 44px/1 "Grenze",serif;margin:8px 0 2px}
.t-kaca .rk .rose{width:330px;display:block;margin:18px auto 0}
.t-kaca .legend{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;margin-top:16px;font-size:13px;color:var(--redup)}
.t-kaca .legend i{display:inline-block;width:14px;height:14px;border:2px solid #05070D;margin-right:5px;vertical-align:-2px}
.t-kaca .stats{display:flex;justify-content:space-around;margin-top:18px;text-align:center}
.t-kaca .stats b{display:block;font:600 30px/1 "Grenze",serif;color:#FFE3A0}
.t-kaca .stats span{font-size:13px;color:var(--redup)}

/* Laptop */
.t-kaca .lp-top{height:72px;display:flex;align-items:center;gap:40px;padding:0 44px;border-bottom:1px solid #222A44;background:#0A0E1A}
.t-kaca .lp-top b{font:600 30px "Grenze",serif}
.t-kaca .lp-top nav{display:flex;gap:26px;font-weight:600;color:#8F97B2}
.t-kaca .lp-top nav .on{color:var(--emas)}
.t-kaca .lp-top .who{margin-left:auto;color:var(--redup);font-size:15px}
.t-kaca .lp{display:grid;grid-template-columns:470px 1fr;gap:44px;padding:36px 44px}
.t-kaca .lp .rose{width:440px;display:block}
.t-kaca .lp-card{border:1px solid #222A44;border-radius:18px;padding:22px 24px;background:var(--malam2)}
.t-kaca .lp h3{margin:0 0 4px;font:600 40px/1 "Grenze",serif}
.t-kaca .lp .or-week{margin:22px 0 0}
.t-kaca .lp .or-week svg{width:64px}
.t-kaca .lp-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
`;

  function absenHtml(o) {
    var st = o.state || 'idle';
    var W = 250, H = 330, win = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path d="' + lancetPath(0, 0, W, H) + '" fill="#0B1020" stroke="#05070D" stroke-width="8"/>' +
      lancet(18, 118, 100, 200, C.kobalt, 11, 'L', 25) + lancet(132, 118, 100, 200, C.emas, 29, 'R', 25) +
      '<g class="lan oc"><clipPath id="koc' + (++uid) + '"><circle cx="125" cy="72" r="40"/></clipPath><g clip-path="url(#koc' + uid + ')">' +
      [0, 1, 2, 3, 4, 5].map(function (k) { return '<path class="pn" d="' + sector(125, 72, 0, 44, k * Math.PI / 3, (k + 1) * Math.PI / 3) + '" fill="' + (k % 2 ? '#C23A4E' : '#F6CD62') + '"/>'; }).join('') +
      '</g><circle cx="125" cy="72" r="40" fill="none" class="lead-o"/><circle cx="125" cy="72" r="12" fill="#2D5BD7" stroke="#05070D" stroke-width="3"/></g></svg>';
    var beams = '<div class="ab-beams" aria-hidden="true"><div class="beam" style="left:110px;width:70px;height:220px"></div><div class="beam" style="left:190px;width:80px;height:200px;animation-delay:-3s"></div>' + dust(14) + '</div>';
    return '<div class="top"><div class="ab-date">' + D.tanggal + '</div><div class="ab-time">' + D.now + '</div><div class="ab-bel">Bel ' + D.school.bel + ' · ' + SM2.sebelumBel(D.now) + ' menit lagi</div></div>' +
      '<div class="ab-win">' + win + '<div class="ab-lbl"><span>GPS<b>' + (st === 'fail' ? '1,4 km' : 'Radius 75 m') + '</b></span><span style="text-align:right">WIFI<b>IP sekolah</b></span></div></div>' + beams +
      '<div class="ab-floor"><b>Hadir 06.41</b><span class="muted">Tepat waktu. Orang tua sudah dikabari.</span></div>' +
      '<p class="ab-say" data-live-text aria-live="polite"></p>' +
      '<div class="ab-fail"><b>Di luar area sekolah</b>Posisimu 1,4 km dari Jl. Bengawan 6. Absen hanya bisa dalam radius 75 m.</div>' +
      '<div class="ab-act"><button class="k-btn" data-show="idle" data-go="gps">Cek lokasi dan WiFi</button><button class="k-btn" data-show="scan" disabled>Menyalakan jendela...</button><button class="k-btn" data-show="ready" data-go="done">Absen masuk</button><button class="k-btn ghost" data-show="done" data-go="idle">Ulangi</button><button class="k-btn ghost" data-show="fail">Cek ulang</button></div>';
  }
  function weekLancets(size) {
    return '<div class="or-week">' + D.minggu.map(function (x, i) {
      var col = x.k === 'T' ? C.emas : C.kobalt;
      return '<figure class="' + (x.today ? 'today' : '') + '"><svg viewBox="0 0 52 110" aria-hidden="true">' + lancet(2, 2, 48, 106, col, 7 + i * 13, '', 12) + '</svg><b>' + x.h + '</b><span>' + x.j + '</span></figure>';
    }).join('') + '</div>';
  }

  SM2.register('kaca', {
    name: 'Kaca Patri',
    fonts: 'https://fonts.googleapis.com/css2?family=Grenze:wght@500;600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap',
    css: css,
    rose: rose,
    lancet: function (w, h, seed) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' + lancet(3, 3, w - 6, h - 6, C.kobalt, seed || 5, '', 20) + '</svg>'; },
    screens: {
      sambut: {
        tone: 'light',
        html: function () {
          var W = 250, H = 420;
          return '<div class="sb-win"><svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="' + lancetPath(0, 0, W, H) + '" fill="#0B1020" stroke="#05070D" stroke-width="8"/>' + lancet(14, 14, 222, 400, C.kobalt, 3, '', 26) + '</svg></div>' +
            '<div class="ab-beams" style="opacity:1;top:430px"><div class="beam" style="left:100px;width:90px;height:240px"></div><div class="beam" style="left:200px;width:70px;height:200px;animation-delay:-2s"></div>' + dust(12) + '</div>' +
            '<div class="sb-copy"><h1>SMA Santa<br>Maria 1</h1><p>Absensi siswa · Jl. Bengawan No. 6, Bandung</p><button class="k-btn">Masuk dengan akun sekolah</button><span class="link">Saya orang tua / wali</span></div>';
        }
      },
      absen: {
        tone: 'light',
        html: absenHtml,
        mount: function (root, o) { SM2.flow(root, { auto: o.live, state: o.state, say: SM2.sayDefault }); }
      },
      ortu: {
        tone: 'light',
        html: function () {
          return '<div class="top"><div class="ab-date">Orang tua · ' + D.siswa.nama + ', ' + D.siswa.kelas + '</div><div class="or-h">Sudah masuk</div><div class="or-s">06.41 · 14 menit sebelum bel</div><div class="muted" style="font-size:14.5px;margin-top:4px">Tercatat lewat GPS dan WiFi sekolah. Belum absen pulang.</div></div>' +
            weekLancets() +
            '<div class="rows"><div>Kabari saat masuk<span class="tg on"></span></div><div>Kabari saat pulang<span class="tg on"></span></div><div>Kabari kalau belum absen 07.15<span class="tg on"></span></div></div>' + nav(0);
        }
      },
      notif: {
        tone: 'light',
        html: function () {
          return '<div class="nt-bg"></div><div class="nt-clock"><span>Jumat, 25 September</span><b>06.41</b></div>' +
            '<div class="nt-card"><span class="nt-ic">' + ICO() + '</span><span class="nt-app"><span>ABSENSI SM1</span><span>sekarang</span></span><span class="nt-t">' + D.siswa.nama + ' sudah masuk</span><span class="nt-b">Tercatat 06.41 lewat GPS dan WiFi sekolah. Tepat waktu.</span></div>' +
            '<div class="nt-card b"><span class="nt-ic">' + ICO() + '</span><span class="nt-app"><span>ABSENSI SM1</span><span>kemarin</span></span><span class="nt-t">Masuk 06.40</span><span class="nt-b">Kamis, 24 September. Tepat waktu.</span></div>';
        }
      },
      izin: {
        tone: 'light',
        html: function () {
          var tile = function (set, seed) { return '<svg viewBox="0 0 170 92" preserveAspectRatio="none" aria-hidden="true">' + (function () { var r = rnd(seed), s = ''; for (var y = 0; y < 92; y += 23) for (var x = 0; x < 170; x += 28.3) s += '<rect x="' + x + '" y="' + y + '" width="28.3" height="23" fill="' + set[Math.floor(r() * set.length)] + '" stroke="#05070D" stroke-width="2"/>'; return s; })() + '</svg>'; };
          return '<div class="top iz"><div class="ab-date">Untuk wali kelas XI-3</div><h2>Surat izin</h2>' +
            '<div class="lab">JENIS</div><div class="tiles"><div class="tile on">' + tile(C.zamrud, 3) + '<span>Sakit</span></div><div class="tile off">' + tile(C.kobalt, 9) + '<span>Izin keluarga</span></div></div>' +
            '<div class="lab">HARI TIDAK MASUK</div><div class="days">' + D.hariIzin.map(function (h, i) { return '<div class="day' + (i === 0 ? ' on' : '') + '"><b>' + h[0] + '</b>' + h[1] + '</div>'; }).join('') + '</div>' +
            '<div class="lab">KETERANGAN</div><div class="ta">Demam sejak semalam, istirahat di rumah.</div><div class="att"><i>+</i>Foto surat dokter (tidak wajib)</div>' +
            '<div style="margin-top:18px"><button class="k-btn">Kirim ke wali kelas</button></div><div class="prev">Sebelumnya: Sakit, Rab 9 Sep · <b>Disetujui</b></div></div>';
        }
      },
      rekap: {
        tone: 'light',
        html: function () {
          var r = D.ringkas;
          return '<div class="top rk"><div class="ab-date">Rekap bulan ini</div><h2>September 2026</h2>' + rose(340) +
            '<div class="legend"><span><i style="background:#2D5BD7"></i>Hadir ' + r.H + '</span><span><i style="background:#F0B840"></i>Terlambat ' + r.T + '</span><span><i style="background:#2F9C7B"></i>Sakit ' + r.S + '</span><span><i style="background:#C23A4E"></i>Alpa ' + r.A + '</span></div>' +
            '<div class="stats"><div><b>' + r.rata + '</b><span>rata-rata masuk</span></div><div><b>' + r.pagi + '</b><span>paling pagi</span></div></div></div>' + nav(2);
        }
      },
      laptop: {
        html: function () {
          return '<div class="lp-top"><b>SMA Santa Maria 1</b><nav><span class="on">Hari ini</span><span>Izin</span><span>Rekap</span></nav><span class="who">Orang tua · ' + D.siswa.nama + ', ' + D.siswa.kelas + '</span></div>' +
            '<div class="lp"><div>' + rose(440) + '<div class="legend" style="justify-content:flex-start"><span><i style="background:#2D5BD7"></i>Hadir</span><span><i style="background:#F0B840"></i>Terlambat</span><span><i style="background:#2F9C7B"></i>Sakit</span><span><i style="background:#C23A4E"></i>Alpa</span></div></div>' +
            '<div><div class="lp-card"><div class="ab-date">' + D.tanggal + ' · pukul ' + D.nowOrtu + '</div><h3>Sudah masuk 06.41</h3><div class="or-s" style="margin-top:4px">14 menit sebelum bel 06.55</div>' + weekLancets() + '</div>' +
            '<div class="lp-row"><div class="lp-card"><div class="ab-date">Izin terakhir</div><div style="font-weight:700;margin-top:6px">Sakit · Rab 9 Sep</div><div style="color:#3DB38F;font-weight:600">Disetujui wali kelas</div></div><div class="lp-card"><div class="ab-date">Tata Usaha</div><div style="font-weight:700;margin-top:6px">' + D.school.telp + '</div><div class="muted">Jl. Bengawan No. 6</div></div></div></div></div>';
        }
      }
    }
  });
})();
