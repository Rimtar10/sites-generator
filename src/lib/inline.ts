import fs from "node:fs/promises";
import path from "node:path";
import type { Site, ImageRef } from "./types";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

async function toDataUri(src: string): Promise<string> {
  if (!src) return "";
  if (src.startsWith("data:")) return src;

  // Local upload -> read straight off disk.
  if (src.startsWith("/api/media/")) {
    const name = path.basename(src.split("?")[0]);
    const file = path.join(process.cwd(), ".data", "uploads", name);
    try {
      const buf = await fs.readFile(file);
      const mime = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      return "";
    }
  }

  // Remote (e.g. a stock photo) -> fetch once and embed.
  if (/^https?:\/\//i.test(src)) {
    try {
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) return src;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 6 * 1024 * 1024) return src; // too big to embed; keep the URL
      const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      return src;
    }
  }

  return src;
}

/**
 * Returns a copy of the site with every image turned into a data: URI, so the
 * exported index.html is one file that works offline, anywhere.
 */
export async function inlineSiteImages(site: Site): Promise<Site> {
  const c = JSON.parse(JSON.stringify(site.content)) as Site["content"];

  const refs: ImageRef[] = [c.hero.image, c.about.image, ...c.work.projects.map((p) => p.image)];

  await Promise.all(
    refs.map(async (ref) => {
      if (ref && ref.src) ref.src = await toDataUri(ref.src);
    })
  );

  return { ...site, content: c };
}

/** A filesystem-safe file name from the business name. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 48) || "website"
  );
}
