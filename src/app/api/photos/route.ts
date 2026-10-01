import { NextResponse } from "next/server";
import { mistralJson } from "@/lib/mistral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Suggests stock photos for an image slot.
 *
 * Step 1 (Mistral): turn "what the business does" into good photo search terms.
 * Step 2 (Pexels): search, if a free PEXELS_API_KEY is set in .env.local.
 *
 * With no Pexels key this still returns the keywords, and the editor falls back
 * to upload-your-own. Nothing breaks.
 */
export async function POST(req: Request) {
  let body: { industry?: string; slot?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let keywords: string[] = [];

  if (body.query?.trim()) {
    keywords = [body.query.trim()];
  } else {
    try {
      const raw = await mistralJson({
        system:
          'You turn business descriptions into stock-photo search terms. Reply only with {"keywords": ["...", "...", "..."]}.',
        user: `Business: ${body.industry || "small business"}
Image slot on their website: ${body.slot || "hero"}

Give 3 short stock-photo search queries (2-4 words each) that would produce photos that actually fit this slot for this business. Concrete nouns and scenes, no adjectives like "beautiful" or "professional".`,
        temperature: 0.6,
        maxTokens: 200,
      });
      if (Array.isArray(raw?.keywords)) {
        keywords = raw.keywords.filter((k: any) => typeof k === "string").slice(0, 3);
      }
    } catch {
      keywords = [body.industry || "workspace"].filter(Boolean);
    }
  }

  if (!keywords.length) keywords = ["workspace"];

  const pexelsKey = process.env.PEXELS_API_KEY?.trim();
  if (!pexelsKey) {
    return NextResponse.json({
      keywords,
      photos: [],
      note: "No PEXELS_API_KEY set in .env.local, so there are no stock suggestions. Upload your own image, or add a free key from pexels.com/api and restart the dev server.",
    });
  }

  try {
    const q = encodeURIComponent(keywords[0]);
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${q}&per_page=12&orientation=landscape`,
      { headers: { Authorization: pexelsKey }, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({
        keywords,
        photos: [],
        note: `Pexels returned ${res.status}. Check PEXELS_API_KEY.`,
      });
    }
    const data = await res.json();
    const photos = (data?.photos ?? []).map((p: any) => ({
      id: String(p.id),
      thumb: p.src?.medium ?? p.src?.small,
      full: p.src?.large2x ?? p.src?.large ?? p.src?.original,
      alt: p.alt || keywords[0],
      credit: p.photographer,
    }));
    return NextResponse.json({ keywords, photos });
  } catch (e: any) {
    return NextResponse.json({
      keywords,
      photos: [],
      note: `Could not reach Pexels: ${String(e?.message || e)}`,
    });
  }
}
