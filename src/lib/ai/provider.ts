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

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export function getChatModel() {
  return openai.responses(CHAT_MODEL);
}

export function getEmbeddingModel() {
  return {
    model: google.embedding(EMBEDDING_MODEL),
    modelId: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}
