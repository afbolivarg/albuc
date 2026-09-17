/**
 * Chat uses OpenAI GPT 5.6 Luna. Embeddings stay on Gemini so existing
 * note_chunks do not need to be re-indexed.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/lib/env";

export const CHAT_MODEL = "gpt-5.6-luna";
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

function requireOpenAI() {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Ask requires this key at runtime.",
    );
  }
  return createOpenAI({ apiKey });
}

export function getChatModel() {
  return requireOpenAI().responses(CHAT_MODEL);
}

export function getEmbeddingModel() {
  return {
    model: google.embedding(EMBEDDING_MODEL),
    modelId: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}
