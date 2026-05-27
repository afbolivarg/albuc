/**
 * Embeddings via Google gemini-embedding-001 (768 dimensions).
 */

import type { GoogleGenerativeAIEmbeddingProviderOptions } from "@ai-sdk/google";
import { embed } from "ai";
import { createLogger, toError } from "@/lib/logger";
import { EMBEDDING_DIMENSIONS, getEmbeddingModel } from "./provider";

const log = createLogger("embedding");

type EmbeddingTaskType = NonNullable<
  GoogleGenerativeAIEmbeddingProviderOptions["taskType"]
>;

function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, value) => sum + value * value, 0),
  );

  if (magnitude === 0) {
    return embedding;
  }

  return embedding.map((value) => value / magnitude);
}

function getProviderOptions(taskType: EmbeddingTaskType): {
  google: GoogleGenerativeAIEmbeddingProviderOptions;
} {
  return {
    google: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      taskType,
    },
  };
}

export function getEmbeddingModelId(): string {
  return getEmbeddingModel().modelId;
}

export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_QUERY",
): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const { model } = getEmbeddingModel();

  try {
    const { embedding } = await embed({
      model: model as Parameters<typeof embed>[0]["model"],
      value: text,
      providerOptions: getProviderOptions(taskType),
    });

    return normalizeEmbedding(embedding);
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
    embeddings.push(await generateEmbedding(text, "RETRIEVAL_DOCUMENT"));
  }
  return embeddings;
}
