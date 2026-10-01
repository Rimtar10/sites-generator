import { getSite } from "@/lib/store";
import { buildDocument } from "@/templates/document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The finished site, exactly as it will be exported — no editing hooks,
 * no builder chrome. Images still point at /uploads so the page stays light.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const site = await getSite(params.id);
  if (!site) return new Response("Site not found.", { status: 404 });

  return new Response(buildDocument(site, { editable: false }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
