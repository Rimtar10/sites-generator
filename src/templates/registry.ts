import type { SectionId } from "@/lib/types";
import { defaultPortfolioContent, PORTFOLIO_JSON_SHAPE } from "./portfolio/content";
import { DEFAULT_DESIGN } from "./themes";

export type TemplateMeta = {
  id: string;
  name: string;
  blurb: string;
  bestFor: string[];
  sections: SectionId[];
  status: "live" | "soon";
  /** Preview swatch for the gallery card. */
  swatch: [string, string, string];
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    blurb:
      "A one-page site for people who sell their craft — freelancers, studios, photographers, consultants.",
    bestFor: ["Freelancer", "Design studio", "Photographer", "Consultant"],
    sections: ["hero", "about", "services", "work", "testimonials", "contact"],
    status: "live",
    swatch: ["#0b0c10", "#7c6cff", "#f2f3f5"],
  },
  // Next templates plug in here — same shape, same editor, same exporter.
  {
    id: "restaurant",
    name: "Restaurant",
    blurb: "Menu, hours, location and a booking call-to-action.",
    bestFor: ["Café", "Restaurant", "Bakery"],
    sections: ["hero", "about", "services", "contact"],
    status: "soon",
    swatch: ["#f6f1ea", "#c2703d", "#2a2119"],
  },
  {
    id: "salon",
    name: "Salon",
    blurb: "Service list with prices, gallery, and a WhatsApp booking button.",
    bestFor: ["Salon", "Barber", "Spa"],
    sections: ["hero", "services", "work", "contact"],
    status: "soon",
    swatch: ["#fdf6f6", "#d6446b", "#2a1b1e"],
  },
];

export const LIVE_TEMPLATE_IDS = TEMPLATES.filter((t) => t.status === "live").map(
  (t) => t.id
);

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

/** Everything a template needs to be buildable. Only Portfolio is wired up today. */
export const TEMPLATE_IMPL = {
  portfolio: {
    defaultContent: defaultPortfolioContent,
    jsonShape: PORTFOLIO_JSON_SHAPE,
    defaultDesign: DEFAULT_DESIGN,
    defaultSections: [
      "hero",
      "about",
      "services",
      "work",
      "testimonials",
      "contact",
    ] as SectionId[],
  },
};
