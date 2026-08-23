import { MONTHLY_BUDGET_MESSAGE } from "@/lib/ai/usage.shared";

export const DEFAULT_CHAT_ERROR_MESSAGE =
  "We're experiencing issues. Please report this and try again later.";

export const MONTHLY_BUDGET_CHAT_MESSAGE = MONTHLY_BUDGET_MESSAGE;

export function getChatErrorMessage(error?: Error | null): string {
  const message = error?.message ?? "";
  if (
    message.includes("Ask budget") ||
    message.includes("402") ||
    message.toLowerCase().includes("payment")
  ) {
    return MONTHLY_BUDGET_CHAT_MESSAGE;
  }
  return DEFAULT_CHAT_ERROR_MESSAGE;
}

export function createChatErrorResponse(
  status: number,
  message = DEFAULT_CHAT_ERROR_MESSAGE,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
