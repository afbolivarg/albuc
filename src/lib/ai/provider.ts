/**
 * Google Gemini models via env:
 * - GOOGLE_GENERATIVE_AI_API_KEY (required)
 * - AI_CHAT_MODEL (optional, default: gemini-2.0-flash-exp)
 * - AI_EMBEDDING_MODEL (optional, default: text-embedding-004)
 */

import { google } from "@ai-sdk/google";

export const DEFAULT_CHAT_MODEL = "gemini-2.0-flash-exp";
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-004";
export const EMBEDDING_DIMENSIONS = 768;

function requireGoogleApiKey() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required");
  }
}

export function getChatModel() {
  requireGoogleApiKey();
  const modelId = process.env.AI_CHAT_MODEL || DEFAULT_CHAT_MODEL;
  return google(modelId);
}

export function getEmbeddingModel() {
  requireGoogleApiKey();
  const modelId = process.env.AI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  return {
    model: google.textEmbeddingModel(modelId),
    modelId,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}
