// Print-head intro: the logo die folds the back half of its top forward, the flap becomes a
// nozzle, the die shrinks into a print head and prints DUNGEON, then "3D PRINT" on top, layer by
// layer, and finally folds back into the die beside the finished name (the normal logo).
//
// Drawn into an <svg> from the die's 8 corners in 3D on every frame, so the fold is a real fold.
// seek(t) is a pure function of time, so the caller decides playback (speed, skip, still).
// Source and prototype: design/brand/ (the canvas board and the video use the same engine).

type Vec2 = [number, number];
type Vec3 = [number, number, number];

export interface PrintIntroData {
  /** "3D PRINT" outline and DUNGEON outline (lockup units, baseline at 0). */
  label: string;
  letters: string;
  /** Die face symbols (100 x 100 face). */
  gate: string;
  eye: string;
  maze: string;
  /** Ink width of the "3D PRINT" line in lockup units. */
  labelWidth: number;
  colors: { accent: string; text: string; muted: string; ink: string; bed: string; hot: string };
  /** Visible part of the 1000 x 360 stage. */
  viewBox?: string;
}

export interface PrintIntro {
  duration: number;
  /** Time at which all motion has finished (the rest is the finished logo). */
  motionEnd: number;
  seek: (t: number) => void;
}

const NS = "http://www.w3.org/2000/svg";

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
const fx = (n: number) => n.toFixed(2);

/** The accent darkened toward black, so every violet comes from one colour. */
const shade = (hex: string, k: number): string => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const ch = (c: number) => Math.round(c * (1 - k)).toString(16).padStart(2, "0");
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

export function createPrintIntro(svg: SVGSVGElement, D: PrintIntroData): PrintIntro {
  const uid = `pd${Math.random().toString(36).slice(2, 7)}`;
  const el = <K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Record<string, string | number>,
    parent?: Element,
  ): SVGElementTagNameMap[K] => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    parent?.appendChild(n);
    return n;
  };

  const { accent: ACC, text: TXT, muted: MUTED, ink: INK, bed: BED, hot: HOT } = D.colors;
  const UNDER = shade(ACC, 0.3);
  const CONE_L = shade(ACC, 0.12);
  const NOZ = 0.5; // nozzle length below the die, in die edges

  // ---- timeline (seconds)
  const T = { rest: 0.5, fold: 0.9, morph: 0.55, print: 2.2, ret: 0.55, unfold: 0.8, hold: 1.1 };
  const t0 = {} as Record<keyof typeof T, number>;
  let total = 0;
  (Object.keys(T) as (keyof typeof T)[]).forEach((k) => {
    t0[k] = total;
    total += T[k];
  });
  const TILT = (30 * Math.PI) / 180;
  const HEAD = 0.5;

  // ---- layout (stage 1000 x 360)
  const K = 0.95, WX0 = 7, WX1 = 638.9, WTOP = -108, WBOT = 2;
  const TX = 255 - WX0 * K, TY = 238; // wordmark origin (baseline)
  const X0 = TX + WX0 * K, X1 = TX + WX1 * K, YT = TY + WTOP * K, YB = TY + WBOT * K;
  const E = (YB - YT) / 1.633; // die edge at rest: the die is as tall as the text block
  const REST = { x: X0 - 21 - E * 0.7071, y: (YT + YB) / 2 };

  // ---- print plan: DUNGEON first (full width), then "3D PRINT" on top, only as wide as the label.
  // Layer time follows travel, so the short label layers go quicker.
  const X = (u: number) => TX + u * K;
  const Y = (v: number) => TY + v * K;
  const groups = [
    { from: 2, to: -77.5, n: 10, x0: WX0, x1: WX1 },
    { from: -86.5, to: -108.5, n: 4, x0: WX0, x1: WX0 + D.labelWidth },
  ];
  interface Layer { yb: number; yt: number; xa: number; xb: number; dir: number; s: number; d: number; first: boolean }
  const PLAN: Layer[] = [];
  let tsum = 0;
  groups.forEach((g, gi) => {
    if (gi > 0) tsum += 0.18; // step up over the gap between the two lines
    for (let j = 0; j < g.n; j++) {
      const xa = X(g.x0), xb = X(g.x1);
      const d = 0.035 + (0.13 * (xb - xa)) / (X1 - X0);
      PLAN.push({
        yb: Y(g.from + ((g.to - g.from) * j) / g.n),
        yt: Y(g.from + ((g.to - g.from) * (j + 1)) / g.n),
        xa, xb, dir: PLAN.length % 2 === 0 ? 1 : -1, s: tsum, d, first: j === 0,
      });
      tsum += d;
    }
  });
  PLAN.forEach((L) => {
    L.s *= T.print / tsum;
    L.d *= T.print / tsum;
  });

  // ---- 3D: cube corners at +-1, isometric camera (Y 45deg, then X 35.26deg + tilt)
  interface Pose { tilt: number; scale: number; cx: number; cy: number }
  const B45 = Math.PI / 4, ISO = Math.atan(1 / Math.SQRT2);
  const project = (p: Vec3, st: Pose): Vec3 => {
    const cb = Math.cos(B45), sb = Math.sin(B45);
    const x1 = p[0] * cb + p[2] * sb, z1 = -p[0] * sb + p[2] * cb, y1 = p[1];
    const a = ISO + st.tilt, ca = Math.cos(a), sa = Math.sin(a);
    const y2 = y1 * ca - z1 * sa, z2 = y1 * sa + z1 * ca;
    const S = (E / 2) * st.scale;
    return [st.cx + x1 * S, st.cy - y2 * S, z2];
  };
  /** Affine map from face-local (0..100) coordinates: O at (0,0), U at (100,0), V at (0,100). */
  const matrix = (O: number[], U: number[], V: number[]) =>
    `matrix(${[(U[0] - O[0]) / 100, (U[1] - O[1]) / 100, (V[0] - O[0]) / 100, (V[1] - O[1]) / 100, O[0], O[1]].join(" ")})`;
  const UL: Vec3 = [-1, 1, -1], TB: Vec3 = [1, 1, -1], UR: Vec3 = [1, 1, 1], CF: Vec3 = [-1, 1, 1];
  /** The top's back corner, rotated about the UL-UR diagonal toward the viewer. */
  const flapTip = (phi: number): Vec3 => [Math.cos(phi), 1 + Math.sin(phi) * Math.SQRT2, -Math.cos(phi)];

  // ---- build the scene
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute("viewBox", D.viewBox ?? "0 0 1000 360");
  const defs = el("defs", {}, svg);
  el("filter", { id: `${uid}glow`, x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs).appendChild(
    el("feGaussianBlur", { stdDeviation: 3 }),
  );
  // face-local shapes: the plate, and the two halves of the top (split on the u = v diagonal)
  el("rect", { x: 3, y: 3, width: 94, height: 94, rx: 5, id: `${uid}plate` }, defs);
  el("polygon", { points: "0.8,0 100,0 100,99.2" }, el("clipPath", { id: `${uid}back` }, defs));
  el("polygon", { points: "0,0.8 0,100 99.2,100" }, el("clipPath", { id: `${uid}front` }, defs));

  const bed = el("line", { x1: X0 - 14, x2: X1 + 14, y1: YB + 7, y2: YB + 7, stroke: BED, "stroke-width": 2, "stroke-linecap": "round", opacity: 0 }, svg);

  // the name, revealed layer by layer
  const place = `translate(${TX} ${TY}) scale(${K})`;
  const word = el("g", { id: `${uid}word` }, defs);
  el("path", { d: D.label, fill: MUTED, transform: place }, word);
  el("path", { d: D.letters, fill: TXT, "fill-rule": "evenodd", transform: place }, word);
  const wordHot = el("g", { id: `${uid}hot` }, defs);
  el("path", { d: D.label, fill: ACC, transform: place }, wordHot);
  el("path", { d: D.letters, fill: ACC, "fill-rule": "evenodd", transform: place }, wordHot);
  const layers = PLAN.map((L, i) => {
    const rect = el("rect", { x: L.xa, y: L.yt - 0.3, width: 0, height: L.yb - L.yt + 0.6 }, el("clipPath", { id: `${uid}L${i}` }, defs));
    el("use", { href: `#${uid}word`, "clip-path": `url(#${uid}L${i})` }, svg);
    const hot = el("use", { href: `#${uid}hot`, "clip-path": `url(#${uid}L${i})`, opacity: 0 }, svg);
    return { rect, hot };
  });
  // layer lines over the fresh print; they fade away so the finished logo is clean
  const lines = el("g", { stroke: INK, "stroke-width": 1, opacity: 0 }, svg);
  PLAN.forEach((L) => {
    if (!L.first) el("line", { x1: L.xa - 3, x2: L.xb + 3, y1: L.yb, y2: L.yb }, lines);
  });

  // the die
  const head = el("g", {}, svg);
  const face = (sym: string, clip?: string) => {
    const g = el("g", {}, head);
    const inner = el("g", clip ? { "clip-path": `url(#${uid}${clip})` } : {}, g);
    el("use", { href: `#${uid}plate`, fill: ACC }, inner);
    const ink = el("path", { d: sym, fill: INK, "fill-rule": "evenodd" }, inner);
    const dark = el("use", { href: `#${uid}plate`, fill: INK, opacity: 0 }, inner);
    return { g, ink, dark };
  };
  // The top is whole while the die rests; once the flap lifts, only its front half stays and the
  // space the flap left is open (the die loses its back top corner).
  const fLeft = face(D.gate), fRight = face(D.eye), fTop = face(D.maze), fTopFront = face(D.maze, "front");
  const fFlap = face(D.maze, "back");
  // the nozzle hangs below the die; its top edge follows the die's V-shaped bottom so it sits flush
  const nozzle = el("g", { opacity: 0 }, head);
  const coneL = el("polygon", { fill: CONE_L }, nozzle);
  const coneR = el("polygon", { fill: UNDER }, nozzle);
  const glow = el("circle", { r: 5, fill: ACC, filter: `url(#${uid}glow)`, opacity: 0 }, svg);
  const tipDot = el("circle", { r: 1.8, fill: HOT, opacity: 0 }, svg);

  // ---- state at time t
  const stateAt = (t: number) => {
    const f = ease(seg(t, t0.fold, t0.fold + T.fold));
    const u = ease(seg(t, t0.unfold, t0.unfold + T.unfold));
    const morph = ease(seg(t, t0.morph, t0.morph + T.morph)) - ease(seg(t, t0.ret, t0.ret + T.ret));
    return {
      phi: Math.PI * (f - u),
      tilt: TILT * (f - u),
      mazeAlpha: 1 - seg(t, t0.fold, t0.fold + 0.3) + seg(t, t0.unfold + T.unfold * 0.5, t0.unfold + T.unfold),
      morph,
      scale: lerp(1, HEAD, morph),
      print: seg(t, t0.print, t0.print + T.print),
      bed: seg(t, t0.morph, t0.morph + 0.3) - seg(t, t0.unfold, t0.unfold + 0.5),
      lines: seg(t, t0.print, t0.print + 0.2) - seg(t, t0.ret + 0.2, t0.unfold + 0.4),
    };
  };
  /** Nozzle tip relative to the die centre once the print head is formed. */
  const tipOffset = (): Vec2 => {
    const B = project([-1, -1, 1], { tilt: TILT, scale: HEAD, cx: 0, cy: 0 });
    return [B[0], B[1] + (0.035 + NOZ) * E * HEAD];
  };
  /** Nozzle tip at tp seconds into the print: left-right passes, stepping up between the lines. */
  const nozzleAt = (tp: number): Vec2 => {
    for (let i = 0; i < PLAN.length; i++) {
      const L = PLAN[i];
      if (tp < L.s) {
        const P = PLAN[i - 1];
        const pe: Vec2 = [P.dir > 0 ? P.xb : P.xa, P.yt], ls: Vec2 = [L.dir > 0 ? L.xa : L.xb, L.yt];
        const g = ease(clamp((tp - P.s - P.d) / (L.s - P.s - P.d), 0, 1));
        return [lerp(pe[0], ls[0], g), lerp(pe[1], ls[1], g)];
      }
      if (tp <= L.s + L.d) {
        const r = (tp - L.s) / L.d;
        return [L.dir > 0 ? lerp(L.xa, L.xb, r) : lerp(L.xb, L.xa, r), L.yt];
      }
    }
    const Z = PLAN[PLAN.length - 1];
    return [Z.dir > 0 ? Z.xb : Z.xa, Z.yt];
  };
  const OFF = tipOffset();
  const START_TIP = nozzleAt(0), END_TIP = nozzleAt(T.print);

  const seek = (t: number) => {
    const st = stateAt(t);
    const tp = st.print * T.print;
    // where the die is: at rest, travelling to or from the print, or riding the nozzle
    const printPos = st.print > 0 && t < t0.ret ? nozzleAt(tp) : t >= t0.ret ? END_TIP : START_TIP;
    const pose: Pose = {
      tilt: st.tilt,
      scale: st.scale,
      cx: lerp(REST.x, printPos[0] - OFF[0], st.morph),
      cy: lerp(REST.y, printPos[1] - OFF[1], st.morph),
    };
    const P = (p: Vec3) => project(p, pose);
    const ul = P(UL), tb = P(TB), ur = P(UR), cf = P(CF);

    // side faces: left (-x) and right (+z), symbols upright
    fLeft.g.setAttribute("transform", matrix(P([-1, 1, -1]), P([-1, 1, 1]), P([-1, -1, -1])));
    fRight.g.setAttribute("transform", matrix(P([-1, 1, 1]), P([1, 1, 1]), P([-1, -1, 1])));

    // the back half of the top (the flap) folds over the diagonal toward the viewer
    const lifted = st.phi > 0.02 || st.morph > 0;
    fTop.g.setAttribute("transform", matrix(ul, tb, cf));
    fTopFront.g.setAttribute("transform", matrix(ul, tb, cf));
    fTop.g.setAttribute("opacity", lifted ? "0" : "1");
    fTopFront.g.setAttribute("opacity", lifted ? "1" : "0");
    fTop.ink.setAttribute("opacity", fx(st.mazeAlpha));
    fTopFront.ink.setAttribute("opacity", fx(st.mazeAlpha));
    const tip = P(flapTip(st.phi));
    // hand-over: the folded flap sinks into the die, then the nozzle grows out underneath
    const shrink = 1 - ease(clamp(st.morph / 0.45, 0, 1));
    const gx = (ul[0] + tip[0] + ur[0]) / 3, gy = (ul[1] + tip[1] + ur[1]) / 3;
    const sp = (q: number[]): Vec2 => [gx + (q[0] - gx) * shrink, gy + (q[1] - gy) * shrink];
    const fa = sp(ul), fb = sp(tip), fc = sp(ur);
    // flap corners: UL at (0,0), the tip at (100,0), UR at (100,100)
    fFlap.g.setAttribute(
      "transform",
      `matrix(${[(fb[0] - fa[0]) / 100, (fb[1] - fa[1]) / 100, (fc[0] - fb[0]) / 100, (fc[1] - fb[1]) / 100, fa[0], fa[1]].join(" ")})`,
    );
    fFlap.g.setAttribute("opacity", shrink > 0.02 ? "1" : "0");
    const cross = (tip[0] - ul[0]) * (ur[1] - ul[1]) - (tip[1] - ul[1]) * (ur[0] - ul[0]);
    const under = cross < 0; // past upright, the flap shows its underside
    fFlap.dark.setAttribute("opacity", under ? "0.3" : "0");
    fFlap.ink.setAttribute("opacity", under ? "0" : fx(st.mazeAlpha));

    // the nozzle: a two-tone cone under the die's bottom corner, growing downward
    const S = E * st.scale;
    const grow = ease(clamp((st.morph - 0.35) / 0.65, 0, 1));
    if (grow > 0.001) {
      const B = P([-1, -1, 1]), BL = P([-1, -1, -1]), BR = P([1, -1, 1]);
      const gap = 0.035 * S, w = 0.3 * S, tw = 0.045 * S;
      const lc: Vec2 = [B[0] - w, B[1] + gap - (w * (B[1] - BL[1])) / (B[0] - BL[0])];
      const rc: Vec2 = [B[0] + w, B[1] + gap + (w * (BR[1] - B[1])) / (BR[0] - B[0])];
      const bc: Vec2 = [B[0], B[1] + gap];
      const tipY = bc[1] + grow * NOZ * S;
      const tc: Vec2 = [B[0], tipY];
      const pts = (qs: Vec2[]) => qs.map((q) => `${fx(q[0])},${fx(q[1])}`).join(" ");
      coneL.setAttribute("points", pts([lc, bc, tc, [B[0] - tw * grow, tipY]]));
      coneR.setAttribute("points", pts([bc, rc, [B[0] + tw * grow, tipY], tc]));
      nozzle.setAttribute("opacity", "1");
    } else {
      nozzle.setAttribute("opacity", "0");
    }

    // printing: each layer is revealed behind the nozzle, glows, then cools
    const printing = st.print > 0 && st.print < 1;
    PLAN.forEach((L, i) => {
      const r = clamp((tp - L.s) / L.d, 0, 1), w = r * (L.xb - L.xa);
      layers[i].rect.setAttribute("x", fx(L.dir > 0 ? L.xa : L.xb - w));
      layers[i].rect.setAttribute("width", fx(w));
      const doneAt = t0.print + L.s + L.d;
      const heat = r <= 0 ? 0 : r < 1 ? 1 : 1 - clamp((t - doneAt) / 0.45, 0, 1);
      layers[i].hot.setAttribute("opacity", heat.toFixed(3));
    });
    lines.setAttribute("opacity", (0.45 * clamp(st.lines, 0, 1)).toFixed(3));
    bed.setAttribute("opacity", clamp(st.bed, 0, 1).toFixed(3));
    glow.setAttribute("opacity", printing ? "0.9" : "0");
    tipDot.setAttribute("opacity", printing ? "1" : "0");
    if (printing) {
      const [x, y] = nozzleAt(tp);
      for (const c of [glow, tipDot]) {
        c.setAttribute("cx", fx(x));
        c.setAttribute("cy", fx(y));
      }
    }
  };

  seek(0);
  return { duration: total, motionEnd: t0.hold, seek };
}
