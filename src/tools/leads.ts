import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dataPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
  "leads.json",
);

export interface Lead {
  id: string;
  name: string;
  phone: string;
  area: string;
  serviceId: string;
  problem: string;
  createdAt: string;
}

const SERVICE_AREA = ["jakarta", "bogor", "depok", "tangerang", "bekasi", "jabodetabek"];

export function checkServiceArea(city: string): { covered: boolean; message: string } {
  const covered = SERVICE_AREA.some((a) => city.toLowerCase().includes(a));
  return {
    covered,
    message: covered
      ? "Area ini masuk jangkauan layanan kami (Jabodetabek)."
      : "Mohon maaf, area ini di luar jangkauan layanan kami saat ini (khusus Jabodetabek).",
  };
}

/**
 * Appends to a local JSON file — fine for a pitch/demo running on one
 * Railway instance. Swap for a real database before this handles real
 * customer traffic (also: Railway's filesystem resets on redeploy).
 */
export async function captureLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  let leads: Lead[] = [];
  try {
    leads = JSON.parse(await readFile(dataPath, "utf-8"));
  } catch {
    leads = [];
  }

  const lead: Lead = {
    ...input,
    id: `LEAD-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  await writeFile(dataPath, JSON.stringify(leads, null, 2));
  return lead;
}
