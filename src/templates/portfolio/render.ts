import type { PortfolioContent, SectionId, ImageRef } from "@/lib/types";

export type RenderOpts = {
  /** Adds contenteditable + data-slot hooks so the editor can edit in place. */
  editable: boolean;
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Attributes that turn an element into an editable text slot. */
function slotAttrs(path: string, o: RenderOpts) {
  return o.editable
    ? ` data-slot="${path}" contenteditable="true" spellcheck="false"`
    : "";
}

/** A text slot. */
function T(
  tag: string,
  cls: string,
  path: string,
  value: string,
  o: RenderOpts,
  extra = ""
) {
  const c = cls ? ` class="${cls}"` : "";
  return `<${tag}${c}${extra}${slotAttrs(path, o)}>${esc(value)}</${tag}>`;
}

/** An image slot — renders the picture, or a labelled placeholder if empty. */
function IMG(cls: string, path: string, image: ImageRef, o: RenderOpts, label: string) {
  const inner = image?.src
    ? `<img src="${esc(image.src)}" alt="${esc(image.alt || "")}" loading="lazy">`
    : `<div class="pf-ph">${esc(label)}</div>`;
  const hook = o.editable ? ` data-image="${path}" tabindex="0"` : "";
  return `<div class="${cls}"${hook}>${inner}</div>`;
}

// ---------------------------------------------------------------------------
// sections
// ---------------------------------------------------------------------------

function header(c: PortfolioContent, o: RenderOpts) {
  const links = c.nav.links
    .map(
      (l, i) =>
        `<a href="#${esc(l.target)}"${slotAttrs(`nav.links.${i}.label`, o)}>${esc(l.label)}</a>`
    )
    .join("");
  return `
<header class="pf-header">
  <div class="pf-wrap pf-nav">
    <a class="pf-brand" href="#top">
      <span class="pf-mark"${slotAttrs("brand.initials", o)}>${esc(c.brand.initials)}</span>
      <span${slotAttrs("brand.name", o)}>${esc(c.brand.name)}</span>
    </a>
    <nav class="pf-links">${links}</nav>
    <a class="pf-btn pf-btn-primary pf-nav-cta" href="#contact"${slotAttrs("nav.ctaLabel", o)}>${esc(
    c.nav.ctaLabel
  )}</a>
  </div>
</header>`;
}

function hero(c: PortfolioContent, o: RenderOpts) {
  return `
<section class="pf-section pf-hero" id="top">
  <div class="pf-wrap">
    <div class="pf-hero-grid">
      <div class="pf-hero-copy">
        ${T("span", "pf-kicker", "hero.eyebrow", c.hero.eyebrow, o)}
        ${T("h1", "pf-h1", "hero.headline", c.hero.headline, o)}
        ${T("p", "pf-hero-sub", "hero.subheadline", c.hero.subheadline, o)}
        <div class="pf-hero-actions">
          <a class="pf-btn pf-btn-primary" href="#work"${slotAttrs("hero.ctaPrimary", o)}>${esc(
    c.hero.ctaPrimary
  )}</a>
          <a class="pf-btn pf-btn-ghost" href="#contact"${slotAttrs("hero.ctaSecondary", o)}>${esc(
    c.hero.ctaSecondary
  )}</a>
        </div>
      </div>
      ${IMG("pf-hero-media", "hero.image", c.hero.image, o, "Hero image")}
    </div>
  </div>
</section>`;
}

function about(c: PortfolioContent, o: RenderOpts) {
  const stats = c.about.stats
    .map(
      (s, i) => `<div class="pf-stat">
        ${T("div", "pf-stat-v", `about.stats.${i}.value`, s.value, o)}
        ${T("div", "pf-stat-l", `about.stats.${i}.label`, s.label, o)}
      </div>`
    )
    .join("");
  return `
<section class="pf-section" id="about">
  <div class="pf-wrap">
    <div class="pf-about-grid">
      ${IMG("pf-about-media", "about.image", c.about.image, o, "About image")}
      <div>
        ${T("span", "pf-kicker", "about.kicker", c.about.kicker, o)}
        ${T("h2", "pf-title", "about.title", c.about.title, o)}
        ${T("p", "pf-about-body", "about.body", c.about.body, o)}
        <div class="pf-stats">${stats}</div>
      </div>
    </div>
  </div>
</section>`;
}

function services(c: PortfolioContent, o: RenderOpts) {
  const cards = c.services.items
    .map(
      (s, i) => `<article class="pf-card">
        <span class="pf-card-n">${String(i + 1).padStart(2, "0")}</span>
        ${T("h3", "", `services.items.${i}.title`, s.title, o)}
        ${T("p", "", `services.items.${i}.description`, s.description, o)}
      </article>`
    )
    .join("");
  return `
<section class="pf-section" id="services">
  <div class="pf-wrap">
    <div class="pf-head">
      ${T("span", "pf-kicker", "services.kicker", c.services.kicker, o)}
      ${T("h2", "pf-title", "services.title", c.services.title, o)}
      ${T("p", "pf-sub", "services.subtitle", c.services.subtitle, o)}
    </div>
    <div class="pf-cards">${cards}</div>
  </div>
</section>`;
}

function work(c: PortfolioContent, o: RenderOpts) {
  const items = c.work.projects
    .map(
      (p, i) => `<article class="pf-proj">
        ${IMG("pf-proj-media", `work.projects.${i}.image`, p.image, o, "Project image")}
        <div class="pf-proj-body">
          ${T("span", "pf-proj-cat", `work.projects.${i}.category`, p.category, o)}
          ${T("h3", "", `work.projects.${i}.title`, p.title, o)}
          ${T("p", "", `work.projects.${i}.description`, p.description, o)}
        </div>
      </article>`
    )
    .join("");
  return `
<section class="pf-section" id="work">
  <div class="pf-wrap">
    <div class="pf-head">
      ${T("span", "pf-kicker", "work.kicker", c.work.kicker, o)}
      ${T("h2", "pf-title", "work.title", c.work.title, o)}
      ${T("p", "pf-sub", "work.subtitle", c.work.subtitle, o)}
    </div>
    <div class="pf-work-grid">${items}</div>
  </div>
</section>`;
}

function testimonials(c: PortfolioContent, o: RenderOpts) {
  const items = c.testimonials.items
    .map(
      (t, i) => `<figure class="pf-quote">
        <div class="pf-quote-mark">&ldquo;</div>
        ${T("p", "", `testimonials.items.${i}.quote`, t.quote, o)}
        <figcaption class="pf-quote-by">
          ${T("div", "pf-quote-name", `testimonials.items.${i}.name`, t.name, o)}
          ${T("div", "pf-quote-role", `testimonials.items.${i}.role`, t.role, o)}
        </figcaption>
      </figure>`
    )
    .join("");
  return `
<section class="pf-section" id="testimonials">
  <div class="pf-wrap">
    <div class="pf-head">
      ${T("span", "pf-kicker", "testimonials.kicker", c.testimonials.kicker, o)}
      ${T("h2", "pf-title", "testimonials.title", c.testimonials.title, o)}
    </div>
    <div class="pf-quotes">${items}</div>
  </div>
</section>`;
}

function contact(c: PortfolioContent, o: RenderOpts) {
  const detail = (k: string, path: string, v: string) =>
    `<div class="pf-detail"><span class="pf-detail-k">${esc(k)}</span>${T(
      "span",
      "",
      path,
      v,
      o
    )}</div>`;
  return `
<section class="pf-section" id="contact">
  <div class="pf-wrap">
    <div class="pf-contact-card">
      <div>
        ${T("span", "pf-kicker", "contact.kicker", c.contact.kicker, o)}
        ${T("h2", "pf-title", "contact.title", c.contact.title, o)}
        ${T("p", "pf-contact-body", "contact.body", c.contact.body, o)}
        <div class="pf-contact-actions">
          <a class="pf-btn pf-btn-primary" href="mailto:${esc(c.contact.email)}"${slotAttrs(
    "contact.ctaLabel",
    o
  )}>${esc(c.contact.ctaLabel)}</a>
        </div>
      </div>
      <div class="pf-details">
        ${detail("Email", "contact.email", c.contact.email)}
        ${detail("Phone", "contact.phone", c.contact.phone)}
        ${detail("Where", "contact.location", c.contact.location)}
      </div>
    </div>
  </div>
</section>`;
}

function footer(c: PortfolioContent, o: RenderOpts) {
  const socials = c.footer.socials
    .map(
      (s, i) =>
        `<a href="${esc(s.url)}"${slotAttrs(`footer.socials.${i}.label`, o)}>${esc(s.label)}</a>`
    )
    .join("");
  return `
<footer class="pf-footer">
  <div class="pf-wrap pf-footer-row">
    ${T("div", "pf-footer-note", "footer.note", c.footer.note, o)}
    <nav class="pf-socials">${socials}</nav>
  </div>
</footer>`;
}

const SECTION_RENDERERS: Record<
  SectionId,
  (c: PortfolioContent, o: RenderOpts) => string
> = { hero, about, services, work, testimonials, contact };

/** Renders the <body> contents of a Portfolio site. */
export function renderPortfolio(
  content: PortfolioContent,
  sections: SectionId[],
  heroLayout: string,
  o: RenderOpts
): string {
  const body = sections
    .map((id) => SECTION_RENDERERS[id]?.(content, o) ?? "")
    .join("\n");
  return `<div class="pf pf-hero-${heroLayout}">
${header(content, o)}
<main>
${body}
</main>
${footer(content, o)}
</div>`;
}
