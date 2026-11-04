const { chromium } = require("playwright");
const fs = require("fs");
const repo = require("path").join(__dirname, "../../../public/assets/icons/");
const P = JSON.parse(fs.readFileSync(__dirname + "/die_icon.json", "utf8"));
const fav = fs.readFileSync(repo + "pd-die-v4.svg", "utf8");
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0A0A0C"/><g transform="translate(14 14) scale(0.72)"><path fill="#8F74FF" fill-rule="evenodd" d="${P.full}"/></g></svg>`;
(async () => {
  const b = await chromium.launch();
  const shot = async (svg, size, out) => {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" style="display:block" `)}</body></html>`);
    await p.screenshot({ path: repo + out, omitBackground: true });
    await p.close();
  };
  await shot(fav, 32, "pd-die-v4-32.png");
  await shot(apple, 180, "pd-die-v7-apple-180.png");
  const p = await b.newPage({ viewport: { width: 420, height: 200 } });
  await p.setContent(`<body style="margin:0;display:flex;gap:20px;padding:10px;background:#DEE1E6">${fav.replace("<svg ", '<svg width="16" height="16" ')}${fav.replace("<svg ", '<svg width="32" height="32" ')}<img src="file://${repo}pd-die-v7-apple-180.png" width="180" height="180"><div style="background:#202124;padding:6px">${fav.replace("<svg ", '<svg width="16" height="16" ')}</div></body>`);
  await p.screenshot({ path: __dirname + "/die-icons-check.png" });
  await b.close();
})();
