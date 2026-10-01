import { NextResponse } from "next/server";
import { readSites, createSite, newId } from "@/lib/store";
import { TEMPLATE_IMPL } from "@/templates/registry";
import { DEFAULT_DESIGN } from "@/templates/themes";
import { defaultPortfolioContent } from "@/templates/portfolio/content";
import type { Site } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sites = await readSites();
  return NextResponse.json({ sites });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const templateId = "portfolio" as const;
  const impl = TEMPLATE_IMPL[templateId];

  const site: Omit<Site, "createdAt" | "updatedAt"> = {
    id: newId(),
    templateId,
    brief: body.brief ?? {
      businessName: "",
      industry: "",
      tone: "professional",
      offerings: "",
    },
    content: body.content ?? defaultPortfolioContent(body.brief),
    design: { ...DEFAULT_DESIGN, ...(body.design ?? {}) },
    sections: body.sections ?? impl.defaultSections,
  };

  const created = await createSite(site);
  return NextResponse.json({ site: created }, { status: 201 });
}
