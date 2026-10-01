import type { PortfolioContent, SectionId } from "@/lib/types";

export type FieldDef = {
  path: string;
  label: string;
  multiline?: boolean;
  /** Rewriting a name or an email address with AI makes no sense. */
  noAi?: boolean;
};

export type FieldGroup = {
  /** Sections map to a SectionId so "rewrite this section" works. */
  section?: SectionId;
  key: string;
  label: string;
  fields: FieldDef[];
};

export function contentFields(c: PortfolioContent): FieldGroup[] {
  return [
    {
      key: "brand",
      label: "Brand & navigation",
      fields: [
        { path: "brand.name", label: "Business name", noAi: true },
        { path: "brand.initials", label: "Logo initials", noAi: true },
        { path: "nav.ctaLabel", label: "Header button" },
        ...c.nav.links.map((_, i) => ({
          path: `nav.links.${i}.label`,
          label: `Nav link ${i + 1}`,
          noAi: true,
        })),
      ],
    },
    {
      section: "hero",
      key: "hero",
      label: "Hero",
      fields: [
        { path: "hero.eyebrow", label: "Eyebrow" },
        { path: "hero.headline", label: "Headline", multiline: true },
        { path: "hero.subheadline", label: "Sub-headline", multiline: true },
        { path: "hero.ctaPrimary", label: "Primary button" },
        { path: "hero.ctaSecondary", label: "Secondary button" },
      ],
    },
    {
      section: "about",
      key: "about",
      label: "About",
      fields: [
        { path: "about.kicker", label: "Kicker" },
        { path: "about.title", label: "Title", multiline: true },
        { path: "about.body", label: "Body", multiline: true },
        ...c.about.stats.flatMap((_, i) => [
          { path: `about.stats.${i}.value`, label: `Stat ${i + 1} — figure` },
          { path: `about.stats.${i}.label`, label: `Stat ${i + 1} — label` },
        ]),
      ],
    },
    {
      section: "services",
      key: "services",
      label: "Services",
      fields: [
        { path: "services.kicker", label: "Kicker" },
        { path: "services.title", label: "Title" },
        { path: "services.subtitle", label: "Subtitle", multiline: true },
        ...c.services.items.flatMap((_, i) => [
          { path: `services.items.${i}.title`, label: `Service ${i + 1} — title` },
          {
            path: `services.items.${i}.description`,
            label: `Service ${i + 1} — description`,
            multiline: true,
          },
        ]),
      ],
    },
    {
      section: "work",
      key: "work",
      label: "Work",
      fields: [
        { path: "work.kicker", label: "Kicker" },
        { path: "work.title", label: "Title" },
        { path: "work.subtitle", label: "Subtitle", multiline: true },
        ...c.work.projects.flatMap((_, i) => [
          { path: `work.projects.${i}.title`, label: `Project ${i + 1} — title` },
          { path: `work.projects.${i}.category`, label: `Project ${i + 1} — category` },
          {
            path: `work.projects.${i}.description`,
            label: `Project ${i + 1} — description`,
            multiline: true,
          },
        ]),
      ],
    },
    {
      section: "testimonials",
      key: "testimonials",
      label: "Testimonials",
      fields: [
        { path: "testimonials.kicker", label: "Kicker" },
        { path: "testimonials.title", label: "Title" },
        ...c.testimonials.items.flatMap((_, i) => [
          {
            path: `testimonials.items.${i}.quote`,
            label: `Quote ${i + 1}`,
            multiline: true,
          },
          { path: `testimonials.items.${i}.name`, label: `Quote ${i + 1} — name`, noAi: true },
          { path: `testimonials.items.${i}.role`, label: `Quote ${i + 1} — role` },
        ]),
      ],
    },
    {
      section: "contact",
      key: "contact",
      label: "Contact",
      fields: [
        { path: "contact.kicker", label: "Kicker" },
        { path: "contact.title", label: "Title" },
        { path: "contact.body", label: "Body", multiline: true },
        { path: "contact.email", label: "Email", noAi: true },
        { path: "contact.phone", label: "Phone", noAi: true },
        { path: "contact.location", label: "Location", noAi: true },
        { path: "contact.ctaLabel", label: "Button" },
      ],
    },
    {
      key: "footer",
      label: "Footer",
      fields: [
        { path: "footer.note", label: "Footer note" },
        ...c.footer.socials.flatMap((_, i) => [
          { path: `footer.socials.${i}.label`, label: `Link ${i + 1} — label`, noAi: true },
          { path: `footer.socials.${i}.url`, label: `Link ${i + 1} — URL`, noAi: true },
        ]),
      ],
    },
  ];
}

/** Every image slot in the template, for the Images tab. */
export function imageSlots(c: PortfolioContent) {
  return [
    { path: "hero.image", label: "Hero image", ref: c.hero.image },
    { path: "about.image", label: "About image", ref: c.about.image },
    ...c.work.projects.map((p, i) => ({
      path: `work.projects.${i}.image`,
      label: `Project ${i + 1} — ${p.title}`,
      ref: p.image,
    })),
  ];
}
