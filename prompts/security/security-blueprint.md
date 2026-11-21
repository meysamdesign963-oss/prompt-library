---
title: Prompt-Library
description: Universal security & engineering spec for any Next.js + MongoDB web app.
category: security
version: 1.0.0
status: Spec ready
tags: security, jwt, owasp, rbac
fa: پرامپت‌لایبرری — اسپک مستقل از نوع پروژه برای امنیت و مهندسی هر اپلیکیشن وب Next.js + MongoDB.
---

# Prompt-Library — Universal Web App Spec

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

Reference: https://github.com/OWASP/Top10
