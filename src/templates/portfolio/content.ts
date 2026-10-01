import type { Brief, PortfolioContent } from "@/lib/types";

const img = (alt: string) => ({ src: "", alt });

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * A complete, never-empty Portfolio content object.
 * Used as (a) the shape the AI must fill, and (b) the fallback if the AI call
 * fails or returns something malformed — so the flow never breaks.
 */
export function defaultPortfolioContent(brief?: Partial<Brief>): PortfolioContent {
  const name = brief?.businessName?.trim() || "Studio Nord";
  const industry = brief?.industry?.trim() || "design studio";
  const services = (brief?.offerings || "Brand identity, Web design, Art direction")
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const svc = (i: number, fallback: string) => services[i] || fallback;

  return {
    brand: { name, initials: initialsOf(name) },
    nav: {
      links: [
        { label: "About", target: "about" },
        { label: "Services", target: "services" },
        { label: "Work", target: "work" },
        { label: "Contact", target: "contact" },
      ],
      ctaLabel: "Get in touch",
    },
    hero: {
      eyebrow: `${industry}`,
      headline: `Work that earns a second look.`,
      subheadline: `${name} builds clear, considered work for people who care how things feel — not just how they look.`,
      ctaPrimary: "See the work",
      ctaSecondary: "Start a project",
      image: img(`${name} hero image`),
    },
    about: {
      kicker: "About",
      title: "A small studio with a long attention span.",
      body: `${name} is a ${industry} that takes on a handful of projects at a time. That means fewer handoffs, faster answers, and work that actually ships.\n\nEvery project starts the same way: understand the problem properly, then make something honest about it.`,
      stats: [
        { value: "40+", label: "Projects delivered" },
        { value: "8", label: "Years of practice" },
        { value: "100%", label: "Clients who return" },
      ],
      image: img("Portrait or workspace photo"),
    },
    services: {
      kicker: "Services",
      title: "What I can help you with",
      subtitle: "Three ways to work together, scoped to fit the size of the problem.",
      items: [
        {
          title: svc(0, "Brand identity"),
          description:
            "A name, a mark, and a system that holds up across everything you make — not just a logo file.",
        },
        {
          title: svc(1, "Web design"),
          description:
            "Sites that load fast, read clearly, and give people an obvious next step to take.",
        },
        {
          title: svc(2, "Art direction"),
          description:
            "A consistent visual voice for campaigns, content, and everything in between.",
        },
      ],
    },
    work: {
      kicker: "Selected work",
      title: "Recent projects",
      subtitle: "A few things I'm happy to talk about.",
      projects: [
        {
          title: "Northline Coffee",
          category: "Identity",
          description: "A full rebrand for a neighbourhood roaster, from cup to storefront.",
          image: img("Northline Coffee project"),
        },
        {
          title: "Atlas Fitness",
          category: "Web",
          description: "A one-page site that tripled trial sign-ups in the first month.",
          image: img("Atlas Fitness project"),
        },
        {
          title: "Meridian Law",
          category: "Identity",
          description: "Quiet, confident branding for a practice that hates looking like a law firm.",
          image: img("Meridian Law project"),
        },
        {
          title: "Field Notes",
          category: "Art direction",
          description: "Photography and layout direction for a twice-yearly print journal.",
          image: img("Field Notes project"),
        },
      ],
    },
    testimonials: {
      kicker: "Kind words",
      title: "What people say",
      items: [
        {
          quote:
            "They understood the business in one meeting and the work showed it. We've had more inbound in three months than in the two years before.",
          name: "Layal Haddad",
          role: "Founder, Northline",
        },
        {
          quote:
            "Fast, calm, and completely unprecious about feedback. Rare combination.",
          name: "Omar Nasr",
          role: "Director, Atlas",
        },
        {
          quote:
            "The site does the selling now, which means I can go back to doing the job.",
          name: "Rita Khoury",
          role: "Partner, Meridian",
        },
      ],
    },
    contact: {
      kicker: "Contact",
      title: "Have something in mind?",
      body: "Tell me what you're working on and roughly when it needs to be live. I'll come back within a day with whether I'm the right fit.",
      email: "hello@example.com",
      phone: "+961 00 000 000",
      location: "Beirut, Lebanon",
      ctaLabel: "Send an email",
    },
    footer: {
      note: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
      socials: [
        { label: "Instagram", url: "#" },
        { label: "LinkedIn", url: "#" },
        { label: "Behance", url: "#" },
      ],
    },
  };
}

/**
 * The JSON contract we hand to Mistral. Kept next to the content shape so the
 * two never drift apart.
 */
export const PORTFOLIO_JSON_SHAPE = `{
  "brand": { "name": string, "initials": string (2 letters, uppercase) },
  "nav": { "ctaLabel": string (2-3 words) },
  "hero": {
    "eyebrow": string (2-4 words, e.g. the discipline or location),
    "headline": string (4-9 words, the single strongest promise, no company name),
    "subheadline": string (1-2 sentences, max 28 words),
    "ctaPrimary": string (2-3 words),
    "ctaSecondary": string (2-3 words)
  },
  "about": {
    "title": string (5-10 words),
    "body": string (2 short paragraphs separated by \\n\\n, max 70 words total),
    "stats": [ { "value": string (short, e.g. "40+", "8", "100%"), "label": string (2-3 words) } ] (exactly 3)
  },
  "services": {
    "title": string (3-6 words),
    "subtitle": string (one sentence, max 18 words),
    "items": [ { "title": string (1-3 words), "description": string (one sentence, max 22 words) } ] (exactly 3)
  },
  "work": {
    "title": string (2-4 words),
    "subtitle": string (one short sentence),
    "projects": [ { "title": string (1-3 words, a plausible client name), "category": string (1-2 words), "description": string (one sentence, max 18 words) } ] (exactly 4)
  },
  "testimonials": {
    "title": string (2-4 words),
    "items": [ { "quote": string (1-2 sentences, max 32 words, sounds like a real person), "name": string (a full name), "role": string (job title + company) } ] (exactly 3)
  },
  "contact": {
    "title": string (3-6 words),
    "body": string (one or two sentences, max 30 words),
    "ctaLabel": string (2-3 words)
  },
  "footer": { "note": string (a one-line copyright) }
}`;
