import { NextResponse } from "next/server";
import { mistralJson, MistralError, mistralModel } from "@/lib/mistral";
import { deepFill } from "@/lib/paths";
import { defaultPortfolioContent, PORTFOLIO_JSON_SHAPE } from "@/templates/portfolio/content";
import type { Brief, PortfolioContent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are a senior website copywriter for small businesses and independent professionals.

How you write:
- Plain, concrete, specific. Short sentences.
- You never use marketing filler: "unlock", "elevate", "seamless", "cutting-edge", "passionate about", "we are dedicated to", "in today's fast-paced world".
- You never repeat the business name in every heading.
- Headlines say something real, not something vague.
- You write in the requested tone without announcing the tone.
- Everything is in English unless the brief is clearly in another language, in which case you match it.

You always reply with a single valid JSON object and nothing else. No markdown, no commentary.`;

function userPrompt(brief: Brief) {
  return `Write the copy for a one-page portfolio website.

BUSINESS NAME: ${brief.businessName}
WHAT THEY DO: ${brief.industry}
TONE: ${brief.tone}
KEY OFFERINGS: ${brief.offerings}

Fill in exactly this JSON shape. Respect every length limit. The bracketed notes are instructions, not values to copy.

${PORTFOLIO_JSON_SHAPE}

Rules:
- "services.items" must reflect the KEY OFFERINGS above. If fewer than 3 offerings are given, invent closely-related ones that fit the business.
- "work.projects" should be realistic, believable sample projects for this kind of business. Use plausible client names, not "Project One".
- "testimonials.items" must sound like real customers of THIS kind of business, with ordinary human names.
- "about.stats" must be plausible for a small business. Do not invent absurd numbers.
- Do not include any contact details, emails, phone numbers or URLs.
- Return only the JSON object.`;
}

export async function POST(req: Request) {
  let brief: Brief;
  try {
    brief = (await req.json()) as Brief;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!brief?.businessName?.trim() || !brief?.industry?.trim()) {
    return NextResponse.json(
      { error: "Business name and what you do are both required." },
      { status: 400 }
    );
  }

  const fallback = defaultPortfolioContent(brief);

  try {
    const raw = await mistralJson({
      system: SYSTEM,
      user: userPrompt(brief),
      temperature: 0.75,
      maxTokens: 2600,
    });

    // Merge over the defaults so a partial or malformed answer still renders.
    const content = deepFill<PortfolioContent>(fallback, raw);

    // Keep the owner's own facts authoritative — the model doesn't get to rename them.
    content.brand.name = brief.businessName.trim();
    content.footer.note = `© ${new Date().getFullYear()} ${content.brand.name}. All rights reserved.`;

    return NextResponse.json({ content, model: mistralModel(), source: "mistral" });
  } catch (e: any) {
    const err = e instanceof MistralError ? e : new MistralError(String(e?.message || e));
    // The flow never breaks: hand back sensible starter copy plus a clear warning.
    return NextResponse.json(
      {
        content: fallback,
        source: "fallback",
        warning: err.message,
        detail: err.detail || undefined,
      },
      { status: 200 }
    );
  }
}
