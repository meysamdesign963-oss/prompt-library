/* Single source of truth for site constants & the category taxonomy. */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const BASE = "https://meysamdesign963-oss.github.io/prompt-library";
export const REPO_URL = "https://github.com/meysamdesign963-oss/prompt-library";
export const BRANCH = "main";
export const OWNER = "meysamdesign963-oss";
export const BUILD_DATE = new Date().toISOString().slice(0, 10);
export const LOGO_PATH = join(ROOT, "public", "logo.svg");
export const hasLogo = existsSync(LOGO_PATH);

export const CATS = {
  security:  { label: "Security",     fa: "امنیت",       icon: "shield",   desc: "Auth, tokens, sessions, OWASP — hardening specs for web apps.", faDesc: "احراز هویت، توکن، سشن و OWASP — اسپک‌های مقاوم‌سازی اپلیکیشن وب." },
  structure: { label: "Structure",    fa: "ساختار",      icon: "folder",   desc: "Folder structures, code style & architecture blueprints.", faDesc: "ساختار پوشه‌ها، سبک کد و بلوپرینت‌های معماری." },
  ui:        { label: "UI & Design",  fa: "رابط کاربری", icon: "palette",  desc: "Design systems, style prompts and interface specs.", faDesc: "سیستم‌های طراحی، پرامپت‌های استایل و اسپک‌های رابط کاربری." },
  server:    { label: "Server & API", fa: "سرور و API",  icon: "terminal", desc: "API design, server hardening, deployment & DevOps prompts.", faDesc: "طراحی API، مقاوم‌سازی سرور، دیپلوی و پرامپت‌های DevOps." },
};

/* Obsidian canvas group colors → hex */
export const CANVAS_COLORS = {
  "1": "#E76E66", "2": "#E0A23C", "3": "#D9C24C",
  "4": "#7CB86A", "5": "#5CB8D4", "6": "#A07CD4",
};
