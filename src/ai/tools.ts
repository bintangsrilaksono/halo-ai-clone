import type OpenAI from "openai";
import { searchServices, listServices } from "../services.js";
import { checkServiceArea, captureLead } from "../tools/leads.js";

export const TOOL_DEFINITIONS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_service",
      description: "Cari layanan maintenance berdasarkan nama atau kata kunci (mis. 'AC', 'listrik', 'plumbing').",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "kata kunci pencarian" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_all_services",
      description: "Ambil daftar lengkap semua layanan yang tersedia beserta cakupannya.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "check_service_area",
      description: "Cek apakah suatu kota/area masuk jangkauan layanan (Jabodetabek).",
      parameters: {
        type: "object",
        properties: { city: { type: "string", description: "nama kota/area yang disebut customer" } },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Simpan data calon customer yang butuh survey/jadwal teknisi. Panggil ini setelah dapat nama, nomor kontak, area, jenis layanan, dan deskripsi masalah.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          area: { type: "string" },
          serviceId: { type: "string", description: "id layanan dari search_service/list_all_services, mis. AC-MTN" },
          problem: { type: "string", description: "deskripsi singkat masalah/kebutuhan customer" },
        },
        required: ["name", "phone", "area", "serviceId", "problem"],
      },
    },
  },
];

export async function runTool(name: string, input: any): Promise<unknown> {
  switch (name) {
    case "search_service":
      return searchServices(input.query);
    case "list_all_services":
      return listServices();
    case "check_service_area":
      return checkServiceArea(input.city);
    case "capture_lead":
      return captureLead(input);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
