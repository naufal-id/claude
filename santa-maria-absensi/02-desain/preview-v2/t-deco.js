/* Tema 3, Deco Bengawan: Art Deco Bandung (Villa Isola 1933, Hotel Preanger 1929, Savoy Homann 1939).
   Penunjuk lantai lift jadi jam menuju bel, tombol lantai jadi dua cek, pintu lift kuningan membuka
   untuk "HADIR". Rekap bulanan = cakrawala gedung Deco: makin pagi datang, makin tinggi gedungnya. */
(function () {
  var D = SM2.data;
  function polar(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function angle(j) { return 180 + (SM2.menit(j) - SM2.menit('06.30')) / 45 * 180; }
  function dial(w, opts) {
    opts = opts || {};
    var cx = 160, cy = 168, R = 140, s = '', t;
    for (var m = 0; m <= 45; m += 5) {
      t = SM2.fmt(SM2.menit('06.30') + m);
      var a = angle(t), major = m % 15 === 0, p1 = polar(cx, cy, R, a), p2 = polar(cx, cy, R - (major ? 18 : 10), a);
      s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" class="tk' + (major ? ' mj' : '') + '"/>';
      if (major) { var pl = polar(cx, cy, R - 34, a); s += '<text x="' + pl[0].toFixed(1) + '" y="' + (pl[1] + 5).toFixed(1) + '" class="dl">' + t + '</text>'; }
    }
    var a0 = angle(D.school.bel), late0 = polar(cx, cy, R + 8, a0), late1 = polar(cx, cy, R + 8, 360);
    var bm = polar(cx, cy, R + 8, a0);
    var tgt = angle(opts.time || D.now) - 270;
    return '<svg class="dial" viewBox="0 0 320 190" role="img" aria-label="Penunjuk waktu: sekarang ' + (opts.time || D.now) + ', bel ' + D.school.bel + '">' +
      '<path d="M' + (cx - R - 14) + ' ' + cy + 'A' + (R + 14) + ' ' + (R + 14) + ' 0 0 1 ' + (cx + R + 14) + ' ' + cy + '" class="rim"/>' +
      '<path d="M' + late0[0].toFixed(1) + ' ' + late0[1].toFixed(1) + 'A' + (R + 8) + ' ' + (R + 8) + ' 0 0 1 ' + late1[0].toFixed(1) + ' ' + late1[1].toFixed(1) + '" class="late"/>' +
      s + '<path d="M' + bm[0].toFixed(1) + ' ' + (bm[1] - 11).toFixed(1) + 'l7 11-7 11-7-11z" class="belmk"/>' +
      '<g class="needle" style="--to:' + tgt.toFixed(1) + 'deg"><path d="M' + cx + ' ' + (cy - R + 22) + 'L' + (cx + 5) + ' ' + cy + 'L' + (cx - 5) + ' ' + cy + 'Z"/></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="11" class="hub"/></svg>';
  }
  function sunburst(n) { var s = ''; for (var i = 0; i < n; i++) { s += '<path d="M0 0L' + (Math.cos((i / n) * Math.PI) * -900).toFixed(0) + ' ' + (Math.sin((i / n) * Math.PI) * -900).toFixed(0) + 'L' + (Math.cos(((i + 0.5) / n) * Math.PI) * -900).toFixed(0) + ' ' + (Math.sin(((i + 0.5) / n) * Math.PI) * -900).toFixed(0) + 'Z"/>'; } return s; }
  function frame(w, h, c) {
    c = c || 14;
    function poly(o) { var x0 = o, y0 = o, x1 = w - o, y1 = h - o, k = c; return 'M' + (x0 + k) + ' ' + y0 + 'H' + (x1 - k) + 'V' + (y0 + k) + 'H' + x1 + 'V' + (y1 - k) + 'H' + (x1 - k) + 'V' + y1 + 'H' + (x0 + k) + 'V' + (y1 - k) + 'H' + x0 + 'V' + (y0 + k) + 'H' + (x0 + k) + 'Z'; }
    return '<svg class="fr" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + poly(1.5) + '"/><path d="' + poly(7) + '" class="in"/></svg>';
  }
  function skyline(w, h, opts) {
    opts = opts || {};
    var days = D.bulan, n = days.length, gap = 4, bw = (w - gap * (n - 1)) / n, base = h - 22, s = '';
    days.forEach(function (x, i) {
      var early = x.j ? SM2.sebelumBel(x.j) : 0, hh;
      if (x.future) hh = 18; else if (x.k === 'H') hh = 50 + early * 9.5; else if (x.k === 'T') hh = 34; else hh = 90;
      var X = i * (bw + gap), Y = base - hh, cls = 'bd k' + (x.k || 'F') + (x.today ? ' today' : '');
      var step = Math.min(6, bw / 4), crown = x.k === 'H' && early >= 14;
      var d = 'M' + X.toFixed(1) + ' ' + base + 'V' + (Y + step * 2).toFixed(1) + 'H' + (X + step).toFixed(1) + 'V' + (Y + step).toFixed(1) + 'H' + (X + step * 2).toFixed(1) + 'V' + Y.toFixed(1) + 'H' + (X + bw - step * 2).toFixed(1) + 'V' + (Y + step).toFixed(1) + 'H' + (X + bw - step).toFixed(1) + 'V' + (Y + step * 2).toFixed(1) + 'H' + (X + bw).toFixed(1) + 'V' + base + 'Z';
      var win = '';
      if (!x.future && x.k !== 'S') for (var yy = Y + step * 2 + 8; yy < base - 8; yy += 11) win += '<rect x="' + (X + bw / 2 - 1.5).toFixed(1) + '" y="' + yy.toFixed(1) + '" width="3" height="5" class="wn" style="--w:' + ((i * 7 + yy) % 23) / 10 + 's"/>';
      s += '<g class="' + cls + '" style="--i:' + i + '"><path d="' + d + '"/>' + (crown ? '<path d="M' + (X + bw / 2).toFixed(1) + ' ' + (Y - 12).toFixed(1) + 'V' + Y.toFixed(1) + '" class="sp"/>' : '') + win + '<title>' + x.h + ' ' + x.d + ' Sep: ' + (x.future ? 'belum berjalan' : SM2.label[x.k] + (x.j ? ' ' + x.j : '')) + '</title></g>';
      if (opts.labels && (x.h === 'Sen' || x.today)) s += '<text x="' + (X + bw / 2).toFixed(1) + '" y="' + (h - 5) + '" class="sl">' + x.d + '</text>';
    });
    return '<svg class="sky" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Cakrawala September: ' + D.ringkas.hadir + ' dari ' + D.ringkas.hari + ' hari hadir, gedung lebih tinggi berarti datang lebih pagi"><g class="lights"><path d="M' + (w * 0.25) + ' ' + base + 'L' + (w * 0.05) + ' 0L' + (w * 0.16) + ' 0Z" class="sl1"/><path d="M' + (w * 0.78) + ' ' + base + 'L' + (w * 0.82) + ' 0L' + (w * 0.94) + ' 0Z" class="sl2"/></g><line x1="0" x2="' + w + '" y1="' + base + '" y2="' + base + '" class="gr"/>' + s + '</svg>';
  }

  var css = `
.t-deco .hadir,.t-deco .ab-say,.t-deco .doors,.t-deco .burst{pointer-events:none}
.t-deco{--jade:#0F3B3A;--jade2:#16504D;--jade3:#0A2B2A;--gading:#EFEFE6;--redup:#B9CBC7;--kuningan:#D4B04A;--kuningan2:#A8842A;--hitam:#081A1A;--bata:#F08A6E;background:var(--jade);color:var(--gading);font:16px/1.45 "Josefin Sans",system-ui,sans-serif}
.t-deco *{box-sizing:border-box}
.t-deco .pj{font-family:"Poiret One",Georgia,serif;font-weight:400}
.t-deco .burst{position:absolute;left:50%;width:0;height:0;pointer-events:none}
.t-deco .burst svg{position:absolute;left:-900px;top:-900px;width:1800px;height:1800px;overflow:visible;animation:dSpin 90s linear infinite}
.t-deco .burst path{fill:rgba(212,176,74,.07)}
@keyframes dSpin{to{transform:rotate(360deg)}}
.t-deco .fr{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.t-deco .fr path{fill:none;stroke:var(--kuningan);stroke-width:1.5;vector-effect:non-scaling-stroke}
.t-deco .fr .in{stroke-width:1;opacity:.6}
.t-deco .speed{display:grid;gap:4px}.t-deco .speed i{display:block;height:1.5px;background:var(--kuningan)}
.t-deco .speed i:nth-child(2){width:80%}.t-deco .speed i:nth-child(3){width:60%}
.t-deco .cap{letter-spacing:.24em;font-size:12px;font-weight:600;color:var(--redup);text-transform:uppercase}
.t-deco .brass{background:linear-gradient(180deg,#EACB6E,#C9A43A 55%,#9C7A24);color:#1E1606}
.t-deco .dbtn{appearance:none;border:0;height:58px;width:100%;font:700 15px "Josefin Sans",sans-serif;letter-spacing:.2em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;cursor:pointer;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px)}
.t-deco .dbtn.ghost{background:transparent;color:var(--gading);box-shadow:inset 0 0 0 1.5px var(--kuningan);clip-path:none}
.t-deco .dbtn:focus-visible{outline:3px solid #EACB6E;outline-offset:3px}
.t-deco .dial{width:100%;display:block;overflow:visible}
.t-deco .dial .rim{fill:none;stroke:var(--kuningan);stroke-width:2}
.t-deco .dial .late{fill:none;stroke:var(--bata);stroke-width:5}
.t-deco .dial .tk{stroke:var(--gading);stroke-width:1.5;opacity:.7}
.t-deco .dial .tk.mj{stroke-width:3;opacity:1}
.t-deco .dial .dl{font:600 12px "Josefin Sans",sans-serif;fill:var(--redup);text-anchor:middle}
.t-deco .dial .belmk{fill:var(--bata)}
.t-deco .dial .needle{transform-origin:160px 168px;transform:rotate(var(--to));animation:dNeedle 1.8s cubic-bezier(.3,1.4,.5,1) both}
.t-deco .dial .needle path{fill:var(--kuningan)}
.t-deco .dial .hub{fill:var(--kuningan);stroke:var(--hitam);stroke-width:3}
@keyframes dNeedle{from{transform:rotate(-90deg)}}
.t-deco .top{position:absolute;left:24px;right:24px;top:62px}

/* Sambut */
.t-deco .sm-arch{position:absolute;left:44px;right:44px;top:150px;height:370px;display:grid;place-items:center;text-align:center;background:var(--jade3)}
.t-deco .sm-arch h1{font:400 50px/1.02 "Poiret One",serif;margin:0;letter-spacing:.02em}
.t-deco .sm-arch .ln{width:120px;margin:18px auto}
.t-deco .sm-act{position:absolute;left:28px;right:28px;bottom:44px;display:grid;gap:12px;text-align:center}

/* Absen */
.t-deco .ab-dial{position:absolute;left:35px;width:320px;top:96px}
.t-deco .ab-time{position:absolute;left:0;right:0;top:304px;text-align:center}
.t-deco .ab-time b{display:block;font:400 76px/1 "Poiret One",serif;letter-spacing:.02em}
.t-deco .ab-time span{font-size:14px;letter-spacing:.2em;color:var(--kuningan);font-weight:700}
.t-deco .floors{position:absolute;left:0;right:0;top:452px;display:flex;justify-content:center;gap:52px}
.t-deco .fl{display:grid;justify-items:center;gap:8px;font-size:12px;letter-spacing:.2em;font-weight:700;color:var(--redup)}
.t-deco .fl i{width:62px;height:62px;border-radius:50%;border:2px solid var(--kuningan);display:grid;place-items:center;position:relative;background:radial-gradient(circle,#1C5A57,#0C302F)}
.t-deco .fl i::after{content:"";width:22px;height:22px;border-radius:50%;background:#274E4C;transition:background .4s,box-shadow .4s}
.t-deco .fl i::before{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px dashed var(--kuningan);opacity:0}
.t-deco[data-state="gps"] .fl.g i::before,.t-deco[data-state="wifi"] .fl.w i::before{opacity:1;animation:dSpin 3s linear infinite}
.t-deco[data-state="wifi"] .fl.g i::after,.t-deco[data-state="ready"] .fl i::after,.t-deco[data-state="done"] .fl i::after{background:#FFE08A;box-shadow:0 0 18px 4px rgba(255,224,138,.7)}
.t-deco[data-state="fail"] .fl.g i::after{background:var(--bata)}
.t-deco .fl b{font-size:13px;letter-spacing:0;color:var(--gading);font-weight:600}
.t-deco .call{position:absolute;left:50%;top:590px;width:126px;height:126px;margin-left:-63px;border-radius:50%;border:0;padding:0;cursor:pointer;background:radial-gradient(circle at 40% 35%,#F4D98A,#C9A43A 55%,#8C6A1C);box-shadow:0 0 0 6px var(--jade),0 0 0 8px var(--kuningan),0 16px 30px -10px rgba(0,0,0,.6);display:grid;place-items:center;font:700 14px "Josefin Sans",sans-serif;letter-spacing:.2em;color:#1E1606;transition:transform .15s}
.t-deco .call:disabled{filter:saturate(.3) brightness(.7);cursor:progress}
.t-deco[data-state="ready"] .call{animation:dCall 1.4s ease-in-out infinite}
@keyframes dCall{50%{box-shadow:0 0 0 6px var(--jade),0 0 0 8px var(--kuningan),0 0 40px 8px rgba(255,224,138,.6)}}
.t-deco .call:focus-visible{outline:3px solid #EACB6E;outline-offset:10px}
.t-deco .ab-say{position:absolute;left:24px;right:24px;top:748px;text-align:center;font-size:14px;color:var(--redup)}
.t-deco .call,.t-deco .ab-say,.t-deco .floors{transition:opacity .3s .55s}
.t-deco[data-state="done"] .call,.t-deco[data-state="done"] .floors,.t-deco[data-state="done"] .ab-say{opacity:0;pointer-events:none;transition-delay:.45s}
.t-deco .ab-bottom{position:absolute;left:24px;right:24px;bottom:36px}
.t-deco .ab-bottom>*{display:none}
.t-deco[data-state="done"] .ab-bottom [data-show~="done"],.t-deco[data-state="fail"] .ab-bottom [data-show~="fail"]{display:flex}
.t-deco .doors{position:absolute;left:0;right:0;top:430px;height:414px;pointer-events:none;overflow:hidden}
.t-deco .door{position:absolute;top:0;bottom:0;width:50%;background:linear-gradient(90deg,#B8922E,#E6C765 50%,#B8922E);transform:translateX(-101%)}
.t-deco .door.r{right:0;transform:translateX(101%)}
.t-deco .door svg{position:absolute;inset:0;width:100%;height:100%}
.t-deco .door svg path{fill:none;stroke:#7A5B14;stroke-width:2}
.t-deco[data-state="done"] .door.l{animation:dDoorL 2.2s cubic-bezier(.6,0,.3,1) forwards}
.t-deco[data-state="done"] .door.r{animation:dDoorR 2.2s cubic-bezier(.6,0,.3,1) forwards}
@keyframes dDoorL{0%{transform:translateX(-101%)}28%,48%{transform:translateX(0)}100%{transform:translateX(-101%)}}
@keyframes dDoorR{0%{transform:translateX(101%)}28%,48%{transform:translateX(0)}100%{transform:translateX(101%)}}
.t-deco .hadir{position:absolute;left:0;right:0;top:470px;text-align:center;opacity:0;transition:opacity .2s}
.t-deco[data-state="done"] .hadir{opacity:1;transition-delay:.9s}
.t-deco .hadir .burst{top:150px}
.t-deco .hadir .burst path{fill:rgba(212,176,74,.16)}
.t-deco .hadir b{position:relative;display:block;font:400 74px/1 "Poiret One",serif;letter-spacing:.14em;color:#FFE08A}
.t-deco .hadir span{position:relative;display:block;margin-top:8px;font-weight:600;letter-spacing:.14em;font-size:14px}
.t-deco .fail{position:absolute;left:24px;right:24px;top:592px;display:none;border:1.5px solid var(--bata);padding:14px 16px;font-size:14.5px}
.t-deco .fail b{display:block;color:var(--bata);letter-spacing:.12em;font-size:13px;margin-bottom:4px}
.t-deco[data-state="fail"] .fail{display:block}
.t-deco[data-state="fail"] .call,.t-deco[data-state="fail"] .ab-say{display:none}

/* Orang tua */
.t-deco .or-head{position:relative;margin-top:14px;padding:22px 20px;background:var(--jade3)}
.t-deco .or-head b{display:block;font:400 54px/1 "Poiret One",serif;color:#FFE08A}
.t-deco .or-head span{font-weight:600}
.t-deco .towers{display:flex;align-items:flex-end;justify-content:space-between;height:150px;margin-top:22px;padding:0 6px;border-bottom:1.5px solid var(--kuningan)}
.t-deco .tw{display:grid;justify-items:center;gap:4px;width:52px}
.t-deco .tw i{display:block;width:36px;background:linear-gradient(180deg,#EACB6E,#A8842A);clip-path:polygon(0 12px,6px 12px,6px 6px,12px 6px,12px 0,24px 0,24px 6px,30px 6px,30px 12px,36px 12px,36px 100%,0 100%);animation:dRise 1.1s cubic-bezier(.2,.9,.3,1) both;animation-delay:calc(var(--i) * 120ms);transform-origin:bottom}
.t-deco .tw.T i{background:var(--bata)}
.t-deco .tw.today i{box-shadow:0 0 22px rgba(255,224,138,.6)}
@keyframes dRise{from{transform:scaleY(0)}}
.t-deco .tw-l{display:flex;justify-content:space-between;padding:8px 6px 0;font-size:12.5px;color:var(--redup)}
.t-deco .tw-l span{width:52px;text-align:center}
.t-deco .tw-l b{display:block;color:var(--gading);font-weight:600}
.t-deco .rows{margin-top:20px}
.t-deco .rows div{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #2B6461;font-size:15px}
.t-deco .knob{width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#F4D98A,#A8842A);box-shadow:0 0 0 2px var(--jade),0 0 0 3.5px var(--kuningan)}
.t-deco .d-nav{position:absolute;left:0;right:0;bottom:0;height:84px;background:var(--jade3);border-top:1.5px solid var(--kuningan);display:flex;justify-content:space-around;padding:12px 0 26px;font-size:12px;letter-spacing:.16em;font-weight:700;color:var(--redup)}
.t-deco .d-nav span{display:grid;justify-items:center;gap:4px}
.t-deco .d-nav .on{color:#FFE08A}
.t-deco .d-nav svg{width:22px;height:22px}

/* Notifikasi */
.t-deco .nt-clock{position:absolute;left:0;right:0;top:120px;text-align:center}
.t-deco .nt-clock b{display:block;font:400 100px/1 "Poiret One",serif}
.t-deco .nt{position:absolute;left:16px;right:16px;top:430px;background:rgba(8,26,26,.88);border:1.5px solid var(--kuningan);padding:14px 16px;display:grid;grid-template-columns:40px 1fr;gap:3px 12px;animation:dDrop 5.5s cubic-bezier(.2,.9,.3,1.2) infinite}
.t-deco .nt.b{top:540px;animation:none;opacity:.8}
.t-deco .nt .ic{grid-row:span 3;width:40px;height:40px;border-radius:50%;display:grid;place-items:center}
.t-deco .nt .ap{font-size:12px;letter-spacing:.16em;color:var(--redup);display:flex;justify-content:space-between}
.t-deco .nt b{font-size:16px}
.t-deco .nt span{font-size:14.5px}
@keyframes dDrop{0%{transform:translateY(-110px);opacity:0}10%,85%{transform:none;opacity:1}100%{transform:translateY(-16px);opacity:0}}

/* Izin */
.t-deco .iz h2{font:400 44px/1 "Poiret One",serif;margin:6px 0 4px}
.t-deco .lab{margin:20px 0 10px}
.t-deco .tok{display:flex;gap:14px}
.t-deco .tok div{flex:1;position:relative;height:74px;display:flex;align-items:center;gap:12px;padding:0 14px;background:var(--jade3);font-weight:700}
.t-deco .tok i{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font:400 22px "Poiret One",serif;font-style:normal;border:1.5px solid var(--kuningan)}
.t-deco .tok .on i{background:radial-gradient(circle at 40% 35%,#F4D98A,#A8842A);color:#1E1606;border-color:transparent}
.t-deco .flr{display:flex;justify-content:space-between}
.t-deco .flr div{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;align-content:center;line-height:1.1;font-size:11px;letter-spacing:.1em;color:var(--redup);border:2px solid var(--kuningan);background:radial-gradient(circle,#1C5A57,#0C302F)}
.t-deco .flr b{display:block;font:400 22px "Poiret One",serif;letter-spacing:0;color:var(--gading)}
.t-deco .flr .on{background:radial-gradient(circle at 40% 35%,#FFE9A8,#E3BE55 60%,#A8842A);color:#3A2B08;box-shadow:0 0 16px rgba(255,224,138,.6)}
.t-deco .flr .on b{color:#1E1606}
.t-deco .ta{position:relative;height:90px;padding:14px 16px;font-size:15px;color:#DCE6E3}

/* Rekap */
.t-deco .rk h2{font:400 44px/1 "Poiret One",serif;margin:6px 0 0}
.t-deco .sky{display:block;width:100%;overflow:visible}
.t-deco .sky .bd path{fill:#C9A43A}
.t-deco .sky .bd{transform-box:fill-box;transform-origin:bottom;animation:dRise 1.2s cubic-bezier(.2,.9,.3,1) both;animation-delay:calc(var(--i) * 60ms)}
.t-deco .sky .kH path{fill:#D4B04A}
.t-deco .sky .kT path{fill:#F08A6E}
.t-deco .sky .kS path,.t-deco .sky .kI path{fill:none;stroke:#D4B04A;stroke-width:1.5;stroke-dasharray:3 3}
.t-deco .sky .kF path{fill:#1C5A57}
.t-deco .sky .today path{fill:#FFE08A;filter:drop-shadow(0 0 10px rgba(255,224,138,.8))}
.t-deco .sky .sp{stroke:#FFE08A;stroke-width:1.5}
.t-deco .sky .wn{fill:#0F3B3A;animation:dWin 2.3s steps(1) infinite;animation-delay:var(--w)}
@keyframes dWin{50%{fill:#FFF3C4}}
.t-deco .sky .gr{stroke:var(--kuningan);stroke-width:1.5}
.t-deco .sky .sl{font:600 11px "Josefin Sans",sans-serif;fill:var(--redup);text-anchor:middle}
.t-deco .sky .lights path{fill:rgba(255,236,170,.10)}
.t-deco .sky .sl1{transform-origin:25% 100%;transform-box:view-box;animation:dLight 7s ease-in-out infinite alternate}
.t-deco .sky .sl2{transform-origin:78% 100%;transform-box:view-box;animation:dLight 9s ease-in-out infinite alternate-reverse}
@keyframes dLight{from{transform:rotate(-14deg)}to{transform:rotate(18deg)}}
.t-deco .stat{display:grid;grid-template-columns:repeat(3,1fr);margin-top:18px;border-top:1.5px solid var(--kuningan);border-bottom:1.5px solid var(--kuningan)}
.t-deco .stat div{padding:12px 6px;text-align:center;border-left:1px solid #2B6461}
.t-deco .stat div:first-child{border-left:0}
.t-deco .stat b{display:block;font:400 32px/1.1 "Poiret One",serif;color:#FFE08A}
.t-deco .stat span{font-size:11.5px;letter-spacing:.14em;color:var(--redup);font-weight:600}

/* Laptop */
.t-deco .lp{position:absolute;inset:0;display:grid;grid-template-columns:470px 1fr}
.t-deco .lp-l{position:relative;background:var(--jade3);padding:40px 44px;overflow:hidden}
.t-deco .lp-r{padding:40px 48px}
.t-deco .lp h3{font:400 40px/1.05 "Poiret One",serif;margin:8px 0 0}
`;
  var I = {
    dial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17a9 9 0 0 1 18 0"/><path d="M12 17l4-6"/></svg>',
    env: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.5 6h17v12h-17z"/><path d="M4 7l8 6 8-6"/></svg>',
    city: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V10h4V6h3v15M14 21V3h3v4h4v14"/></svg>'
  };
  function nav(a) { return '<nav class="d-nav">' + [['dial', 'HARI INI'], ['env', 'IZIN'], ['city', 'REKAP']].map(function (x, i) { return '<span class="' + (i === a ? 'on' : '') + '">' + I[x[0]] + x[1] + '</span>'; }).join('') + '</nav>'; }
  function burst(top, n) { return '<div class="burst" style="top:' + top + 'px" aria-hidden="true"><svg viewBox="-900 -900 1800 1800">' + sunburst(n || 36) + '</svg></div>'; }
  function doorArt() { return '<svg viewBox="0 0 195 452" preserveAspectRatio="none" aria-hidden="true"><path d="M20 20H175V432H20z"/><path d="M40 60L97 20L155 60M40 110L97 70L155 110M40 160L97 120L155 160"/><path d="M97 200V432M60 240H135M60 280H135"/></svg>'; }
  function towers() {
    return '<div class="towers">' + D.minggu.map(function (x, i) { var e = SM2.sebelumBel(x.j); return '<div class="tw ' + x.k + (x.today ? ' today' : '') + '" style="--i:' + i + '"><i style="height:' + (x.k === 'T' ? 26 : 40 + e * 6) + 'px"></i></div>'; }).join('') + '</div>' +
      '<div class="tw-l">' + D.minggu.map(function (x) { return '<span><b>' + x.h + '</b>' + x.j + '</span>'; }).join('') + '</div>';
  }

  SM2.register('deco', {
    name: 'Deco Bengawan',
    fonts: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Poiret+One&display=swap',
    css: css, dial: dial, skyline: skyline, frame: frame, sunburst: sunburst,
    screens: {
      sambut: {
        tone: 'light',
        html: function () {
          return burst(560) + '<div class="sm-arch">' + frame(302, 370, 22) + '<div><div class="cap">Absensi siswa</div><h1 style="margin-top:14px">SMA<br>SANTA<br>MARIA 1</h1><div class="speed ln" aria-hidden="true"><i></i><i style="margin:0 auto;width:80%"></i><i style="margin:0 auto;width:60%"></i></div><div class="cap">Jl. Bengawan 6 · Bandung</div></div></div>' +
            '<div class="sm-act"><button class="dbtn brass">Masuk</button><span class="cap" style="padding:8px">Saya orang tua / wali</span></div>';
        }
      },
      absen: {
        tone: 'light',
        html: function () {
          return burst(900, 30) + '<div class="ab-dial">' + dial() + '</div><div class="ab-time"><span>JUMAT · 25 SEPTEMBER</span><b>' + D.now + '</b><span>BEL ' + D.school.bel + ' · ' + SM2.sebelumBel(D.now) + ' MENIT LAGI</span></div>' +
            '<div class="floors"><div class="fl g"><i></i>GPS<b>75 m</b></div><div class="fl w"><i></i>WIFI<b>IP sekolah</b></div></div>' +
            '<button class="call" data-go="gps" aria-label="Cek lokasi dan WiFi">CEK</button>' +
            '<div class="fail"><b>DI LUAR AREA</b>Posisimu 1,4 km dari Jl. Bengawan 6. Absen hanya bisa dalam radius 75 m.</div>' +
            '<p class="ab-say" data-live-text aria-live="polite"></p>' +
            '<div class="hadir">' + burst(150, 28) + '<b>HADIR</b><span>06.41 · TEPAT WAKTU</span><span style="color:var(--redup);letter-spacing:.04em;font-weight:400">Orang tua sudah dikabari</span></div>' +
            '<div class="doors" aria-hidden="true"><div class="door l">' + doorArt() + '</div><div class="door r">' + doorArt() + '</div></div>' +
            '<div class="ab-bottom"><button class="dbtn ghost" data-show="done" data-go="idle">Ulangi</button><button class="dbtn ghost" data-show="fail">Cek ulang</button></div>';
        },
        mount: function (root, o) {
          var call = root.querySelector('.call');
          SM2.flow(root, {
            auto: o.live, state: o.state, say: SM2.sayDefault,
            onState: function (s) {
              call.disabled = s === 'gps' || s === 'wifi';
              call.textContent = s === 'ready' ? 'ABSEN' : s === 'gps' || s === 'wifi' ? '...' : 'CEK';
              call.setAttribute('data-go', s === 'ready' ? 'done' : 'gps');
              call.setAttribute('aria-label', s === 'ready' ? 'Absen masuk' : 'Cek lokasi dan WiFi');
            }
          });
        }
      },
      ortu: {
        tone: 'light',
        html: function () {
          return '<div class="top"><div class="cap">Orang tua · ' + D.siswa.nama + ' · ' + D.siswa.kelas + '</div><div class="or-head">' + frame(342, 150, 14) + '<div class="cap" style="color:var(--kuningan)">Jumat · 25 September</div><b>06.41</b><span>Sudah masuk, 14 menit sebelum bel</span></div>' +
            '<div class="cap" style="margin-top:24px">Minggu ini</div>' + towers() +
            '<div class="rows"><div>Kabari saat masuk dan pulang<span class="knob"></span></div><div>Kabari kalau belum absen 07.15<span class="knob"></span></div></div></div>' + nav(0);
        }
      },
      notif: {
        tone: 'light',
        html: function () {
          var ic = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#C9A43A"/><path d="M8 26a12 12 0 0 1 24 0" fill="none" stroke="#1E1606" stroke-width="2.5"/><path d="M20 26l5-8" stroke="#1E1606" stroke-width="2.5"/></svg>';
          return burst(844, 40) + '<div class="nt-clock"><span class="cap" style="color:var(--gading)">Jumat · 25 September</span><b>06.41</b></div>' +
            '<div class="nt"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>SEKARANG</span></span><b>' + D.siswa.nama + ' sudah masuk</b><span>06.41, 14 menit sebelum bel.</span></div>' +
            '<div class="nt b"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>KEMARIN</span></span><b>Masuk 06.40</b><span>Kamis, 24 September. Tepat waktu.</span></div>';
        }
      },
      izin: {
        tone: 'light',
        html: function () {
          return '<div class="top iz"><div class="cap">Untuk wali kelas XI-3</div><h2>Surat izin</h2>' +
            '<div class="cap lab">Alasan</div><div class="tok"><div class="on">' + frame(160, 74, 10) + '<i>S</i>Sakit</div><div>' + frame(160, 74, 10) + '<i>I</i>Izin keluarga</div></div>' +
            '<div class="cap lab">Hari tidak masuk</div><div class="flr">' + D.hariIzin.map(function (h, i) { return '<div class="' + (i === 0 ? 'on' : '') + '"><b>' + h[1] + '</b>' + h[0].toUpperCase() + '</div>'; }).join('') + '</div>' +
            '<div class="cap lab">Keterangan</div><div class="ta">' + frame(342, 90, 10) + 'Demam sejak semalam, istirahat di rumah.</div>' +
            '<div class="cap" style="margin-top:12px;letter-spacing:.1em">+ Foto surat dokter, tidak wajib</div>' +
            '<div style="margin-top:20px"><button class="dbtn brass">Kirim ke wali kelas</button></div></div>';
        }
      },
      rekap: {
        tone: 'light',
        html: function () {
          var r = D.ringkas;
          return '<div class="top rk"><div class="cap">Rekap bulan ini</div><h2>September</h2><div style="margin-top:26px">' + skyline(342, 330, { labels: true }) + '</div>' +
            '<div class="cap" style="margin-top:6px;letter-spacing:.08em;font-size:12.5px">Gedung tinggi = datang lebih pagi · jingga = terlambat · garis putus = sakit</div>' +
            '<div class="stat"><div><b>' + r.hadir + '/' + r.hari + '</b><span>HADIR</span></div><div><b>' + r.rata + '</b><span>RATA-RATA</span></div><div><b>' + r.pagi + '</b><span>PALING PAGI</span></div></div></div>' + nav(2);
        }
      },
      laptop: {
        html: function () {
          var r = D.ringkas;
          return '<div class="lp"><div class="lp-l">' + burst(820, 36) + '<div class="cap">Orang tua · ' + D.siswa.nama + ' · XI-3</div><h3>Sudah masuk</h3><div style="margin-top:18px;position:relative">' + dial() + '</div><div style="text-align:center;margin-top:6px;position:relative"><b class="pj" style="font-size:64px;color:#FFE08A">06.41</b><div class="cap">14 menit sebelum bel</div></div></div>' +
            '<div class="lp-r"><div style="display:flex;justify-content:space-between;align-items:baseline"><b class="pj" style="font-size:40px">September</b><span class="cap">' + r.hadir + ' dari ' + r.hari + ' hari hadir</span></div><div style="margin-top:14px">' + skyline(700, 330, { labels: true }) + '</div>' +
            '<div class="stat"><div><b>' + r.rata + '</b><span>RATA-RATA MASUK</span></div><div><b>' + r.T + '</b><span>TERLAMBAT</span></div><div><b>' + r.S + '</b><span>SAKIT</span></div></div></div></div>';
        }
      }
    }
  });
})();
