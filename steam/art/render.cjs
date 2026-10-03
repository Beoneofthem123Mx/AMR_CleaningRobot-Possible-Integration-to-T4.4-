// Genera el arte de la tienda de Steam a partir de capsule.html (requiere Playwright + Chromium).
//   node steam/art/render.cjs
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const path = require("path"), DIR = __dirname;
const JOBS = [
  ["header_capsule.png", 920, 430, "full", "circo"],
  ["small_capsule.png", 462, 174, "full", "circo"],
  ["main_capsule.png", 1232, 706, "full", "circo"],
  ["vertical_capsule.png", 748, 896, "full", "circo"],
  ["library_capsule.png", 600, 900, "full", "plaza"],
  ["library_hero.png", 3840, 1240, "bg", "circo"],
  ["library_logo.png", 1280, 720, "logo", "circo"],
  ["page_background.png", 1438, 810, "bg", "mitin"],
  ["icon_512.png", 512, 512, "icon", "circo"],
  ["icon_256.png", 256, 256, "icon", "circo"],
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  for (const [out, w, h, mode, bg] of JOBS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto("file://" + path.join(DIR, "capsule.html") + `?w=${w}&h=${h}&mode=${mode}&bg=${bg}`);
    await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(300);
    await p.locator("#c").screenshot({ path: path.join(DIR, "out", out), omitBackground: true });
    console.log("ok", out); await p.close();
  }
  await b.close();
})();
