/**
 * Embeddings via Google text-embedding-004 (768 dimensions).
 * Embeddings use text-embedding-004 (768 dimensions).
 */

import { embed } from "ai";
import { createLogger, toError } from "@/lib/logger";
import { getEmbeddingModel } from "./provider";

const log = createLogger("embedding");

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
    log.error("generateEmbedding failed", toError(error));
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
