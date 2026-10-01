import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Site } from "./types";

/**
 * Dead-simple local store: one JSON file on disk.
 * No database, no cloud, no accounts — this project runs entirely on your machine.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const SITES_FILE = path.join(DATA_DIR, "sites.json");

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SITES_FILE);
  } catch {
    await fs.writeFile(SITES_FILE, "[]", "utf8");
  }
}

export async function readSites(): Promise<Site[]> {
  await ensure();
  try {
    const raw = await fs.readFile(SITES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSites(sites: Site[]) {
  await ensure();
  await fs.writeFile(SITES_FILE, JSON.stringify(sites, null, 2), "utf8");
}

export function newId() {
  return crypto.randomBytes(6).toString("hex");
}

export async function getSite(id: string): Promise<Site | null> {
  const sites = await readSites();
  return sites.find((s) => s.id === id) ?? null;
}

export async function createSite(site: Omit<Site, "createdAt" | "updatedAt">): Promise<Site> {
  const now = new Date().toISOString();
  const full: Site = { ...site, createdAt: now, updatedAt: now };
  const sites = await readSites();
  sites.unshift(full);
  await writeSites(sites);
  return full;
}

export async function updateSite(id: string, patch: Partial<Site>): Promise<Site | null> {
  const sites = await readSites();
  const i = sites.findIndex((s) => s.id === id);
  if (i === -1) return null;
  const next: Site = {
    ...sites[i],
    ...patch,
    id: sites[i].id,
    createdAt: sites[i].createdAt,
    updatedAt: new Date().toISOString(),
  };
  sites[i] = next;
  await writeSites(sites);
  return next;
}

export async function deleteSite(id: string): Promise<boolean> {
  const sites = await readSites();
  const next = sites.filter((s) => s.id !== id);
  if (next.length === sites.length) return false;
  await writeSites(next);
  return true;
}
