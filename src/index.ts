import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { registerWhatsAppWebhook } from "./webhooks/whatsapp.js";
import { registerInstagramWebhook } from "./webhooks/instagram.js";
import { registerChatUi } from "./routes/chat.js";

const app = Fastify({ logger: true });

// Public demo chat endpoint gets called from landing pages hosted on other
// domains (e.g. the Karyawan AI pitch page) — no cookies/credentials involved,
// so open CORS is fine here.
await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true }));

registerWhatsAppWebhook(app);
registerInstagramWebhook(app);
registerChatUi(app);

app.listen({ port: config.port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
