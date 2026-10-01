"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Design, ImageRef, SectionId, Site } from "@/lib/types";
import { SECTION_LABELS, SECTION_ORDER } from "@/lib/types";
import { buildDocument } from "@/templates/document";
import { FONT_PAIRS, PALETTES } from "@/templates/themes";
import { getByPath, setByPath } from "@/lib/paths";
import { contentFields, imageSlots } from "./fields";
import ImagePicker from "./ImagePicker";
import {
  Arrow,
  Check,
  Desktop,
  Download,
  Eye,
  Image as ImageIcon,
  Loader,
  Phone,
  Spark,
  Warn,
} from "@/components/Icons";

type Tab = "design" | "content" | "images" | "sections";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function Editor({ initialSite }: { initialSite: Site }) {
  const [site, setSite] = useState<Site>(initialSite);
  const [docRev, setDocRev] = useState(0);
  const [tab, setTab] = useState<Tab>("design");
  const [save, setSave] = useState<SaveState>("idle");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pickerPath, setPickerPath] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollY = useRef(0);
  const firstRun = useRef(true);

  // ---- one-time notice from the wizard -----------------------------------
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("notice");
    if (q && q !== "ok") setNotice(q);
    if (q) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  // ---- the preview document ----------------------------------------------
  // Rebuilt only when the structure changes; plain text edits are patched into
  // the live iframe instead, so typing never reloads the preview.
  const doc = useMemo(
    () => buildDocument(site, { editable: true, scrollY: scrollY.current }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docRev]
  );

  const postToFrame = useCallback((msg: any) => {
    iframeRef.current?.contentWindow?.postMessage({ __sitesmith: true, ...msg }, "*");
  }, []);

  // ---- messages coming back from the preview ------------------------------
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || !d.__sitesmith) return;
      if (d.type === "scroll") {
        scrollY.current = d.y || 0;
      } else if (d.type === "slot") {
        setSite((s) => ({ ...s, content: setByPath(s.content, d.path, d.value) }));
      } else if (d.type === "image") {
        setPickerPath(d.path);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ---- autosave to .data/sites.json ---------------------------------------
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSave("saving");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sites/${site.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: site.content,
            design: site.design,
            sections: site.sections,
            brief: site.brief,
          }),
        });
        setSave(res.ok ? "saved" : "error");
      } catch {
        setSave("error");
      }
    }, 700);
    return () => clearTimeout(t);
  }, [site]);

  // ---- editing helpers -----------------------------------------------------
  const setText = useCallback(
    (path: string, value: string) => {
      setSite((s) => ({ ...s, content: setByPath(s.content, path, value) }));
      postToFrame({ type: "patch", path, value });
    },
    [postToFrame]
  );

  const setImage = useCallback((path: string, next: ImageRef) => {
    setSite((s) => ({ ...s, content: setByPath(s.content, path, next) }));
    setDocRev((r) => r + 1);
  }, []);

  const setDesign = useCallback(<K extends keyof Design>(k: K, v: Design[K]) => {
    setSite((s) => ({ ...s, design: { ...s.design, [k]: v } }));
    setDocRev((r) => r + 1);
  }, []);

  const toggleSection = useCallback((id: SectionId) => {
    setSite((s) => {
      const on = s.sections.includes(id);
      const next = on
        ? s.sections.filter((x) => x !== id)
        : SECTION_ORDER.filter((x) => x === id || s.sections.includes(x));
      return { ...s, sections: next.length ? next : s.sections };
    });
    setDocRev((r) => r + 1);
  }, []);

  const moveSection = useCallback((id: SectionId, dir: -1 | 1) => {
    setSite((s) => {
      const arr = [...s.sections];
      const i = arr.indexOf(id);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, sections: arr };
    });
    setDocRev((r) => r + 1);
  }, []);

  // ---- AI rewriting --------------------------------------------------------
  async function rewriteSlot(path: string) {
    setBusyKey(path);
    setAiError(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "slot", path, brief: site.brief, content: site.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rewrite failed.");
      setText(path, data.value);
    } catch (e: any) {
      setAiError(String(e?.message || e));
    } finally {
      setBusyKey(null);
    }
  }

  async function rewriteSection(section: SectionId) {
    setBusyKey(section);
    setAiError(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "section", section, brief: site.brief, content: site.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rewrite failed.");

      setSite((s) => {
        const current: any = getByPath(s.content, section);
        // Never let the model touch the owner's images.
        const merged = mergeKeepImages(current, data.value);
        return { ...s, content: setByPath(s.content, section, merged) };
      });
      setDocRev((r) => r + 1);
    } catch (e: any) {
      setAiError(String(e?.message || e));
    } finally {
      setBusyKey(null);
    }
  }

  async function publishLocally() {
    setBusyKey("publish");
    setPublishMsg(null);
    try {
      const res = await fetch(`/api/publish/${site.id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Publish failed.");
      setPublishMsg(`Written to ${data.relative} (${Math.round(data.bytes / 1024)} KB)`);
    } catch (e: any) {
      setPublishMsg(String(e?.message || e));
    } finally {
      setBusyKey(null);
    }
  }

  const groups = useMemo(() => contentFields(site.content), [site.content]);
  const images = useMemo(() => imageSlots(site.content), [site.content]);
  const pickerRef: ImageRef | null = pickerPath
    ? (getByPath(site.content, pickerPath) as ImageRef)
    : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ---------------- top bar ---------------- */}
      <header className="flex flex-none items-center gap-4 border-b border-[#1a1a21] bg-[#0a0a0d] px-4 py-2.5">
        <Link href="/sites" className="flex items-center gap-2 text-[#8a8a98] hover:text-white">
          <Arrow className="h-4 w-4 rotate-180" />
          <span className="text-[13px] font-medium">Sites</span>
        </Link>

        <div className="h-5 w-px bg-[#1e1e26]" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold tracking-tight">
            {site.content.brand.name}
          </div>
          <div className="truncate text-[12px] text-[#5f5f6d]">
            Portfolio template · {site.brief.industry || "—"}
          </div>
        </div>

        <SaveBadge state={save} />

        <div className="flex items-center gap-1 rounded-lg border border-[#1e1e26] p-0.5">
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded-md p-1.5 transition ${
              device === "desktop" ? "bg-[#1e1e26] text-white" : "text-[#6b6b7a] hover:text-white"
            }`}
            title="Desktop preview"
          >
            <Desktop className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded-md p-1.5 transition ${
              device === "mobile" ? "bg-[#1e1e26] text-white" : "text-[#6b6b7a] hover:text-white"
            }`}
            title="Mobile preview"
          >
            <Phone className="h-4 w-4" />
          </button>
        </div>

        <a href={`/preview/${site.id}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
          <Eye className="h-3.5 w-3.5" /> Preview
        </a>
        <button className="btn-ghost btn-sm" onClick={publishLocally} disabled={busyKey === "publish"}>
          {busyKey === "publish" ? <Loader className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          Publish locally
        </button>
        <a href={`/api/export/${site.id}`} className="btn-primary btn-sm">
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </header>

      {publishMsg && (
        <div className="flex-none border-b border-[#1a1a21] bg-[#0d1410] px-4 py-2 text-[13px] text-[#9fe0b4]">
          {publishMsg}
        </div>
      )}
      {notice && (
        <div className="flex flex-none items-start gap-2 border-b border-[#3a2a14] bg-[#17120a] px-4 py-2.5 text-[13px] text-[#e5c07b]">
          <Warn className="mt-0.5 h-4 w-4 flex-none" />
          <span className="flex-1">
            The AI step didn&apos;t run, so this site is starter copy: {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-[#8a7a5a] hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ---------------- side panel ---------------- */}
        <aside className="flex w-[352px] flex-none flex-col border-r border-[#1a1a21] bg-[#0a0a0d]">
          <div className="flex flex-none gap-1 border-b border-[#1a1a21] p-2">
            {(["design", "content", "images", "sections"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md py-1.5 text-[12px] font-semibold capitalize transition ${
                  tab === t ? "bg-[#1e1e26] text-white" : "text-[#6b6b7a] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {aiError && (
            <div className="m-3 flex items-start gap-2 rounded-lg border border-[#4a2020] bg-[#1d0f0f] p-3 text-[12px] leading-relaxed text-[#ffb4b4]">
              <Warn className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="ui-scroll min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "design" && <DesignPanel design={site.design} onChange={setDesign} />}

            {tab === "content" && (
              <div className="space-y-6">
                {groups.map((g) => (
                  <div key={g.key}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a8a98]">
                        {g.label}
                      </h3>
                      {g.section && (
                        <button
                          onClick={() => rewriteSection(g.section!)}
                          disabled={busyKey === g.section}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#26262e] px-2 py-1 text-[11px] font-semibold text-[#a89bff] transition hover:border-[#7c6cff] disabled:opacity-50"
                        >
                          {busyKey === g.section ? (
                            <Loader className="h-3 w-3" />
                          ) : (
                            <Spark className="h-3 w-3" />
                          )}
                          Rewrite
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {g.fields.map((f) => (
                        <FieldRow
                          key={f.path}
                          label={f.label}
                          value={String(getByPath(site.content, f.path) ?? "")}
                          multiline={f.multiline}
                          busy={busyKey === f.path}
                          showAi={!f.noAi}
                          onChange={(v) => setText(f.path, v)}
                          onAi={() => rewriteSlot(f.path)}
                          onFocus={() => postToFrame({ type: "focus", path: f.path })}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "images" && (
              <div className="space-y-2">
                <p className="mb-4 text-[13px] leading-relaxed text-[#8a8a98]">
                  Click any image in the preview to change it, or pick one here.
                </p>
                {images.map((im) => (
                  <button
                    key={im.path}
                    onClick={() => setPickerPath(im.path)}
                    className="flex w-full items-center gap-3 rounded-lg border border-[#1e1e26] bg-[#0d0d11] p-2.5 text-left transition hover:border-[#7c6cff]"
                  >
                    <div className="grid h-12 w-16 flex-none place-items-center overflow-hidden rounded-md border border-[#26262e] bg-[#101014]">
                      {im.ref.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={im.ref.src} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-[#4e4e5c]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium">{im.label}</div>
                      <div className="truncate text-[12px] text-[#5f5f6d]">
                        {im.ref.src ? "Image set" : "Empty — click to add"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tab === "sections" && (
              <div className="space-y-2">
                <p className="mb-4 text-[13px] leading-relaxed text-[#8a8a98]">
                  Turn sections off or reorder them. The hero always reads best first.
                </p>
                {SECTION_ORDER.map((id) => {
                  const on = site.sections.includes(id);
                  const pos = site.sections.indexOf(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-lg border border-[#1e1e26] bg-[#0d0d11] p-2.5"
                    >
                      <button
                        onClick={() => toggleSection(id)}
                        className={`grid h-5 w-5 flex-none place-items-center rounded border transition ${
                          on
                            ? "border-[#7c6cff] bg-[#7c6cff] text-white"
                            : "border-[#31313b] text-transparent"
                        }`}
                        title={on ? "Hide section" : "Show section"}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <span className={`flex-1 text-[13px] ${on ? "" : "text-[#5f5f6d]"}`}>
                        {SECTION_LABELS[id]}
                      </span>
                      <button
                        disabled={!on || pos <= 0}
                        onClick={() => moveSection(id, -1)}
                        className="rounded px-1.5 text-[#6b6b7a] transition hover:text-white disabled:opacity-25"
                      >
                        ↑
                      </button>
                      <button
                        disabled={!on || pos === site.sections.length - 1}
                        onClick={() => moveSection(id, 1)}
                        className="rounded px-1.5 text-[#6b6b7a] transition hover:text-white disabled:opacity-25"
                      >
                        ↓
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ---------------- preview ---------------- */}
        <section className="min-w-0 flex-1 bg-[#08080a] p-5">
          <div
            className="mx-auto h-full overflow-hidden rounded-xl border border-[#1e1e26] bg-white transition-all duration-300"
            style={{ maxWidth: device === "mobile" ? 420 : "100%" }}
          >
            <iframe
              ref={iframeRef}
              key={docRev}
              title="Website preview"
              srcDoc={doc}
              className="h-full w-full"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </section>
      </div>

      {pickerPath && pickerRef && (
        <ImagePicker
          label={images.find((i) => i.path === pickerPath)?.label ?? "Image"}
          value={pickerRef}
          industry={site.brief.industry}
          slot={pickerPath}
          onChange={(next) => setImage(pickerPath, next)}
          onClose={() => setPickerPath(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function mergeKeepImages(current: any, incoming: any): any {
  if (Array.isArray(current) && Array.isArray(incoming)) {
    return current.map((item, i) =>
      incoming[i] === undefined ? item : mergeKeepImages(item, incoming[i])
    );
  }
  if (current && typeof current === "object") {
    const out: any = { ...current };
    for (const k of Object.keys(current)) {
      if (k === "image") continue; // the owner's picture stays put
      if (incoming && k in incoming) out[k] = mergeKeepImages(current[k], incoming[k]);
    }
    return out;
  }
  if (typeof incoming === "string" && incoming.trim()) return incoming.trim();
  return current;
}

function SaveBadge({ state }: { state: SaveState }) {
  const map = {
    idle: { text: "Saved", cls: "text-[#5f5f6d]" },
    saving: { text: "Saving…", cls: "text-[#8a8a98]" },
    saved: { text: "Saved", cls: "text-[#6fca8e]" },
    error: { text: "Save failed", cls: "text-[#ff9b9b]" },
  } as const;
  const m = map[state];
  return <span className={`text-[12px] font-medium ${m.cls}`}>{m.text}</span>;
}

function FieldRow({
  label,
  value,
  multiline,
  busy,
  showAi,
  onChange,
  onAi,
  onFocus,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  busy: boolean;
  showAi: boolean;
  onChange: (v: string) => void;
  onAi: () => void;
  onFocus: () => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b6b7a]">
          {label}
        </label>
        {showAi && (
          <button
            onClick={onAi}
            disabled={busy}
            title="Rewrite this with Mistral"
            className="text-[#5f5f6d] transition hover:text-[#a89bff] disabled:opacity-50"
          >
            {busy ? <Loader className="h-3.5 w-3.5" /> : <Spark className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {multiline ? (
        <textarea
          rows={value.length > 120 ? 5 : 2}
          className="field resize-y !py-2 !text-[13px]"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="field !py-2 !text-[13px]"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function DesignPanel({
  design,
  onChange,
}: {
  design: Design;
  onChange: <K extends keyof Design>(k: K, v: Design[K]) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a8a98]">
          Colour scheme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((p) => {
            const active = design.paletteId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChange("paletteId", p.id)}
                className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                  active ? "border-[#7c6cff] bg-[#7c6cff]/10" : "border-[#1e1e26] hover:border-[#3b3b47]"
                }`}
              >
                <span
                  className="grid h-8 w-8 flex-none place-items-center rounded-md border border-black/40"
                  style={{ background: p.bg }}
                >
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: p.accent }} />
                </span>
                <span className="truncate text-[12px] font-medium">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a8a98]">
          Typography
        </h3>
        <div className="space-y-2">
          {FONT_PAIRS.map((f) => {
            const active = design.fontId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange("fontId", f.id)}
                className={`block w-full rounded-lg border p-3 text-left transition ${
                  active ? "border-[#7c6cff] bg-[#7c6cff]/10" : "border-[#1e1e26] hover:border-[#3b3b47]"
                }`}
              >
                <span className="text-[13px] font-medium">{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Segmented
        title="Corners"
        value={design.radius}
        options={[
          ["sharp", "Sharp"],
          ["soft", "Soft"],
          ["round", "Round"],
        ]}
        onChange={(v) => onChange("radius", v as Design["radius"])}
      />

      <Segmented
        title="Hero layout"
        value={design.heroLayout}
        options={[
          ["split", "Split"],
          ["centered", "Centered"],
          ["stacked", "Stacked"],
        ]}
        onChange={(v) => onChange("heroLayout", v as Design["heroLayout"])}
      />

      <Segmented
        title="Spacing"
        value={design.spacing}
        options={[
          ["compact", "Compact"],
          ["comfortable", "Comfy"],
          ["airy", "Airy"],
        ]}
        onChange={(v) => onChange("spacing", v as Design["spacing"])}
      />
    </div>
  );
}

function Segmented({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a8a98]">
        {title}
      </h3>
      <div className="flex gap-1 rounded-lg border border-[#1e1e26] p-1">
        {options.map(([v, label]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-md py-1.5 text-[12px] font-medium transition ${
              value === v ? "bg-[#7c6cff] text-white" : "text-[#8a8a98] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
