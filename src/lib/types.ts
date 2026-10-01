// ---------------------------------------------------------------------------
// Shared types for the whole builder.
// ---------------------------------------------------------------------------

/** The 4 questions we ask the business owner before generating anything. */
export type Brief = {
  businessName: string;
  industry: string;
  tone: Tone;
  offerings: string; // free text: "logo design, brand identity, web design"
};

export type Tone =
  | "friendly"
  | "professional"
  | "elegant"
  | "playful"
  | "bold"
  | "minimal";

export const TONES: { id: Tone; label: string; hint: string }[] = [
  { id: "friendly", label: "Friendly", hint: "Warm, human, easy to read" },
  { id: "professional", label: "Professional", hint: "Clear, credible, no fluff" },
  { id: "elegant", label: "Elegant", hint: "Refined, calm, a little poetic" },
  { id: "playful", label: "Playful", hint: "Light, witty, energetic" },
  { id: "bold", label: "Bold", hint: "Short punchy lines, confident" },
  { id: "minimal", label: "Minimal", hint: "Few words, lots of space" },
];

/** An image slot. `src` is either /uploads/x.png, a data: URI, or "" (empty). */
export type ImageRef = {
  src: string;
  alt: string;
};

// --- Portfolio template content shape -------------------------------------
// Every string here is an editable "slot" in the template.

export type PortfolioContent = {
  brand: { name: string; initials: string };
  nav: { links: { label: string; target: string }[]; ctaLabel: string };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: ImageRef;
  };
  about: {
    kicker: string;
    title: string;
    body: string;
    stats: { value: string; label: string }[];
    image: ImageRef;
  };
  services: {
    kicker: string;
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  work: {
    kicker: string;
    title: string;
    subtitle: string;
    projects: { title: string; category: string; description: string; image: ImageRef }[];
  };
  testimonials: {
    kicker: string;
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  contact: {
    kicker: string;
    title: string;
    body: string;
    email: string;
    phone: string;
    location: string;
    ctaLabel: string;
  };
  footer: {
    note: string;
    socials: { label: string; url: string }[];
  };
};

/** Which sections are switched on, and in which order they render. */
export type SectionId =
  | "hero"
  | "about"
  | "services"
  | "work"
  | "testimonials"
  | "contact";

export const SECTION_ORDER: SectionId[] = [
  "hero",
  "about",
  "services",
  "work",
  "testimonials",
  "contact",
];

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  work: "Work",
  testimonials: "Testimonials",
  contact: "Contact",
};

// --- Design -----------------------------------------------------------------

export type Palette = {
  id: string;
  name: string;
  mode: "light" | "dark";
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
};

export type FontPair = {
  id: string;
  name: string;
  heading: string;
  body: string;
  /** Google Fonts href, or "" for system fonts. */
  googleHref: string;
  headingWeight: number;
  /** Extra letter-spacing for display headings, in em. */
  headingTracking: string;
};

export type Design = {
  paletteId: string;
  fontId: string;
  /** Corner rounding across the site. */
  radius: "sharp" | "soft" | "round";
  /** Hero composition variant. */
  heroLayout: "split" | "centered" | "stacked";
  /** Density of vertical rhythm. */
  spacing: "compact" | "comfortable" | "airy";
};

// --- A saved site -----------------------------------------------------------

export type Site = {
  id: string;
  templateId: "portfolio";
  brief: Brief;
  content: PortfolioContent;
  design: Design;
  sections: SectionId[];
  createdAt: string;
  updatedAt: string;
};
