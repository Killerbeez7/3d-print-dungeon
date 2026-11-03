// Renders the logo die animations to square MP4 loops (1080 x 1080, 60 fps):
//   die-rolling-1080.mp4  the header die: quarter turns now and then, and a throw
//   die-loader-1080.mp4   the loading die: thrown over and over
// Same faces, angles, timings and easings as the site (Die.tsx + .die styles), drawn with CSS 3D
// and stepped frame by frame. Needs Playwright (Chromium) and ffmpeg:
//   node design/brand/die/render-die-videos.cjs
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..", "..", "..");
const OUT = path.join(__dirname, "..");
const faces = Object.fromEntries(
  [...fs.readFileSync(path.join(ROOT, "src/features/shared/components/dieFaces.ts"), "utf8").matchAll(/ {2}(\w+): "([^"]+)",/g)].map((m) => [m[1], m[2]]),
);
const SIDES = { front: "gate", right: "eye", back: "lock", left: "fire", top: "maze", bottom: "bricks" };
const ACCENT = "#8F74FF", INK = "#0A0A0C", EDGE = 360;
const MOVE = { turn: [0.8, "cubic-bezier(.34,1.45,.5,1)", 0.1], throw: [1.1, "cubic-bezier(.2,.8,.25,1.06)", 0.42] };

// Keyframes for a sequence of moves, each after a hold; poses are rotateX (flips) + rotateY (turns).
function keyframes(hold, steps) {
  const total = steps.reduce((s, m) => s + hold + MOVE[m][0], 0);
  const pct = (t) => `${((100 * t) / total).toFixed(3)}%`;
  const pose = (a, b) => `rotateX(${a}deg) rotateY(${b}deg)`;
  let a = 0, b = 0, t = 0;
  const roll = [], hop = [];
  for (const m of steps) {
    const [ms, ease, h] = MOVE[m];
    const up = -EDGE * h;
    roll.push(`${pct(t)}{transform:${pose(a, b)};animation-timing-function:linear}`);
    hop.push(`${pct(t)}{transform:translateY(0);animation-timing-function:linear}`);
    t += hold;
    roll.push(`${pct(t)}{transform:${pose(a, b)};animation-timing-function:${ease}}`);
    hop.push(`${pct(t)}{transform:translateY(0);animation-timing-function:cubic-bezier(.2,.7,.4,1)}`);
    if (m === "throw") {
      hop.push(`${pct(t + ms * 0.38)}{transform:translateY(${up}px);animation-timing-function:cubic-bezier(.6,0,.85,.4)}`);
      hop.push(`${pct(t + ms * 0.72)}{transform:translateY(0) scale(1.06,.94);animation-timing-function:ease-out}`);
      hop.push(`${pct(t + ms * 0.84)}{transform:translateY(${up * 0.12}px);animation-timing-function:ease-in}`);
      a -= 360;
    } else {
      hop.push(`${pct(t + ms * 0.4)}{transform:translateY(${up}px);animation-timing-function:cubic-bezier(.6,0,.8,.4)}`);
    }
    b -= 90;
    t += ms;
  }
  roll.push(`100%{transform:${pose(a, b)}}`);
  hop.push("100%{transform:translateY(0)}");
  return { total, css: `@keyframes roll{${roll.join("")}}@keyframes hop{${hop.join("")}}` };
}

function page(kf) {
  const face = (side) =>
    `<div class="f ${side}"><svg viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="5" fill="${ACCENT}"/>` +
    `<path fill="${INK}" fill-rule="evenodd" d="${faces[SIDES[side]]}"/></svg></div>`;
  const h = EDGE / 2;
  return `<!doctype html><html><head><style>
body{margin:0;width:1080px;height:1080px;background:${INK};display:grid;place-items:center;overflow:hidden}
.box{width:${EDGE * 1.414}px;height:${EDGE * 1.633}px;display:grid;place-items:center;margin-top:${EDGE * 0.2}px}
.hop,.iso,.cube{transform-style:preserve-3d}
.hop{width:${EDGE}px;height:${EDGE}px;animation:hop ${kf.total}s infinite}
.iso{width:100%;height:100%;transform:rotateX(-35.264deg) rotateY(-45deg)}
.cube{position:relative;width:100%;height:100%;animation:roll ${kf.total}s infinite}
.f{position:absolute;inset:0;backface-visibility:hidden}.f svg{display:block;width:100%;height:100%}
.front{transform:translateZ(${h}px)}.back{transform:rotateY(180deg) translateZ(${h}px)}
.right{transform:rotateY(90deg) translateZ(${h}px)}.left{transform:rotateY(-90deg) translateZ(${h}px)}
.top{transform:rotateX(90deg) translateZ(${h}px)}.bottom{transform:rotateX(-90deg) translateZ(${h}px)}
${kf.css}</style></head><body><div class="box"><div class="hop"><div class="iso"><div class="cube">
${Object.keys(SIDES).map(face).join("")}</div></div></div></div></body></html>`;
}

async function render(browser, name, kf) {
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), "pd-die-"));
  const p = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.setContent(page(kf));
  const fps = 60, n = Math.round(kf.total * fps); // the last pose equals the first: a seamless loop
  for (let i = 0; i < n; i++) {
    await p.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), (i * 1000) / fps);
    await p.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.png`) });
  }
  await p.close();
  const out = path.join(OUT, name);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(fps), "-i", path.join(frames, "f%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", out]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log(`wrote ${out} (${n} frames, ${kf.total.toFixed(2)} s)`);
}

(async () => {
  const browser = await chromium.launch();
  await render(browser, "die-rolling-1080.mp4", keyframes(1.2, ["turn", "turn", "throw", "turn"]));
  await render(browser, "die-loader-1080.mp4", keyframes(0.15, ["throw", "throw", "throw", "throw"]));
  await browser.close();
})();
