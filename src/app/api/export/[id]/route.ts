import { getSite } from "@/lib/store";
import { buildDocument } from "@/templates/document";
import { inlineSiteImages, slugify } from "@/lib/inline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Downloads the finished website as ONE self-contained index.html:
 * template markup + inlined CSS + base64 images. Double-click and it works.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const site = await getSite(params.id);
  if (!site) {
    return new Response("Site not found.", { status: 404 });
  }

  const inlined = await inlineSiteImages(site);
  const html = buildDocument(inlined, { editable: false });
  const name = `${slugify(site.content.brand.name)}.html`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
