// Renders the print-head intro to an MP4 (1920 x 1080, 60 fps) next to this folder.
// Needs Playwright (Chromium) and ffmpeg:  node design/brand/intro/render-video.cjs
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const dir = __dirname;
const out = path.join(dir, "..", "print-dungeon-intro-1080p.mp4");
const engine = fs.readFileSync(path.join(dir, "engine.js"), "utf8");
const data = fs.readFileSync(path.join(dir, "data.json"), "utf8");
const html = `<!doctype html><html><body style="margin:0;background:#0A0A0C;overflow:hidden">
<svg id="s" width="1920" height="1080" style="display:block"></svg>
<script>${engine}
window.api = PDIntro(document.getElementById("s"), ${data});
document.getElementById("s").setAttribute("viewBox", "70 -79 860 483.75"); // 16:9 around the stage
</script></body></html>`;

(async () => {
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), "pd-intro-"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.setContent(html);
  const duration = await page.evaluate(() => window.api.duration);
  const fps = 60;
  const n = Math.round(duration * fps);
  for (let i = 0; i <= n; i++) {
    await page.evaluate((t) => window.api.seek(t), i / fps);
    await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.png`) });
  }
  await browser.close();
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(fps), "-i", path.join(frames, "f%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow", "-movflags", "+faststart", out]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log(`wrote ${out} (${n + 1} frames)`);
})();
