/* Shared helpers: markdown (vendored marked), escaping, front-matter, canvas. */
import { createRequire } from "node:module";
import { join } from "node:path";
import { CANVAS_COLORS, ROOT } from "./site.mjs";

/* markdown (vendored marked, works offline) */
const require_ = createRequire(import.meta.url);
const markedMod = require_(join(ROOT, "assets/vendor/marked.min.js"));
const markedRef = markedMod.marked ?? markedMod;
export const mdToHtml = (t) => (markedRef.parse ? markedRef.parse(t) : markedRef.marked.parse(t));

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slugify = (s) =>
  String(s).toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const titleize = (s) =>
  String(s).replace(/\.[a-z0-9]+$/i, "").split(/[-_\s]+/).filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
export const pill = (text, cls = "") => `<span class="pill ${cls}">${text}</span>`;

export function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_-]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1].trim().toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: text.slice(m[0].length) };
}

export function canvasToMd(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const parts = (j.nodes || []).filter((n) => n.type === "text" && n.text).map((n) => n.text);
    return parts.length ? parts.join("\n\n---\n\n") : "*(This canvas has no text nodes — open it in Obsidian.)*";
  } catch (_) {
    return "*(Unreadable canvas file — open it in Obsidian.)*";
  }
}

/* full, faithful canvas rendering: intro cards first, then every group
   in numbered order with its nodes as individual cards in geometric
   reading order — group markers use the actual Obsidian canvas colors */
export function canvasToHtml(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const nodes = (j.nodes || []).filter((n) => n.type === "text" && n.text);
    const groups = (j.nodes || []).filter((n) => n.type === "group");
    const inGroup = (n) => groups.find((g) => {
      const cx = n.x + (n.width || 0) / 2, cy = n.y + (n.height || 0) / 2;
      return cx >= g.x && cx <= g.x + (g.width || 0) && cy >= g.y && cy <= g.y + (g.height || 0);
    });
    const gnum = (label) => { const m = String(label || "").match(/(\d+)\s*·/); return m ? +m[1] : 99; };
    const card = (n) => `<div class="canvas-card">${mdToHtml(n.text)}</div>`;

    const sections = new Map();
    const intro = [];
    for (const n of nodes) {
      const g = inGroup(n);
      if (!g) { intro.push(n); continue; }
      if (!sections.has(g.id)) sections.set(g.id, { label: g.label, num: gnum(g.label), color: g.color, nodes: [] });
      sections.get(g.id).nodes.push(n);
    }
    intro.sort((a, b) => a.y - b.y || a.x - b.x);
    let html = intro.map(card).join("\n");
    const sorted = [...sections.values()].sort((a, b) => a.num - b.num || a.label.localeCompare(b.label));
    for (const s of sorted) {
      s.nodes.sort((a, b) => a.y - b.y || a.x - b.x);
      const dot = CANVAS_COLORS[s.color] || "var(--mint)";
      html += `<h2 class="canvas-group"><span class="canvas-dot" style="background:${dot}"></span>${esc(s.label)}</h2>`
        + s.nodes.map(card).join("\n");
    }
    return html || '<div class="canvas-card"><p><em>(This canvas has no text nodes — open it in Obsidian.)</em></p></div>';
  } catch (_) {
    return '<div class="canvas-card"><p><em>(Unreadable canvas file — open it in Obsidian.)</em></p></div>';
  }
}

/* raw canvas model for the interactive viewer (positions + edges + rendered html) */
export function buildCanvasJson(jsonText) {
  try {
    const j = JSON.parse(jsonText);
    const nodes = (j.nodes || []).filter((n) => n.type === "text" && n.text);
    const groups = (j.nodes || []).filter((n) => n.type === "group");
    return JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.width, h: n.height, c: n.color || null, html: mdToHtml(n.text) })),
      groups: groups.map((g) => ({ id: g.id, x: g.x, y: g.y, w: g.width, h: g.height, label: g.label || "", c: g.color || null })),
      edges: (j.edges || []).map((e) => ({ f: e.fromNode, fs: e.fromSide, t: e.toNode, ts: e.toSide, c: e.color || null })),
    }).replace(/<\/script/gi, "<\\\\/script");
  } catch (_) {
    return "{}";
  }
}
