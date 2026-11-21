/* One-off utility: download Google Fonts woff2 files locally (self-hosting).
   Run: node tools/fetch-fonts.mjs  → assets/fonts/fonts.css + *.woff2        */
import { mkdirSync, writeFileSync } from "node:fs";

const UA = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
};
const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Vazirmatn:wght@400;500&display=swap";

mkdirSync("assets/fonts", { recursive: true });

const css = await (await fetch(CSS_URL, UA)).text();
const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))];

const map = new Map();
let i = 0;
for (const u of urls) {
  const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
  const name = `f${i++}.woff2`;
  writeFileSync(`assets/fonts/${name}`, buf);
  map.set(u, name);
  console.log(`${name}  ${buf.length} bytes  ← ${u.split("/").pop()}`);
}

const localCss = css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (_, u) => `url(${map.get(u)})`);
writeFileSync("assets/fonts/fonts.css", localCss);
console.log(`\nOK — ${urls.length} font files, fonts.css rewritten to local paths.`);
