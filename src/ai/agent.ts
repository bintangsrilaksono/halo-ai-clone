import OpenAI from "openai";
import { config } from "../config.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { TOOL_DEFINITIONS, runTool } from "./tools.js";

// DeepSeek's API is OpenAI-compatible, so the OpenAI SDK works by just
// pointing baseURL at DeepSeek instead of api.openai.com.
const client = new OpenAI({
  apiKey: config.deepseek.apiKey,
  baseURL: "https://api.deepseek.com",
});

export type ChatMessage = OpenAI.ChatCompletionMessageParam;

/**
 * Runs one turn of the sales agent: appends the customer's message to
 * history, loops through tool calls until the model produces a final
 * text reply, and returns that reply plus the updated history to persist.
 */
export async function handleMessage(
  history: ChatMessage[],
  customerText: string,
): Promise<{ reply: string; history: ChatMessage[] }> {
  const conversation: ChatMessage[] = [...history, { role: "user", content: customerText }];

  for (let turn = 0; turn < 6; turn++) {
    const completion = await client.chat.completions.create({
      model: config.deepseek.model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...conversation],
      tools: TOOL_DEFINITIONS,
    });

    const message = completion.choices[0].message;
    conversation.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { reply: message.content ?? "", history: conversation };
    }

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || "{}");
      const result = await runTool(toolCall.function.name, args);
      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply: "Maaf, kakak bisa diulang lagi pertanyaannya? Aku sambungkan ke tim ya.",
    history: conversation,
  };
}
