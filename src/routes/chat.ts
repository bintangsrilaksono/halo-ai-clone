import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { handleMessage } from "../ai/agent.js";
import { getHistory, saveHistory } from "../store/conversations.js";

const publicDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "public",
);

/**
 * "/" serves the public marketing landing page (with a live embedded chat
 * widget). "/chat" keeps the bare test-chat UI for quick dev checks. Both
 * hit the same agent/history as the WhatsApp & Instagram webhooks.
 */
export function registerChatUi(app: FastifyInstance) {
  app.get("/", async (_req, reply) => {
    const html = await readFile(path.join(publicDir, "landing.html"), "utf-8");
    reply.type("text/html").send(html);
  });

  app.get("/chat", async (_req, reply) => {
    const html = await readFile(path.join(publicDir, "index.html"), "utf-8");
    reply.type("text/html").send(html);
  });

  app.post("/api/chat", async (req, reply) => {
    const { sessionId, message } = req.body as { sessionId?: string; message?: string };
    if (!sessionId || !message) {
      return reply.code(400).send({ error: "sessionId dan message wajib diisi" });
    }

    const history = getHistory(sessionId);
    const { reply: aiReply, history: updated } = await handleMessage(history, message);
    saveHistory(sessionId, updated);

    return { reply: aiReply };
  });
}
