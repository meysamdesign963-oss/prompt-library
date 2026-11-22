/* Site chrome components: header (boxed), navigation, footer (boxed),
   and the full page shell that assembles head + chrome + body. */
import { icon } from "./icons.mjs";
import { esc } from "./utils.mjs";
import { REPO_URL, OWNER, CATS } from "./site.mjs";
import { brandMark } from "./components.mjs";

function headActions() {
  return `
    <div class="head-actions">
      <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
        <span class="menu-ic menu-ic--open">${icon("menu")}</span>
        <span class="menu-ic menu-ic--close">${icon("close")}</span>
      </button>
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
    ["About", "about/", "about"],
  ];
  const nav = navItems
    .map(([label, href, key]) =>
      `<a href="${pre}${href}"${key === active ? ' class="is-active"' : ""}>${label}</a>`)
    .join("");
  return `    <nav class="site-nav reveal" id="site-nav" aria-label="Site sections">${nav}</nav>`;
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
      <div class="footer-col" data-acc-col>
        <button class="footer-toggle" type="button" data-acc-toggle aria-expanded="false">
          <span class="mono-title">Categories</span>
          <span class="acc-chevron">${icon("chevron")}</span>
        </button>
        <div class="footer-list">${Object.entries(CATS).map(([k, c]) => `<a href="${pre}${k}/">${c.label} <span class="foot-fa">${c.fa}</span></a>`).join("")}</div>
      </div>
      <div class="footer-col" data-acc-col>
        <button class="footer-toggle" type="button" data-acc-toggle aria-expanded="false">
          <span class="mono-title">Resources</span>
          <span class="acc-chevron">${icon("chevron")}</span>
        </button>
        <div class="footer-list">
        <a href="https://github.com/${OWNER}" target="_blank" rel="noopener">Author · meysamdesign963-oss ${icon("ext")}</a>
        <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub repository ${icon("ext")}</a>
        <a href="${pre}Prompt-Library.canvas" target="_blank" rel="noopener">Prompt-Library.canvas ${icon("ext")}</a>
        <a href="https://github.com/OWASP/Top10" target="_blank" rel="noopener">OWASP Top 10 ${icon("ext")}</a>
        <a href="https://jsoncanvas.org" target="_blank" rel="noopener">JSON Canvas spec ${icon("ext")}</a>
        <a href="https://obsidian.md" target="_blank" rel="noopener">Obsidian ${icon("ext")}</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Prompt Library · Built by <a href="https://github.com/${OWNER}" target="_blank" rel="noopener">meysamdesign963-oss ${icon("ext")}</a></span>
      <span>Static · No tracking · EN → FA</span>
    </div>
  </footer>`;
}
