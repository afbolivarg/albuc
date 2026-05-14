/**
 * Embedding Service
 * Uses the configured AI provider (see src/lib/ai/provider.ts).
 * If you change the embedding model, re-embed all notes: pnpm embeddings:process
 */

import { embed } from "ai"
import { getEmbeddingModel } from "./provider"
import { logError } from "@/lib/logger"

export function getEmbeddingModelId(): string {
  return getEmbeddingModel().modelId
}

export function getEmbeddingDimensions(): number {
  return getEmbeddingModel().dimensions
}

/**
 * Generate an embedding for a single text chunk.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text")
  }

  const { model } = getEmbeddingModel()

  try {
    const { embedding } = await embed({
      model: model as Parameters<typeof embed>[0]["model"],
      value: text,
    })

    return embedding
  } catch (error) {
    logError(error, { operation: "generateEmbedding" })
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Generate embeddings for multiple text chunks in batch (sequentially).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return []
  }

  const embeddings: number[][] = []
  for (const text of texts) {
    const embedding = await generateEmbedding(text)
    embeddings.push(embedding)
  }
  return embeddings
}

/**
 * Cosine similarity between two vectors (for testing/debugging).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
