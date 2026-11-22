/* Page templates: home, category listing, prompt detail, 404. */
import { icon } from "./icons.mjs";
import { esc, pill } from "./utils.mjs";
import { REPO_URL, BRANCH, BASE, OWNER, CATS, BUILD_DATE } from "./site.mjs";
import { shell, crumbGraph } from "./seo.mjs";
import { brand, brandMark, aboutCard, terminalCard, howtoCard, renderCard, relatedSection, canvasStageBlock, copyPromptBtn, cardHead } from "./components.mjs";

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

export function aboutPage() {
  const pre = "../"; // served at /about/ → one level deep

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", name: "About — Prompt Library", url: BASE + "/about/", inLanguage: ["en", "fa"] },
      crumbGraph([["Library", BASE + "/"], ["About", BASE + "/about/"]]),
    ],
  };

  return shell({
    pre,
    active: "about",
    title: "About — Prompt Library",
    desc: "What Prompt-Library is, who builds it and how every prompt becomes a real static page — bilingual (EN → FA), framework-free and SEO-ready.",
    canonical: BASE + "/about/",
    jsonLd,
    body: `
  <div class="stack">
    <section class="card reveal" aria-labelledby="ab-title">
      <div class="prompt-head">
        <span class="icon-tile icon-tile--lg">${icon("book")}</span>
        <div class="prompt-id">
          <h2 class="title-xl" id="ab-title">About Prompt-Library</h2>
          <p class="title-sub">درباره‌ی سایت · سازنده · چرخه‌ی انتشار</p>
        </div>
      </div>
      <p class="lede prompt-desc">Everything about this site — <strong>what it is</strong>, <strong>who builds it</strong> and <strong>how every prompt becomes a real static page</strong>.</p>
      <p class="fa">همه‌چیز درباره‌ی این سایت — اینکه <strong>چیست</strong>، <strong>توسط کی ساخته شده</strong> و <strong>چطور کار می‌کند</strong>.</p>
      <div class="prompt-pills">
        ${pill("V1.0", "pill--dark")}
        ${pill("Open source")}
        ${pill("Static · No tracking")}
      </div>
    </section>

    <section class="card reveal" aria-labelledby="ab-what-title">
      ${cardHead("book", "ab-what-title", "What is this site?")}
      <p class="lede prompt-desc"><strong>Prompt-Library</strong> is a curated, growing collection of <strong>production-grade security &amp; engineering prompts</strong> for Next.js + MongoDB web builders — authored as <strong>Markdown + Obsidian Canvas</strong>, bilingual (<strong>English → Persian</strong>), and published as <strong>real static pages</strong>: every prompt gets its own URL, unique meta tags, JSON-LD and a sitemap entry.</p>
      <p class="fa"><strong>پرامپت‌لایبرری</strong> مجموعه‌ای منتخب و در حال رشد از <strong>پرامپت‌های امنیتی و مهندسیِ آماده‌ی کار</strong> برای سازندگان وب با Next.js + MongoDB است — به‌صورت Markdown و Obsidian Canvas نوشته می‌شود، دوزبانه است (انگلیسی → فارسی) و به‌صورت صفحات استاتیک واقعی منتشر می‌شود: هر پرامپت URL و متای اختصاصی و JSON-LD و ورود به sitemap دارد. بدون فریم‌ورک، بدون ردیابی — فقط HTML و CSS و JavaScript خالص.</p>
      <div class="chips prompt-chips">
        <span class="chip">${icon("book")}<span>11 prompts</span></span>
        <span class="chip">${icon("layers")}<span>4 categories</span></span>
        <span class="chip">${icon("globe")}<span>2 languages</span></span>
        <span class="chip">${icon("check")}<span>0 tracking</span></span>
      </div>
    </section>

    <section class="card reveal" aria-labelledby="ab-who-title">
      ${cardHead("sparkle", "ab-who-title", "Who builds it")}
      <div class="prompt-head">
        <span class="brand-tile" aria-hidden="true">${brandMark(pre)}</span>
        <div class="prompt-id">
          <h3 class="title-xl" id="ab-who-name">meysam</h3>
          <p class="title-sub">meysamdesign963-oss · 3D Designer &amp; Full-Stack Web Builder · طراح سه‌بعدی و سازنده‌ی وب</p>
        </div>
      </div>
      <p class="lede prompt-desc">A 3D designer gone full-stack: the same hands that model in Blender ship <strong>Next.js + MongoDB</strong> products like <strong>Duck CRM</strong>. This library is where the prompts and workflows that power those builds are collected, polished and published.</p>
      <p class="fa">یک طراح سه‌بعدی که به سراغ ساخت محصولات وب با Next.js و MongoDB رفت؛ سازنده‌ی <strong>Duck CRM</strong>. این کتابخانه جایی است که پرامپت‌ها و گردش‌کارهایی که این ساخته‌ها را پیش می‌برند، جمع‌آوری، پرداخت و منتشر می‌شوند.</p>
      <div class="prompt-pills">
        ${pill("Author", "pill--dark")}
        <a class="pill pill-link" href="https://github.com/meysamdesign963-oss" target="_blank" rel="noopener">GitHub profile ${icon("ext")}</a>
        <a class="pill pill-link" href="https://duckcrm.ir" target="_blank" rel="noopener">duckcrm.ir ${icon("ext")}</a>
        <a class="pill pill-link" href="https://github.com/meysamdesign963-oss/prompt-library" target="_blank" rel="noopener">This repo ${icon("ext")}</a>
      </div>
    </section>

    <section class="card reveal" aria-labelledby="ab-how-title">
      ${cardHead("list", "ab-how-title", "How publishing works")}
      <div class="timeline">
        <div class="row cat-row">
          <span class="step-tile" aria-hidden="true">01</span>
          <div class="cat-body">
            <div class="cat-top"><span class="row-name">Author</span><span class="row-sub">Write</span></div>
            <p class="row-text">Write a <strong>.md</strong> (with front-matter) or an Obsidian <strong>.canvas</strong> file inside <strong>prompts/&lt;category&gt;/</strong> — the folder is the category.</p>
          </div>
        </div>
        <div class="connector" aria-hidden="true"></div>
        <div class="row cat-row">
          <span class="step-tile" aria-hidden="true">02</span>
          <div class="cat-body">
            <div class="cat-top"><span class="row-name">Push to main</span><span class="row-sub">Build</span></div>
            <p class="row-text">A GitHub Action runs the static generator (<strong>tools/build.mjs</strong> — pure Node, no dependencies).</p>
          </div>
        </div>
        <div class="connector" aria-hidden="true"></div>
        <div class="row cat-row">
          <span class="step-tile" aria-hidden="true">03</span>
          <div class="cat-body">
            <div class="cat-top"><span class="row-name">Real pages ship</span><span class="row-sub">Live</span></div>
            <p class="row-text">Every prompt gets a card, its own page (<strong>/category/slug/</strong>), unique meta tags, JSON-LD and a sitemap entry — automatically.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="card reveal" aria-labelledby="ab-tech-title">
      ${cardHead("layers", "ab-tech-title", "Under the hood")}
      <div class="chips">
        <span class="chip">${icon("filecode")}<span>Pure HTML / CSS / JS</span></span>
        <span class="chip">${icon("check")}<span>Zero frameworks</span></span>
        <span class="chip">${icon("moon")}<span>Dark / Light theme</span></span>
        <span class="chip">${icon("list")}<span>IRANSansX · Inter · JetBrains Mono</span></span>
        <span class="chip">${icon("filecode")}<span>JSON Canvas viewer</span></span>
        <span class="chip">${icon("globe")}<span>JSON-LD + Sitemap</span></span>
        <span class="chip">${icon("check")}<span>Self-hosted fonts</span></span>
      </div>
    </section>

    <div class="back-row reveal">
      <a class="pill pill-link" href="../">${icon("arrow")} Back to Library</a>
      <a class="pill pill-link" href="https://github.com/meysamdesign963-oss" target="_blank" rel="noopener">GitHub ${icon("ext")}</a>
    </div>
  </div>`,
  });
}
