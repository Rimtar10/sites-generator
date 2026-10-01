import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Uploads live in .data/uploads and are served back by /api/media/<name>.
 *
 * They deliberately do NOT go in public/ — Next only serves files that were in
 * public/ at build time, so anything uploaded after `npm run build` would 404.
 */
const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected a multipart form upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }
  if (!EXT[file.type]) {
    return NextResponse.json(
      {
        error: `Unsupported image type "${file.type || "unknown"}". Use PNG, JPG, WEBP, GIF, AVIF or SVG.`,
      },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(file.size / 1048576).toFixed(1)} MB. The limit is 8 MB.` },
      { status: 413 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}${EXT[file.type]}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);

  return NextResponse.json({ src: `/api/media/${name}`, bytes: buf.length });
}
