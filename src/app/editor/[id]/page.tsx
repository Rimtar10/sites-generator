import { notFound } from "next/navigation";
import { getSite } from "@/lib/store";
import Editor from "./Editor";

export const dynamic = "force-dynamic";

export default async function EditorPage({ params }: { params: { id: string } }) {
  const site = await getSite(params.id);
  if (!site) notFound();
  return <Editor initialSite={site} />;
}
