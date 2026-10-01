import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getSite } from "@/lib/store";
import { buildDocument } from "@/templates/document";
import { inlineSiteImages, slugify } from "@/lib/inline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Publish" for a local-first project: writes the finished site to
 * ./exports/<name>/index.html inside the project folder. No hosting involved —
 * you can open it, zip it, or drop it on any host later.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const site = await getSite(params.id);
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });

  const inlined = await inlineSiteImages(site);
  const html = buildDocument(inlined, { editable: false });

  const folder = path.join(process.cwd(), "exports", slugify(site.content.brand.name));
  await fs.mkdir(folder, { recursive: true });
  const file = path.join(folder, "index.html");
  await fs.writeFile(file, html, "utf8");

  return NextResponse.json({
    ok: true,
    file,
    relative: path.relative(process.cwd(), file),
    bytes: Buffer.byteLength(html, "utf8"),
  });
}
