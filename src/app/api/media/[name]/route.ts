import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

/** Serves an uploaded image back out of .data/uploads. */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  // Only ever a bare file name — no traversal out of the uploads folder.
  const name = path.basename(params.name);
  const ext = path.extname(name).toLowerCase();
  if (!MIME[ext]) return new Response("Not found", { status: 404 });

  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
