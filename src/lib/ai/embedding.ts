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

export async function generateEmbeddingResult(
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_QUERY",
): Promise<{ embedding: number[]; tokens: number }> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const { model } = getEmbeddingModel();

  try {
    const result = await embed({
      model: model as Parameters<typeof embed>[0]["model"],
      value: text,
      providerOptions: getProviderOptions(taskType),
    });

    return {
      embedding: normalizeEmbedding(result.embedding),
      tokens: result.usage?.tokens ?? 0,
    };
  } catch (error) {
    log.error("generateEmbedding failed", toError(error));
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function generateEmbeddings(
  texts: string[],
): Promise<{ embeddings: number[][]; tokens: number }> {
  if (texts.length === 0) {
    return { embeddings: [], tokens: 0 };
  }

  const results = await Promise.all(
    texts.map((text) => generateEmbeddingResult(text, "RETRIEVAL_DOCUMENT")),
  );
  return {
    embeddings: results.map((result) => result.embedding),
    tokens: results.reduce((sum, result) => sum + result.tokens, 0),
  };
}
