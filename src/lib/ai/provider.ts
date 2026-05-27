/**
 * Google Gemini models. Requires GOOGLE_GENERATIVE_AI_API_KEY.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "@/lib/env";

export const CHAT_MODEL = "gemini-3.1-flash-lite";
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export function getChatModel() {
  return google(CHAT_MODEL);
}

export function getEmbeddingModel() {
  return {
    model: google.embedding(EMBEDDING_MODEL),
    modelId: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}
