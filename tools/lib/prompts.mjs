/* Loads every prompt from prompts/<category>/*.{md,canvas} into the
   unified card model used by the page templates. */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, CATS } from "./site.mjs";
import { esc, slugify, titleize, parseFrontMatter, canvasToMd, mdToHtml } from "./utils.mjs";
import { EXTRAS } from "../extras.mjs";

export function loadPrompts() {
  const dir = join(ROOT, "prompts");
  const out = [];
  for (const cat of readdirSync(dir)) {
    const catPath = join(dir, cat);
    if (!CATS[cat] || !existsSync(catPath) || !readdirSync(catPath).length) continue;
    for (const f of readdirSync(catPath)) {
      if (!/\.(md|canvas)$/i.test(f)) continue;
      const raw = readFileSync(join(catPath, f), "utf8");
      const slug = slugify(f);
      const isCanvas = /\.canvas$/i.test(f);
      const { meta, body } = parseFrontMatter(raw);
      const text = isCanvas ? canvasToMd(raw) : body;
      const c = CATS[cat];
      const tags = (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
      out.push({
        slug, cat, fname: f, sourcePath: `prompts/${cat}/${f}`,
        name: esc(meta.title || titleize(f)),
        sub: esc(meta.description || `${c.label} prompt`),
        desc: esc(meta.description || c.desc),
        descFa: esc(meta.fa || ""),
        version: esc(meta.version || "1.0"),
        status: esc(meta.status || `${c.label} · ready`),
        tags, tagLabel: tags.length ? esc(tags.slice(0, 2).join(" · ")) : esc(c.label),
        icon: c.icon,
        bodyHtml: mdToHtml(text),
        bodyText: text,
        extras: EXTRAS[slug] || null,
      });
    }
  }
  return out;
}
