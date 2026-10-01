"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TONES, type Brief, type Tone } from "@/lib/types";
import { Arrow, Loader, Spark, Warn } from "@/components/Icons";

const INDUSTRY_SUGGESTIONS = [
  "Graphic designer",
  "Photographer",
  "Web developer",
  "Architecture studio",
  "Interior designer",
  "Marketing consultant",
  "Illustrator",
  "Videographer",
];

const STEPS = ["Your name", "What you do", "Tone", "What you offer"];

export default function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brief, setBrief] = useState<Brief>({
    businessName: "",
    industry: "",
    tone: "professional",
    offerings: "",
  });

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) =>
    setBrief((b) => ({ ...b, [k]: v }));

  const canAdvance =
    (step === 0 && brief.businessName.trim().length > 0) ||
    (step === 1 && brief.industry.trim().length > 0) ||
    step === 2 ||
    (step === 3 && brief.offerings.trim().length > 0);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const gen = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });
      const data = await gen.json();
      if (!gen.ok) throw new Error(data?.error || "Generation failed.");

      const created = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, content: data.content }),
      });
      const saved = await created.json();
      if (!created.ok) throw new Error(saved?.error || "Could not save the site.");

      const q = data.warning
        ? `?notice=${encodeURIComponent(data.warning)}`
        : data.source === "mistral"
        ? "?notice=ok"
        : "";
      router.push(`/editor/${saved.site.id}${q}`);
    } catch (e: any) {
      setError(String(e?.message || e));
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && step < 3 && canAdvance) {
      e.preventDefault();
      setStep(step + 1);
    }
  }

  if (busy) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="fade-in w-full max-w-md text-center">
          <Loader className="mx-auto h-7 w-7 text-[#7c6cff]" />
          <h1 className="mt-6 text-[22px] font-semibold tracking-tight">
            Writing your website
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#8a8a98]">
            Mistral is drafting the headline, about section, services, sample work and
            testimonials for {brief.businessName || "your business"}. This takes a few
            seconds.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <header className="mb-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7c6cff] text-[13px] font-bold text-white">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight">SiteSmith</span>
        </Link>
        <span className="rounded-full border border-[#26262e] px-3 py-1 text-[12px] text-[#8a8a98]">
          Portfolio template
        </span>
      </header>

      {/* progress */}
      <div className="mb-10 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors ${
                i <= step ? "bg-[#7c6cff]" : "bg-[#1e1e26]"
              }`}
            />
            <div
              className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                i === step ? "text-[#a89bff]" : "text-[#4e4e5c]"
              }`}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      <div key={step} className="fade-in" onKeyDown={onKeyDown}>
        {step === 0 && (
          <>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">
              What&apos;s the business called?
            </h1>
            <p className="mt-3 text-[15px] text-[#8a8a98]">
              Your name works too, if you&apos;re the product.
            </p>
            <input
              autoFocus
              className="field mt-8 !py-4 !text-[17px]"
              placeholder="e.g. Rim Tarhini, or Studio Nord"
              value={brief.businessName}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">What do you do?</h1>
            <p className="mt-3 text-[15px] text-[#8a8a98]">
              A few words is enough. This shapes everything the AI writes.
            </p>
            <input
              autoFocus
              className="field mt-8 !py-4 !text-[17px]"
              placeholder="e.g. freelance brand designer"
              value={brief.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {INDUSTRY_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("industry", s)}
                  className="rounded-full border border-[#26262e] px-3 py-1.5 text-[13px] text-[#9a9aa8] transition hover:border-[#7c6cff] hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">
              How should it sound?
            </h1>
            <p className="mt-3 text-[15px] text-[#8a8a98]">
              This changes the writing, not the layout.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {TONES.map((t) => {
                const active = brief.tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("tone", t.id as Tone)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#7c6cff] bg-[#7c6cff]/10"
                        : "border-[#26262e] bg-[#0d0d11] hover:border-[#3b3b47]"
                    }`}
                  >
                    <div className="text-[15px] font-semibold">{t.label}</div>
                    <div className="mt-1 text-[13px] text-[#8a8a98]">{t.hint}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">
              What do you offer?
            </h1>
            <p className="mt-3 text-[15px] text-[#8a8a98]">
              Two or three things, separated by commas. These become your services.
            </p>
            <textarea
              autoFocus
              rows={4}
              className="field mt-8 resize-none !text-[16px]"
              placeholder="Brand identity, Web design, Art direction"
              value={brief.offerings}
              onChange={(e) => set("offerings", e.target.value)}
            />
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#4a2020] bg-[#1d0f0f] p-4 text-[14px] text-[#ffb4b4]">
          <Warn className="mt-0.5 h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="btn-ghost"
          disabled={step === 0}
        >
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="btn-primary"
            disabled={!canAdvance}
          >
            Continue <Arrow />
          </button>
        ) : (
          <button
            type="button"
            onClick={generate}
            className="btn-primary"
            disabled={!canAdvance}
          >
            <Spark /> Generate my website
          </button>
        )}
      </div>
    </main>
  );
}
