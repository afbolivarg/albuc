export const DEFAULT_CHAT_ERROR_MESSAGE =
  "We're experiencing issues. Please report this and try again later.";

export function getChatErrorMessage(_error?: Error | null): string {
  // Map known errors to user-facing copy here later.
  return DEFAULT_CHAT_ERROR_MESSAGE;
}

export function createChatErrorResponse(status: number): Response {
  return new Response(JSON.stringify({ error: DEFAULT_CHAT_ERROR_MESSAGE }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
