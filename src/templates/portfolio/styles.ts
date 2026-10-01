import type { Design } from "@/lib/types";
import { getPalette, getFontPair, RADII, SPACING } from "../themes";

/**
 * The Portfolio template's entire stylesheet, generated from the design tokens.
 *
 * This is deliberately plain CSS (no Tailwind, no build step) because the exact
 * same string is embedded in the exported standalone index.html. What the owner
 * sees in the editor is byte-for-byte what ships.
 */
export function portfolioCss(design: Design): string {
  const p = getPalette(design.paletteId);
  const f = getFontPair(design.fontId);
  const r = RADII[design.radius];
  const s = SPACING[design.spacing];

  return `
.pf {
  --bg: ${p.bg};
  --surface: ${p.surface};
  --text: ${p.text};
  --muted: ${p.muted};
  --accent: ${p.accent};
  --accent-text: ${p.accentText};
  --border: ${p.border};
  --r-sm: ${r.sm};
  --r-md: ${r.md};
  --r-lg: ${r.lg};
  --r-pill: ${r.pill};
  --sec: ${s.section};
  --gap: ${s.gap};
  --font-h: ${f.heading};
  --font-b: ${f.body};
  --hw: ${f.headingWeight};
  --tracking: ${f.headingTracking};

  background: var(--bg);
  color: var(--text);
  font-family: var(--font-b);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.pf *, .pf *::before, .pf *::after { box-sizing: border-box; }
.pf img { max-width: 100%; display: block; }
.pf a { color: inherit; text-decoration: none; }
.pf h1, .pf h2, .pf h3, .pf h4 {
  font-family: var(--font-h);
  font-weight: var(--hw);
  letter-spacing: var(--tracking);
  line-height: 1.08;
  margin: 0;
}
.pf p { margin: 0; }
.pf ul { margin: 0; padding: 0; list-style: none; }

.pf-wrap { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
.pf-section { padding: var(--sec) 0; }
.pf-kicker {
  font-family: var(--font-b);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 14px;
  display: inline-block;
}
.pf-title { font-size: clamp(30px, 4.4vw, 46px); }
.pf-sub { color: var(--muted); font-size: 17px; max-width: 60ch; margin-top: 16px; }
.pf-head { margin-bottom: var(--gap); }

/* ---------- buttons ---------- */
.pf-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 24px;
  border-radius: var(--r-pill);
  font-weight: 600; font-size: 15px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform .15s ease, opacity .15s ease, background .15s ease;
}
.pf-btn:hover { transform: translateY(-1px); }
.pf-btn-primary { background: var(--accent); color: var(--accent-text); }
.pf-btn-ghost { background: transparent; color: var(--text); border-color: var(--border); }
.pf-btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

/* ---------- header ---------- */
.pf-header {
  position: sticky; top: 0; z-index: 40;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--border);
}
.pf-nav { display: flex; align-items: center; justify-content: space-between; height: 68px; gap: 24px; }
.pf-brand { display: flex; align-items: center; gap: 11px; font-family: var(--font-h); font-weight: var(--hw); font-size: 17px; letter-spacing: var(--tracking); }
.pf-mark {
  width: 32px; height: 32px; flex: none;
  display: grid; place-items: center;
  background: var(--accent); color: var(--accent-text);
  border-radius: var(--r-sm);
  font-size: 13px; font-weight: 700; letter-spacing: 0;
}
.pf-links { display: flex; gap: 28px; font-size: 15px; color: var(--muted); }
.pf-links a:hover { color: var(--text); }
.pf-nav-cta { flex: none; }

/* ---------- hero ---------- */
.pf-hero { padding-top: calc(var(--sec) * .8); padding-bottom: var(--sec); }
.pf-hero-grid { display: grid; gap: 56px; align-items: center; }
.pf-hero-split .pf-hero-grid { grid-template-columns: 1.05fr .95fr; }
.pf-hero-centered .pf-hero-grid { grid-template-columns: 1fr; text-align: center; justify-items: center; }
.pf-hero-stacked .pf-hero-grid { grid-template-columns: 1fr; }
.pf-h1 { font-size: clamp(40px, 6.6vw, 74px); }
.pf-hero-sub { color: var(--muted); font-size: clamp(17px, 1.5vw, 19px); margin-top: 22px; max-width: 54ch; }
.pf-hero-centered .pf-hero-sub { margin-left: auto; margin-right: auto; }
.pf-hero-actions { display: flex; gap: 12px; margin-top: 34px; flex-wrap: wrap; }
.pf-hero-centered .pf-hero-actions { justify-content: center; }
.pf-hero-media {
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  aspect-ratio: 4 / 4.6;
  max-height: 600px;
  background: var(--surface);
}
.pf-hero-centered .pf-hero-media,
.pf-hero-stacked .pf-hero-media { aspect-ratio: 16 / 8; width: 100%; margin-top: 8px; }
.pf-hero-media img { width: 100%; height: 100%; object-fit: cover; }

/* ---------- about ---------- */
.pf-about-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 56px; align-items: center; }
.pf-about-media {
  border-radius: var(--r-lg); overflow: hidden;
  border: 1px solid var(--border);
  aspect-ratio: 1 / 1; background: var(--surface);
}
.pf-about-media img { width: 100%; height: 100%; object-fit: cover; }
.pf-about-body { color: var(--muted); font-size: 17px; margin-top: 18px; white-space: pre-line; }
.pf-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 38px; }
.pf-stat-v { font-family: var(--font-h); font-weight: var(--hw); font-size: 34px; letter-spacing: var(--tracking); color: var(--accent); }
.pf-stat-l { font-size: 13px; color: var(--muted); margin-top: 4px; letter-spacing: .04em; }

/* ---------- services ---------- */
.pf-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.pf-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 30px 26px;
  transition: border-color .2s ease, transform .2s ease;
}
.pf-card:hover { border-color: var(--accent); transform: translateY(-3px); }
.pf-card-n {
  font-family: var(--font-h); font-size: 13px; font-weight: 700;
  color: var(--accent); letter-spacing: .1em; display: block; margin-bottom: 16px;
}
.pf-card h3 { font-size: 20px; }
.pf-card p { color: var(--muted); font-size: 15px; margin-top: 10px; }

/* ---------- work ---------- */
.pf-work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
.pf-proj {
  border: 1px solid var(--border); border-radius: var(--r-md);
  overflow: hidden; background: var(--surface);
  transition: border-color .2s ease, transform .2s ease;
}
.pf-proj:hover { border-color: var(--accent); transform: translateY(-3px); }
.pf-proj-media { aspect-ratio: 16 / 10; background: var(--bg); overflow: hidden; }
.pf-proj-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s ease; }
.pf-proj:hover .pf-proj-media img { transform: scale(1.04); }
.pf-proj-body { padding: 22px 24px 26px; }
.pf-proj-cat { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); font-weight: 600; }
.pf-proj h3 { font-size: 21px; margin-top: 8px; }
.pf-proj p { color: var(--muted); font-size: 15px; margin-top: 8px; }

/* ---------- testimonials ---------- */
.pf-quotes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.pf-quote {
  border: 1px solid var(--border); border-radius: var(--r-md);
  background: var(--surface); padding: 30px 26px;
  display: flex; flex-direction: column; gap: 18px;
}
.pf-quote-mark { font-family: var(--font-h); font-size: 40px; line-height: .6; color: var(--accent); }
.pf-quote p { font-size: 16px; }
.pf-quote-by { margin-top: auto; }
.pf-quote-name { font-weight: 600; font-size: 15px; }
.pf-quote-role { color: var(--muted); font-size: 13px; }

/* ---------- contact ---------- */
.pf-contact-card {
  border: 1px solid var(--border); border-radius: var(--r-lg);
  background: var(--surface);
  padding: clamp(36px, 5vw, 64px);
  display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px; align-items: center;
}
.pf-contact-body { color: var(--muted); font-size: 17px; margin-top: 16px; }
.pf-details { display: grid; gap: 14px; }
.pf-detail { display: flex; gap: 12px; align-items: baseline; font-size: 15px; }
.pf-detail-k { color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; min-width: 78px; }
.pf-contact-actions { margin-top: 28px; }

/* ---------- footer ---------- */
.pf-footer { border-top: 1px solid var(--border); padding: 34px 0; }
.pf-footer-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.pf-footer-note { color: var(--muted); font-size: 14px; }
.pf-socials { display: flex; gap: 22px; font-size: 14px; color: var(--muted); }
.pf-socials a:hover { color: var(--accent); }

/* ---------- empty image placeholder ---------- */
.pf-ph {
  width: 100%; height: 100%;
  display: grid; place-items: center;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%),
    repeating-linear-gradient(45deg, var(--border) 0 1px, transparent 1px 11px);
  color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
}

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .pf-hero-split .pf-hero-grid,
  .pf-about-grid,
  .pf-contact-card { grid-template-columns: 1fr; }
  .pf-hero-media { aspect-ratio: 16 / 10; }
  .pf-cards, .pf-quotes { grid-template-columns: 1fr 1fr; }
  .pf-work-grid { grid-template-columns: 1fr; }
  .pf-links { display: none; }
}
@media (max-width: 620px) {
  .pf-cards, .pf-quotes, .pf-stats { grid-template-columns: 1fr; }
  .pf-stats { gap: 18px; }
  .pf-wrap { padding: 0 18px; }
}
`.trim();
}
