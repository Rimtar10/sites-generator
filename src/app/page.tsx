import Link from "next/link";
import { TEMPLATES } from "@/templates/registry";
import { PALETTES } from "@/templates/themes";
import { Arrow, Spark } from "@/components/Icons";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-10">
      {/* top bar */}
      <header className="mb-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7c6cff] text-[13px] font-bold text-white">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight">SiteSmith</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/sites" className="btn-ghost btn-sm">
            My sites
          </Link>
          <Link href="/new" className="btn-primary btn-sm">
            Start building
          </Link>
        </nav>
      </header>

      {/* hero */}
      <section className="fade-in max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#26262e] bg-[#101014] px-3 py-1 text-[12px] font-medium text-[#a8a8b6]">
          <Spark className="h-3.5 w-3.5 text-[#7c6cff]" />
          Powered by Mistral AI
        </span>
        <h1 className="mt-7 text-[clamp(38px,6vw,62px)] font-bold leading-[1.03] tracking-[-0.035em]">
          A one-page website that
          <br />
          fills itself in.
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#9a9aa8]">
          Most builders hand you a blank template and wish you luck. Pick a design,
          answer four questions about your business, and get a finished site back —
          headlines, copy, the lot. Then change whatever you like.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/new" className="btn-primary">
            Build my site <Arrow />
          </Link>
          <Link href="/sites" className="btn-ghost">
            Open a saved site
          </Link>
        </div>
      </section>

      {/* how it works */}
      <section className="mt-24 grid gap-4 sm:grid-cols-3">
        {[
          {
            n: "01",
            t: "Pick a template",
            d: "Each one is a complete, responsive layout. Colours, fonts and spacing are yours to change.",
          },
          {
            n: "02",
            t: "Answer four questions",
            d: "Name, what you do, the tone you want, and what you offer. That's the whole brief.",
          },
          {
            n: "03",
            t: "Edit and download",
            d: "Click any text to rewrite it, swap in your photos, then export one HTML file that just works.",
          },
        ].map((s) => (
          <div key={s.n} className="panel p-6">
            <span className="text-[12px] font-bold tracking-[0.14em] text-[#7c6cff]">{s.n}</span>
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{s.t}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a98]">{s.d}</p>
          </div>
        ))}
      </section>

      {/* templates */}
      <section className="mt-24">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.02em]">Templates</h2>
            <p className="mt-2 text-[15px] text-[#8a8a98]">
              One is live and fully working. The rest use the same engine and slot in next.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const live = t.status === "live";
            const card = (
              <div
                className={`panel group h-full overflow-hidden transition ${
                  live ? "hover:border-[#7c6cff]" : "opacity-55"
                }`}
              >
                <div
                  className="relative h-40 border-b border-[#1e1e26]"
                  style={{ background: t.swatch[0] }}
                >
                  <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-7">
                    <div
                      className="h-2.5 w-24 rounded-full"
                      style={{ background: t.swatch[1] }}
                    />
                    <div
                      className="h-4 w-44 rounded"
                      style={{ background: t.swatch[2], opacity: 0.92 }}
                    />
                    <div
                      className="h-4 w-32 rounded"
                      style={{ background: t.swatch[2], opacity: 0.5 }}
                    />
                    <div className="mt-2 flex gap-2">
                      <div
                        className="h-6 w-20 rounded-full"
                        style={{ background: t.swatch[1] }}
                      />
                      <div
                        className="h-6 w-20 rounded-full border"
                        style={{ borderColor: t.swatch[2], opacity: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-semibold tracking-tight">{t.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                        live
                          ? "bg-[#7c6cff]/15 text-[#a89bff]"
                          : "bg-[#1e1e26] text-[#6b6b7a]"
                      }`}
                    >
                      {live ? "Live" : "Soon"}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a98]">{t.blurb}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.bestFor.map((b) => (
                      <span
                        key={b}
                        className="rounded-md border border-[#26262e] px-2 py-1 text-[11px] text-[#7c7c8a]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  {live && (
                    <div className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-[#7c6cff]">
                      Use this template <Arrow className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );

            return live ? (
              <Link key={t.id} href={`/new?template=${t.id}`}>
                {card}
              </Link>
            ) : (
              <div key={t.id}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* palettes */}
      <section className="mt-24">
        <h2 className="text-[26px] font-bold tracking-[-0.02em]">
          {PALETTES.length} colour schemes, 6 type pairings
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-[#8a8a98]">
          Every template reads its colours, fonts, corner rounding and spacing from
          tokens, so switching the whole look is one click — and the site you export
          is exactly what you saw.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {PALETTES.map((p) => (
            <div
              key={p.id}
              className="panel flex items-center gap-3 px-4 py-3"
              title={p.name}
            >
              <div className="flex">
                {[p.bg, p.accent, p.text].map((c, i) => (
                  <span
                    key={i}
                    className="h-6 w-6 rounded-full border border-black/40"
                    style={{ background: c, marginLeft: i ? -8 : 0 }}
                  />
                ))}
              </div>
              <span className="text-[13px] font-medium text-[#b4b4c0]">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-24 border-t border-[#1a1a21] pt-8 text-[13px] text-[#5f5f6d]">
        Runs entirely on your machine. Sites are stored in <code className="text-[#8a8a98]">.data/sites.json</code>,
        images in <code className="text-[#8a8a98]">public/uploads/</code>.
      </footer>
    </main>
  );
}
