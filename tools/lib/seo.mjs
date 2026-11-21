/* SEO pieces: page shell (head/meta/JSON-LD/chrome assembly),
   BreadcrumbList builder, sitemap.xml and robots.txt. */
import { esc } from "./utils.mjs";
import { BASE, CATS, BUILD_DATE } from "./site.mjs";
import { siteHeader, siteFooter } from "./chrome.mjs";

export function crumbGraph(items) {
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
<link rel="preload" href="${pre}assets/fonts/IRANSansX-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${pre}assets/fonts/IRANSansX-DemiBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${pre}assets/fonts/IRANSansX-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="${pre}assets/favicon.svg">
<link rel="stylesheet" href="${pre}assets/fonts/fonts.css">
<link rel="stylesheet" href="${pre}assets/style.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>


${siteHeader(pre, active)}

<main class="sheet">

${body}

</main>

${siteFooter(pre)}

<script src="${pre}assets/main.js" defer></script>
</body>
</html>`;
}

export function sitemap(prompts) {
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

export const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;
