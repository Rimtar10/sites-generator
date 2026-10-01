import { NextResponse } from "next/server";
import { getSite, updateSite, deleteSite } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const site = await getSite(params.id);
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });
  return NextResponse.json({ site });
}

export async function PUT(req: Request, { params }: Ctx) {
  let patch: any;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const site = await updateSite(params.id, patch);
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });
  return NextResponse.json({ site });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ok = await deleteSite(params.id);
  if (!ok) return NextResponse.json({ error: "Site not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
