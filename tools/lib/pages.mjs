/* Page templates: home, category listing, prompt detail, 404. */
import { icon } from "./icons.mjs";
import { esc, pill } from "./utils.mjs";
import { REPO_URL, BRANCH, BASE, OWNER, CATS, BUILD_DATE } from "./site.mjs";
import { shell, crumbGraph } from "./seo.mjs";
import { brand, aboutCard, terminalCard, howtoCard, renderCard, relatedSection, canvasStageBlock, copyPromptBtn } from "./components.mjs";

export function relatedOf(p, all) {
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

export function homePage(prompts) {
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
          "@type": "CreativeWork", name: p.name, url: `${BASE}/${p.cat}/${p.slug}/`,
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

export function categoryPage(cat, prompts) {
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

export function promptPage(p, all) {
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
        ${copyPromptBtn(p.slug)}
      </div>
    </section>
    ${p.canvasData ? canvasStageBlock(p) : ""}
    <section class="card reveal" data-text-view aria-label="Prompt full text">
      <div class="md-body md-body--page">${p.bodyHtml}</div>
    </section>
    ${relatedSection(p, all, pre, relatedOf)}
    <div class="back-row reveal">
      <a class="pill pill-link" href="../">${icon("arrow")} Back to ${c.label}</a>
      <a class="pill pill-link" href="../../">All prompts</a>
    </div>
  </div>
  <script type="text/plain" class="prompt-raw" data-id="${p.slug}">${p.bodyText.replace(/<\/script/gi, "<\\\\/script")}</script>`,
  });
}

export function notFoundPage(prompts) {
  const pre = BASE + "/"; // absolute: GH Pages serves 404.html at any unknown path depth
  return shell({
    pre, // absolute: GH Pages serves 404.html at any unknown path depth
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
      <a class="pill pill-link" href="${pre}">Back to the library ${icon("arrow")}</a>
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
  var pth = location.pathname, m2;
  if ((m2 = pth.match(/\\/p\\/([^/]+)\\/?$/)) && PL_MAP[m2[1]]) location.replace("/" + PL_MAP[m2[1]]);
  else if ((m2 = pth.match(/\\/c\\/([^/]+)\\/?$/)) && PL_CATS.indexOf(m2[1]) !== -1) location.replace("/" + m2[1] + "/");
})();
</script>`;
}
