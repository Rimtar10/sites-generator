import type { Site } from "@/lib/types";
import { getFontPair, getPalette } from "./themes";
import { portfolioCss } from "./portfolio/styles";
import { renderPortfolio, esc } from "./portfolio/render";

export type DocOpts = {
  /** true inside the editor preview, false for the exported file. */
  editable?: boolean;
  /** Restore the preview scroll position after a rebuild. */
  scrollY?: number;
};

/** CSS that only exists while editing — never ends up in the exported site. */
const EDITOR_CSS = `
[data-slot] {
  outline: 1px dashed transparent;
  outline-offset: 3px;
  border-radius: 3px;
  cursor: text;
  transition: outline-color .12s ease;
}
[data-slot]:hover { outline-color: color-mix(in srgb, var(--accent) 55%, transparent); }
[data-slot]:focus { outline: 2px solid var(--accent); outline-offset: 3px; }
[data-image] { position: relative; cursor: pointer; }
[data-image]::after {
  content: "Click to change image";
  position: absolute; inset: 0;
  display: grid; place-items: center;
  background: rgba(0,0,0,.55); color: #fff;
  font: 600 11px/1 ui-sans-serif, system-ui, sans-serif;
  letter-spacing: .1em; text-transform: uppercase;
  opacity: 0; transition: opacity .15s ease;
}
[data-image]:hover::after, [data-image]:focus-visible::after { opacity: 1; }
`;

/** The bridge between the preview iframe and the editor UI around it. */
const EDITOR_JS = `
(function () {
  function send(msg) { msg.__sitesmith = true; parent.postMessage(msg, "*"); }

  document.addEventListener("focusout", function (e) {
    var el = e.target && e.target.closest && e.target.closest("[data-slot]");
    if (!el) return;
    send({ type: "slot", path: el.getAttribute("data-slot"), value: el.innerText.replace(/\\u00a0/g, " ").trim() });
  }, true);

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var picker = t.closest("[data-image]");
    if (picker) { e.preventDefault(); send({ type: "image", path: picker.getAttribute("data-image") }); return; }
    var a = t.closest("a");
    if (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") e.preventDefault();
    }
  });

  document.addEventListener("keydown", function (e) {
    var el = e.target && e.target.closest && e.target.closest("[data-slot]");
    if (e.key === "Escape" && document.activeElement) { document.activeElement.blur(); return; }
    if (e.key === "Enter" && el && el.getAttribute("data-slot") !== "about.body") {
      e.preventDefault(); el.blur();
    }
  });

  var timer;
  window.addEventListener("scroll", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { send({ type: "scroll", y: window.scrollY }); }, 140);
  }, { passive: true });

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || !d.__sitesmith) return;
    if (d.type === "patch") {
      var els = document.querySelectorAll('[data-slot="' + d.path + '"]');
      for (var i = 0; i < els.length; i++) {
        if (els[i].innerText !== d.value) els[i].innerText = d.value;
      }
    }
    if (d.type === "focus") {
      var el = document.querySelector('[data-slot="' + d.path + '"], [data-image="' + d.path + '"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  window.addEventListener("load", function () {
    if (window.__SS_SCROLL__) window.scrollTo(0, window.__SS_SCROLL__);
    send({ type: "ready" });
  });
})();
`;

/**
 * Builds the complete HTML document for a site.
 *
 * The editor preview and the exported index.html come from this one function —
 * the only difference is the editing hooks, so what you see is what ships.
 */
export function buildDocument(site: Site, opts: DocOpts = {}): string {
  const editable = !!opts.editable;
  const font = getFontPair(site.design.fontId);
  const css = portfolioCss(site.design);
  const body = renderPortfolio(
    site.content,
    site.sections,
    site.design.heroLayout,
    { editable }
  );

  const title = `${site.content.brand.name} — ${site.content.hero.eyebrow}`;
  const description = site.content.hero.subheadline;

  const fontLink = font.googleHref
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${font.googleHref}">`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${fontLink}
  <style>
html, body { margin: 0; padding: 0; background: ${getPalette(site.design.paletteId).bg}; }
${css}
${editable ? EDITOR_CSS : ""}
  </style>
</head>
<body>
${body}
${
  editable
    ? `<script>window.__SS_SCROLL__ = ${Number(opts.scrollY) || 0};</script>
<script>${EDITOR_JS}</script>`
    : ""
}
</body>
</html>
`;
}
