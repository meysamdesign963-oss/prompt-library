---
title: Next.js Project Structure
description: Exact folder structure & code-style prompt for scalable Next.js + MongoDB projects.
category: structure
version: 1.0.0
status: Ready
tags: structure, folders, code-style, nextjs
fa: پرامپت ساختار پوشه‌ها و سبک کد برای پروژه‌های مقیاس‌پذیر Next.js + MongoDB.
---

# Next.js Project Structure — Folder & Code Style Prompt

You are scaffolding a Next.js + MongoDB application. Follow this structure and code style exactly so the project stays clean, readable and scalable as it grows.

## 1 · Folder Tree

The whole project lives in src/ with this exact layout:

- src/app/ → frontend pages & routing
  - src/app/api/ → backend & API routes (one folder per resource: auth, users, files, …)
- src/public/img/ → site images
- src/public/font/ → site fonts
- src/controllers/ → HTTP layer: parse requests, call services, return responses — no business logic here
- src/services/ → ALL business logic — controllers and components never talk to the database directly
- src/components/ → every reusable UI piece, grouped by domain: auth/, theme/, layout/, ui/
- src/utils/ → libraries, realtime connections, helpers
- .env → secrets: token keys, DB URI (never commit!)

## 2 · Layer Rules

1. Request flow is always: route → controller → service → database. Never skip a layer.
2. Controllers return one consistent response shape: { success, message, data }.
3. Services are the only place that touches MongoDB — every query filters by user_id where applicable.
4. Components are dumb where possible: props in, UI out; data fetching stays in controllers/services via API calls.

## 3 · Code Style

- Clean code: anyone on the team must be able to read and understand any file without a briefing.
- Componentize every reusable piece under components/ — duplicated UI is a bug.
- Name files by domain, not by type: services/auth-service.js, components/auth/login-form.jsx.
- Keep functions small and single-purpose; extract anything reused into utils/.
- Comment only the "why", never the "what".

## 4 · Scalability Checks

- Adding a new feature = adding folders under app/, controllers/, services/, components/ — no structural rewrites.
- Any update to the schema or code must never break the project (update-resilient goal — MongoDB, no migrations).
- Every public page is fully SEO-optimized (metadata, semantic HTML, performance).
