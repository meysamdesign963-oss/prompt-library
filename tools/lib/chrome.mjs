/* Site chrome components: header (boxed), navigation, footer (boxed),
   and the full page shell that assembles head + chrome + body. */
import { icon } from "./icons.mjs";
import { esc } from "./utils.mjs";
import { REPO_URL, CATS } from "./site.mjs";
import { brandMark } from "./components.mjs";

function headActions() {
  return `
    <div class="head-actions">
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle title="Toggle dark / light theme" aria-label="Toggle color theme">
        <span class="theme-ic theme-ic--moon">${icon("moon")}</span>
        <span class="theme-ic theme-ic--sun">${icon("sun")}</span>
      </button>
      <a class="pill pill-link" href="${REPO_URL}" target="_blank" rel="noopener">
        GitHub
        ${icon("ext")}
      </a>
    </div>`;
}

function siteNav(pre, active) {
  const navItems = [
    ["Library", "", "home"],
    ...Object.entries(CATS).map(([k, c]) => [c.label, `${k}/`, k]),
  ];
  const nav = navItems
    .map(([label, href, key]) =>
      `<a href="${pre}${href}"${key === active ? ' class="is-active"' : ""}>${label}</a>`)
    .join("");
  return `    <nav class="site-nav reveal" aria-label="Site sections">${nav}</nav>`;
}

export function siteHeader(pre, active) {
  return `  <header class="site-header reveal">
    <div class="header-row">
    <div class="brand">
      <a class="brand-link" href="${pre}" aria-label="Prompt Library home">
        <span class="brand-tile" aria-hidden="true">${brandMark(pre)}</span>
        <div>
          <h1 class="brand-name">Prompt Library</h1>
          <p class="brand-sub">Curated specs &amp; prompts for builders</p>
        </div>
      </a>
    </div>
    ${headActions()}
    </div>
${siteNav(pre, active)}
  </header>`;
}

export function siteFooter(pre) {
  return `  <footer class="site-footer reveal">
    <div class="footer-grid">
      <div class="footer-col footer-brandcol">
        <div class="brand">
          <span class="brand-tile" aria-hidden="true">${brandMark(pre)}</span>
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
  </footer>`;
}

/* full page shell: head (SEO + theme boot) → header → sheet(body) → footer */
export function shell({ pre, title, desc, canonical, jsonLd, body, active = "" }) {
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

${siteHeader(pre, active)}

<main class="sheet">

${body}

</main>

${siteFooter(pre)}

<script src="${pre}assets/main.js" defer></script>
</body>
</html>`;
}
