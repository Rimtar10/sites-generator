"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { Image as ImageIcon, Loader, Spark, Trash } from "@/components/Icons";

type Photo = { id: string; thumb: string; full: string; alt: string; credit?: string };

export default function ImagePicker({
  label,
  value,
  industry,
  slot,
  onChange,
  onClose,
}: {
  label: string;
  value: ImageRef;
  industry: string;
  slot: string;
  onChange: (next: ImageRef) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed.");
      onChange({ src: data.src, alt: value.alt || label });
      onClose();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function suggest() {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, slot }),
      });
      const data = await res.json();
      setKeywords(data.keywords || []);
      setPhotos(data.photos || []);
      if (data.note) setNote(data.note);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="panel fade-in ui-scroll max-h-[86vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight">{label}</h2>
            <p className="mt-1 text-[13px] text-[#8a8a98]">
              Upload your own photo, paste a link, or let Mistral suggest search terms.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm">
            Close
          </button>
        </div>

        {/* current */}
        <div className="mt-5 flex items-center gap-4 rounded-xl border border-[#1e1e26] bg-[#0a0a0d] p-4">
          <div className="grid h-20 w-28 flex-none place-items-center overflow-hidden rounded-lg border border-[#26262e] bg-[#101014]">
            {value.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.src} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5 text-[#4e4e5c]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              className="field"
              placeholder="Alt text (what's in the picture)"
              value={value.alt}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
            />
          </div>
          {value.src && (
            <button
              className="btn-ghost btn-sm"
              onClick={() => onChange({ ...value, src: "" })}
              title="Remove image"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button className="btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
            Upload image
          </button>
          <button className="btn-ghost btn-sm" onClick={suggest} disabled={busy}>
            <Spark className="h-3.5 w-3.5" /> Suggest photos
          </button>
        </div>

        {/* paste a URL */}
        <div className="mt-4 flex gap-2">
          <input
            className="field"
            placeholder="…or paste an image URL"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <button
            className="btn-ghost btn-sm flex-none"
            disabled={!urlDraft.trim()}
            onClick={() => {
              onChange({ src: urlDraft.trim(), alt: value.alt || label });
              onClose();
            }}
          >
            Use
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-[#4a2020] bg-[#1d0f0f] p-3 text-[13px] text-[#ffb4b4]">
            {error}
          </p>
        )}
        {note && (
          <p className="mt-4 rounded-lg border border-[#2a2a34] bg-[#0f0f14] p-3 text-[13px] leading-relaxed text-[#9a9aa8]">
            {note}
          </p>
        )}
        {keywords.length > 0 && (
          <p className="mt-4 text-[13px] text-[#8a8a98]">
            Search terms Mistral suggested:{" "}
            {keywords.map((k) => (
              <span
                key={k}
                className="mr-1.5 inline-block rounded-md border border-[#26262e] px-2 py-0.5 text-[12px] text-[#b4b4c0]"
              >
                {k}
              </span>
            ))}
          </p>
        )}

        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <button
                key={p.id}
                className="overflow-hidden rounded-lg border border-[#26262e] transition hover:border-[#7c6cff]"
                onClick={() => {
                  onChange({ src: p.full, alt: p.alt || label });
                  onClose();
                }}
                title={p.credit ? `Photo: ${p.credit}` : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt={p.alt} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
