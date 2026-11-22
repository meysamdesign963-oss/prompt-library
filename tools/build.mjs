/* ============================================================
   Prompt Library — static site generator (no dependencies)
   Run:  node tools/build.mjs
   Reads prompts/<category>/*.{md,canvas} and generates:
     index.html · <category>/index.html · <category>/<slug>/index.html
     404.html · sitemap.xml · robots.txt
   Every page: unique <title>/description, canonical, Open Graph,
   JSON-LD (CreativeWork / CollectionPage + BreadcrumbList),
   related-prompt links, self-hosted fonts, no client-side rendering.

   Structure:
     build.mjs         → this entry: load → render → write
     lib/site.mjs      → constants + category taxonomy
     lib/icons.mjs     → inline SVG icon set
     lib/utils.mjs     → markdown, escaping, front-matter, canvas parsing
     lib/prompts.mjs   → prompt loader (unified card model)
     lib/components.mjs→ reusable UI components (cards, sections, buttons)
     lib/chrome.mjs    → header/footer/nav components + page shell
     lib/pages.mjs     → page templates
     lib/seo.mjs       → shell head, BreadcrumbList, sitemap, robots
     extras.mjs        → rich sections for featured prompts
   ============================================================ */
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, CATS, BUILD_DATE } from "./lib/site.mjs";
import { loadPrompts } from "./lib/prompts.mjs";
import { canvasToHtml, canvasToMd, buildCanvasJson } from "./lib/utils.mjs";
import { missingIcons } from "./lib/icons.mjs";
import { homePage, categoryPage, promptPage, notFoundPage, aboutPage } from "./lib/pages.mjs";
import { sitemap, robotsTxt } from "./lib/seo.mjs";
import { EXTRAS } from "./extras.mjs";

const prompts = loadPrompts();

/* the root Obsidian canvas gets its own fully-rendered page */
const rootCanvasPath = join(ROOT, "Prompt-Library.canvas");
if (existsSync(rootCanvasPath)) {
  const raw = readFileSync(rootCanvasPath, "utf8");
  let metaVersion = "1.0";
  try { metaVersion = JSON.parse(raw).metadata?.version || "1.0"; } catch (_) {}
  prompts.unshift({
    slug: "security-blueprint-canvas",
    cat: "security",
    fname: "Prompt-Library.canvas",
    sourcePath: "Prompt-Library.canvas",
    name: "Prompt-Library",
    sub: "Obsidian Canvas · the full prompt (EN → FA)",
    desc: "Every card of Prompt-Library rendered page by page — architecture, structure, login, tokens, post-login and OWASP — exactly as laid out in the Obsidian canvas.",
    descFa: "تمام کارت‌های پرامپت‌لایبرری امنیتی، دقیقاً به همان چیدمان کانواس اوبسیدین — از معماری تا OWASP.",
    version: metaVersion,
    status: "Canvas",
    tags: ["canvas", "obsidian", "security"],
    tagLabel: "JSON Canvas",
    icon: "layers",
    bodyHtml: canvasToHtml(raw),
    bodyText: canvasToMd(raw),
    canvasData: buildCanvasJson(raw),
    extras: { featured: false, icon: "layers", pillLabel: "JSON Canvas", alt: { href: "security/security-blueprint/", label: "Markdown view" } },
  });
  if (EXTRAS["security-blueprint"]) {
    EXTRAS["security-blueprint"].alt = { href: "security/security-blueprint-canvas/", label: "Canvas view" };
  }
}

/* clean previously generated output */
for (const d of ["p", "c", "about", ...Object.keys(CATS)]) {
  rmSync(join(ROOT, d), { recursive: true, force: true });
}

/* pages */
writeFileSync(join(ROOT, "index.html"), homePage(prompts));
writeFileSync(join(ROOT, "404.html"), notFoundPage(prompts));
writeFileSync(join(ROOT, "sitemap.xml"), sitemap(prompts));
writeFileSync(join(ROOT, "robots.txt"), robotsTxt);

mkdirSync(join(ROOT, "about"), { recursive: true });
writeFileSync(join(ROOT, "about", "index.html"), aboutPage());

for (const cat of Object.keys(CATS)) {
  mkdirSync(join(ROOT, cat), { recursive: true });
  writeFileSync(join(ROOT, cat, "index.html"), categoryPage(cat, prompts));
}
for (const p of prompts) {
  mkdirSync(join(ROOT, p.cat, p.slug), { recursive: true });
  writeFileSync(join(ROOT, p.cat, p.slug, "index.html"), promptPage(p, prompts));
}

/* favicon — generated from public/logo.svg (sage tile + ink mark) */
const faviconFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#869A8C"/><path d="M10 16.5l4.5 4.5L22.5 11" stroke="#F8F8F8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let faviconSvg = faviconFallback;
try {
  const logoSrc = readFileSync(join(ROOT, "public", "logo.svg"), "utf8");
  const inner = logoSrc.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  const vb = logoSrc.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(parseFloat);
  const w = vb[2], h = vb[3];
  if (inner && w && h) {
    const scale = 22 / Math.max(w, h);
    const iw = (w * scale).toFixed(2), ih = (h * scale).toFixed(2);
    const x = ((32 - w * scale) / 2).toFixed(2), y = ((32 - h * scale) / 2).toFixed(2);
    faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#869A8C"/><svg x="${x}" y="${y}" width="${iw}" height="${ih}" viewBox="0 0 ${w} ${h}">${inner}</svg></svg>`;
  }
} catch (_) {}
writeFileSync(join(ROOT, "assets/favicon.svg"), faviconSvg);

const miss = missingIcons();
console.log(miss.length ? `⚠ missing icons: ${miss.join(", ")}` : "icons: all resolved");
console.log(`OK — built ${prompts.length} prompt pages, ${Object.keys(CATS).length} category pages, home, 404, sitemap.xml, robots.txt (${BUILD_DATE})`);
for (const p of prompts) console.log(`  · /${p.cat}/${p.slug}/`);
