/* Inline SVG icon set (14px line icons, currentColor). */
const svg = (paths, filled = false) =>
  `<svg viewBox="0 0 24 24" ${filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  shield: svg('<path d="M12 3l7 3.2v5.1c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V6.2L12 3z"/>'),
  layers: svg('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'),
  folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  key: svg('<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5L20 3"/><path d="M16 7l3 3"/>'),
  bug: svg('<circle cx="12" cy="13" r="5"/><path d="M12 8V6"/><path d="M9.5 8L7.5 5M14.5 8l2-3"/><path d="M4.5 13h2.5M17 13h2.5M6 19l2-2M18 19l-2-2"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.5"/>'),
  copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  expand: svg('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7.5 7.5"/><path d="M3 21l7.5-7.5"/>'),
  dots: svg('<circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/>', true),
  ext: svg('<path d="M7 17L17 7"/><path d="M8.5 7H17v8.5"/>'),
  filecode: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/><path d="M10.5 12.5L8.5 15l2 2.5"/><path d="M13.5 12.5l2 2.5-2 2.5"/>'),
  book: svg('<path d="M2.5 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12a2.5 2.5 0 0 0-2.5-2.5h-7v-13z"/><path d="M21.5 4.5h-6A3.5 3.5 0 0 0 12 8v12a2.5 2.5 0 0 1 2.5-2.5h7v-13z"/>'),
  sparkle: svg('<path d="M12 3l2.2 6.2L20.5 12l-6.3 2.8L12 21l-2.2-6.2L3.5 12l6.3-2.8L12 3z"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  terminal: svg('<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 9.5l3.5 3L7 15.5"/><path d="M12.5 15.5H17"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-1.4-3.4A2 2 0 0 1 12 12h4.5A4.5 4.5 0 0 0 21 7.5C21 4.4 16.9 3 12 3z"/><circle cx="7.5" cy="10.5" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16.5" cy="10.5" r="1.1"/>'),
  arrow: svg('<path d="M5 12h13"/><path d="M13 6.5L18.5 12 13 17.5"/>'),
  box: svg('<path d="M21 8.2l-9-5-9 5v7.6l9 5 9-5V8.2z"/><path d="M3 8.2l9 5 9-5"/><path d="M12 13.2V21"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.8 2.7 2.8 14.3 0 17-2.8-2.7-2.8-14.3 0-17z"/>'),
  moon: svg('<path d="M20 12.5A8 8 0 1 1 11.5 4a6.5 6.5 0 0 0 8.5 8.5z"/>'),
  zoomin: svg('<path d="M12 5v14M5 12h14"/>'),
  min: svg('<path d="M4 14h6v6"/><path d="M14 10h6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>'),
  zoomout: svg('<path d="M5 12h14"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  chevron: svg('<path d="M6 9l6 6 6-6"/>'),
};
/* audit: unknown icon names are collected so the build can warn about them */
const missing = new Set();
export const icon = (n) => {
  const s = ICONS[n] || "";
  if (!s && n) missing.add(n);
  return s;
};
export const missingIcons = () => [...missing];
