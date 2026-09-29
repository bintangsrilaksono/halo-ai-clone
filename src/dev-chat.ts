import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { handleMessage, type ChatMessage } from "./ai/agent.js";

/**
 * Local REPL to test the sales agent's brain without WhatsApp/Instagram —
 * useful before Meta accounts and webhook tunneling are set up.
 */
const rl = readline.createInterface({ input: stdin, output: stdout });
let history: ChatMessage[] = [];

console.log("Chat dengan agent (ctrl+c untuk keluar)\n");

for (;;) {
  const text = await rl.question("Kamu: ");
  const { reply, history: updated } = await handleMessage(history, text);
  history = updated;
  console.log(`Agent: ${reply}\n`);
}
