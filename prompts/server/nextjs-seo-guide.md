---
name: nextjs-seo
title: Next.js SEO Guide
description: "Complete Google SEO implementation guide for Next.js (Node.js) projects. Covers the App Router Metadata API, generateMetadata, sitemap.ts/robots.ts conventions, JSON-LD structured data, Open Graph & Twitter cards, canonicalization, hreflang/i18n, Core Web Vitals (LCP/INP/CLS), rendering strategies (SSG/SSR/ISR/PPR/Cache Components), and Search Console auditing. Use this skill whenever the user mentions SEO, Google ranking, search visibility, meta tags, Open Graph, sitemap, robots.txt, structured data, schema.org, rich results, canonical URLs, hreflang, page speed, Core Web Vitals, Lighthouse score, \"my site doesn't appear on Google\", or asks to build/optimize any Next.js page, blog, e-commerce store, or marketing site — even if they don't explicitly say \"SEO\"."
category: server
version: 1.0.0
status: Ready
tags: seo, nextjs, google, metadata, core-web-vitals
fa: راهنمای کامل پیاده‌سازی سئوی گوگل در Next.js — Metadata API، JSON-LD، sitemap و robots، Core Web Vitals و چک‌لیست لانچ.
---

# Next.js SEO — Complete Google Optimization Guide

Implement production-grade Google SEO in Next.js (Node.js) projects. This skill encodes Google Search Central documentation plus current Next.js (v15/v16, App Router first) conventions into a review-and-implementation workflow.

## How Google Search Works (30-second mental model)

Google processes every URL in four stages. Every SEO task maps to one of them:

1. **Crawl** — Googlebot discovers URLs via links, sitemaps, and previously known URLs. `robots.txt`, `noindex`, and server errors control this.
2. **Render** — Googlebot executes JavaScript with an evergreen Chromium (Web Rendering Service). SSR/SSG pages render instantly; JS-only content enters a slower second wave. Server-rendered HTML is always safer.
3. **Index** — Google parses the rendered HTML, resolves canonicals, groups duplicate URLs, and stores content. `<link rel="canonical">`, `noindex`, and hreflang act here.
4. **Rank** — Helpful-content signals, relevance, links, page experience (Core Web Vitals), and spam policies determine position.

Rule of thumb: ship real content in the initial HTML response, describe every page with unique metadata, remove crawl/index blockers, and keep the page fast and stable.

## Core Workflow

When building or auditing a Next.js project, work through these steps in order:

### Step 1 — Establish the base (every project)

```ts
// app/layout.tsx — root layout
import type { Metadata, Viewport } from 'next'

const SITE_URL = 'https://example.com' // single source of truth

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), // resolves all relative URLs — REQUIRED for OG images
  title: {
    default: 'Site Name — Primary value proposition',
    template: '%s — Site Name', // child pages only need `title`
  },
  description: 'Default site-wide description, 150–160 chars, unique per page when possible.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Site Name',
    url: SITE_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}
```

```ts
// app/page.tsx — home page
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Home', // renders as "Home — Site Name" via template
  alternates: { canonical: '/' },
}
```

Key API facts:

- `metadata` = static export; `generateMetadata()` = dynamic, receives awaited `params`/`searchParams` (Next 15+: they are Promises).
- Metadata only works in **Server Components**. Next always adds `charset` and `viewport` meta tags automatically.
- Merge rules: fields are **shallow-merged** from root layout down. A child's `title` overrides the parent's whole `title` object; `openGraph.title` falls back to `title` when omitted.
- `themeColor`/`viewport` inside `metadata` are **deprecated since Next 14** — use the `viewport`/`generateViewport` exports.
- Next 15.2+ streams metadata for human users but **emits blocking `<head>` metadata for bots** (Googlebot, Bingbot, Twitterbot…) — configurable via `htmlLimitedBots`. Bots still see correct tags; do not panic when you see tags in `<body>` for a non-bot UA.
- Next 16: `params`/`searchParams` must be awaited; Turbopack is default; `middleware.ts` → `proxy.ts`; Cache Components model with `"use cache"`.

### Step 2 — Control crawling and indexing

- `app/robots.ts` → generates `/robots.txt` (allow public paths, block `/api`, admin, search results pages).
- `app/sitemap.ts` → generates `/sitemap.xml` from your routes/CMS (split with `generateSitemaps` beyond 50,000 URLs).
- Canonical URLs: set `alternates.canonical` on every indexable page, especially filtered/sorted/paginated variants.
- Block indexing with `robots: { index: false }` (meta robots) — **never** with robots.txt (Google explicitly does not support `noindex` in robots.txt).
- Non-HTML resources: use the `X-Robots-Tag` HTTP header via `next.config.ts` `headers()`.
- Redirects: `permanent: true` (308/301) for moved content, `temporary` otherwise; declare in `next.config.ts`.

### Step 3 — Add structured data (JSON-LD)

Emit `<script type="application/ld+json">` from Server Components. Minimum set per site type:

| Site type | Schemas |
|---|---|
| Any site | `Organization`, `WebSite` (+ `SearchAction`), `BreadcrumbList` |
| Blog / news | `Article` / `BlogPosting` / `NewsArticle` |
| E-commerce | `Product` + `Offer` + `AggregateRating`, `Review` |
| Local business | `LocalBusiness` (+ subtypes), `Event` |
| Docs / how-to | `HowTo`, `TechArticle`, `FAQPage` (visible on page) |

```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    image: post.cover,
    author: { '@type': 'Person', name: post.author.name },
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* content */}</article>
    </>
  )
}
```

### Step 4 — Social sharing (Open Graph + Twitter)

- `metadata.openGraph` + `metadata.twitter` objects, or file conventions: `opengraph-image.png`, `twitter-image.png`, `icon.png`, `apple-icon.png` per route segment.
- Dynamic OG images: `opengraph-image.tsx` with `ImageResponse` from `next/og` (1200×630, flexbox-only CSS subset).
- Always provide absolute-resolvable images (needs `metadataBase`) with `width`/`height`/`alt`.

### Step 5 — Core Web Vitals (page experience)

Thresholds (75th percentile of real-user visits, from CrUX): **LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1** (INP replaced FID in March 2024).

Next.js levers, in impact order:
1. `next/image` everywhere; `priority` on the LCP image; correct `sizes`.
2. `next/font/google` / `next/font/local` (self-hosted, subset, no render-blocking Google CSS, `adjustFontFallback` kills font CLS).
3. Server Components by default; `"use client"` only at leaves.
4. `next/script` with proper `strategy` for third-party tags; `afterInteractive` default, `lazyOnload` for widgets.
5. Streaming + Suspense for fast FCP; static/ISR rendering for TTFB.

### Step 6 — Rendering strategy per page type (SEO-critical decision)

| Page type | Strategy | Why |
|---|---|---|
| Marketing / home | Static (default) | Instant TTFB, zero config |
| Blog / docs | Static or ISR (`revalidate`) | Freshness without SSR cost |
| E-commerce PDP | ISR or dynamic w/ cache | Price/stock freshness vs speed |
| Search results, cart | Dynamic (SSR) | Per-request personalization |
| Dashboard (auth) | Client + `noindex` | Not for Google anyway |

Next 16 Cache Components: enable `cacheComponents: true`, wrap dynamic data with `"use cache"` + `cacheLife()`; PPR shells stream instantly while dynamic holes fill in — bots get a complete, cached HTML shell.

### Step 7 — Internationalization (if multi-language)

- App Router pattern: `app/[lang]/` dynamic segment; render localized metadata via `generateMetadata`.
- hreflang: `alternates.languages` with `x-default`; every URL pair must be **reciprocal**.
- Locales in URLs (`/en/…`, `/de/…`) is Google's recommended structure.

### Step 8 — Pages Router projects

If the project uses `pages/` (not `app/`): `<Head>` component, `getStaticProps`/`getServerSideProps`, manual canonical/OG tags.

### Step 9 — Validate and monitor

1. `next build` — watch for metadata warnings (`metadataBase` missing, prerender errors).
2. Google **Rich Results Test** + **Schema.org validator** for JSON-LD.
3. PageSpeed Insights / Lighthouse for CWV; Search Console for indexing, sitemaps, rich results.
4. Re-crawl after changes: URL Inspection → "Request indexing".

## Non-Negotiable Rules

These prevent the most common, highest-impact failures seen in real Next.js projects:

1. **One canonical URL per page.** Missing or self-conflicting canonicals dilute ranking across `?filter=`, trailing-slash, and http/https variants.
2. **Never rely on robots.txt to de-index.** `noindex` belongs in meta robots or `X-Robots-Tag`. Blocking via robots.txt hides the page from the crawler but leaves the URL indexed "without content".
3. **Set `metadataBase` in the root layout.** Without it, OG image URLs warn or resolve wrong; social cards break silently.
4. **Every indexable page needs a unique `title` + `description`.** Templated or duplicated descriptions get rewritten by Google; titles get truncated past ~600 px.
5. **Server-render indexable content.** Content only mounted after user interaction or fetch-on-client is invisible until render — often never indexed.
6. **`priority` the LCP image, `sizes` every image.** Wrong `sizes` wastes bandwidth; missing `priority` on the hero image tanks LCP.
7. **JSON-LD must mirror visible content.** Structured data describing invisible/fabricated content violates Google's spam policies.
8. **Await `params`/`searchParams`.** Next 15+ they are Promises; sync access throws at build.
9. **Keep `viewport` out of `metadata`.** Use the `viewport`/`generateViewport` export (deprecated-in-14 fields still render but warn).
10. **Use 308/301 (`permanent: true`) for content moves**, and only one redirect hop. Chains leak PageRank and delay crawls.

## Launch-Ready SEO Checklist (condensed)

- [ ] `metadataBase` + title template + default OG in root layout
- [ ] Unique title/description/canonical per indexable route
- [ ] `robots.ts` allows pages, blocks `/api`, `/admin`, internal search
- [ ] `sitemap.ts` lists all canonical, indexable URLs with `lastModified`
- [ ] JSON-LD for site type + `BreadcrumbList` on nested pages
- [ ] `opengraph-image` per key route (1200×630) + favicon/icon set
- [ ] `next/image` with `sizes`; `priority` on hero; `next/font` for all text
- [ ] `noindex` on utility pages (404 intentionally excluded, thank-you, admin)
- [ ] 301 redirects map for any moved/renamed routes
- [ ] hreflang `alternates.languages` + `x-default` if multi-language
- [ ] Verified in Search Console; sitemap submitted; zero "Page indexing" errors
- [ ] PSI field data: LCP < 2.5 s, INP < 200 ms, CLS < 0.1

## Common Failure Patterns → Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| "Crawled - currently not indexed" | Thin/duplicate content, render-blocking | Server-render, unique content, check canonicals |
| OG image missing in social preview | No `metadataBase` / relative URL | Set `metadataBase`; verify absolute URL |
| Wrong page ranks for query | Missing canonical on parameterized URLs | `alternates.canonical` + consistent internal links |
| Google shows old title | Stale snippet, not an error | Update title, request re-indexing; Google may rewrite regardless |
| LCP image > 2.5 s | Hero image not prioritized, oversized | `priority`, responsive `sizes`, modern formats |
| Tags appear in `<body>` | Streaming metadata for non-bot UA | Expected; verify with `curl -A "Googlebot"` |
| Site lost rankings after deploy | `noindex` leaked to prod, mass 404s | Check headers/robots, redirects, Search Console coverage |
