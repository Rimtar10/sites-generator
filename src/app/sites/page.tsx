import Link from "next/link";
import { readSites } from "@/lib/store";
import { getPalette } from "@/templates/themes";
import { Arrow, Download, Eye } from "@/components/Icons";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const sites = await readSites();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7c6cff] text-[13px] font-bold text-white">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight">SiteSmith</span>
        </Link>
        <Link href="/new" className="btn-primary btn-sm">
          New site
        </Link>
      </header>

      <h1 className="text-[30px] font-bold tracking-[-0.03em]">My sites</h1>
      <p className="mt-2 text-[15px] text-[#8a8a98]">
        Stored locally in <code className="text-[#b4b4c0]">.data/sites.json</code>.
      </p>

      {sites.length === 0 ? (
        <div className="panel mt-10 p-12 text-center">
          <p className="text-[15px] text-[#8a8a98]">You haven&apos;t built anything yet.</p>
          <Link href="/new" className="btn-primary mt-6 inline-flex">
            Build your first site <Arrow />
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {sites.map((s) => {
            const p = getPalette(s.design.paletteId);
            return (
              <div
                key={s.id}
                className="panel flex flex-wrap items-center gap-4 p-4 transition hover:border-[#31313b]"
              >
                <div
                  className="grid h-14 w-14 flex-none place-items-center rounded-lg border border-black/40"
                  style={{ background: p.bg }}
                >
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: p.accent }}
                  >
                    {s.content.brand.initials}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] font-semibold tracking-tight">
                    {s.content.brand.name}
                  </div>
                  <div className="truncate text-[13px] text-[#7c7c8a]">
                    {s.brief.industry || "—"} · {p.name} · updated{" "}
                    {new Date(s.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-none items-center gap-2">
                  <a
                    href={`/preview/${s.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost btn-sm"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </a>
                  <a href={`/api/export/${s.id}`} className="btn-ghost btn-sm">
                    <Download className="h-3.5 w-3.5" /> HTML
                  </a>
                  <Link href={`/editor/${s.id}`} className="btn-primary btn-sm">
                    Edit
                  </Link>
                  <DeleteButton id={s.id} name={s.content.brand.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
