import { NextResponse } from "next/server";
import { mistralJson, MistralError } from "@/lib/mistral";
import { deepFill, getByPath } from "@/lib/paths";
import type { Brief, PortfolioContent, SectionId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are a senior website copywriter for small businesses.
Plain, concrete, specific. No marketing filler ("unlock", "elevate", "seamless", "passionate about").
You always reply with a single valid JSON object and nothing else.`;

/** Length + purpose guidance per slot, so rewrites stay inside the layout. */
const SLOT_HINTS: Record<string, string> = {
  "hero.eyebrow": "2-4 words. The discipline, category or location. Not a sentence.",
  "hero.headline": "4-9 words. The single strongest promise. No business name.",
  "hero.subheadline": "1-2 sentences, max 28 words. Says who it's for and why it's worth it.",
  "hero.ctaPrimary": "2-3 words on a button.",
  "hero.ctaSecondary": "2-3 words on a secondary button.",
  "about.title": "5-10 words. A statement, not a label.",
  "about.body": "Two short paragraphs separated by a blank line. Max 70 words total.",
  "services.title": "3-6 words.",
  "services.subtitle": "One sentence, max 18 words.",
  "work.title": "2-4 words.",
  "work.subtitle": "One short sentence.",
  "testimonials.title": "2-4 words.",
  "contact.title": "3-6 words. An invitation.",
  "contact.body": "One or two sentences, max 30 words.",
  "contact.ctaLabel": "2-3 words on a button.",
  "nav.ctaLabel": "2-3 words on a button.",
};

function hintFor(path: string) {
  if (SLOT_HINTS[path]) return SLOT_HINTS[path];
  if (/services\.items\.\d+\.title$/.test(path)) return "1-3 words. A service name.";
  if (/services\.items\.\d+\.description$/.test(path))
    return "One sentence, max 22 words, describing the service concretely.";
  if (/work\.projects\.\d+\.title$/.test(path)) return "1-3 words. A plausible client or project name.";
  if (/work\.projects\.\d+\.category$/.test(path)) return "1-2 words. A kind of work.";
  if (/work\.projects\.\d+\.description$/.test(path)) return "One sentence, max 18 words.";
  if (/testimonials\.items\.\d+\.quote$/.test(path))
    return "1-2 sentences, max 32 words, in a real customer's voice.";
  if (/testimonials\.items\.\d+\.name$/.test(path)) return "An ordinary full name.";
  if (/testimonials\.items\.\d+\.role$/.test(path)) return "Job title and company.";
  if (/about\.stats\.\d+\.value$/.test(path)) return "A very short figure, e.g. 40+, 8, 100%.";
  if (/about\.stats\.\d+\.label$/.test(path)) return "2-3 words describing the figure.";
  if (/footer\.note$/.test(path)) return "A single short footer line.";
  return "Keep it roughly the same length as the current text.";
}

type Body = {
  kind: "slot" | "section";
  brief: Brief;
  content: PortfolioContent;
  /** For kind=slot */
  path?: string;
  /** For kind=section */
  section?: SectionId;
  /** Optional free-text steer from the owner. */
  instruction?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { kind, brief, content, instruction } = body;
  const context = `BUSINESS: ${brief?.businessName || ""}
WHAT THEY DO: ${brief?.industry || ""}
TONE: ${brief?.tone || "professional"}
KEY OFFERINGS: ${brief?.offerings || ""}`;

  try {
    if (kind === "slot") {
      const path = body.path || "";
      const current = String(getByPath(content, path) ?? "");
      const raw = await mistralJson({
        system: SYSTEM,
        user: `Rewrite one piece of text on a portfolio website.

${context}

FIELD: ${path}
WHAT THIS FIELD IS: ${hintFor(path)}
CURRENT TEXT: ${JSON.stringify(current)}
${instruction ? `THE OWNER ASKS: ${instruction}` : "Make it sharper and more specific. Do not simply reword it."}

Reply with: {"value": "the new text"}`,
        temperature: 0.85,
        maxTokens: 400,
      });
      const value = typeof raw?.value === "string" ? raw.value.trim() : "";
      if (!value) throw new MistralError("Mistral returned no text for that field.", 502);
      return NextResponse.json({ value });
    }

    if (kind === "section") {
      const section = body.section as SectionId;
      const current = getByPath(content, section);
      if (!current) {
        return NextResponse.json({ error: `Unknown section "${section}".` }, { status: 400 });
      }
      const raw = await mistralJson({
        system: SYSTEM,
        user: `Rewrite the "${section}" section of a portfolio website.

${context}

CURRENT SECTION JSON:
${JSON.stringify(current, null, 2)}

Rules:
- Return the SAME JSON structure: exactly the same keys, and arrays of exactly the same length.
- Do not include any key named "image".
- Change the words, not the shape. Keep every string roughly the same length as it is now.
${instruction ? `- The owner asks: ${instruction}` : "- Make it more specific and more concrete."}

Reply with the JSON object for this section only.`,
        temperature: 0.85,
        maxTokens: 1600,
      });
      const merged = deepFill(current, raw);
      return NextResponse.json({ section, value: merged });
    }

    return NextResponse.json({ error: 'kind must be "slot" or "section".' }, { status: 400 });
  } catch (e: any) {
    const err = e instanceof MistralError ? e : new MistralError(String(e?.message || e));
    return NextResponse.json(
      { error: err.message, detail: err.detail || undefined },
      { status: err.status >= 400 && err.status < 600 ? err.status : 500 }
    );
  }
}
