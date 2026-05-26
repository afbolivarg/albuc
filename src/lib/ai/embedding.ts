/**
 * Embeddings via Google text-embedding-004 (768 dimensions).
 * Changing AI_EMBEDDING_MODEL invalidates existing note embeddings.
 */

import { embed } from "ai";
import { logError } from "@/lib/logger";
import { getEmbeddingModel } from "./provider";

export function getEmbeddingModelId(): string {
  return getEmbeddingModel().modelId;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const { model } = getEmbeddingModel();

  try {
    const { embedding } = await embed({
      model: model as Parameters<typeof embed>[0]["model"],
      value: text,
    });

    return embedding;
  } catch (error) {
    logError(error, { operation: "generateEmbedding" });
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }
  return embeddings;
}
