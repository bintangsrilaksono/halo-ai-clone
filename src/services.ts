import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dataPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "services.json",
);

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  cakupan: string[];
}

// Re-reads on every call (no caching) so edits to data/services.json show up
// without restarting the server.
async function loadServices(): Promise<ServiceItem[]> {
  return JSON.parse(await readFile(dataPath, "utf-8"));
}

export async function searchServices(query: string): Promise<ServiceItem[]> {
  const services = await loadServices();
  const q = query.toLowerCase();
  return services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase() === q ||
      s.cakupan.some((c) => c.toLowerCase().includes(q)),
  );
}

export async function listServices(): Promise<ServiceItem[]> {
  return loadServices();
}
