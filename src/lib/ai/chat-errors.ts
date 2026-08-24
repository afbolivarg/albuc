import type { MessageKey } from "@/lib/i18n/en";
import { isMessageKey } from "@/lib/i18n/translate";

export function getChatErrorKey(error?: Error | null): MessageKey {
  const message = error?.message ?? "";
  if (isMessageKey(message)) return message;
  if (
    message.includes("Ask budget") ||
    message.includes("402") ||
    message.toLowerCase().includes("payment") ||
    message.includes("ask.hardCap")
  ) {
    return "ask.hardCap";
  }
  return "ask.error";
}

export function createChatErrorResponse(
  status: number,
  key: MessageKey = "ask.error",
): Response {
  return new Response(JSON.stringify({ error: key }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
