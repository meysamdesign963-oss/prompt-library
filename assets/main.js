"use strict";

/* ============================================================
   Prompt Library — SPA app
   - Hash router: #/ (index) · #/c/<category> · #/p/<slug>
   - Auto-discovery: every prompts/<category>/*.{md,canvas} file
     in the repo is fetched (GitHub API + raw) and rendered
     automatically — drop a file, push, it appears.
   - Embedded prompts (content.js) keep their rich cards.
   ============================================================ */

/* ---------- icon set ---------- */
const svg = (paths, filled = false) =>
  `<svg viewBox="0 0 24 24" ${filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${paths}</svg>`;

const ICONS = {
  shield:   svg('<path d="M12 3l7 3.2v5.1c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V6.2L12 3z"/>'),
  layers:   svg('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'),
  folder:   svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>'),
  lock:     svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  key:      svg('<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5L20 3"/><path d="M16 7l3 3"/>'),
  bug:      svg('<circle cx="12" cy="13" r="5"/><path d="M12 8V6"/><path d="M9.5 8L7.5 5M14.5 8l2-3"/><path d="M4.5 13h2.5M17 13h2.5M6 19l2-2M18 19l-2-2"/>'),
  clock:    svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  eye:      svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/>'),
  copy:     svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  check:    svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  expand:   svg('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7.5 7.5"/><path d="M3 21l7.5-7.5"/>'),
  dots:     svg('<circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/>', true),
  ext:      svg('<path d="M7 17L17 7"/><path d="M8.5 7H17v8.5"/>'),
  filecode: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/><path d="M10.5 12.5L8.5 15l2 2.5"/><path d="M13.5 12.5l2 2.5-2 2.5"/>'),
  book:     svg('<path d="M2.5 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12a2.5 2.5 0 0 0-2.5-2.5h-7v-13z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.5 2.5 0 0 1 2.5-2.5h7v-13z"/>'),
  sparkle:  svg('<path d="M12 3l2.2 6.2L20.5 12l-6.3 2.8L12 21l-2.2-6.2L3.5 12l6.3-2.8L12 3z"/>'),
  list:     svg('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  terminal: svg('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 9.5l3.5 3L7 15.5"/><path d="M12.5 15.5H17"/>'),
  palette:  svg('<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-1.4-3.4A2 2 0 0 1 12 12h4.5A4.5 4.5 0 0 0 21 7.5C21 4.4 16.9 3 12 3z"/><circle cx="7.5" cy="10.5" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16.5" cy="10.5" r="1.1"/>'),
  arrow:    svg('<path d="M5 12h13"/><path d="M13 6.5L18.5 12 13 17.5"/>'),
  globe:    svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.8 2.7 2.8 14.3 0 17-2.8-2.7-2.8-14.3 0-17z"/>'),
};
const icon = (name) => ICONS[name] || "";

/* ---------- tiny utils ---------- */
const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;
const slugify = (s) =>
  String(s).toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const titleize = (s) =>
  String(s).replace(/\.[a-z0-9]+$/i, "").split(/[-_\s]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

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

function mdToHtml(text) {
  if (window.marked && typeof window.marked.parse === "function") return window.marked.parse(text);
  return `<pre><code>${escapeHtml(text)}</code></pre>`;
}

function canvasToMd(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const parts = [];
    for (const n of j.nodes || []) {
      if (n.type === "text" && n.text) parts.push(n.text);
    }
    return parts.length ? parts.join("\n\n---\n\n") : "*(This canvas has no text nodes — open it in Obsidian.)*";
  } catch (_) {
    return "*(Unreadable canvas file — open it in Obsidian.)*";
  }
}

/* ---------- state ---------- */
const state = { discovered: [], loaded: false, byId: new Map() };

function indexPrompts() {
  state.byId.clear();
  for (const p of PROMPTS) state.byId.set(p.id, p);
  for (const p of state.discovered) if (!state.byId.has(p.id)) state.byId.set(p.id, p);
}
const promptsOf = (cat) => [...state.byId.values()].filter((p) => p.cat === cat);
const countOf = (cat) => promptsOf(cat).length;

/* ---------- auto-discovery (prompts/<category>/*.{md,canvas}) ---------- */
async function fetchWithTimeout(url, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { signal: ctl.signal }); }
  finally { clearTimeout(t); }
}

async function discoverPrompts() {
  if (state.loaded) return;
  state.loaded = true;
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`
    );
    if (!res.ok) throw new Error("tree " + res.status);
    const j = await res.json();
    const files = (j.tree || []).filter((t) =>
      t.type === "blob" && /^prompts\/([^/]+)\/[^/]+\.(md|canvas)$/i.test(t.path)
    );
    const out = [];
    for (const f of files) {
      const m = f.path.match(/^prompts\/([^/]+)\/([^/]+)\.(md|canvas)$/i);
      const cat = m[1].toLowerCase();
      const fname = m[2], ext = m[3].toLowerCase();
      if (!CATS[cat]) continue;
      const slug = slugify(fname);
      if (PROMPTS.some((p) => p.id === slug)) continue; // embedded rich card wins
      const raw = await fetchWithTimeout(
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${encodeURI(f.path)}`
      );
      if (!raw.ok) continue;
      const text = await raw.text();
      out.push(ext === "canvas"
        ? makeCanvasEntry(cat, slug, fname, text)
        : makeMdEntry(cat, slug, fname, text));
    }
    state.discovered = out;
  } catch (_) {
    state.discovered = state.discovered || [];
  }
  indexPrompts();
}

function makeMdEntry(cat, slug, fname, text) {
  const { meta, body } = parseFrontMatter(text);
  const c = CATS[cat];
  const tags = (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  return {
    id: slug, generic: true, cat, icon: c.icon,
    name: meta.title ? escapeHtml(meta.title) : escapeHtml(titleize(fname)),
    sub: meta.description ? escapeHtml(meta.description) : escapeHtml(c.label + " prompt"),
    version: meta.version ? escapeHtml(meta.version) : "V1.0",
    status: meta.status ? escapeHtml(meta.status) : escapeHtml(c.label + " · ready"),
    tags: tags.length ? escapeHtml(tags.slice(0, 2).join(" · ")) : escapeHtml(c.label),
    tagList: tags,
    descEn: meta.description ? escapeHtml(meta.description) : escapeHtml(c.desc),
    descFa: meta.fa ? escapeHtml(meta.fa) : "",
    sourcePath: `prompts/${cat}/${fname}`,
    bodyText: text,
    bodyHtml: mdToHtml(body),
  };
}

function makeCanvasEntry(cat, slug, fname, text) {
  const c = CATS[cat];
  const md = canvasToMd(text);
  return {
    id: slug, generic: true, cat, icon: c.icon,
    name: escapeHtml(titleize(fname)),
    sub: escapeHtml("Obsidian Canvas · JSON"),
    version: "V1.0",
    status: "Canvas",
    tags: escapeHtml(c.label),
    tagList: [],
    descEn: escapeHtml(c.desc),
    descFa: "",
    sourcePath: `prompts/${cat}/${fname}`,
    bodyText: md,
    bodyHtml: mdToHtml(md),
  };
}

/* ---------- embedded rich card ---------- */
function renderPrompt(p) {
  const chips = p.chips
    .map((c) => `<span class="chip">${icon(c.iconName)}<span>${c.label}</span></span>`)
    .join("");
  const stats = (p.stats || [])
    .map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`)
    .join("");
  const catRows = p.categories.map(([ic, name, sub, text], i) =>
    `<div class="row cat-row">
      <span class="icon-tile icon-tile--lg">${icon(ic)}</span>
      <div class="cat-body">
        <div class="cat-top"><span class="row-name">${name}</span><span class="row-sub">${sub}</span></div>
        <p class="row-text">${text}</p>
      </div>
      <span class="cat-no">${String(i + 1).padStart(2, "0")}</span>
    </div>`
  );
  const cats = catRows.join('<div class="connector" aria-hidden="true"></div>');

  const stackTiles = (p.swatchMode
    ? p.stack.map(([color, fg, name, cat]) =>
        `<div class="stack-tile">
          <span class="brand-letter" style="background:${color};color:${fg}">Aa</span>
          <div><p class="stack-name">${name}</p><p class="stack-cat">${cat}</p></div>
        </div>`)
    : p.stack.map(([letter, color, name, cat]) =>
        `<div class="stack-tile">
          <span class="brand-letter" style="background:${color}1A;color:${color}">${letter}</span>
          <div><p class="stack-name">${name}</p><p class="stack-cat">${cat}</p></div>
        </div>`)
  ).join("");

  const ruleItems = p.rules
    .map(([name, fix], i) =>
      `<div class="owasp-item">
        <span class="owasp-no">${String(i + 1).padStart(2, "0")}</span>
        <div><p class="owasp-name">${name}</p><p class="owasp-fix">${fix}</p></div>
      </div>`)
    .join("");

  const srcHref = p.canvas ? p.canvas.href : p.live.href;
  const sourceRow = p.canvas
    ? `<div class="row">
        <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
        <div>
          <p class="row-name">${p.canvas.name}</p>
          <p class="row-sub" style="margin-left:0;margin-top:2px">${p.canvas.sub}</p>
        </div>
        <a class="pill row-right" href="${p.canvas.href}" target="_blank" rel="noopener">Open ${icon("ext")}</a>
      </div>`
    : `<div class="row">
        <span class="icon-tile icon-tile--lg">${icon("eye")}</span>
        <div>
          <p class="row-name">${p.live.name}</p>
          <p class="row-sub" style="margin-left:0;margin-top:2px">${p.live.sub}</p>
        </div>
        <a class="pill row-right" href="${p.live.href}" target="_blank" rel="noopener">Live ${icon("ext")}</a>
      </div>`;

  return `
  <section class="card prompt-card reveal" id="${p.id}" aria-labelledby="${p.id}-title">
    <div class="prompt-head">
      <span class="icon-tile icon-tile--lg">${icon(p.icon)}</span>
      <div class="prompt-id">
        <h3 class="title-xl" id="${p.id}-title">${p.name}</h3>
        <p class="title-sub">${p.sub}</p>
      </div>
      <div class="head-icons">
        <a class="icon-btn" href="${srcHref}" target="_blank" rel="noopener" title="${p.canvas ? "Open source file" : "Open live site"}">${icon("dots")}</a>
        <button class="icon-btn" type="button" data-expand="details-${p.id}" aria-expanded="false" aria-controls="details-${p.id}" title="Expand details">${icon("expand")}</button>
      </div>
    </div>

    <div class="prompt-pills">
      ${pill(p.featured ? "Recommended" : "New", "pill--mint")}
      ${pill(p.status, "pill--dark")}
      ${pill(p.version)}
      ${pill(p.tags || "Bilingual FA · EN")}
      <a class="pill pill-link" href="#/p/${p.id}">Full text ${icon("ext")}</a>
      <button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${p.id}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>
    </div>

    <p class="lede prompt-desc">${p.descEn}</p>
    <p class="fa">${p.descFa}</p>

    <div class="chips prompt-chips">${chips}</div>
    ${p.stats ? `<div class="stats prompt-stats">${stats}</div>` : ""}

    <div class="details" id="details-${p.id}">
      <div class="details-inner">
        <div class="details-pad">
          <div class="detail-group">
            <span class="sec-label">${p.mapTitle}</span>
            <div class="timeline">${cats}</div>
          </div>
          <div class="detail-group">
            <span class="sec-label">${p.gridTitle}</span>
            <div class="stack-grid">${stackTiles}</div>
          </div>
          <div class="detail-group">
            <span class="sec-label">${p.rulesTitle}</span>
            <div class="owasp-grid">${ruleItems}</div>
          </div>
          ${sourceRow}
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- generic card (auto-discovered files) ---------- */
function renderGenericCard(p) {
  const chips = (p.tagList || [])
    .map((t) => `<span class="chip">${icon(p.icon)}<span>${escapeHtml(t)}</span></span>`)
    .join("");
  return `
  <section class="card prompt-card reveal" id="${p.id}" aria-labelledby="${p.id}-title">
    <div class="prompt-head">
      <span class="icon-tile icon-tile--lg">${icon(p.icon)}</span>
      <div class="prompt-id">
        <h3 class="title-xl" id="${p.id}-title">${p.name}</h3>
        <p class="title-sub">${p.sub}</p>
      </div>
      <div class="head-icons">
        <a class="icon-btn" href="${REPO_URL}/blob/${BRANCH}/${p.sourcePath}" target="_blank" rel="noopener" title="Open source file">${icon("dots")}</a>
        <button class="icon-btn" type="button" data-expand="details-${p.id}" aria-expanded="false" aria-controls="details-${p.id}" title="Expand details">${icon("expand")}</button>
      </div>
    </div>

    <div class="prompt-pills">
      ${pill("New", "pill--mint")}
      ${pill(p.status, "pill--dark")}
      ${pill(p.version)}
      ${pill(CATS[p.cat].label)}
      <a class="pill pill-link" href="#/p/${p.id}">Full text ${icon("ext")}</a>
      <button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${p.id}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>
    </div>

    <p class="lede prompt-desc">${p.descEn}</p>
    ${p.descFa ? `<p class="fa">${p.descFa}</p>` : ""}
    ${chips ? `<div class="chips prompt-chips">${chips}</div>` : ""}

    <div class="details" id="details-${p.id}">
      <div class="details-inner">
        <div class="details-pad">
          <div class="detail-group">
            <span class="sec-label">Prompt — full text</span>
            <div class="md-body">${p.bodyHtml}</div>
          </div>
          <div class="row">
            <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
            <div>
              <p class="row-name">${p.sourcePath}</p>
              <p class="row-sub" style="margin-left:0;margin-top:2px">Source file · auto-discovered</p>
            </div>
            <a class="pill row-right" href="${REPO_URL}/blob/${BRANCH}/${p.sourcePath}" target="_blank" rel="noopener">Source ${icon("ext")}</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

const renderCard = (p) => (p.generic ? renderGenericCard(p) : renderPrompt(p));

/* ---------- shared view fragments ---------- */
const crumbsHtml = (items) => `
  <nav class="crumbs reveal" aria-label="Breadcrumb">
    ${items.map((it, i) =>
      i < items.length - 1
        ? `<span>${it[0]}</span><span class="sep" aria-hidden="true">›</span>`
        : `<strong>${it[0]}</strong>`
    ).join("")}
  </nav>`;

const terminalCard = `
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
      <button class="btn-white" type="button" data-copy-target="security-blueprint">
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
          <p class="row-text">That's it — the site discovers every file in <strong>prompts/**</strong> automatically and publishes its card, page and copy button. No build step, no registration.</p>
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
    <p class="lede">A curated, growing collection of <strong>production-grade prompts and engineering specs</strong>, organized into <strong>four category folders</strong> — Security · Structure · UI &amp; Design · Server &amp; API. Every entry is bilingual (<strong>English first, then Persian</strong>) and written to be handed straight to a developer or an AI coding agent. New <strong>.md</strong> or <strong>.canvas</strong> files dropped into <strong>prompts/&lt;category&gt;/</strong> are discovered and published automatically.</p>
    <div class="chips">
      <span class="chip">${icon("globe")}<span>Open source</span></span>
      <span class="chip">${icon("book")}<span>Bilingual FA · EN</span></span>
      <span class="chip">${icon("filecode")}<span>MD + JSON Canvas</span></span>
      <span class="chip">${icon("sparkle")}<span>Agent-ready</span></span>
      <span class="chip">${icon("check")}<span>Auto-published</span></span>
    </div>
  </section>`;

/* ---------- views ---------- */
function viewHome() {
  const catTiles = Object.entries(CATS).map(([key, c]) =>
    `<a class="cat-tile" href="#/c/${key}">
      <span class="cat-row-top">
        <span class="icon-tile icon-tile--lg">${icon(c.icon)}</span>
        <span class="cat-count">${String(countOf(key)).padStart(2, "0")}</span>
      </span>
      <span class="stack-name">${c.label}</span>
      <span class="stack-cat">${c.fa}</span>
    </a>`).join("");

  const sections = Object.entries(CATS)
    .filter(([key]) => countOf(key) > 0)
    .map(([key, c]) => {
      const items = promptsOf(key).map(renderCard).join("");
      return `
      <div class="cat-section">
        <div class="cat-section-head">
          <span class="sec-label">${c.label} — ${countOf(key)} prompt${countOf(key) > 1 ? "s" : ""}</span>
          <a class="pill pill-link" href="#/c/${key}">Open category ${icon("arrow")}</a>
        </div>
        ${items}
      </div>`;
    }).join("");

  return `
  ${crumbsHtml([["Library"], ["All prompts"]])}
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
    ${terminalCard}
    ${howtoCard}
  </div>`;
}

function viewCategory(cat) {
  const c = CATS[cat];
  const items = promptsOf(cat);
  const cards = items.length
    ? items.map(renderCard).join("")
    : `<div class="empty-state reveal">
        <span class="icon-tile icon-tile--lg">${icon(c.icon)}</span>
        <p class="row-name">No prompts here yet</p>
        <p class="row-text">Create <strong>prompts/${cat}/my-prompt.md</strong> (or a .canvas file), push to main — and it appears here automatically.</p>
        <a class="pill pill-link" href="${REPO_URL}/new/${BRANCH}?filename=prompts/${cat}/my-prompt.md" target="_blank" rel="noopener">Create on GitHub ${icon("ext")}</a>
      </div>`;

  return `
  ${crumbsHtml([["Library", "#/"], [c.label]])}
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
        ${pill(String(countOf(cat)).padStart(2, "0") + " prompts", "pill--dark")}
        <a class="pill pill-link" href="${REPO_URL}/tree/${BRANCH}/prompts/${cat}" target="_blank" rel="noopener">Folder ${icon("ext")}</a>
        <a class="pill pill-link" href="${REPO_URL}/new/${BRANCH}?filename=prompts/${cat}/my-prompt.md" target="_blank" rel="noopener">Add prompt ${icon("ext")}</a>
      </div>
    </section>
    ${cards}
    ${howtoCard}
  </div>`;
}

function viewPromptDetail(slug) {
  const p = state.byId.get(slug);
  const c = CATS[p.cat];
  const bodyHtml = p.generic ? p.bodyHtml : mdToHtml(p.full);
  const srcHref = p.generic
    ? `${REPO_URL}/blob/${BRANCH}/${p.sourcePath}`
    : (p.canvas ? p.canvas.href : (p.live ? p.live.href : REPO_URL));

  return `
  ${crumbsHtml([["Library", "#/"], [c.label, `#/c/${p.cat}`], [p.name]])}
  <div class="stack">
    <section class="card reveal" aria-labelledby="pd-title">
      <div class="prompt-head">
        <span class="icon-tile icon-tile--lg">${icon(p.icon)}</span>
        <div class="prompt-id">
          <h2 class="title-xl" id="pd-title">${p.name}</h2>
          <p class="title-sub">${p.sub}</p>
        </div>
        <div class="head-icons">
          <a class="icon-btn" href="${srcHref}" target="_blank" rel="noopener" title="Open source">${icon("dots")}</a>
        </div>
      </div>
      <div class="prompt-pills">
        ${pill(p.featured ? "Recommended" : c.label, p.featured ? "pill--mint" : "pill--dark")}
        ${pill(p.status)}
        ${pill(p.version)}
        ${pill(p.tags || c.label)}
        <button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${p.id}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>
      </div>
    </section>
    <section class="card reveal" aria-label="Prompt full text">
      <div class="md-body md-body--page">${bodyHtml}</div>
    </section>
    <div class="back-row reveal">
      <a class="pill pill-link" href="#/c/${p.cat}">${icon("arrow")} Back to ${c.label}</a>
      <a class="pill pill-link" href="#/">All prompts</a>
    </div>
  </div>`;
}

function view404() {
  return `
  ${crumbsHtml([["Library", "#/"], ["Not found"]])}
  <div class="stack">
    <div class="empty-state reveal">
      <span class="icon-tile icon-tile--lg">${icon("filecode")}</span>
      <p class="row-name">Page not found</p>
      <p class="row-text">The prompt or category you're looking for doesn't exist (yet).</p>
      <a class="pill pill-link" href="#/">Back to the library ${icon("arrow")}</a>
    </div>
  </div>`;
}

/* ---------- router ---------- */
function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "").split("?")[0];
  const parts = hash.split("/").filter(Boolean).map(decodeURIComponent);
  if (!parts.length) return { view: "home" };
  if (parts[0] === "c" && parts[1] && CATS[parts[1]]) return { view: "category", cat: parts[1] };
  if (parts[0] === "p" && parts[1]) return { view: "prompt", slug: parts[1] };
  return { view: "404" };
}

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const route = parseRoute();
  await Promise.race([discoverPrompts(), new Promise((r) => setTimeout(r, 6000))]);
  if (seq !== renderSeq) return; // a newer navigation superseded this render

  const app = document.getElementById("app");
  if (route.view === "home") { app.innerHTML = viewHome(); document.title = "Prompt Library — Curated Prompts & Specs"; }
  else if (route.view === "category") { app.innerHTML = viewCategory(route.cat); document.title = `${CATS[route.cat].label} — Prompt Library`; }
  else if (route.view === "prompt" && state.byId.has(route.slug)) {
    const p = state.byId.get(route.slug);
    app.innerHTML = viewPromptDetail(route.slug);
    document.title = `${p.name} — Prompt Library`;
  }
  else { app.innerHTML = view404(); document.title = "Not found — Prompt Library"; }

  wireEvents();
  initReveal();
  window.scrollTo(0, 0);
}

/* ---------- interactions ---------- */
function wireEvents() {
  document.querySelectorAll("[data-expand]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = document.getElementById(btn.getAttribute("data-expand"));
      const open = d.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.title = open ? "Collapse details" : "Expand details";
    });
  });

  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el));
  });

  document.querySelectorAll("[data-copy-target], [data-copy-prompt]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-copy-target") || el.getAttribute("data-copy-prompt");
      const p = state.byId.get(id);
      if (p) copyText(p.generic ? p.bodyText : p.full, el);
    });
  });
}

async function copyText(text, el) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    ta.remove();
  }
  flashCopied(el, ok);
}

function flashCopied(el, ok) {
  if (!ok) { el.title = "Copy failed — select and copy manually"; return; }
  const prev = el.innerHTML;
  const prevTitle = el.title;
  el.classList.add("is-copied");
  el.innerHTML = el.classList.contains("btn-white") || el.classList.contains("btn-copy")
    ? `${icon("check")}<span>Copied ✓</span>`
    : icon("check");
  el.title = "Copied";
  setTimeout(() => {
    el.innerHTML = prev;
    el.title = prevTitle;
    el.classList.remove("is-copied");
  }, 1600);
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal:not(.is-in)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 45}ms`;
    io.observe(el);
  });
}

/* ---------- boot ---------- */
indexPrompts();
window.addEventListener("hashchange", render);
render();
