"use strict";

/* ============================================================
   Prompt Library — progressive enhancement only.
   All content is server-rendered static HTML (tools/build.mjs);
   this file adds: expand/collapse, copy-to-clipboard, scroll reveal.
   ============================================================ */

const CHECK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/* ---------- expand / collapse ---------- */
function wireExpanders() {
  document.querySelectorAll("[data-expand]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = document.getElementById(btn.getAttribute("data-expand"));
      const open = d.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.title = open ? "Collapse details" : "Expand details";
    });
  });
}

/* ---------- copy to clipboard ---------- */
async function copyText(text, el) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    ta.remove();
  }
  flashCopied(el, ok);
}

function flashCopied(el, ok) {
  if (!ok) { el.title = "Copy failed — select and copy manually"; return; }
  const prev = el.innerHTML;
  const prevTitle = el.title;
  el.classList.add("is-copied");
  el.innerHTML = el.classList.contains("btn-white") || el.classList.contains("btn-copy")
    ? `${CHECK_SVG}<span>Copied ✓</span>`
    : CHECK_SVG;
  el.title = "Copied";
  setTimeout(() => {
    el.innerHTML = prev;
    el.title = prevTitle;
    el.classList.remove("is-copied");
  }, 1600);
}

function wireCopy() {
  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el));
  });

  document.querySelectorAll("[data-copy-prompt]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-copy-prompt");
      const raw = document.querySelector(`.prompt-raw[data-id="${id}"]`);
      if (raw) copyText(raw.textContent, el);
    });
  });
}

/* ---------- theme toggle ---------- */
function wireTheme() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    try { localStorage.setItem("pl-theme", cur); } catch (_) {}
  });
}

/* ---------- interactive canvas viewer (Obsidian-style) ---------- */
const CV_COLORS = { "1": "#E76E66", "2": "#E0A23C", "3": "#D9C24C", "4": "#7CB86A", "5": "#5CB8D4", "6": "#A07CD4" };
const cvColor = (c) => CV_COLORS[c] || "#5CB8A6";
const CV_DIRS = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };

function wireCanvas() {
  const stage = document.querySelector("[data-canvas-stage]");
  const dataEl = document.querySelector(".canvas-json");
  if (!stage || !dataEl) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch (_) { return; }
  if (!data.nodes || !data.nodes.length) return;

  const world = document.createElement("div");
  world.className = "canvas-world";
  stage.appendChild(world);

  const pos = {};
  const groupsLayer = document.createElement("div");
  groupsLayer.className = "cv-layer";
  world.appendChild(groupsLayer);
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "cv-edges");
  const defs = document.createElementNS(svgNS, "defs");
  const edgeColors = [...new Set(data.edges.map((e) => e.c).filter(Boolean))];
  defs.innerHTML = edgeColors.map((c) =>
    `<marker id="arw-${c}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="${cvColor(c)}"/></marker>`
  ).join("") + `<marker id="arw-default" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="#5CB8A6"/></marker>`;
  svg.appendChild(defs);
  world.appendChild(svg);
  const nodesLayer = document.createElement("div");
  nodesLayer.className = "cv-layer";
  world.appendChild(nodesLayer);

  for (const g of data.groups) {
    const el = document.createElement("div");
    el.className = "cv-group";
    el.style.cssText = `left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border-color:${cvColor(g.c)}`;
    const label = document.createElement("div");
    label.className = "cv-group-label";
    label.style.borderColor = cvColor(g.c);
    label.style.color = cvColor(g.c);
    label.textContent = g.label;
    el.appendChild(label);
    groupsLayer.appendChild(el);
  }

  const nodeEls = {};
  for (const n of data.nodes) {
    pos[n.id] = { x: n.x, y: n.y };
    const el = document.createElement("div");
    el.className = "cv-node";
    el.dataset.id = n.id;
    el.style.cssText = `left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px;` + (n.c ? `border-color:${cvColor(n.c)}` : "");
    const body = document.createElement("div");
    body.className = "md-body";
    body.innerHTML = n.html;
    el.appendChild(body);
    nodesLayer.appendChild(el);
    nodeEls[n.id] = el;
  }

  const edgeEls = [];
  for (const e of data.edges) {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", cvColor(e.c));
    path.setAttribute("stroke-width", "2");
    path.setAttribute("marker-end", e.c ? `url(#arw-${e.c})` : "url(#arw-default)");
    svg.appendChild(path);
    edgeEls.push({ e, path });
  }
  const sidePt = (id, side) => {
    const o = pos[id];
    if (!o) return null;
    const n = data.nodes.find((x) => x.id === id);
    const w = n ? n.w : 220, h = n ? n.h : 140;
    if (side === "top") return { x: o.x + w / 2, y: o.y };
    if (side === "bottom") return { x: o.x + w / 2, y: o.y + h };
    if (side === "left") return { x: o.x, y: o.y + h / 2 };
    return { x: o.x + w, y: o.y + h / 2 };
  };
  function redrawEdges() {
    for (const { e, path } of edgeEls) {
      const a = sidePt(e.f, e.fs), b = sidePt(e.t, e.ts);
      if (!a || !b) continue;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const k = Math.min(Math.max(dist / 2, 40), 160);
      const d1 = CV_DIRS[e.fs] || [0, -1], d2 = CV_DIRS[e.ts] || [0, 1];
      path.setAttribute("d",
        `M ${a.x} ${a.y} C ${a.x + d1[0] * k} ${a.y + d1[1] * k} ${b.x + d2[0] * k} ${b.y + d2[1] * k} ${b.x} ${b.y}`);
    }
  }

  let scale = 1, tx = 0, ty = 0;
  const zoomLabel = document.querySelector("[data-zoom-label]");
  function applyView() {
    world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + "%";
  }
  function bbox() {
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const n of data.nodes) {
      minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h);
    }
    for (const g of data.groups) {
      minX = Math.min(minX, g.x); minY = Math.min(minY, g.y);
      maxX = Math.max(maxX, g.x + g.w); maxY = Math.max(maxY, g.y + g.h);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  function fit() {
    const bb = bbox();
    const vw = stage.clientWidth || 800, vh = stage.clientHeight || 600;
    scale = Math.max(Math.min(vw / bb.w, vh / bb.h, 1), 0.15);
    tx = (vw - bb.w * scale) / 2 - bb.x * scale;
    ty = (vh - bb.h * scale) / 2 - bb.y * scale;
    applyView();
  }
  const clampScale = (v) => Math.min(Math.max(v, 0.15), 3);
  function zoomAt(cx, cy, ns) {
    const r = stage.getBoundingClientRect();
    const lx = cx - r.left, ly = cy - r.top;
    tx = lx - ((lx - tx) / scale) * ns;
    ty = ly - ((ly - ty) / scale) * ns;
    scale = ns;
    applyView();
  }

  const pointers = new Map();
  let panState = null, dragState = null, pinchState = null;
  stage.addEventListener("pointerdown", (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchState = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale };
      panState = null;
      if (dragState) { nodeEls[dragState.id]?.classList.remove("is-dragging"); dragState = null; }
      return;
    }
    const nodeEl = e.target.closest(".cv-node");
    if (nodeEl) {
      dragState = { id: nodeEl.dataset.id, sx: e.clientX, sy: e.clientY, ox: pos[nodeEl.dataset.id].x, oy: pos[nodeEl.dataset.id].y };
      nodeEl.classList.add("is-dragging");
    } else {
      panState = { sx: e.clientX, sy: e.clientY, otx: tx, oty: ty };
      stage.classList.add("is-panning");
    }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchState) {
      const pts = [...pointers.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const r = stage.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, clampScale(pinchState.scale * (d / pinchState.dist)));
      return;
    }
    if (dragState) {
      pos[dragState.id].x = dragState.ox + (e.clientX - dragState.sx) / scale;
      pos[dragState.id].y = dragState.oy + (e.clientY - dragState.sy) / scale;
      const el = nodeEls[dragState.id];
      el.style.left = pos[dragState.id].x + "px";
      el.style.top = pos[dragState.id].y + "px";
      redrawEdges();
    } else if (panState) {
      tx = panState.otx + (e.clientX - panState.sx);
      ty = panState.oty + (e.clientY - panState.sy);
      applyView();
    }
  });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (dragState) { nodeEls[dragState.id]?.classList.remove("is-dragging"); dragState = null; }
    panState = null;
    pinchState = null;
    stage.classList.remove("is-panning");
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, clampScale(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  }, { passive: false });

  document.querySelectorAll("[data-zoom]").forEach((b) =>
    b.addEventListener("click", () => {
      const r = stage.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, clampScale(scale * (b.getAttribute("data-zoom") === "in" ? 1.25 : 0.8)));
    })
  );
  const fitBtn = document.querySelector("[data-canvas-fit]");
  if (fitBtn) fitBtn.addEventListener("click", fit);
  document.addEventListener("canvas-refit", fit);

  redrawEdges();
  requestAnimationFrame(() => requestAnimationFrame(fit));
}

function wireCanvasMode() {
  const btns = [...document.querySelectorAll("[data-canvas-mode-btn]")];
  const stageSec = document.querySelector("[data-canvas-view]");
  const textSec = document.querySelector("[data-text-view]");
  if (!btns.length || !stageSec || !textSec) return;
  function set(mode) {
    stageSec.hidden = mode !== "canvas";
    textSec.hidden = mode !== "text";
    btns.forEach((b) => {
      const on = b.getAttribute("data-canvas-mode-btn") === mode;
      b.classList.toggle("is-active", on);
      b.classList.toggle("pill--dark", on);
    });
    if (mode === "canvas") requestAnimationFrame(() => document.dispatchEvent(new CustomEvent("canvas-refit")));
  }
  btns.forEach((b) => b.addEventListener("click", () => set(b.getAttribute("data-canvas-mode-btn"))));
  set("canvas");
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal:not(.is-in)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }),
    { threshold: 0 }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 45}ms`;
    io.observe(el);
  });
}

wireExpanders();
wireCopy();
wireTheme();
wireCanvas();
wireCanvasMode();
initReveal();
