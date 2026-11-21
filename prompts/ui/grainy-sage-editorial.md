---
title: Grainy Sage Editorial
description: The complete UI style system behind this website — exact tokens, scales, layout recipes and rules.
category: ui
version: 1.0.0
status: Style ready
tags: design-system, style, saas, typography
fa: پرامپت کامل استایل رابط کاربری همین وب‌سایت — سیستم طراحی دقیق با توکن‌ها، اسکیل‌ها و قوانین.
---

# Grainy Sage Editorial — UI Style System Prompt

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
- Dot-grid: radial-gradient(circle, #E3E4E0 1px, transparent 1.4px) with an 18px background-size on the sheet.
- Fonts via Google Fonts: Inter (400–700) + JetBrains Mono (400–700), plus Vazirmatn for Persian.
- Define every token above as a CSS custom property in :root.
- Render content from a data array so new entries inherit the system automatically.

## 8 · The Rules
DO: keep grain only on the green background, never on white cards; mono uppercase for all labels; stay monochrome with green as small semantic accents only; generous whitespace (at least 24px between cards).
DON'T: no saturated fills or colored large surfaces; no shadow on every element; no 0px corners; max ONE dark "terminal" card per screen.
