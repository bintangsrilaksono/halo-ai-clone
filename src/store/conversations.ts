import type { ChatMessage } from "../ai/agent.js";

/**
 * In-memory only — history is lost on restart and never shared across
 * instances. Swap for Postgres/Redis before running more than one process
 * or expecting conversations to survive a deploy.
 */
const conversations = new Map<string, ChatMessage[]>();

export function getHistory(customerId: string): ChatMessage[] {
  return conversations.get(customerId) ?? [];
}

export function saveHistory(customerId: string, history: ChatMessage[]): void {
  conversations.set(customerId, history);
}
