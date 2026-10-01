import type { Palette, FontPair, Design } from "@/lib/types";

export const PALETTES: Palette[] = [
  {
    id: "midnight",
    name: "Midnight",
    mode: "dark",
    bg: "#0b0c10",
    surface: "#14161c",
    text: "#f2f3f5",
    muted: "#9aa0ac",
    accent: "#7c6cff",
    accentText: "#ffffff",
    border: "#23262f",
  },
  {
    id: "ivory",
    name: "Ivory",
    mode: "light",
    bg: "#fbfaf7",
    surface: "#ffffff",
    text: "#16151a",
    muted: "#6d6a78",
    accent: "#1f1d26",
    accentText: "#ffffff",
    border: "#e7e4dc",
  },
  {
    id: "sand",
    name: "Sand",
    mode: "light",
    bg: "#f6f1ea",
    surface: "#fffdfa",
    text: "#2a2119",
    muted: "#7b6b59",
    accent: "#c2703d",
    accentText: "#ffffff",
    border: "#e5dacb",
  },
  {
    id: "forest",
    name: "Forest",
    mode: "dark",
    bg: "#0d1512",
    surface: "#14201b",
    text: "#eef4f0",
    muted: "#93a89c",
    accent: "#4ade80",
    accentText: "#06210f",
    border: "#1f2f27",
  },
  {
    id: "cobalt",
    name: "Cobalt",
    mode: "light",
    bg: "#f4f7fb",
    surface: "#ffffff",
    text: "#0f1b2d",
    muted: "#5d6b80",
    accent: "#2563eb",
    accentText: "#ffffff",
    border: "#dde5f0",
  },
  {
    id: "rose",
    name: "Rose",
    mode: "light",
    bg: "#fdf6f6",
    surface: "#ffffff",
    text: "#2a1b1e",
    muted: "#7d626a",
    accent: "#d6446b",
    accentText: "#ffffff",
    border: "#f0dfe2",
  },
  {
    id: "mono",
    name: "Mono",
    mode: "light",
    bg: "#ffffff",
    surface: "#fafafa",
    text: "#0a0a0a",
    muted: "#737373",
    accent: "#0a0a0a",
    accentText: "#ffffff",
    border: "#e5e5e5",
  },
  {
    id: "amber",
    name: "Amber",
    mode: "dark",
    bg: "#14110c",
    surface: "#1d1912",
    text: "#f7f2e8",
    muted: "#a8977c",
    accent: "#f0a830",
    accentText: "#1a1207",
    border: "#2b2419",
  },
];

export const FONT_PAIRS: FontPair[] = [
  {
    id: "grotesk",
    name: "Space Grotesk / Inter",
    heading: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap",
    headingWeight: 700,
    headingTracking: "-0.03em",
  },
  {
    id: "serif",
    name: "Fraunces / Inter",
    heading: "'Fraunces', Georgia, 'Times New Roman', serif",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600&display=swap",
    headingWeight: 700,
    headingTracking: "-0.02em",
  },
  {
    id: "editorial",
    name: "Playfair / Source Sans",
    heading: "'Playfair Display', Georgia, serif",
    body: "'Source Sans 3', ui-sans-serif, system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Source+Sans+3:wght@400;600&display=swap",
    headingWeight: 700,
    headingTracking: "-0.01em",
  },
  {
    id: "neue",
    name: "Manrope",
    heading: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    body: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap",
    headingWeight: 800,
    headingTracking: "-0.04em",
  },
  {
    id: "mono",
    name: "JetBrains Mono / Inter",
    heading: "'JetBrains Mono', ui-monospace, monospace",
    body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap",
    headingWeight: 700,
    headingTracking: "-0.04em",
  },
  {
    id: "system",
    name: "System (no webfont)",
    heading:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    body:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    googleHref: "",
    headingWeight: 700,
    headingTracking: "-0.03em",
  },
];

export const RADII: Record<Design["radius"], { sm: string; md: string; lg: string; pill: string }> = {
  sharp: { sm: "0px", md: "0px", lg: "0px", pill: "0px" },
  soft: { sm: "6px", md: "12px", lg: "20px", pill: "999px" },
  round: { sm: "12px", md: "22px", lg: "36px", pill: "999px" },
};

export const SPACING: Record<Design["spacing"], { section: string; gap: string }> = {
  compact: { section: "72px", gap: "28px" },
  comfortable: { section: "112px", gap: "40px" },
  airy: { section: "160px", gap: "56px" },
};

export const DEFAULT_DESIGN: Design = {
  paletteId: "midnight",
  fontId: "grotesk",
  radius: "soft",
  heroLayout: "split",
  spacing: "comfortable",
};

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function getFontPair(id: string): FontPair {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];
}
