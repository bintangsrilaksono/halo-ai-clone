import type { FastifyInstance } from "fastify";
import axios from "axios";
import { config } from "../config.js";
import { handleMessage } from "../ai/agent.js";
import { getHistory, saveHistory } from "../store/conversations.js";

async function sendInstagramReply(recipientId: string, text: string) {
  await axios.post(
    `https://graph.facebook.com/v21.0/me/messages`,
    { recipient: { id: recipientId }, message: { text } },
    { params: { access_token: config.instagram.pageAccessToken } },
  );
}

export function registerInstagramWebhook(app: FastifyInstance) {
  app.get("/webhooks/instagram", async (req, reply) => {
    const query = req.query as Record<string, string>;
    if (
      query["hub.mode"] === "subscribe" &&
      query["hub.verify_token"] === config.instagram.verifyToken
    ) {
      return reply.send(query["hub.challenge"]);
    }
    return reply.code(403).send();
  });

  app.post("/webhooks/instagram", async (req, reply) => {
    reply.send({ received: true });

    const body = req.body as any;
    const messaging = body?.entry?.[0]?.messaging?.[0];
    const text: string | undefined = messaging?.message?.text;
    const senderId: string | undefined = messaging?.sender?.id;
    if (!text || !senderId) return;

    const history = getHistory(senderId);
    const { reply: aiReply, history: updated } = await handleMessage(history, text);
    saveHistory(senderId, updated);

    await sendInstagramReply(senderId, aiReply);
  });
}
