/* Tema 5, Rosario: untaian manik dari tradisi rosario (Oktober, Bulan Rosario) dengan salib kecil
   sebagai penghormatan pada Yayasan Salib Suci. Paling bersih dari kelima arah.
   Absen = geser manik sampai ke salib. Rekap bulanan = untaian melingkar, satu manik satu hari sekolah. */
(function () {
  var D = SM2.data;
  function cross(x, y, s, cls) { var w = s * 0.28; return '<path class="' + (cls || 'cr') + '" d="M' + (x - w / 2) + ' ' + y + 'h' + w + 'v' + (s * 0.3) + 'h' + (s * 0.28) + 'v' + w + 'h' + (-s * 0.28) + 'v' + (s * 0.7 - w) + 'h' + (-w) + 'v' + (-(s * 0.7 - w)) + 'h' + (-s * 0.28) + 'v' + (-w) + 'h' + (s * 0.28) + 'z"/>'; }
  // Untaian melingkar bulanan dengan liontin salib
  function loop(size, opts) {
    opts = opts || {};
    var c = size / 2, R = size * 0.36, cy = size * 0.42, n = D.bulan.length, s = '', a0 = Math.PI / 2 + Math.PI / n;
    s += '<circle cx="' + c + '" cy="' + cy + '" r="' + R + '" class="str"/>';
    s += '<path d="M' + c + ' ' + (cy + R) + 'V' + (cy + R + size * 0.12) + '" class="str"/>';
    D.bulan.forEach(function (x, i) {
      var a = a0 + i * 2 * Math.PI / (n + 1), X = c + R * Math.cos(a), Y = cy + R * Math.sin(a), r = size * 0.028;
      s += '<g class="bd k' + (x.k || 'F') + (x.today ? ' today' : '') + '" style="--i:' + i + '"><circle cx="' + X.toFixed(1) + '" cy="' + Y.toFixed(1) + '" r="' + r.toFixed(1) + '"/><title>' + x.h + ' ' + x.d + ' Sep: ' + (x.future ? 'belum berjalan' : SM2.label[x.k] + (x.j ? ' ' + x.j : '')) + '</title></g>';
    });
    s += '<circle cx="' + c + '" cy="' + (cy + R) + '" r="' + (size * 0.04) + '" class="knot"/>';
    s += cross(c, cy + R + size * 0.12, size * 0.16, 'cr');
    var mid = opts.center === false ? '' : '<text x="' + c + '" y="' + (cy + 6) + '" class="lv">' + D.ringkas.hadir + '<tspan class="lv2"> / ' + D.ringkas.hari + '</tspan></text><text x="' + c + '" y="' + (cy + 32) + '" class="ll">hari hadir</text>';
    return '<svg class="loop" viewBox="0 0 ' + size + ' ' + (size * 0.98) + '" role="img" aria-label="Untaian September: ' + D.ringkas.hadir + ' dari ' + D.ringkas.hari + ' hari hadir">' + s + mid + '</svg>';
  }
  // Satu dasa: lima manik Senin sampai Jumat pada lengkung
  function decade(w, opts) {
    var h = 120, s = '', pts = [];
    for (var i = 0; i < 5; i++) { var t = i / 4, x = 30 + (w - 60) * t, y = 30 + Math.sin(Math.PI * t) * 34; pts.push([x, y]); }
    s += '<path d="M0 24 C ' + w * 0.3 + ' 76, ' + w * 0.7 + ' 76, ' + w + ' 24" class="str"/>';
    D.minggu.forEach(function (x, i) {
      var p = pts[i];
      s += '<g class="bd k' + x.k + (x.today ? ' today' : '') + '" style="--i:' + i + '"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="13"/></g><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 34).toFixed(1) + '" class="dt">' + x.h + '</text><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 50).toFixed(1) + '" class="dj">' + x.j + '</text>';
    });
    return '<svg class="decade" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Minggu ini: ' + D.minggu.map(function (x) { return x.h + ' ' + x.j; }).join(', ') + '">' + s + '</svg>';
  }

  var css = `
.t-rosario .hadir,.t-rosario .glow,.t-rosario .say,.t-rosario .strand{pointer-events:none}
.t-rosario{--mutiara:#F6F7FB;--putih:#fff;--biru:#2B4C9B;--biru2:#3E63B8;--biru-muda:#DCE5F7;--tinta:#141A2E;--redup:#5A6178;--perak:#AEB6C7;--amber:#A8661A;--mawar:#C8566F;background:var(--mutiara);color:var(--tinta);font:16px/1.5 "Be Vietnam Pro",system-ui,sans-serif}
.t-rosario *{box-sizing:border-box}
.t-rosario .cs{font-family:"Castoro",Georgia,serif}
.t-rosario .str{fill:none;stroke:var(--perak);stroke-width:1.6}
.t-rosario .bd circle{fill:#fff;stroke:#C7CEDC;stroke-width:1.5;filter:drop-shadow(0 1.5px 1.5px rgba(20,26,46,.12))}
.t-rosario .bd.kH circle{fill:var(--biru);stroke:var(--biru)}
.t-rosario .bd.kT circle{fill:#fff;stroke:var(--amber);stroke-width:3}
.t-rosario .bd.kS circle,.t-rosario .bd.kI circle{fill:var(--biru-muda);stroke:var(--biru2);stroke-width:1.5;stroke-dasharray:2.5 2.5}
.t-rosario .bd.kA circle{fill:var(--mawar);stroke:var(--mawar)}
.t-rosario .bd.kF circle{fill:#fff;stroke:#DDE2EC}
.t-rosario .bd.today circle{stroke:#fff;stroke-width:2.5;paint-order:stroke;filter:drop-shadow(0 0 7px rgba(43,76,155,.6))}
.t-rosario .bd{opacity:0;animation:rIn .5s ease forwards;animation-delay:calc(var(--i) * 55ms + .1s)}
@keyframes rIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.t-rosario .bd.today{animation:rIn .5s ease forwards,rPulse 2.4s ease-in-out infinite;animation-delay:calc(var(--i) * 55ms + .1s),2s;transform-box:fill-box;transform-origin:center}
@keyframes rPulse{50%{transform:scale(1.18)}}
.t-rosario .knot{fill:var(--mawar)}
.t-rosario .cr{fill:var(--biru)}
.t-rosario .loop .lv{font:400 54px "Castoro",serif;fill:var(--tinta);text-anchor:middle}
.t-rosario .loop .lv2{font-size:28px;fill:var(--redup)}
.t-rosario .loop .ll{font:500 13px "Be Vietnam Pro",sans-serif;fill:var(--redup);text-anchor:middle;letter-spacing:.04em}
.t-rosario .decade{width:100%;display:block;overflow:visible}
.t-rosario .decade .dt{font:600 12.5px "Be Vietnam Pro",sans-serif;fill:var(--tinta);text-anchor:middle}
.t-rosario .decade .dj{font:400 12px "Be Vietnam Pro",sans-serif;fill:var(--redup);text-anchor:middle}
.t-rosario .top{position:absolute;left:28px;right:28px;top:68px}
.t-rosario .kick{font-size:14px;color:var(--redup);font-weight:500}
.t-rosario .rbtn{appearance:none;border:0;height:56px;width:100%;border-radius:28px;font:600 16px "Be Vietnam Pro",sans-serif;cursor:pointer;background:var(--biru);color:#fff}
.t-rosario .rbtn.line{background:transparent;color:var(--biru);box-shadow:inset 0 0 0 1.5px #C7CEDC}
.t-rosario .rbtn:disabled{opacity:.6;cursor:progress}
.t-rosario .rbtn:focus-visible{outline:3px solid var(--biru2);outline-offset:3px}
.t-rosario .muted{color:var(--redup)}

/* Sambut */
.t-rosario .flow{position:absolute;left:0;top:130px;width:390px;height:420px}
.t-rosario .flow .str{stroke-width:1.4}
.t-rosario .flow .fb{fill:#fff;stroke:#C7CEDC;stroke-width:1.2;filter:drop-shadow(0 2px 2px rgba(20,26,46,.1));offset-path:path("M-20 60 C 120 20, 230 220, 180 300 S 260 420, 420 380");animation:rTravel 16s linear infinite;animation-delay:calc(var(--i) * -0.8s)}
.t-rosario .flow .fb.b{fill:var(--biru);stroke:var(--biru)}
@keyframes rTravel{from{offset-distance:0%}to{offset-distance:100%}}
.t-rosario .sm-copy{position:absolute;left:28px;right:28px;bottom:170px}
.t-rosario .sm-copy h1{font:400 50px/1.02 "Castoro",serif;margin:0}
.t-rosario .sm-copy h1 i{color:var(--biru)}
.t-rosario .sm-copy p{margin:12px 0 0;color:var(--redup)}
.t-rosario .sm-act{position:absolute;left:28px;right:28px;bottom:42px;display:grid;gap:10px;text-align:center}
.t-rosario .sm-act span{color:var(--biru);font-weight:600;padding:6px}

/* Absen */
.t-rosario .ab-time{font:400 96px/0.9 "Castoro",serif;letter-spacing:-.02em;margin-top:8px}
.t-rosario .ab-time i{font-style:italic}
.t-rosario .ab-bel{margin-top:10px;font-weight:600;color:var(--biru)}
.t-rosario .strand{position:absolute;left:0;top:296px;width:390px;height:190px}
.t-rosario .strand svg{width:100%;height:100%;overflow:visible}
.t-rosario .strand .sb2{fill:#fff;stroke:#C7CEDC;stroke-width:1.2}
.t-rosario .strand .ck circle.b{fill:#fff;stroke:#C7CEDC;stroke-width:1.5;transition:fill .5s,stroke .5s}
.t-rosario .strand .ck .rip{fill:none;stroke:var(--biru);stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center}
.t-rosario .strand text{font:600 12.5px "Be Vietnam Pro",sans-serif;fill:var(--tinta);text-anchor:middle}
.t-rosario .strand text.s{font-weight:400;fill:var(--redup)}
.t-rosario[data-state="gps"] .ck.g .rip,.t-rosario[data-state="wifi"] .ck.w .rip{animation:rRip 1.3s ease-out infinite}
@keyframes rRip{from{opacity:.8;transform:scale(1)}to{opacity:0;transform:scale(2.6)}}
.t-rosario[data-state="wifi"] .ck.g circle.b,.t-rosario[data-state="ready"] .ck circle.b,.t-rosario[data-state="done"] .ck circle.b{fill:var(--biru);stroke:var(--biru)}
.t-rosario[data-state="fail"] .ck.g circle.b{fill:#fff;stroke:var(--mawar);stroke-width:3}
.t-rosario .strand .lit{fill:#fff;stroke:#C7CEDC;stroke-width:1.2;transition:fill .4s,stroke .4s;transition-delay:calc(var(--i) * 70ms)}
.t-rosario[data-state="done"] .strand .lit{fill:var(--biru);stroke:var(--biru)}
.t-rosario .slide{position:absolute;left:28px;right:28px;top:548px;height:72px;border-radius:36px;background:#fff;box-shadow:inset 0 0 0 1.5px #DDE2EC;transition:opacity .4s}
.t-rosario .slide .line{position:absolute;left:36px;right:40px;top:35px;height:1.6px;background:var(--perak)}
.t-rosario .slide .hint{position:absolute;left:0;right:0;top:0;line-height:72px;text-align:center;font-weight:600;color:var(--redup);font-size:15px;padding-left:40px}
.t-rosario .slide .hint span{background:#fff;padding:0 10px}
.t-rosario .slide .end{position:absolute;right:20px;top:18px;width:26px;height:36px}
.t-rosario .slide .end .cr{fill:var(--biru)}
.t-rosario .handle{position:absolute;left:6px;top:6px;width:60px;height:60px;border-radius:50%;border:0;padding:0;cursor:grab;background:radial-gradient(circle at 36% 30%,#fff 0 10%,#E9EEF8 30%,#C9D3E8 75%,#AEB9D2);box-shadow:0 4px 12px -2px rgba(20,26,46,.28);transform:translateX(calc(var(--p,0) * 262px));touch-action:none}
.t-rosario .handle.go{transition:transform .9s cubic-bezier(.5,0,.3,1)}
.t-rosario .handle.back{transition:transform .35s ease}
.t-rosario .handle:focus-visible{outline:3px solid var(--biru2);outline-offset:3px}
.t-rosario[data-state="ready"] .handle{background:radial-gradient(circle at 36% 30%,#fff 0 10%,#7F9BDA 35%,#2B4C9B 80%);animation:rNudge 1.8s ease-in-out infinite}
@keyframes rNudge{0%,100%{margin-left:0}40%{margin-left:14px}}
.t-rosario[data-state="ready"] .handle.go,.t-rosario[data-state="ready"] .handle.drag{animation:none}
.t-rosario:not([data-state="ready"]) .slide{opacity:.45}
.t-rosario:not([data-state="ready"]) .handle{cursor:default}
.t-rosario[data-state="done"] .slide{opacity:0}
.t-rosario .say{position:absolute;left:28px;right:28px;top:630px;text-align:center;font-size:14px;color:var(--redup)}
.t-rosario .act{position:absolute;left:28px;right:28px;bottom:40px}
.t-rosario .act>*{display:none}
.t-rosario[data-state="idle"] .act [data-show~="idle"],.t-rosario[data-state="gps"] .act [data-show~="scan"],.t-rosario[data-state="wifi"] .act [data-show~="scan"],.t-rosario[data-state="done"] .act [data-show~="done"],.t-rosario[data-state="fail"] .act [data-show~="fail"]{display:block}
.t-rosario .hadir{position:absolute;left:28px;right:28px;top:520px;opacity:0;transform:translateY(10px);transition:opacity .7s .3s,transform .7s .3s}
.t-rosario[data-state="done"] .hadir{opacity:1;transform:none}
.t-rosario[data-state="done"] .say{opacity:0}
.t-rosario .hadir b{display:block;font:italic 400 60px/1 "Castoro",serif;color:var(--biru)}
.t-rosario .hadir span{display:block;margin-top:6px;font-weight:500}
.t-rosario .glow{position:absolute;left:50%;top:584px;width:10px;height:10px;margin:-5px;border-radius:50%;background:rgba(43,76,155,.25);opacity:0}
.t-rosario[data-state="done"] .glow{animation:rGlow 1.2s ease-out}
@keyframes rGlow{from{opacity:.8;transform:scale(1)}to{opacity:0;transform:scale(60)}}
.t-rosario .fail{position:absolute;left:28px;right:28px;top:548px;display:none;background:#fff;border-radius:18px;padding:14px 16px;box-shadow:inset 0 0 0 1.5px #F0C6CF;font-size:14.5px}
.t-rosario .fail b{display:block;color:#A33A52}
.t-rosario[data-state="fail"] .fail{display:block}
.t-rosario[data-state="fail"] .slide,.t-rosario[data-state="fail"] .say{display:none}

/* Orang tua */
.t-rosario .or h1{font:400 38px/1.12 "Castoro",serif;margin:8px 0 0}
.t-rosario .or h1 i{color:var(--biru)}
.t-rosario .or .sub{margin-top:10px;color:var(--redup);font-size:15px}
.t-rosario .panel{background:#fff;border-radius:24px;padding:18px 18px 12px;margin-top:22px;box-shadow:0 1px 0 #E6E9F1}
.t-rosario .panel h3{margin:0 0 4px;font-size:14px;font-weight:600;color:var(--redup)}
.t-rosario .rw{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-top:1px solid #EEF0F5;font-size:15px}
.t-rosario .rw:first-of-type{border-top:0}
.t-rosario .tg{width:44px;height:26px;border-radius:13px;background:var(--biru);position:relative}
.t-rosario .tg::after{content:"";position:absolute;right:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff}
.t-rosario .r-nav{position:absolute;left:0;right:0;bottom:0;height:84px;background:#fff;border-top:1px solid #E6E9F1;display:flex;justify-content:space-around;padding:12px 0 26px;font-size:12.5px;font-weight:600;color:var(--redup)}
.t-rosario .r-nav span{display:grid;justify-items:center;gap:3px}
.t-rosario .r-nav .on{color:var(--biru)}
.t-rosario .r-nav svg{width:24px;height:24px}

/* Notifikasi */
.t-rosario .nt-bg{position:absolute;inset:0;background:linear-gradient(180deg,#DCE5F7,#F6F7FB 60%)}
.t-rosario .nt-clock{position:absolute;left:0;right:0;top:112px;text-align:center}
.t-rosario .nt-clock b{display:block;font:400 100px/1 "Castoro",serif;color:var(--tinta)}
.t-rosario .nt{position:absolute;left:14px;right:14px;top:420px;background:rgba(255,255,255,.92);border-radius:22px;padding:14px 16px;display:grid;grid-template-columns:40px 1fr;gap:3px 12px;box-shadow:0 10px 30px -14px rgba(20,26,46,.35);animation:rDrop 5.5s cubic-bezier(.2,.9,.3,1.2) infinite}
.t-rosario .nt.b{top:530px;animation:none;opacity:.85}
.t-rosario .nt .ic{grid-row:span 3;width:40px;height:40px;border-radius:12px;background:var(--biru);display:grid;place-items:center}
.t-rosario .nt .ap{font-size:13px;color:var(--redup);display:flex;justify-content:space-between}
.t-rosario .nt b{font-size:15.5px}
.t-rosario .nt span{font-size:14.5px}
@keyframes rDrop{0%{transform:translateY(-110px);opacity:0}10%,85%{transform:none;opacity:1}100%{transform:translateY(-16px);opacity:0}}

/* Izin */
.t-rosario .iz h1{font:400 40px/1.05 "Castoro",serif;margin:6px 0 0}
.t-rosario .lab{font-size:13.5px;font-weight:600;color:var(--redup);margin:22px 0 10px}
.t-rosario .ch{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t-rosario .ch div{background:#fff;border-radius:20px;padding:14px;display:flex;align-items:center;gap:10px;font-weight:600;box-shadow:inset 0 0 0 1.5px #DDE2EC}
.t-rosario .ch i{width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 1.5px #C7CEDC}
.t-rosario .ch .on{box-shadow:inset 0 0 0 2px var(--biru)}
.t-rosario .ch .on i{background:var(--biru);box-shadow:none}
.t-rosario .dy{position:relative;height:96px}
.t-rosario .dy svg{width:100%;height:100%;overflow:visible}
.t-rosario .dy text{font:600 12.5px "Be Vietnam Pro",sans-serif;fill:var(--tinta);text-anchor:middle}
.t-rosario .dy text.s{font-weight:400;fill:var(--redup)}
.t-rosario .ta{background:#fff;border-radius:20px;padding:14px 16px;height:92px;box-shadow:inset 0 0 0 1.5px #DDE2EC;font-size:15px}

/* Rekap */
.t-rosario .rk h1{font:400 44px/1 "Castoro",serif;margin:6px 0 0}
.t-rosario .rk .loop{width:334px;display:block;margin:10px auto 0}
.t-rosario .kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}
.t-rosario .kv div{background:#fff;border-radius:18px;padding:12px;text-align:center}
.t-rosario .kv b{display:block;font:400 26px/1.1 "Castoro",serif}
.t-rosario .kv span{font-size:12px;color:var(--redup)}
.t-rosario .key{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;color:var(--redup);margin-top:10px}
.t-rosario .key i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:5px;vertical-align:-1px}

/* Laptop */
.t-rosario .lp{position:absolute;inset:0;display:grid;grid-template-columns:520px 1fr}
.t-rosario .lp-l{background:#fff;padding:36px 40px;display:grid;align-content:start}
.t-rosario .lp-r{padding:44px 48px}
`;
  var I = {
    bead: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="6"/><path d="M2 12h4M18 12h4"/></svg>',
    env: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="6" width="17" height="12" rx="3"/><path d="M4 8l8 5.5L20 8"/></svg>',
    loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="6.5"/><path d="M12 16.5V22M9.5 19.5h5"/></svg>'
  };
  function nav(a) { return '<nav class="r-nav">' + [['bead', 'Hari ini'], ['env', 'Izin'], ['loop', 'Rekap']].map(function (x, i) { return '<span class="' + (i === a ? 'on' : '') + '">' + I[x[0]] + x[1] + '</span>'; }).join('') + '</nav>'; }

  SM2.register('rosario', {
    name: 'Rosario',
    fonts: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Castoro:ital@0;1&display=swap',
    css: css, loop: loop, decade: decade, cross: cross,
    screens: {
      sambut: {
        tone: 'dark',
        html: function () {
          var b = ''; for (var i = 0; i < 20; i++) b += '<circle class="fb' + (i % 5 === 4 ? ' b' : '') + '" r="' + (i % 5 === 4 ? 9 : 7) + '" style="--i:' + i + '"/>';
          return '<div class="flow" aria-hidden="true"><svg viewBox="0 0 390 420"><path d="M-20 60 C 120 20, 230 220, 180 300 S 260 420, 420 380" class="str"/>' + b + '</svg></div>' +
            '<div class="top"><span class="kick">SMA Santa Maria 1 · Bandung</span></div>' +
            '<div class="sm-copy"><h1>Satu manik,<br><i>satu hari.</i></h1><p>Absensi siswa · Jl. Bengawan No. 6</p></div>' +
            '<div class="sm-act"><button class="rbtn">Masuk dengan akun sekolah</button><span>Saya orang tua / wali</span></div>';
        }
      },
      absen: {
        tone: 'dark',
        html: function () {
          var d = 'M-10 40 C 90 170, 300 170, 400 40', lits = '';
          [[40, 88], [82, 116], [124, 134], [266, 134], [308, 116], [350, 88]].forEach(function (p, i) { lits += '<circle class="lit" cx="' + p[0] + '" cy="' + p[1] + '" r="7" style="--i:' + i + '"/>'; });
          return '<div class="top"><div class="kick">' + D.tanggal + '</div><div class="ab-time"><i>' + D.now + '</i></div><div class="ab-bel">Bel ' + D.school.bel + ' · ' + SM2.sebelumBel(D.now) + ' menit lagi</div></div>' +
            '<div class="strand" aria-hidden="true"><svg viewBox="0 0 390 190"><path d="' + d + '" class="str"/>' + lits +
            '<g class="ck g"><circle class="rip" cx="165" cy="140" r="13"/><circle class="b" cx="165" cy="140" r="13"/><text x="165" y="174">GPS</text></g>' +
            '<g class="ck w"><circle class="rip" cx="225" cy="140" r="13"/><circle class="b" cx="225" cy="140" r="13"/><text x="225" y="174">WiFi</text></g></svg></div>' +
            '<div class="slide"><span class="line"></span><span class="hint"><span>Geser manik ke salib</span></span><svg class="end" viewBox="0 0 26 36" aria-hidden="true">' + cross(13, 0, 36, 'cr') + '</svg><button class="handle" aria-label="Geser untuk absen masuk. Tekan Enter untuk absen."></button></div>' +
            '<span class="glow" aria-hidden="true"></span>' +
            '<div class="hadir"><b>Hadir.</b><span>Masuk 06.41, tepat waktu. Orang tua sudah dikabari.</span></div>' +
            '<div class="fail"><b>Di luar area sekolah</b>Posisimu 1,4 km dari Jl. Bengawan 6. Absen hanya bisa dalam radius 75 m.</div>' +
            '<p class="say" data-live-text aria-live="polite"></p>' +
            '<div class="act"><button class="rbtn" data-show="idle" data-go="gps">Cek lokasi dan WiFi</button><button class="rbtn" data-show="scan" disabled>Mengecek...</button><button class="rbtn line" data-show="done" data-go="idle">Ulangi</button><button class="rbtn line" data-show="fail">Cek ulang</button></div>';
        },
        mount: function (root, o) {
          var h = root.querySelector('.handle'), flow, t;
          function setP(p) { h.style.setProperty('--p', p); }
          flow = SM2.flow(root, {
            auto: o.live, state: o.state, say: function (s) { return { idle: 'Dua manik terisi setelah GPS dan WiFi cocok', gps: 'Mengecek lokasi GPS', wifi: 'Lokasi cocok. Mengecek WiFi sekolah', ready: 'Geser manik ke salib untuk absen', done: '', fail: '' }[s] || ''; },
            readyDur: 2600,
            onState: function (s, api) {
              clearTimeout(t); h.classList.remove('go', 'back');
              if (s === 'done') { setP(1); return; }
              setP(0);
              if (s === 'ready' && api && api.auto) { api.pause(); t = setTimeout(function () { h.classList.add('go'); setP(1); t = setTimeout(function () { api.go('done'); }, 950); }, 900); }
            }
          });
          if (o.state === 'done') setP(1);
          var drag = null;
          h.addEventListener('pointerdown', function (e) {
            if (root.getAttribute('data-state') !== 'ready') return;
            clearTimeout(t); flow.pause();
            drag = { x: e.clientX, w: h.parentNode.getBoundingClientRect().width };
            h.classList.remove('go', 'back'); h.classList.add('drag'); h.setPointerCapture(e.pointerId);
          });
          h.addEventListener('pointermove', function (e) {
            if (!drag) return;
            var scale = drag.w / 334, p = Math.max(0, Math.min(1, (e.clientX - drag.x) / (262 * scale)));
            drag.p = p; setP(p);
          });
          function end() {
            if (!drag) return;
            h.classList.remove('drag');
            if ((drag.p || 0) > 0.88) { setP(1); flow.go('done'); } else { h.classList.add('back'); setP(0); }
            drag = null;
          }
          h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
          h.addEventListener('click', function (e) { if (e.detail === 0 && root.getAttribute('data-state') === 'ready') flow.go('done'); });
        }
      },
      ortu: {
        tone: 'dark',
        html: function () {
          return '<div class="top or"><div class="kick">Orang tua · ' + D.siswa.nama + ', ' + D.siswa.kelas + '</div><h1>' + D.siswa.nama + ' masuk pukul <i>06.41</i>.</h1><div class="sub">Tepat waktu, 14 menit sebelum bel. Tercatat lewat GPS dan WiFi sekolah.</div>' +
            '<div class="panel"><h3>Minggu ini</h3>' + decade(300) + '</div>' +
            '<div class="panel"><div class="rw">Kabari saat masuk dan pulang<span class="tg"></span></div><div class="rw">Kabari kalau belum absen 07.15<span class="tg"></span></div></div></div>' + nav(0);
        }
      },
      notif: {
        tone: 'dark',
        html: function () {
          var ic = '<svg viewBox="0 0 40 40" width="26" aria-hidden="true"><circle cx="20" cy="14" r="8" fill="none" stroke="#fff" stroke-width="2.5"/>' + '<path d="M18.5 22h3v4h4v3h-4v7h-3v-7h-4v-3h4z" fill="#fff"/></svg>';
          return '<div class="nt-bg"></div><div class="nt-clock"><span style="font-weight:600;font-size:17px">Jumat, 25 September</span><b>06.41</b></div>' +
            '<div class="nt"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>sekarang</span></span><b>' + D.siswa.nama + ' sudah masuk</b><span>06.41, 14 menit sebelum bel.</span></div>' +
            '<div class="nt b"><span class="ic">' + ic + '</span><span class="ap"><span>ABSENSI SM1</span><span>kemarin</span></span><b>Masuk 06.40</b><span>Kamis, 24 September. Tepat waktu.</span></div>';
        }
      },
      izin: {
        tone: 'dark',
        html: function () {
          var s = '<path d="M0 20 C 110 70, 230 70, 334 20" class="str"/>';
          D.hariIzin.forEach(function (h, i) { var t = i / 4, x = 24 + 286 * t, y = 24 + Math.sin(Math.PI * t) * 24; s += '<g class="bd ' + (i < 2 ? 'kH' : 'kF') + '" style="--i:' + i + '"><circle cx="' + x + '" cy="' + y + '" r="13"/></g><text x="' + x + '" y="' + (y + 34) + '">' + h[0] + '</text><text x="' + x + '" y="' + (y + 50) + '" class="s">' + h[1] + '</text>'; });
          return '<div class="top iz"><div class="kick">Untuk wali kelas XI-3</div><h1>Ajukan izin</h1>' +
            '<div class="lab">Alasan</div><div class="ch"><div class="on"><i></i>Sakit</div><div><i></i>Izin keluarga</div></div>' +
            '<div class="lab">Hari tidak masuk</div><div class="dy"><svg viewBox="0 0 334 96" aria-hidden="true">' + s + '</svg></div>' +
            '<div class="lab">Keterangan</div><div class="ta">Demam sejak semalam, perlu istirahat dua hari.</div>' +
            '<div style="margin-top:12px;font-size:14px" class="muted">+ Foto surat dokter (tidak wajib)</div><div style="margin-top:18px"><button class="rbtn">Kirim ke wali kelas</button></div></div>';
        }
      },
      rekap: {
        tone: 'dark',
        html: function () {
          var r = D.ringkas;
          return '<div class="top rk"><div class="kick">Rekap bulan ini</div><h1>September</h1>' + loop(334) +
            '<div class="key"><span><i style="background:#2B4C9B"></i>Hadir</span><span><i style="box-shadow:inset 0 0 0 2.5px #A8661A"></i>Terlambat</span><span><i style="background:#DCE5F7;box-shadow:inset 0 0 0 1.5px #3E63B8"></i>Sakit</span><span><i style="box-shadow:inset 0 0 0 1.5px #DDE2EC;background:#fff"></i>Belum</span></div>' +
            '<div class="kv" style="margin-top:12px"><div><b>' + r.rata + '</b><span>rata-rata masuk</span></div><div><b>' + r.pagi + '</b><span>paling pagi</span></div><div><b>' + r.T + '</b><span>terlambat</span></div></div></div>' + nav(2);
        }
      },
      laptop: {
        html: function () {
          var r = D.ringkas;
          return '<div class="lp"><div class="lp-l"><div class="kick">Rekap September</div>' + loop(440) + '<div class="kv"><div><b>' + r.rata + '</b><span>rata-rata masuk</span></div><div><b>' + r.pagi + '</b><span>paling pagi</span></div><div><b>' + r.T + '</b><span>terlambat</span></div></div></div>' +
            '<div class="lp-r or"><div class="kick">Orang tua · ' + D.siswa.nama + ', ' + D.siswa.kelas + ' · Jumat, 25 September</div><h1 style="font:400 52px/1.08 Castoro,serif;margin:10px 0 0">' + D.siswa.nama + ' masuk pukul <i style="color:#2B4C9B">06.41</i>.</h1><div class="sub" style="font-size:17px">Tepat waktu, 14 menit sebelum bel.</div>' +
            '<div class="panel" style="max-width:560px"><h3>Minggu ini</h3>' + decade(520) + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:560px"><div class="panel"><h3>Izin terakhir</h3><b>Sakit · Rab 9 Sep</b><div style="color:#2B4C9B;font-weight:600">Disetujui wali kelas</div></div><div class="panel"><h3>Tata Usaha</h3><b>' + D.school.telp + '</b><div class="muted">Jl. Bengawan No. 6</div></div></div></div></div>';
        }
      }
    }
  });
})();
