import type { FastifyInstance } from "fastify";
import axios from "axios";
import { config } from "../config.js";
import { handleMessage } from "../ai/agent.js";
import { getHistory, saveHistory } from "../store/conversations.js";

async function sendWhatsAppReply(to: string, text: string) {
  await axios.post(
    `https://graph.facebook.com/v21.0/${config.whatsapp.phoneNumberId}/messages`,
    { messaging_product: "whatsapp", to, text: { body: text } },
    { headers: { Authorization: `Bearer ${config.whatsapp.token}` } },
  );
}

export function registerWhatsAppWebhook(app: FastifyInstance) {
  // Meta calls this once to verify the webhook URL you register.
  app.get("/webhooks/whatsapp", async (req, reply) => {
    const query = req.query as Record<string, string>;
    if (
      query["hub.mode"] === "subscribe" &&
      query["hub.verify_token"] === config.whatsapp.verifyToken
    ) {
      return reply.send(query["hub.challenge"]);
    }
    return reply.code(403).send();
  });

  app.post("/webhooks/whatsapp", async (req, reply) => {
    reply.send({ received: true }); // ack fast, Meta retries on timeout

    const body = req.body as any;
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== "text") return;

    const from: string = message.from;
    const text: string = message.text.body;

    const history = getHistory(from);
    const { reply: aiReply, history: updated } = await handleMessage(history, text);
    saveHistory(from, updated);

    await sendWhatsAppReply(from, aiReply);
  });
}
