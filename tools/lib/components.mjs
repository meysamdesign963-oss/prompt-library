/* Reusable UI components (server-rendered at build time):
   brand, cards, sections, pills, buttons. */
import { icon } from "./icons.mjs";
import { esc, pill, mdToHtml } from "./utils.mjs";
import { REPO_URL, BRANCH, CATS, hasLogo } from "./site.mjs";

/* brand mark — the site logo (public/logo.svg) or a fallback icon */
export const brandMark = (pre) =>
  hasLogo
    ? `<img class="brand-logo" src="${pre}public/logo.svg" alt="" width="26">`
    : icon("box");

/* brand lockup — linked (header) or plain (footer) */
export function brand(pre, { name, sub, href, heading = false }) {
  const tile = `<span class="brand-tile" aria-hidden="true">${brandMark(pre)}</span>`;
  const nameTag = (href || heading) ? "h1" : "p";
  const text = `<div><${nameTag} class="brand-name">${name}</${nameTag}><p class="brand-sub">${sub}</p></div>`;
  return href
    ? `<a class="brand-link" href="${href}" aria-label="Prompt Library home">${tile}${text}</a>`
    : `${tile}${text}`;
}

/* generic card head: icon tile + mono title */
export const cardHead = (ic, id, title) => `    <div class="card-head">
      <span class="icon-tile" aria-hidden="true">${icon(ic)}</span>
      <h2 class="mono-title" id="${id}">${title}</h2>
    </div>`;

/* copy-the-full-prompt button component */
export const copyPromptBtn = (slug) =>
  `<button class="pill pill--dark btn-copy" type="button" data-copy-prompt="${slug}" title="Copy the full prompt">Copy prompt ${icon("copy")}</button>`;

/* "Full text" pill link to a prompt's own page */
export const fullTextLink = (pre, p) =>
  `<a class="pill pill-link" href="${pre}${p.cat}/${p.slug}/">Full text ${icon("ext")}</a>`;

/* ---------- shared sections ---------- */
export const aboutCard = `
  <section class="card reveal" id="about" aria-labelledby="about-title">
    ${cardHead("book", "about-title", "About this library")}
    <p class="lede">A curated, growing collection of <strong>production-grade prompts and engineering specs</strong>, organized into <strong>four category folders</strong> — Security · Structure · UI &amp; Design · Server &amp; API. Every entry is bilingual (<strong>English first, then Persian</strong>) and written to be handed straight to a developer or an AI coding agent. New <strong>.md</strong> or <strong>.canvas</strong> files dropped into <strong>prompts/&lt;category&gt;/</strong> are built and published automatically as real static pages.</p>
    <div class="chips">
      <span class="chip">${icon("globe")}<span>Open source</span></span>
      <span class="chip">${icon("book")}<span>Bilingual FA · EN</span></span>
      <span class="chip">${icon("filecode")}<span>MD + JSON Canvas</span></span>
      <span class="chip">${icon("sparkle")}<span>Agent-ready</span></span>
      <span class="chip">${icon("check")}<span>Static pages · SEO-ready</span></span>
    </div>
    <div class="prompt-pills"><a class="pill pill-link" href="about/">More about the project ${icon("arrow")}</a></div>
  </section>`;

export const terminalCard = (pre) => `
  <section class="card card-dark reveal" id="use-as-prompt" aria-labelledby="use-title">
    ${cardHead("terminal", "use-title", "Use it as a prompt")}
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

export const howtoCard = `
  <section class="card reveal" id="how-to-use" aria-labelledby="how-title">
    ${cardHead("list", "how-title", "Publish a new prompt — automatic")}
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

/* ---------- prompt card (home / category listings) ---------- */
export function renderCard(p, pre) {
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
      ${fullTextLink(pre, p)}
      ${copyPromptBtn(p.slug)}
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

/* ---------- similar prompts ---------- */
export function relatedSection(p, all, pre, relatedOf) {
  const rel = relatedOf(p, all);
  if (!rel.length) return "";
  const rows = rel.map((q, i) =>
    `<a class="row cat-row rel-row" href="${pre}${q.cat}/${q.slug}/">
      <span class="step-tile" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="icon-tile icon-tile--lg">${icon(q.icon)}</span>
      <div class="cat-body">
        <div class="cat-top"><span class="row-name">${q.name}</span><span class="row-sub">${CATS[q.cat].label}</span></div>
        <p class="row-text">${q.desc}</p>
      </div>
      <span class="rel-arrow" aria-hidden="true">${icon("arrow")}</span>
    </a>`).join('<div class="connector rel-connector" aria-hidden="true"></div>');
  return `
  <section class="card reveal" aria-labelledby="rel-title">
    ${cardHead("layers", "rel-title", "Similar prompts")}
    <div class="timeline rel-timeline">${rows}</div>
  </section>`;
}

/* ---------- interactive canvas viewer block ---------- */
export function canvasStageBlock(p) {
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
