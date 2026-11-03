/* Print-head intro: the die folds its top into a nozzle, prints the name layer by layer,
   then folds back into the die beside the finished name. Pure function of time: seek(t). */
function PDIntro(svg, D) {
  var NS = "http://www.w3.org/2000/svg";
  var uid = "pd" + Math.random().toString(36).slice(2, 7);
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  var ACC = D.accent || "#8F74FF", INK = "#0A0A0C", TXT = "#F4F2EE", MUTED = "#8E8E99";
  function shade(hex, k) { // the accent darkened toward black by k, so every violet comes from one colour
    var n = parseInt(hex.slice(1), 16);
    var f = function (c) { var v = Math.round(c * (1 - k)).toString(16); return v.length < 2 ? "0" + v : v; };
    return "#" + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
  }
  var UNDER = shade(ACC, 0.3), CONE_L = shade(ACC, 0.12);
  var NOZ = 0.5; // nozzle length below the die, in die edges

  // ---- timeline (seconds)
  var T = { rest: 0.5, fold: 0.9, morph: 0.55, print: 2.2, ret: 0.55, unfold: 0.8, hold: 1.1 };
  var t0 = {}, acc = 0;
  ["rest", "fold", "morph", "print", "ret", "unfold", "hold"].forEach(function (k) { t0[k] = acc; acc += T[k]; });
  var DURATION = acc;
  var TILT = 30 * Math.PI / 180, HEAD = 0.5;

  // ---- layout (stage 1000 x 360)
  var K = 0.95, WX0 = 7, WX1 = 638.9, WTOP = -108, WBOT = 2;
  var TX = 255 - WX0 * K, TY = 238;                 // wordmark origin (baseline)
  var X0 = TX + WX0 * K, X1 = TX + WX1 * K, YT = TY + WTOP * K, YB = TY + WBOT * K;
  var E = (YB - YT) / 1.633;                        // die edge at rest (die as tall as the text block)
  var REST = { x: X0 - 21 - E * 0.7071, y: (YT + YB) / 2 };

  // ---- print plan: DUNGEON first (full width), then "3D PRINT" on top, only as wide as the label.
  // Layer time follows travel, so the short label layers go quicker.
  function X(u) { return TX + u * K; }
  function Y(v) { return TY + v * K; }
  var LABEL_W = D.labelWidth || 172.5;
  var GROUPS = [{ from: 2, to: -77.5, n: 10, x0: WX0, x1: WX1 }, { from: -86.5, to: -108.5, n: 4, x0: WX0, x1: WX0 + LABEL_W }];
  var PLAN = [], tsum = 0, idx = 0;
  GROUPS.forEach(function (g, gi) {
    if (gi > 0) tsum += 0.18; // step up over the gap between the two lines
    for (var j = 0; j < g.n; j++) {
      var xa = X(g.x0), xb = X(g.x1), d = 0.035 + 0.13 * (xb - xa) / (X1 - X0);
      PLAN.push({ yb: Y(g.from + (g.to - g.from) * j / g.n), yt: Y(g.from + (g.to - g.from) * (j + 1) / g.n),
                  xa: xa, xb: xb, dir: idx % 2 === 0 ? 1 : -1, s: tsum, d: d, first: j === 0 });
      tsum += d; idx++;
    }
  });
  PLAN.forEach(function (L) { L.s *= T.print / tsum; L.d *= T.print / tsum; });

  // ---- 3D: cube corners at +-1, iso camera (Y 45deg, then X 35.26deg + tilt)
  var B45 = Math.PI / 4, ISO = Math.atan(1 / Math.sqrt(2));
  function project(p, st) {
    var cb = Math.cos(B45), sb = Math.sin(B45);
    var x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb, y1 = p[1];
    var a = ISO + st.tilt, ca = Math.cos(a), sa = Math.sin(a);
    var y2 = y1 * ca - z1 * sa, z2 = y1 * sa + z1 * ca;
    var S = (E / 2) * st.scale;
    return [st.cx + x1 * S, st.cy - y2 * S, z2];
  }
  function matrix(O, U, V) { // face-local (0..100) -> screen
    return "matrix(" + [(U[0] - O[0]) / 100, (U[1] - O[1]) / 100, (V[0] - O[0]) / 100, (V[1] - O[1]) / 100, O[0], O[1]].join(" ") + ")";
  }
  var UL = [-1, 1, -1], TB = [1, 1, -1], UR = [1, 1, 1], CF = [-1, 1, 1];
  function flapTip(phi) { // back corner of the top face, rotated about the UL-UR diagonal toward the viewer
    var r = Math.SQRT2, c = Math.cos(phi), s = Math.sin(phi);
    // M = (0,1,0); T-M = (1,0,-1); up = (0,sqrt2,0)
    return [c * 1, 1 + s * r, c * -1];
  }

  // ---- build the scene
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute("viewBox", "0 0 1000 360");
  var defs = el("defs", {}, svg);
  el("rect", { width: 1000, height: 360, fill: INK }, svg);
  el("filter", { id: uid + "glow", x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs)
    .appendChild(el("feGaussianBlur", { stdDeviation: 3 }));
  // clip shapes in face-local units: plate and the two halves of the top face (split on the u=v diagonal)
  el("rect", { x: 3, y: 3, width: 94, height: 94, rx: 5, id: uid + "plate" }, defs);
  var cpBack = el("clipPath", { id: uid + "back" }, defs);
  el("polygon", { points: "0.8,0 100,0 100,99.2" }, cpBack);
  var cpFront = el("clipPath", { id: uid + "front" }, defs);
  el("polygon", { points: "0,0.8 0,100 99.2,100" }, cpFront);

  // print bed
  var bed = el("line", { x1: X0 - 14, x2: X1 + 14, y1: YB + 7, y2: YB + 7, stroke: "#2A2A33", "stroke-width": 2, "stroke-linecap": "round" }, svg);

  // the wordmark, revealed layer by layer
  var word = el("g", { id: uid + "word" }, defs);
  el("path", { d: D.label, fill: MUTED, transform: "translate(" + TX + " " + TY + ") scale(" + K + ")" }, word);
  el("path", { d: D.letters, fill: TXT, "fill-rule": "evenodd", transform: "translate(" + TX + " " + TY + ") scale(" + K + ")" }, word);
  var wordHot = el("g", { id: uid + "hot" }, defs);
  el("path", { d: D.label, fill: ACC, transform: "translate(" + TX + " " + TY + ") scale(" + K + ")" }, wordHot);
  el("path", { d: D.letters, fill: ACC, "fill-rule": "evenodd", transform: "translate(" + TX + " " + TY + ") scale(" + K + ")" }, wordHot);
  var layers = [];
  PLAN.forEach(function (L, i) {
    var cp = el("clipPath", { id: uid + "L" + i }, defs);
    var r = el("rect", { x: L.xa, y: L.yt - 0.3, width: 0, height: L.yb - L.yt + 0.6 }, cp);
    el("use", { href: "#" + uid + "word", "clip-path": "url(#" + uid + "L" + i + ")" }, svg);
    var hot = el("use", { href: "#" + uid + "hot", "clip-path": "url(#" + uid + "L" + i + ")", opacity: 0 }, svg);
    layers.push({ rect: r, hot: hot });
  });
  // layer lines over the fresh print (fade away at the end so the logo is clean)
  var lines = el("g", { stroke: INK, "stroke-width": 1, opacity: 0 }, svg);
  PLAN.forEach(function (L) { if (!L.first) el("line", { x1: L.xa - 3, x2: L.xb + 3, y1: L.yb, y2: L.yb }, lines); });

  // the die
  var head = el("g", {}, svg);
  function face(sym, clip) {
    var g = el("g", {}, head);
    var inner = el("g", clip ? { "clip-path": "url(#" + uid + clip + ")" } : {}, g);
    el("use", { href: "#" + uid + "plate", fill: ACC }, inner);
    var ink = sym ? el("path", { d: sym, fill: INK, "fill-rule": "evenodd" }, inner) : null;
    var shade = el("use", { href: "#" + uid + "plate", fill: "#000", opacity: 0 }, inner);
    return { g: g, ink: ink, shade: shade };
  }
  // the top: whole while the die rests; once the flap lifts, only its front half stays and the
  // space the flap left is open (the die loses its back top corner, as in the sketch)
  var fLeft = face(D.gate), fRight = face(D.eye), fTop = face(D.maze), fTopFront = face(D.maze, "front");
  var fFlap = face(D.maze, "back");
  // the nozzle hangs below the die; its top edge follows the die's V-shaped bottom so it sits flush
  var nozzle = el("g", { opacity: 0 }, head);
  var coneL = el("polygon", { fill: CONE_L }, nozzle), coneR = el("polygon", { fill: UNDER }, nozzle);
  var glow = el("circle", { r: 5, fill: ACC, filter: "url(#" + uid + "glow)", opacity: 0 }, svg);
  var tipDot = el("circle", { r: 1.8, fill: "#FFE7B8", opacity: 0 }, svg);

  // ---- state at time t
  function state(t) {
    var s = { tilt: 0, phi: 0, scale: 1, cx: REST.x, cy: REST.y, morph: 0, mazeAlpha: 1, print: 0, after: 0, bed: 0, lines: 0 };
    var f = ease(seg(t, t0.fold, t0.fold + T.fold));
    var u = ease(seg(t, t0.unfold, t0.unfold + T.unfold));
    s.phi = Math.PI * (f - u);
    s.tilt = TILT * (f - u);
    s.mazeAlpha = 1 - seg(t, t0.fold, t0.fold + 0.3) + seg(t, t0.unfold + T.unfold * 0.5, t0.unfold + T.unfold);
    var m = ease(seg(t, t0.morph, t0.morph + T.morph)), rt = ease(seg(t, t0.ret, t0.ret + T.ret));
    s.morph = m - rt;
    s.scale = lerp(1, HEAD, s.morph);
    s.print = seg(t, t0.print, t0.print + T.print);
    s.bed = seg(t, t0.morph, t0.morph + 0.3) - seg(t, t0.unfold, t0.unfold + 0.5);
    s.lines = seg(t, t0.print, t0.print + 0.2) - seg(t, t0.ret + 0.2, t0.unfold + 0.4);
    s.t = t;
    return s;
  }
  function tipOffset(st) { // nozzle tip relative to the die centre, for a given scale/tilt (morph = 1)
    var probe = { tilt: st.tilt, scale: st.scale, cx: 0, cy: 0 };
    var B = project([-1, -1, 1], probe);
    return [B[0], B[1] + (0.035 + NOZ) * E * st.scale];
  }
  function nozzleAt(tp) { // nozzle tip at print time tp (seconds into the print), boustrophedon
    for (var i = 0; i < PLAN.length; i++) {
      var L = PLAN[i];
      if (tp < L.s) { // stepping up between the two lines
        var P = PLAN[i - 1], pe = [P.dir > 0 ? P.xb : P.xa, P.yt], ls = [L.dir > 0 ? L.xa : L.xb, L.yt];
        var g = ease(clamp((tp - P.s - P.d) / (L.s - P.s - P.d), 0, 1));
        return [lerp(pe[0], ls[0], g), lerp(pe[1], ls[1], g)];
      }
      if (tp <= L.s + L.d) {
        var r = (tp - L.s) / L.d;
        return [L.dir > 0 ? lerp(L.xa, L.xb, r) : lerp(L.xb, L.xa, r), L.yt];
      }
    }
    var Z = PLAN[PLAN.length - 1];
    return [Z.dir > 0 ? Z.xb : Z.xa, Z.yt];
  }

  function render(t) {
    var st = state(t);
    // where the die is: at rest, travelling to/from the print, or riding the nozzle
    var startTip = nozzleAt(0), endTip = nozzleAt(T.print), tp = st.print * T.print;
    var off = tipOffset({ tilt: TILT, scale: HEAD });
    var printPos = st.print > 0 && t < t0.ret ? nozzleAt(tp) : (t >= t0.ret ? endTip : startTip);
    var target = { x: printPos[0] - off[0], y: printPos[1] - off[1] };
    var k = st.morph;
    st.cx = lerp(REST.x, target.x, k);
    st.cy = lerp(REST.y, target.y, k);

    var P = function (p) { return project(p, st); };
    var ul = P(UL), tb = P(TB), ur = P(UR), cf = P(CF);
    // side faces: left (-x) and right (+z), symbols upright
    fLeft.g.setAttribute("transform", matrix(P([-1, 1, -1]), P([-1, 1, 1]), P([-1, -1, -1])));
    fRight.g.setAttribute("transform", matrix(P([-1, 1, 1]), P([1, 1, 1]), P([-1, -1, 1])));
    // the back half of the top (the flap) folds over the diagonal toward the viewer
    var lifted = st.phi > 0.02 || st.morph > 0;
    fTop.g.setAttribute("transform", matrix(ul, tb, cf));
    fTopFront.g.setAttribute("transform", matrix(ul, tb, cf));
    fTop.g.setAttribute("opacity", lifted ? 0 : 1);
    fTopFront.g.setAttribute("opacity", lifted ? 1 : 0);
    fTopFront.ink.setAttribute("opacity", st.mazeAlpha);
    var tip = P(flapTip(st.phi));
    // hand-over: the folded flap sinks into the die (shrinks to nothing), then the nozzle slides out underneath
    var shrink = 1 - ease(clamp(st.morph / 0.45, 0, 1));
    var gx = (ul[0] + tip[0] + ur[0]) / 3, gy = (ul[1] + tip[1] + ur[1]) / 3;
    var sp = function (q) { return [gx + (q[0] - gx) * shrink, gy + (q[1] - gy) * shrink]; };
    var fa = sp(ul), fb = sp(tip), fc = sp(ur);
    fFlap.g.setAttribute("transform", "matrix(" + [(fb[0] - fa[0]) / 100, (fb[1] - fa[1]) / 100, (fc[0] - fb[0]) / 100, (fc[1] - fb[1]) / 100, fa[0], fa[1]].join(" ") + ")");
    fFlap.g.setAttribute("opacity", shrink > 0.02 ? 1 : 0);
    var cross = (tip[0] - ul[0]) * (ur[1] - ul[1]) - (tip[1] - ul[1]) * (ur[0] - ul[0]);
    var under = cross < 0; // the flap shows its underside once it passes upright
    fFlap.shade.setAttribute("opacity", under ? 0.3 : 0);
    fTop.ink.setAttribute("opacity", st.mazeAlpha);
    fFlap.ink.setAttribute("opacity", under ? 0 : st.mazeAlpha);
    // the nozzle: a two-tone cone under the die's bottom corner, growing downward
    var B = P([-1, -1, 1]), BL = P([-1, -1, -1]), BR = P([1, -1, 1]);
    var S = E * st.scale, grow = ease(clamp((st.morph - 0.35) / 0.65, 0, 1));
    if (grow > 0.001) {
      var gap = 0.035 * S; // same breathing room as between the die's faces
      var w = 0.3 * S, tw = 0.045 * S;
      var ux = (B[0] - BL[0]), uy = (B[1] - BL[1]), vx = (BR[0] - B[0]), vy = (BR[1] - B[1]);
      var lc = [B[0] - w, B[1] + gap - w * uy / ux], rc = [B[0] + w, B[1] + gap + w * vy / vx], bc = [B[0], B[1] + gap];
      var tipY = bc[1] + grow * NOZ * S, tc = [B[0], tipY];
      var pt = function (q) { return q[0].toFixed(2) + "," + q[1].toFixed(2); };
      coneL.setAttribute("points", [lc, bc, tc, [B[0] - tw * grow, tipY]].map(pt).join(" "));
      coneR.setAttribute("points", [bc, rc, [B[0] + tw * grow, tipY], tc].map(pt).join(" "));
      nozzle.setAttribute("opacity", 1);
    } else {
      nozzle.setAttribute("opacity", 0);
    }
    // printing
    var printing = st.print > 0 && st.print < 1;
    var hotFade = 0.45;
    PLAN.forEach(function (L, i) {
      var r = clamp((tp - L.s) / L.d, 0, 1), w = r * (L.xb - L.xa);
      layers[i].rect.setAttribute("x", (L.dir > 0 ? L.xa : L.xb - w).toFixed(2));
      layers[i].rect.setAttribute("width", w.toFixed(2));
      var doneAt = t0.print + L.s + L.d;
      var heat = r <= 0 ? 0 : r < 1 ? 1 : 1 - clamp((t - doneAt) / hotFade, 0, 1);
      layers[i].hot.setAttribute("opacity", heat.toFixed(3));
    });
    lines.setAttribute("opacity", (0.45 * clamp(st.lines, 0, 1)).toFixed(3));
    bed.setAttribute("opacity", clamp(st.bed, 0, 1).toFixed(3));
    var tip2 = printing ? nozzleAt(tp) : null;
    glow.setAttribute("opacity", printing ? 0.9 : 0);
    tipDot.setAttribute("opacity", printing ? 1 : 0);
    if (tip2) { glow.setAttribute("cx", tip2[0]); glow.setAttribute("cy", tip2[1]); tipDot.setAttribute("cx", tip2[0]); tipDot.setAttribute("cy", tip2[1]); }
  }

  render(0);
  return { duration: DURATION, seek: render, beats: t0 };
}
