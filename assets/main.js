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
    { threshold: 0.08 }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 45}ms`;
    io.observe(el);
  });
}

wireExpanders();
wireCopy();
initReveal();
