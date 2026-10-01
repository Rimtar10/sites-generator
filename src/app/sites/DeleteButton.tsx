"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, Trash } from "@/components/Icons";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [arming, setArming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  if (!arming) {
    return (
      <button
        onClick={() => setArming(true)}
        title={`Delete ${name}`}
        className="rounded-md border border-[#26262e] p-2 text-[#6b6b7a] transition hover:border-[#5a2626] hover:text-[#ff9b9b]"
      >
        <Trash className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={remove} disabled={busy} className="btn btn-sm bg-[#7a2020] text-white">
        {busy ? <Loader className="h-3.5 w-3.5" /> : "Delete"}
      </button>
      <button onClick={() => setArming(false)} className="btn-ghost btn-sm">
        Cancel
      </button>
    </div>
  );
}
