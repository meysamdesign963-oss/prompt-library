/* ============================================================
   Prompt Library — static site generator (no dependencies)
   Run:  node tools/build.mjs
   Reads prompts/<category>/*.{md,canvas} and generates:
     index.html · c/<category>/index.html · p/<slug>/index.html
     404.html · sitemap.xml · robots.txt
   Every page: unique <title>/description, canonical, Open Graph,
   JSON-LD (CreativeWork / CollectionPage + BreadcrumbList),
   related-prompt links, self-hosted fonts, no client-side rendering.
   ============================================================ */
import { createRequire } from "node:module";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTRAS } from "./extras.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://meysamdesign963-oss.github.io/prompt-library";
const REPO_URL = "https://github.com/meysamdesign963-oss/prompt-library";
const BRANCH = "main";
const OWNER = "meysamdesign963-oss";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/* ---------- markdown (vendored marked, works offline) ---------- */
const require_ = createRequire(import.meta.url);
const markedMod = require_(join(ROOT, "assets/vendor/marked.min.js"));
const markedRef = markedMod.marked ?? markedMod;
const mdToHtml = (t) => (markedRef.parse ? markedRef.parse(t) : markedRef.marked.parse(t));

/* ---------- categories ---------- */
const CATS = {
  security:  { label: "Security",     fa: "امنیت",       icon: "shield",   desc: "Auth, tokens, sessions, OWASP — hardening specs for web apps.", faDesc: "احراز هویت، توکن، سشن و OWASP — اسپک‌های مقاوم‌سازی اپلیکیشن وب." },
  structure: { label: "Structure",    fa: "ساختار",      icon: "folder",   desc: "Folder structures, code style & architecture blueprints.", faDesc: "ساختار پوشه‌ها، سبک کد و بلوپرینت‌های معماری." },
  ui:        { label: "UI & Design",  fa: "رابط کاربری", icon: "palette",  desc: "Design systems, style prompts and interface specs.", faDesc: "سیستم‌های طراحی، پرامپت‌های استایل و اسپک‌های رابط کاربری." },
  server:    { label: "Server & API", fa: "سرور و API",  icon: "terminal", desc: "API design, server hardening, deployment & DevOps prompts.", faDesc: "طراحی API، مقاوم‌سازی سرور، دیپلوی و پرامپت‌های DevOps." },
};

/* ---------- icons ---------- */
const svg = (paths, filled = false) =>
  `<svg viewBox="0 0 24 24" ${filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${paths}</svg>`;
const ICONS = {
  shield: svg('<path d="M12 3l7 3.2v5.1c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V6.2L12 3z"/>'),
  layers: svg('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'),
  folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  key: svg('<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5L20 3"/><path d="M16 7l3 3"/>'),
  bug: svg('<circle cx="12" cy="13" r="5"/><path d="M12 8V6"/><path d="M9.5 8L7.5 5M14.5 8l2-3"/><path d="M4.5 13h2.5M17 13h2.5M6 19l2-2M18 19l-2-2"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/>'),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  expand: svg('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7.5 7.5"/><path d="M3 21l7.5-7.5"/>'),
  dots: svg('<circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/>', true),
  ext: svg('<path d="M7 17L17 7"/><path d="M8.5 7H17v8.5"/>'),
  filecode: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/><path d="M10.5 12.5L8.5 15l2 2.5"/><path d="M13.5 12.5l2 2.5-2 2.5"/>'),
  book: svg('<path d="M2.5 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12a2.5 2.5 0 0 0-2.5-2.5h-7v-13z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.5 2.5 0 0 1 2.5-2.5h7v-13z"/>'),
  sparkle: svg('<path d="M12 3l2.2 6.2L20.5 12l-6.3 2.8L12 21l-2.2-6.2L3.5 12l6.3-2.8L12 3z"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  terminal: svg('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 9.5l3.5 3L7 15.5"/><path d="M12.5 15.5H17"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-1.4-3.4A2 2 0 0 1 12 12h4.5A4.5 4.5 0 0 0 21 7.5C21 4.4 16.9 3 12 3z"/><circle cx="7.5" cy="10.5" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16.5" cy="10.5" r="1.1"/>'),
  arrow: svg('<path d="M5 12h13"/><path d="M13 6.5L18.5 12 13 17.5"/>'),
  box: svg('<path d="M21 8.2l-9-5-9 5v7.6l9 5 9-5V8.2z"/><path d="M3 8.2l9 5 9-5"/><path d="M12 13.2V21"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.8 2.7 2.8 14.3 0 17-2.8-2.7-2.8-14.3 0-17z"/>'),
  moon: svg('<path d="M20 12.5A8 8 0 1 1 11.5 4a6.5 6.5 0 0 0 8.5 8.5z"/>'),
  zoomin: svg('<path d="M12 5v14M5 12h14"/>'),
  min: svg('<path d="M4 14h6v6"/><path d="M14 10h6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>'),
  zoomout: svg('<path d="M5 12h14"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'),
};
const icon = (n) => ICONS[n] || "";

/* ---------- utils ---------- */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slugify = (s) =>
  String(s).toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const titleize = (s) =>
  String(s).replace(/\.[a-z0-9]+$/i, "").split(/[-_\s]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;

function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_-]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1].trim().toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: text.slice(m[0].length) };
}

function canvasToMd(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const parts = (j.nodes || []).filter((n) => n.type === "text" && n.text).map((n) => n.text);
    return parts.length ? parts.join("\n\n---\n\n") : "*(This canvas has no text nodes — open it in Obsidian.)*";
  } catch (_) {
    return "*(Unreadable canvas file — open it in Obsidian.)*";
  }
}

/* full, faithful canvas rendering: intro cards first, then every group
   in numbered order with its nodes as individual cards in geometric
   reading order — group markers use the actual Obsidian canvas colors */
const CANVAS_COLORS = {
  "1": "#E76E66", "2": "#E0A23C", "3": "#D9C24C",
  "4": "#7CB86A", "5": "#5CB8D4", "6": "#A07CD4",
};
function canvasToHtml(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const nodes = (j.nodes || []).filter((n) => n.type === "text" && n.text);
    const groups = (j.nodes || []).filter((n) => n.type === "group");
    const inGroup = (n) => groups.find((g) => {
      const cx = n.x + (n.width || 0) / 2, cy = n.y + (n.height || 0) / 2;
      return cx >= g.x && cx <= g.x + (g.width || 0) && cy >= g.y && cy <= g.y + (g.height || 0);
    });
    const gnum = (label) => { const m = String(label || "").match(/(\d+)\s*·/); return m ? +m[1] : 99; };
    const card = (n) => `<div class="canvas-card">${mdToHtml(n.text)}</div>`;

    const sections = new Map();
    const intro = [];
    for (const n of nodes) {
      const g = inGroup(n);
      if (!g) { intro.push(n); continue; }
      if (!sections.has(g.id)) sections.set(g.id, { label: g.label, num: gnum(g.label), color: g.color, nodes: [] });
      sections.get(g.id).nodes.push(n);
    }
    intro.sort((a, b) => a.y - b.y || a.x - b.x);
    let html = intro.map(card).join("\n");
    const sorted = [...sections.values()].sort((a, b) => a.num - b.num || a.label.localeCompare(b.label));
    for (const s of sorted) {
      s.nodes.sort((a, b) => a.y - b.y || a.x - b.x);
      const dot = CANVAS_COLORS[s.color] || "var(--mint)";
      html += `<h2 class="canvas-group"><span class="canvas-dot" style="background:${dot}"></span>${esc(s.label)}</h2>`
        + s.nodes.map(card).join("\n");
    }
    return html || '<div class="canvas-card"><p><em>(This canvas has no text nodes — open it in Obsidian.)</em></p></div>';
  } catch (_) {
    return '<div class="canvas-card"><p><em>(Unreadable canvas file — open it in Obsidian.)</em></p></div>';
  }
}

/* raw canvas model for the interactive viewer (positions + edges + rendered html) */
function buildCanvasJson(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const nodes = (j.nodes || []).filter((n) => n.type === "text" && n.text);
    const groups = (j.nodes || []).filter((n) => n.type === "group");
    return JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.width, h: n.height, c: n.color || null, html: mdToHtml(n.text) })),
      groups: groups.map((g) => ({ id: g.id, x: g.x, y: g.y, w: g.width, h: g.height, label: g.label || "", c: g.color || null })),
      edges: (j.edges || []).map((e) => ({ f: e.fromNode, fs: e.fromSide, t: e.toNode, ts: e.toSide, c: e.color || null })),
    }).replace(/<\/script/gi, "<\\/script");
  } catch (_) {
    return "{}";
  }
}

/* ---------- load prompts ---------- */
function loadPrompts() {
  const dir = join(ROOT, "prompts");
  const out = [];
  for (const cat of readdirSync(dir)) {
    const catPath = join(dir, cat);
    if (!CATS[cat] || !existsSync(catPath) || !readdirSync(catPath).length) continue;
    for (const f of readdirSync(catPath)) {
      if (!/\.(md|canvas)$/i.test(f)) continue;
      const raw = readFileSync(join(catPath, f), "utf8");
      const slug = slugify(f);
      const isCanvas = /\.canvas$/i.test(f);
      const { meta, body } = parseFrontMatter(raw);
      const text = isCanvas ? canvasToMd(raw) : body;
      const c = CATS[cat];
      const tags = (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
      out.push({
        slug, cat, fname: f, sourcePath: `prompts/${cat}/${f}`,
        name: esc(meta.title || titleize(f)),
        sub: esc(meta.description || `${c.label} prompt`),
        desc: esc(meta.description || c.desc),
        descFa: esc(meta.fa || ""),
        version: esc(meta.version || "1.0"),
        status: esc(meta.status || `${c.label} · ready`),
        tags, tagLabel: tags.length ? esc(tags.slice(0, 2).join(" · ")) : esc(c.label),
        icon: c.icon,
        bodyHtml: mdToHtml(text),
        bodyText: text,
        extras: EXTRAS[slug] || null,
      });
    }
  }
  return out;
}

/* ---------- card rendering ---------- */
function renderCard(p, pre) {
  const x = p.extras;
  const chipData = x?.chips || p.tags.map((t) => [p.icon, t]);
  const chips = chipData
    .map(([ic, label]) => `<span class="chip">${icon(ic)}<span>${esc(label)}</span></span>`).join("");

  const stats = (x?.stats || [])
    .map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join("");

  const srcHref = x?.canvas
    ? pre + x.canvas.href
    : x?.live ? x.live.href
    : `${REPO_URL}/blob/${BRANCH}/${p.sourcePath}`;
  const srcTitle = x?.canvas ? "Open source file" : x?.live ? "Open live site" : "Open source file";

  let richSections = "";
  if (x?.map) {
    const catRows = x.map.categories.map(([ic, name, sub, text], i) =>
      `<div class="row cat-row">
        <span class="icon-tile icon-tile--lg">${icon(ic)}</span>
        <div class="cat-body">
          <div class="cat-top"><span class="row-name">${name}</span><span class="row-sub">${sub}</span></div>
          <p class="row-text">${text}</p>
        </div>
        <span class="cat-no">${String(i + 1).padStart(2, "0")}</span>
      </div>`).join('<div class="connector" aria-hidden="true"></div>');

    const tiles = (x.map.swatchMode
      ? x.map.stack.map(([color, fg, name, cat]) =>
          `<div class="stack-tile">
            <span class="brand-letter" style="background:${color};color:${fg}">Aa</span>
            <div><p class="stack-name">${name}</p><p class="stack-cat">${cat}</p></div>
          </div>`)
      : x.map.stack.map(([letter, color, name, cat]) =>
          `<div class="stack-tile">
            <span class="brand-letter" style="background:${color}1A;color:${color}">${letter}</span>
            <div><p class="stack-name">${name}</p><p class="stack-cat">${cat}</p></div>
          </div>`)).join("");

    const ruleItems = x.map.rules
      .map(([name, fix], i) =>
        `<div class="owasp-item">
          <span class="owasp-no">${String(i + 1).padStart(2, "0")}</span>
          <div><p class="owasp-name">${name}</p><p class="owasp-fix">${fix}</p></div>
        </div>`).join("");

    const sourceRow = x.canvas
      ? `<div class="row">
          <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
          <div><p class="row-name">${x.canvas.name}</p>
          <p class="row-sub" style="margin-left:0;margin-top:2px">${x.canvas.sub}</p></div>
          <a class="pill row-right" href="${pre}${x.canvas.href}" target="_blank" rel="noopener">Open ${icon("ext")}</a>
        </div>`
      : `<div class="row">
          <span class="icon-tile icon-tile--lg">${icon("eye")}</span>
          <div><p class="row-name">${x.live.name}</p>
          <p class="row-sub" style="margin-left:0;margin-top:2px">${x.live.sub}</p></div>
          <a class="pill row-right" href="${x.live.href}" target="_blank" rel="noopener">Live ${icon("ext")}</a>
        </div>`;

    richSections = `
      <div class="detail-group">
        <span class="sec-label">${x.map.title}</span>
        <div class="timeline">${catRows}</div>
      </div>
      <div class="detail-group">
        <span class="sec-label">${x.map.gridTitle}</span>
        <div class="stack-grid">${tiles}</div>
      </div>
      <div class="detail-group">
        <span class="sec-label">${x.map.rulesTitle}</span>
        <div class="owasp-grid">${ruleItems}</div>
      </div>
      ${sourceRow}`;
  } else {
    richSections = `
      <div class="detail-group">
        <span class="sec-label">Prompt — full text</span>
        <div class="md-body">${p.bodyHtml}</div>
      </div>
      <div class="row">
        <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
        <div><p class="row-name">${p.sourcePath}</p>
        <p class="row-sub" style="margin-left:0;margin-top:2px">Source file · auto-published</p></div>
        <a class="pill row-right" href="${REPO_URL}/blob/${BRANCH}/${p.sourcePath}" target="_blank" rel="noopener">Source ${icon("ext")}</a>
      </div>`;
  }

  return `
  <section class="card prompt-card reveal" id="${p.slug}" aria-labelledby="${p.slug}-title">
    <div class="prompt-head">
      <span class="icon-tile icon-tile--lg">${icon(x?.icon || p.icon)}</span>
      <div class="prompt-id">
        <h3 class="title-xl" id="${p.slug}-title">${p.name}</h3>
        <p class="title-sub">${p.sub}</p>
      </div>
      <div class="head-icons">
        <a class="icon-btn" href="${srcHref}" target="_blank" rel="noopener" title="${srcTitle}">${icon("dots")}</a>
        <button class="icon-btn" type="button" data-expand="details-${p.slug}" aria-expanded="false" aria-controls="details-${p.slug}" title="Expand details">${icon("expand")}</button>
      </div>
    </div>

    <div class="prompt-pills">
      ${pill(x?.featured ? "Recommended" : "New", "pill--mint")}
      ${pill(p.status, "pill--dark")}
      ${pill(p.version)}
      ${pill(x?.pillLabel || CATS[p.cat].label)}
      <a class="pill pill-link" href="${pre}${p.cat}/${p.slug}/">Full text ${icon("ext")}</a>
      <button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${p.slug}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>
    </div>

    <p class="lede prompt-desc">${p.desc}</p>
    ${p.descFa ? `<p class="fa">${p.descFa}</p>` : ""}
    ${chips ? `<div class="chips prompt-chips">${chips}</div>` : ""}
    ${x?.stats ? `<div class="stats prompt-stats">${stats}</div>` : ""}

    <div class="details" id="details-${p.slug}">
      <div class="details-inner">
        <div class="details-pad">${richSections}</div>
      </div>
    </div>
  </section>
  <script type="text/plain" class="prompt-raw" data-id="${p.slug}">${p.bodyText.replace(/<\/script/gi, "<\\\\/script")}</script>`;
}

/* ---------- shared fragments ---------- */
const terminalCard = (pre) => `
  <section class="card card-dark reveal" id="use-as-prompt" aria-labelledby="use-title">
    <div class="card-head">
      <span class="icon-tile" aria-hidden="true">${icon("terminal")}</span>
      <h2 class="mono-title" id="use-title">Use it as a prompt</h2>
    </div>
    <div class="term-stack">
      <div class="term-line">
        <span class="dollar" aria-hidden="true">$</span>
        <span class="term-cmd">git clone ${REPO_URL}.git</span>
        <button class="icon-btn icon-btn--dark" type="button" data-copy="git clone ${REPO_URL}.git" title="Copy command" aria-label="Copy clone command">${icon("copy")}</button>
      </div>
      <div class="term-line">
        <span class="dollar" aria-hidden="true">$</span>
        <span class="term-cmd">open Prompt-Library.canvas → Obsidian / any JSON Canvas app</span>
        <button class="icon-btn icon-btn--dark" type="button" data-copy="open Prompt-Library.canvas" title="Copy command" aria-label="Copy open command">${icon("copy")}</button>
      </div>
    </div>
    <div class="term-actions">
      <span class="term-hint">Then paste the spec into your AI agent — Claude · Cursor · Copilot</span>
      <button class="btn-white" type="button" data-copy-prompt="security-blueprint">
        ${icon("copy")}
        <span>Copy full prompt</span>
      </button>
    </div>
  </section>`;

const howtoCard = `
  <section class="card reveal" id="how-to-use" aria-labelledby="how-title">
    <div class="card-head">
      <span class="icon-tile" aria-hidden="true">${icon("list")}</span>
      <h2 class="mono-title" id="how-title">Publish a new prompt — automatic</h2>
    </div>
    <div class="timeline">
      <div class="row cat-row">
        <span class="step-tile" aria-hidden="true">01</span>
        <div class="cat-body">
          <div class="cat-top"><span class="row-name">Pick a category folder</span><span class="row-sub">Setup</span></div>
          <p class="row-text">Create your file under <strong>prompts/security/</strong> · <strong>prompts/structure/</strong> · <strong>prompts/ui/</strong> · <strong>prompts/server/</strong> — the folder is the category.</p>
        </div>
      </div>
      <div class="connector" aria-hidden="true"></div>
      <div class="row cat-row">
        <span class="step-tile" aria-hidden="true">02</span>
        <div class="cat-body">
          <div class="cat-top"><span class="row-name">Drop a .md or .canvas file</span><span class="row-sub">Add</span></div>
          <p class="row-text">Add front-matter (title, description, version, tags) to a <strong>.md</strong> — or just push an Obsidian <strong>.canvas</strong> file with no ceremony.</p>
        </div>
      </div>
      <div class="connector" aria-hidden="true"></div>
      <div class="row cat-row">
        <span class="step-tile" aria-hidden="true">03</span>
        <div class="cat-body">
          <div class="cat-top"><span class="row-name">Push to main</span><span class="row-sub">Auto</span></div>
          <p class="row-text">The build generates a real static page for it — with its own meta tags, JSON-LD and a spot in <strong>sitemap.xml</strong> — and publishes it automatically.</p>
        </div>
      </div>
    </div>
  </section>`;

const aboutCard = `
  <section class="card reveal" id="about" aria-labelledby="about-title">
    <div class="card-head">
      <span class="icon-tile" aria-hidden="true">${icon("book")}</span>
      <h2 class="mono-title" id="about-title">About this library</h2>
    </div>
    <p class="lede">A curated, growing collection of <strong>production-grade prompts and engineering specs</strong>, organized into <strong>four category folders</strong> — Security · Structure · UI &amp; Design · Server &amp; API. Every entry is bilingual (<strong>English first, then Persian</strong>) and written to be handed straight to a developer or an AI coding agent. New <strong>.md</strong> or <strong>.canvas</strong> files dropped into <strong>prompts/&lt;category&gt;/</strong> are built and published automatically as real static pages.</p>
    <div class="chips">
      <span class="chip">${icon("globe")}<span>Open source</span></span>
      <span class="chip">${icon("book")}<span>Bilingual FA · EN</span></span>
      <span class="chip">${icon("filecode")}<span>MD + JSON Canvas</span></span>
      <span class="chip">${icon("sparkle")}<span>Agent-ready</span></span>
      <span class="chip">${icon("check")}<span>Static pages · SEO-ready</span></span>
    </div>
  </section>`;

/* ---------- page shell ---------- */
function shell({ pre, title, desc, canonical, jsonLd, body, active = "" }) {
  const brandMark = hasLogo
    ? `<img class="brand-logo" src="${pre}public/logo.svg" alt="" width="26">`
    : icon("box");
  const navItems = [
    ["Library", "", "home"],
    ...Object.entries(CATS).map(([k, c]) => [c.label, `${k}/`, k]),
  ];
  const nav = navItems
    .map(([label, href, key]) =>
      `<a href="${pre}${href}"${key === active ? ' class="is-active"' : ""}>${label}</a>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Prompt Library">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#869A8C" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#161A17" media="(prefers-color-scheme: dark)">
<script>(function(){var t;try{t=localStorage.getItem("pl-theme")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)})()</script>
<link rel="icon" href="${pre}assets/favicon.svg">
<link rel="stylesheet" href="${pre}assets/fonts/fonts.css">
<link rel="stylesheet" href="${pre}assets/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>

<!-- ambient light beams (animated backdrop) -->
<div class="bg-lights" aria-hidden="true"><span></span><span></span><span></span><span></span></div>

  <header class="site-header reveal">
    <div class="header-row">
    <div class="brand">
      <a class="brand-link" href="${pre}" aria-label="Prompt Library home">
        <span class="brand-tile" aria-hidden="true">${brandMark}</span>
        <div>
          <h1 class="brand-name">Prompt Library</h1>
          <p class="brand-sub">Curated specs &amp; prompts for builders</p>
        </div>
      </a>
    </div>
    <div class="head-actions">
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle title="Toggle dark / light theme" aria-label="Toggle color theme">
        <span class="theme-ic theme-ic--moon">${icon("moon")}</span>
        <span class="theme-ic theme-ic--sun">${icon("sun")}</span>
      </button>
      <a class="pill pill-link" href="${REPO_URL}" target="_blank" rel="noopener">
        GitHub
        ${icon("ext")}
      </a>
    </div>
    </div>
    <nav class="site-nav reveal" aria-label="Site sections">${nav}</nav>
  </header>

<main class="sheet">

${body}

</main>

  <footer class="site-footer reveal">
    <div class="footer-grid">
      <div class="footer-col footer-brandcol">
        <div class="brand">
          <span class="brand-tile" aria-hidden="true">${brandMark}</span>
          <div>
            <p class="brand-name">Prompt Library</p>
            <p class="brand-sub">Curated specs &amp; prompts</p>
          </div>
        </div>
        <p class="footer-about">A curated, growing collection of bilingual prompts and engineering specs — published as pure static pages and ready to hand to a developer or an AI coding agent.</p>
      </div>
      <div class="footer-col">
        <h3 class="mono-title">Categories</h3>
        ${Object.entries(CATS).map(([k, c]) => `<a href="${pre}${k}/">${c.label} <span class="foot-fa">${c.fa}</span></a>`).join("")}
      </div>
      <div class="footer-col">
        <h3 class="mono-title">Resources</h3>
        <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub repository ${icon("ext")}</a>
        <a href="${pre}Prompt-Library.canvas" target="_blank" rel="noopener">Prompt-Library.canvas ${icon("ext")}</a>
        <a href="https://github.com/OWASP/Top10" target="_blank" rel="noopener">OWASP Top 10 ${icon("ext")}</a>
        <a href="https://jsoncanvas.org" target="_blank" rel="noopener">JSON Canvas spec ${icon("ext")}</a>
        <a href="https://obsidian.md" target="_blank" rel="noopener">Obsidian ${icon("ext")}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Prompt Library — built with security in mind</span>
      <span>Static · No tracking · EN → FA</span>
    </div>
  </footer>

<script src="${pre}assets/main.js" defer></script>
</body>
</html>`;
}

/* ---------- pages ---------- */
function relatedOf(p, all) {
  const same = all.filter((q) => q.slug !== p.slug && q.cat === p.cat);
  if (same.length >= 3) return same.slice(0, 3);
  const tagSet = new Set(p.tags);
  const others = all
    .filter((q) => q.slug !== p.slug && q.cat !== p.cat)
    .map((q) => [q, q.tags.filter((t) => tagSet.has(t)).length])
    .sort((a, b) => b[1] - a[1])
    .map(([q]) => q);
  return [...same, ...others].slice(0, 3);
}

function relatedSection(p, all, pre) {
  const rel = relatedOf(p, all);
  if (!rel.length) return "";
  const rows = rel.map((q) =>
    `<a class="row cat-row related-row" href="${pre}${q.cat}/${q.slug}/">
      <span class="icon-tile icon-tile--lg">${icon(q.icon)}</span>
      <div class="cat-body">
        <div class="cat-top"><span class="row-name">${q.name}</span><span class="row-sub">${CATS[q.cat].label}</span></div>
        <p class="row-text">${q.desc}</p>
      </div>
      <span class="cat-no">${icon("arrow")}</span>
    </a>`).join('<div class="connector" aria-hidden="true"></div>');
  return `
  <section class="card reveal" aria-labelledby="rel-title">
    <div class="card-head">
      <span class="icon-tile" aria-hidden="true">${icon("layers")}</span>
      <h2 class="mono-title" id="rel-title">Similar prompts</h2>
    </div>
    <div class="timeline">${rows}</div>
  </section>`;
}

function crumbGraph(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it[0],
      ...(it[1] ? { item: it[1] } : {}),
    })),
  };
}

function homePage(prompts) {
  const pre = "";
  const catTiles = Object.entries(CATS).map(([key, c]) =>
    `<a class="cat-tile" href="c/${key}/">
      <span class="cat-row-top">
        <span class="icon-tile icon-tile--lg">${icon(c.icon)}</span>
        <span class="cat-count">${String(prompts.filter((p) => p.cat === key).length).padStart(2, "0")}</span>
      </span>
      <span class="stack-name">${c.label}</span>
      <span class="stack-cat">${c.fa}</span>
    </a>`).join("");

  const sections = Object.entries(CATS)
    .filter(([key]) => prompts.some((p) => p.cat === key))
    .map(([key, c]) => {
      const items = prompts.filter((p) => p.cat === key).map((p) => renderCard(p, pre)).join("");
      const n = prompts.filter((p) => p.cat === key).length;
      return `
      <div class="cat-section">
        <div class="cat-section-head">
          <span class="sec-label">${c.label} — ${n} prompt${n > 1 ? "s" : ""}</span>
          <a class="pill pill-link" href="c/${key}/">Open category ${icon("arrow")}</a>
        </div>
        ${items}
      </div>`;
    }).join("");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Prompt Library", url: BASE + "/", inLanguage: ["en", "fa"] },
      {
        "@type": "CollectionPage", name: "All prompts", url: BASE + "/",
        hasPart: prompts.map((p) => ({
          "@type": "CreativeWork", name: p.name, url: `${BASE}/p/${p.slug}/`,
          description: p.desc, keywords: p.tags.join(", "),
        })),
      },
      crumbGraph([["Library", BASE + "/"], ["All prompts", BASE + "/"]]),
    ],
  };

  return shell({
    pre,
    active: "home",
    title: "Prompt Library — Curated Prompts & Specs (Security · Structure · UI · Server)",
    desc: "A curated collection of production-grade prompts and engineering specs — security, structure, UI design systems and server/API — bilingual (EN/FA), auto-published as static pages.",
    canonical: BASE + "/",
    jsonLd,
    body: `
  <div class="stack">
    ${aboutCard}
    <section class="card reveal" aria-labelledby="cats-title">
      <div class="card-head">
        <span class="icon-tile" aria-hidden="true">${icon("layers")}</span>
        <h2 class="mono-title" id="cats-title">Categories — one folder each</h2>
      </div>
      <div class="cat-grid">${catTiles}</div>
    </section>
    ${sections}
    ${terminalCard(pre)}
    ${howtoCard}
  </div>`,
  });
}

function categoryPage(cat, prompts) {
  const c = CATS[cat];
  const pre = "../"; // served at /<cat>/ → one level deep
  const items = prompts.filter((p) => p.cat === cat);
  const cards = items.length
    ? items.map((p) => renderCard(p, pre)).join("")
    : `<div class="empty-state reveal">
        <span class="icon-tile icon-tile--lg">${icon(c.icon)}</span>
        <p class="row-name">No prompts here yet</p>
        <p class="row-text">Create <strong>prompts/${cat}/my-prompt.md</strong> (or a .canvas file), push to main — and its page is generated automatically.</p>
        <a class="pill pill-link" href="${REPO_URL}/new/${BRANCH}?filename=prompts/${cat}/my-prompt.md" target="_blank" rel="noopener">Create on GitHub ${icon("ext")}</a>
      </div>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: `${c.label} prompts`, url: `${BASE}/${cat}/`, description: c.desc, inLanguage: ["en", "fa"] },
      crumbGraph([["Library", BASE + "/"], [c.label, `${BASE}/${cat}/`]]),
    ],
  };

  return shell({
    pre,
    active: cat,
    title: `${c.label} Prompts — Prompt Library`,
    desc: `${c.desc} ${c.faDesc}`,
    canonical: `${BASE}/${cat}/`,
    jsonLd,
    body: `
  <div class="stack">
    <section class="card reveal" aria-labelledby="cat-title">
      <div class="prompt-head">
        <span class="icon-tile icon-tile--lg">${icon(c.icon)}</span>
        <div class="prompt-id">
          <h2 class="title-xl" id="cat-title">${c.label}</h2>
          <p class="title-sub">${c.fa} · prompts/${cat}/</p>
        </div>
      </div>
      <p class="lede prompt-desc">${c.desc}</p>
      <p class="fa">${c.faDesc}</p>
      <div class="prompt-pills">
        ${pill(String(items.length).padStart(2, "0") + " prompts", "pill--dark")}
        <a class="pill pill-link" href="${REPO_URL}/tree/${BRANCH}/prompts/${cat}" target="_blank" rel="noopener">Folder ${icon("ext")}</a>
        <a class="pill pill-link" href="${REPO_URL}/new/${BRANCH}?filename=prompts/${cat}/my-prompt.md" target="_blank" rel="noopener">Add prompt ${icon("ext")}</a>
      </div>
    </section>
    ${cards}
    ${howtoCard}
  </div>`,
  });
}

function canvasStageBlock(p) {
  return `
  <section class="card reveal" data-canvas-view aria-label="Interactive canvas" hidden>
    <div class="canvas-toolbar">
      <div class="mode-pills">
        <button class="pill mode-pill" type="button" data-canvas-mode-btn="canvas">Canvas view</button>
        <button class="pill mode-pill" type="button" data-canvas-mode-btn="text">Text view</button>
      </div>
      <div class="canvas-controls">
        <button class="icon-btn" type="button" data-zoom="out" title="Zoom out" aria-label="Zoom out">${icon("zoomout")}</button>
        <span class="zoom-label" data-zoom-label>100%</span>
        <button class="icon-btn" type="button" data-zoom="in" title="Zoom in" aria-label="Zoom in">${icon("zoomin")}</button>
        <button class="pill pill-link" type="button" data-canvas-fit>Fit</button>
        <button class="icon-btn" type="button" data-canvas-fullscreen title="Toggle fullscreen">
          <span class="fs-ic fs-ic--expand">${icon("expand")}</span>
          <span class="fs-ic fs-ic--min">${icon("min")}</span>
        </button>
      </div>
    </div>
    <div class="canvas-stage" data-canvas-stage></div>
  </section>
  <script type="application/json" class="canvas-json">${p.canvasData}</script>`;
}

function promptPage(p, all) {
  const pre = "../../"; // served at /<cat>/<slug>/ → two levels deep
  const c = CATS[p.cat];
  const x = p.extras;
  const srcHref = x?.canvas
    ? pre + x.canvas.href
    : x?.live ? x.live.href
    : `${REPO_URL}/blob/${BRANCH}/${p.sourcePath}`;
  const srcTitle = x?.canvas ? "Open source file" : x?.live ? "Open live site" : "Open source file";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: p.name,
        headline: p.name,
        description: p.desc,
        url: `${BASE}/${p.cat}/${p.slug}/`,
        inLanguage: ["en", "fa"],
        keywords: p.tags.join(", "),
        datePublished: BUILD_DATE,
        dateModified: BUILD_DATE,
        author: { "@type": "Person", name: OWNER, url: `https://github.com/${OWNER}` },
        isPartOf: { "@type": "WebSite", name: "Prompt Library", url: BASE + "/" },
      },
      crumbGraph([["Library", BASE + "/"], [c.label, `${BASE}/${p.cat}/`], [p.name, `${BASE}/${p.cat}/${p.slug}/`]]),
    ],
  };

  return shell({
    pre,
    active: p.cat,
    title: `${p.name} — ${c.label} Prompt · Prompt Library`,
    desc: p.desc,
    canonical: `${BASE}/${p.cat}/${p.slug}/`,
    jsonLd,
    body: `
  <div class="stack">
    <section class="card reveal" aria-labelledby="pd-title">
      <div class="prompt-head">
        <span class="icon-tile icon-tile--lg">${icon(x?.icon || p.icon)}</span>
        <div class="prompt-id">
          <h2 class="title-xl" id="pd-title">${p.name}</h2>
          <p class="title-sub">${p.sub}</p>
        </div>
        <div class="head-icons">
          <a class="icon-btn" href="${srcHref}" target="_blank" rel="noopener" title="${srcTitle}">${icon("dots")}</a>
        </div>
      </div>
      <div class="prompt-pills">
        ${pill(x?.featured ? "Recommended" : c.label, x?.featured ? "pill--mint" : "pill--dark")}
        ${pill(p.status)}
        ${pill(p.version)}
        ${pill(p.tagLabel)}
        ${x?.alt ? `<a class="pill pill-link" href="${pre}${x.alt.href}">${x.alt.label} ${icon("ext")}</a>` : ""}
        <button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${p.slug}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>
      </div>
    </section>
    ${p.canvasData ? canvasStageBlock(p) : ""}
    <section class="card reveal" data-text-view aria-label="Prompt full text">
      <div class="md-body md-body--page">${p.bodyHtml}</div>
    </section>
    ${relatedSection(p, all, pre)}
    <div class="back-row reveal">
      <a class="pill pill-link" href="../">${icon("arrow")} Back to ${c.label}</a>
      <a class="pill pill-link" href="../../">All prompts</a>
    </div>
  </div>
  <script type="text/plain" class="prompt-raw" data-id="${p.slug}">${p.bodyText.replace(/<\/script/gi, "<\\\\/script")}</script>`,
  });
}

function notFoundPage(prompts) {
  return shell({
    pre: "",
    title: "Page not found — Prompt Library",
    desc: "The page you requested does not exist in the Prompt Library.",
    canonical: BASE + "/404.html",
    jsonLd: { "@context": "https://schema.org", "@graph": [crumbGraph([["Library", BASE + "/"], ["Not found"]])] },
    body: `
  <div class="stack">
    <div class="empty-state reveal">
      <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
      <p class="row-name">Page not found</p>
      <p class="row-text">The prompt or category you're looking for doesn't exist (yet).</p>
      <a class="pill pill-link" href="/">Back to the library ${icon("arrow")}</a>
    </div>
  </div>`,
  }) + `
<script>
var PL_MAP = ${JSON.stringify(prompts.reduce((m, p) => (m[p.slug] = p.cat + "/" + p.slug + "/", m), {}))};
var PL_CATS = ${JSON.stringify(Object.keys(CATS))};
(function () {
  var h = location.hash || "", m;
  if ((m = h.match(/^#\\/p\\/([^/?]+)/)) && PL_MAP[m[1]]) location.replace("/" + PL_MAP[m[1]]);
  else if ((m = h.match(/^#\\/c\\/([^/?]+)/)) && PL_CATS.indexOf(m[1]) !== -1) location.replace("/" + m[1] + "/");
})();
</script>`;
}

/* ---------- sitemap & robots ---------- */
function sitemap(prompts) {
  const urls = [
    { loc: `${BASE}/`, priority: "1.0" },
    ...Object.keys(CATS).map((k) => ({ loc: `${BASE}/${k}/`, priority: "0.8" })),
    ...prompts.map((p) => ({ loc: `${BASE}/${p.cat}/${p.slug}/`, priority: "0.9" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${BUILD_DATE}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
}

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;

/* ---------- favicon & brand mark (from public/logo.svg) ---------- */
const LOGO_PATH = join(ROOT, "public", "logo.svg");
const hasLogo = existsSync(LOGO_PATH);
let faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#869A8C"/><path d="M10 16.5l4.5 4.5L22.5 11" stroke="#F8F8F8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
if (hasLogo) {
  try {
    const src = readFileSync(LOGO_PATH, "utf8");
    const d = (src.match(/ d="([^"]+)"/) || [])[1];
    const vb = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) || [];
    if (d && vb[1] && vb[2]) {
      const w = parseFloat(vb[1]), h = parseFloat(vb[2]);
      const scale = Math.min(22 / w, 22 / h);
      const tx = ((32 - w * scale) / 2).toFixed(2), ty = ((32 - h * scale) / 2).toFixed(2);
      faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#869A8C"/><g transform="translate(${tx} ${ty}) scale(${scale.toFixed(4)})"><path fill="#171717" fill-rule="evenodd" d="${d}"/></g></svg>`;
    }
  } catch (_) {}
}

/* ---------- main ---------- */
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
    sub: "Obsidian Canvas · the full blueprint (EN → FA)",
    desc: "Every card of the Security Blueprint rendered page by page — architecture, structure, login, tokens, post-login and OWASP — exactly as laid out in the Obsidian canvas.",
    descFa: "تمام کارت‌های بلوپرینت امنیتی، دقیقاً به همان چیدمان کانواس اوبسیدین — از معماری تا OWASP.",
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
for (const d of ["p", "c", ...Object.keys(CATS)]) {
  rmSync(join(ROOT, d), { recursive: true, force: true });
}

writeFileSync(join(ROOT, "index.html"), homePage(prompts));
writeFileSync(join(ROOT, "404.html"), notFoundPage(prompts));
writeFileSync(join(ROOT, "sitemap.xml"), sitemap(prompts));
writeFileSync(join(ROOT, "robots.txt"), robotsTxt);
writeFileSync(join(ROOT, "assets/favicon.svg"), faviconSvg);

for (const cat of Object.keys(CATS)) {
  mkdirSync(join(ROOT, cat), { recursive: true });
  writeFileSync(join(ROOT, cat, "index.html"), categoryPage(cat, prompts));
}
for (const p of prompts) {
  mkdirSync(join(ROOT, p.cat, p.slug), { recursive: true });
  writeFileSync(join(ROOT, p.cat, p.slug, "index.html"), promptPage(p, prompts));
}

console.log(`OK — built ${prompts.length} prompt pages, ${Object.keys(CATS).length} category pages, home, 404, sitemap.xml, robots.txt (${BUILD_DATE})`);
for (const p of prompts) console.log(`  · /${p.cat}/${p.slug}/`);
