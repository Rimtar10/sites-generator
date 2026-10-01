import { Suspense } from "react";
import Wizard from "./Wizard";

export default function NewSitePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#8a8a98]">Loading…</div>}>
      <Wizard />
    </Suspense>
  );
}
