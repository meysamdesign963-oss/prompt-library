"use strict";

/* ============================================================
   Prompt Library — content data
   CATS: the fixed category taxonomy (one folder per category
   under prompts/). Embedded prompts keep their rich hand-tuned
   cards; anything else discovered in prompts/** is rendered
   generically by the app (see main.js).
   ============================================================ */

const REPO_OWNER = "meysamdesign963-oss";
const REPO_NAME = "prompt-library";
const BRANCH = "main";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const PAGES_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;

const CATS = {
  security:  { label: "Security",     fa: "امنیت",       icon: "shield",   desc: "Auth, tokens, sessions, OWASP — hardening specs for web apps.", faDesc: "احراز هویت، توکن، سشن و OWASP — اسپک‌های مقاوم‌سازی اپلیکیشن وب." },
  structure: { label: "Structure",    fa: "ساختار",      icon: "folder",   desc: "Folder structures, code style & architecture blueprints.", faDesc: "ساختار پوشه‌ها، سبک کد و بلوپرینت‌های معماری." },
  ui:        { label: "UI & Design",  fa: "رابط کاربری", icon: "palette",  desc: "Design systems, style prompts and interface specs.", faDesc: "سیستم‌های طراحی، پرامپت‌های استایل و اسپک‌های رابط کاربری." },
  server:    { label: "Server & API", fa: "سرور و API",  icon: "terminal", desc: "API design, server hardening, deployment & DevOps prompts.", faDesc: "طراحی API، مقاوم‌سازی سرور، دیپلوی و پرامپت‌های DevOps." },
};

/* ---------- full copyable prompts ---------- */
const FULL_PROMPT = `# Security Blueprint — Universal Web App Spec

You are building a web application with Next.js + MongoDB. Follow this security and engineering spec exactly. It is project-agnostic — adapt the product-specific examples (upload whitelist, phone format, masked fields) to your own domain; everything else applies as-is.

## 1 · Architecture & Tech Stack
- Database → MongoDB (no SQL): schema changes never need migrations; updates stay fast and painless.
- Frontend → React: light and fast UI.
- Backend → Next.js (App Router, src/app/api/) + Node.js patterns: one codebase for app + API.
- Engineering goals: update-resilient (no update may ever break the project) and SEO-first (every public page fully optimized).

## 2 · Folder Structure & Code Style
The whole project lives in src/ with this exact structure:
- src/app/ → frontend pages & routing (src/app/api/ → backend & API routes)
- src/public/img + src/public/font → site images and fonts
- src/controllers/ → HTTP responses
- src/services/ → all business logic
- src/components/ → UI & styles (auth, theme, layout, ui)
- src/utils/ → libraries, realtime, helpers
- .env → secrets: token keys, DB URI (never commit!)
- Clean code: anyone must be able to read and understand it, so future updates stay painless.
- Componentize every reusable piece under components/ so the project stays scalable.

## 3 · Login Security
1. Password hashing: Bcrypt or Argon2 only — plain text and MD5 are forbidden.
2. Rate limit: max 5 login requests per 15 minutes per IP → temporary IP block.
3. Unified error message: never reveal whether the username or the password was wrong.
4. Secure token storage: the login JWT lives only in HttpOnly + Secure cookies so XSS cannot steal it.
5. Strict input validation: every field regex-validated server-side so malicious payloads (SQLi / XSS) never reach the database.

## 4 · JWT Token System
- After login the backend issues TWO tokens, each signed with its OWN 128-character secret generated with crypto and stored in .env:
  - Access token — 2 minutes: payload { id, role, firstName, jti: crypto.randomUUID() }.
  - Refresh token — 15 days: payload { id, firstName, jti: crypto.randomUUID() }.
- Cookies (adapt the Express sample to the Next.js App Router API):
  accessToken  → httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 2 * 60 * 1000
  refreshToken → same flags, maxAge: 15 * 24 * 60 * 60 * 1000
- Logout clears BOTH cookies with identical flags. A new login immediately invalidates the previous session.

## 5 · Post-Login Security
- Sessions: idle timeout 15–30 min · absolute timeout ~8 h (stolen long-lived tokens become useless) · single active session per user (a new login invalidates the previous one).
- RBAC isolation: every database query filters by user_id = current user; only admins see global reports and every user's data; a user must never see another user's files, tasks, messages or customer data.
- IDOR prevention: changing an id in the API URL (/api/files/101 → /api/files/102) must never return someone else's data — the server verifies ownership of every requested id (Object-Level Authorization); prefer UUIDs over sequential ids.
- Data masking: sensitive customer data — above all phone numbers — appears masked in list views (e.g. 0912****567); full value is revealed only through a "View" action and every reveal is logged.
- File uploads: whitelist formats (e.g. jpg/png/pdf — check extension AND MIME type), filenames randomized on the server, no execute permission on stored files, store in cloud storage — never in code or database.
- Chat & AI: sanitize messages before storage (XSS); rate limit + character-length limit on AI requests (cost and prompt-injection protection).
- Audit trail: every sensitive action — viewing sensitive data, editing or deleting records, downloading files — is logged with IP + timestamp + username + action type, so leaks can always be traced to who, what and when.

## 6 · OWASP Top 10 Checklist
1. SQL Injection — sanitize every input (' OR 1=1 -- must fail).
2. XSS (Reflected / Stored / DOM-based) — sanitize output and messages.
3. CSRF — CSRF tokens in forms + SameSite=Strict/Lax cookies + re-confirmation for sensitive operations.
4. IDOR — server-side ownership check per request; UUIDs.
5. Authentication Failures — session regeneration after login, expiry, account lockout after failed attempts.
6. Sensitive Data Exposure — HTTPS mandatory (TLS 1.2+ & HSTS), encryption at rest & in transit, proper secrets management, no stack traces to users, no API keys in frontend code.
7. SSRF — whitelist allowed domains, block internal & loopback IPs, no automatic redirects.
8. Security Misconfiguration — server hardening, no debug mode in production, CORS only for allowed domains, security headers.
9. Vulnerable Components — regular package updates, review advisories, remove unused dependencies.
10. Unsafe File Uploads — whitelist extensions & MIME types, random filenames stored outside the web root, antivirus scanning, no execute permission.

Reference: https://github.com/OWASP/Top10`;

/* ---------- the scaled UI style prompt ---------- */
const STYLE_PROMPT = `# Grainy Sage Editorial — UI Style System Prompt

You are designing the UI of a SaaS web application. Apply this complete style system exactly. It produces a calm, tactile, blueprint-style interface: an organic textured backdrop with precise, flat, paper-white cards and monospaced technical labels — like a beautifully printed spec sheet resting on a sage-green plaster desk.

## 1 · Identity & Mood
- Keyword set: calm, tactile, editorial, blueprint, precise, organic.
- High contrast black-on-white, generous whitespace, hairline borders, pill-shaped chips.
- The page reads like a printed spec sheet; the background reads like plaster — never like a gradient.

## 2 · Color Tokens (use exact values)
- Page background: muted sage green #869A8C with a film-grain / plaster noise texture (~10–14% opacity) and a soft vignette darkening toward the edges to #5F6E62. Variant mood: olive #77816A.
- Main canvas: ONE large off-white #F8F8F8 rounded sheet (radius 20–24px) centered on the green, with a faint dot-grid (#E3E4E0 dots ~1px, 18px pitch) and a soft large shadow (0 24px 60px rgba(0,0,0,.18)).
- Ink / primary text: #171717.
- Dark "terminal" card surface: #1F1F1F with nested inner panels #2D2D2F and borders #3A3A3C.
- Secondary text: #6F7070 · inactive nav text: #A1A1A1.
- Hairline borders on light surfaces: #E7E8E4 (1px).
- Accent mint green #5CB8A6 — sparingly only: "Recommended" badge on light mint bg #F2FBFA, checkmarks, positive states. Never large surfaces.
- Status pills: "Configured" = solid #1E1E1E pill with white mono text (on light) or white #F8F8F8 pill with black text (on dark).
- Brand logo colors (e.g. Supabase green #46BF91, Clerk purple #705AF3) only inside small icon tiles.

## 3 · Typography
- Micro-labels, card titles, status labels: monospace (Geist Mono / JetBrains Mono), UPPERCASE, 9–12px, letter-spacing +0.08em, weight 500–600. Everything label-like is mono uppercase ("APP OVERVIEW", "VISIT WEBSITE").
- Body & UI: clean grotesque sans (Inter / Geist), 13–14px, line-height 1.55; body text #6F7070, emphasis #171717.
- Step nav: sans breadcrumb ("Get started › Features › Tech stack › …") — current step bold #171717, others #A1A1A1.
- Type scale reference: 16–18px mono titles · 14px body · 12.5px secondary · 11px / 9.5px mono micro-labels.
- Non-Latin scripts (e.g. Persian / Arabic): use a dedicated family (Vazirmatn), correct RTL direction, no uppercase treatment.

## 4 · Spacing & Radius Scales
- Spacing scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 px. Minimum 24px vertical gap between cards.
- Radius hierarchy: sheet 20–24px → cards 12–14px → rows / tiles 8–10px → pills fully rounded. Never 0px corners.

## 5 · Layout System
- Full-viewport grainy green background; ONE centered white sheet (max-width ~760–880px, padding 40–56px) holding the whole flow.
- Inside: a vertical stack of flat white section cards (radius 12–14px, 1px #E7E8E4 border) connected by short dotted vertical connector lines (timeline feel).
- Card header pattern: small 14px line-icon + mono uppercase title on the left; subtle expand and kebab icons on the right.
- Content as nested rows / tiles (radius 8–10px, 1px border): icon tile + name + tiny mono uppercase sublabel ("SOURCE CODE", "DATABASE") on the left; status pill or button on the right.
- Feature chips: fully rounded, 1px border, icon + 12–13px label, wrapping in rows.
- Tech stack / token grids: 4-column grid of bordered tiles (brand icon or color swatch + name + mono category).
- Option cards: name + mint "Recommended" pill, "Pricing" / "Best for" blocks with bold 12px labels, gray text, mint check checklist, small white pill "Choose" button bottom-right.

## 6 · Shape, Depth & Motion
- Flat cards with hairlines; only the sheet and the dark card get soft shadows. No glassmorphism, no gradients on cards.
- Motion: subtle — fade + 4px upward slide, 150–200ms ease-out; hover darkens the border and lifts 1px. No springy animation.
- Copy feedback: swap the label to "COPIED ✓" for ~1.5s using the mint accent.

## 7 · Implementation Notes
- Grain: inline SVG feTurbulence (fractalNoise, baseFrequency ~0.82) as a data-URI on a fixed full-screen overlay, opacity ~0.13, pointer-events none.
- Vignette: fixed radial-gradient overlay from a transparent center toward rgba(70,82,72,.5) at the edges.
- Ambient light: 2-3 large diagonal white/mint gradients (opacity ~.2-.4, blur ~60px) sweeping slowly across the green background (30-50s transform-only loops), plus a faint light sheen passing over the sheet; disabled under prefers-reduced-motion.
- Dot-grid: radial-gradient(circle, #E3E4E0 1px, transparent 1.4px) with an 18px background-size on the sheet.
- Fonts via Google Fonts: Inter (400–700) + JetBrains Mono (400–700), plus Vazirmatn for Persian.
- Define every token above as a CSS custom property in :root.
- Render content from a data array so new entries inherit the system automatically.

## 8 · The Rules
DO: keep grain only on the green background, never on white cards; mono uppercase for all labels; stay monochrome with green as small semantic accents only; generous whitespace (at least 24px between cards).
DON'T: no saturated fills or colored large surfaces; no shadow on every element; no 0px corners; max ONE dark "terminal" card per screen.`;

/* ---------- embedded prompts (rich hand-tuned cards) ---------- */
const PROMPTS = [
  {
    id: "security-blueprint",
    cat: "security",
    icon: "shield",
    featured: true,
    name: "Security Blueprint",
    sub: "Universal Web App Spec · Next.js + MongoDB",
    version: "V1.0",
    status: "Spec ready",
    tags: "Bilingual FA · EN",
    descEn:
      "A project-agnostic security & engineering blueprint for any Next.js + MongoDB web app — six color-coded categories in one interactive Obsidian Canvas, written to be handed to a developer or AI coding agent as a ready-made spec.",
    descFa:
      "بلوپرینت مستقل از نوع پروژه برای امنیت و مهندسی هر اپلیکیشن وب با Next.js + MongoDB — شش دسته‌بندی در قالب یک کانواس تعاملی اوبسیدین، آماده‌ی تحویل به توسعه‌دهنده یا ایجنت هوش مصنوعی.",
    chips: [
      ["key", "JWT auth"],
      ["bug", "OWASP Top 10"],
      ["layers", "RBAC isolation"],
      ["clock", "Rate limiting"],
      ["lock", "Secure cookies"],
      ["eye", "Data masking"],
      ["filecode", "Safe uploads"],
      ["book", "Audit trail"],
    ].map(([iconName, label]) => ({ iconName, label })),
    stats: [
      ["06", "Categories"],
      ["20", "Canvas cards"],
      ["02", "Languages"],
      ["10", "OWASP items"],
    ],
    categories: [
      ["layers", "Architecture & Tech Stack", "Stack & goals", "MongoDB (no migrations) · React · Next.js + Node.js · SEO-first · update-resilient engineering goals."],
      ["folder", "Folder Structure & Code Style", "src/ layout", "Exact src/ structure (app, controllers, services, components, utils) · clean code · componentize everything."],
      ["lock", "Login Security", "Auth gate", "Bcrypt / Argon2 hashing · 5 req / 15 min rate limit · unified errors · HttpOnly cookies · server-side validation."],
      ["key", "JWT Token System", "Two tokens", "Access 2 min + Refresh 15 days · separate 128-char secrets · strict SameSite cookies · logout clears both."],
      ["shield", "Post-Login Security", "Runtime shield", "Sessions (idle 15–30 min, absolute ~8 h, single active) · RBAC isolation · IDOR · masking · uploads · AI limits · audit trail."],
      ["bug", "OWASP Top 10 Checklist", "Threat model", "The 10 critical web threats with concrete fixes — from SQLi and XSS to SSRF and unsafe uploads."],
    ],
    stack: [
      ["M", "#47A248", "MongoDB", "Database"],
      ["R", "#61DAFB", "React", "Frontend"],
      ["N", "#171717", "Next.js", "Framework"],
      ["Nd", "#5FA04E", "Node.js", "Runtime"],
      ["O", "#7C3AED", "Obsidian", "Canvas"],
      ["W", "#B91C1C", "OWASP", "Checklist"],
    ],
    rules: [
      ["SQL Injection", "sanitize every input — ' OR 1=1 -- must fail"],
      ["XSS", "reflected · stored · DOM — sanitize output"],
      ["CSRF", "tokens + SameSite + re-auth"],
      ["IDOR", "ownership check per request · UUIDs"],
      ["Auth Failures", "regeneration · expiry · lockout"],
      ["Data Exposure", "TLS 1.2+ · HSTS · secrets mgmt"],
      ["SSRF", "domain whitelist · block internal IPs"],
      ["Misconfiguration", "hardening · strict CORS · headers"],
      ["Vulnerable Deps", "regular updates · prune unused"],
      ["Unsafe Uploads", "whitelist · AV scan · no execute"],
    ],
    mapTitle: "Blueprint map — 6 categories",
    gridTitle: "Tech stack",
    rulesTitle: "OWASP Top 10 — quick reference",
    canvas: { href: "./Prompt-Library.canvas", name: "Prompt-Library.canvas", sub: "Source file · JSON Canvas" },
    full: FULL_PROMPT,
  },
  {
    id: "grainy-sage-editorial",
    cat: "ui",
    icon: "palette",
    name: "Grainy Sage Editorial",
    sub: "UI Style Prompt · Design System Spec",
    version: "V1.0",
    status: "Style ready",
    tags: "Design system",
    descEn:
      "The complete UI style prompt behind this very website — a scaled, ready-to-paste design system: exact color tokens, mono-uppercase typography, spacing & radius scales, layout recipes, motion spec and the ten DO / DON'T rules.",
    descFa:
      "پرامپت کامل استایل رابط کاربری همین وب‌سایت — یک سیستم طراحی دقیق و آماده‌ی استفاده: توکن‌های دقیق رنگ، تایپوگرافی مونو، اسکیل فاصله و شعاع، دستورالعمل لی‌اوت، مشخصات حرکت و ده قانون DO / DON'T.",
    chips: [
      ["palette", "Color tokens"],
      ["list", "Type scale"],
      ["layers", "Radius scale"],
      ["sparkle", "Motion spec"],
      ["filecode", "CSS variables"],
      ["check", "Do & don't"],
      ["eye", "Grain & texture"],
      ["terminal", "Dark card rule"],
    ].map(([iconName, label]) => ({ iconName, label })),
    stats: [
      ["15", "Color tokens"],
      ["04", "Radius steps"],
      ["07", "Spacing steps"],
      ["02", "Type families"],
    ],
    categories: [
      ["sparkle", "Identity & Mood", "Tone", "Calm, tactile, blueprint-style SaaS aesthetic — a printed spec sheet resting on a sage-green plaster desk."],
      ["palette", "Color Tokens", "Exact hex", "Sage #869A8C + grain & vignette → sheet #F8F8F8 · ink #171717 · mint #5CB8A6 accents · one dark card #1F1F1F."],
      ["list", "Typography", "Mono labels", "Mono uppercase micro-labels (JetBrains Mono, +0.08em) · grotesque sans body (Inter 13–14px) · sans breadcrumb nav."],
      ["layers", "Spacing & Radius", "Scales", "Spacing steps 4 · 8 · 12 · 16 · 24 · 32 · 48 · radius hierarchy sheet 24 → card 14 → row 10 → pill 999."],
      ["folder", "Layout System", "Sheet flow", "One centered 760–880px sheet · flat white cards with dotted connectors · nested rows, chips and 4-column grids."],
      ["clock", "Depth & Motion", "Subtle", "Flat hairline cards · fade + 4px slide 150–200ms ease-out · hover lifts 1px · soft shadows on sheet & dark card only."],
    ],
    swatchMode: true,
    stack: [
      ["#869A8C", "#F8F8F8", "Sage", "#869A8C · page background"],
      ["#F8F8F8", "#171717", "Sheet", "#F8F8F8 · main canvas"],
      ["#171717", "#F8F8F8", "Ink", "#171717 · primary text"],
      ["#6F7070", "#F8F8F8", "Gray", "#6F7070 · secondary text"],
      ["#1F1F1F", "#F8F8F8", "Terminal", "#1F1F1F · dark card"],
      ["#5CB8A6", "#171717", "Mint", "#5CB8A6 · accent"],
      ["#F2FBFA", "#2F8577", "Mint BG", "#F2FBFA · badge surface"],
      ["#E7E8E4", "#171717", "Hairline", "#E7E8E4 · 1px borders"],
    ],
    rules: [
      ["DO · Grain placement", "grain only on the green background — never on white cards"],
      ["DO · Mono labels", "every label mono uppercase with +0.08em tracking"],
      ["DO · Semantic mint", "green only as small semantic accents, never large surfaces"],
      ["DO · Generous air", "at least 24px vertical gap between cards"],
      ["DO · Pill everything", "chips & status pills fully rounded with hairline borders"],
      ["DON'T · Saturated fills", "no saturated colors or large colored surfaces"],
      ["DON'T · Shadow spam", "no shadow on every element — sheet & dark card only"],
      ["DON'T · Sharp corners", "no 0px corners anywhere"],
      ["DON'T · Gradient cards", "no glassmorphism, no gradients on cards"],
      ["DON'T · Dark card spam", "max ONE dark terminal card per screen"],
    ],
    mapTitle: "Style map — 6 sections",
    gridTitle: "Core palette",
    rulesTitle: "Do & Don't — 10 rules",
    live: { href: PAGES_URL, name: "This website", sub: "Live preview · built with this exact prompt" },
    full: STYLE_PROMPT,
  },
];
