/**
 * Embedding Service
 * Provides abstraction for generating embeddings using the Vercel AI SDK
 * with Google's text-embedding-004 model (768 dimensions)
 *
 * ⚠️ IMPORTANT: If you change the embedding model, you MUST re-embed all existing notes.
 * Different models produce incompatible vectors even if dimensions match.
 * Run: pnpm embeddings:process
 */

import { embed } from "ai"
import { google } from "@ai-sdk/google"

// Current embedding model - changing this requires re-embedding ALL notes
export const EMBEDDING_MODEL = "text-embedding-004"
export const EMBEDDING_DIMENSIONS = 768

/**
 * Generate an embedding for a single text chunk.
 * Uses Google's text-embedding-004 model which produces 768-dimensional vectors.
 *
 * @param text - The text to embed
 * @returns Array of 768 numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text")
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is required for embedding generation"
    )
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel(EMBEDDING_MODEL),
      value: text,
    })

    return embedding
  } catch (error) {
    console.error("Failed to generate embedding:", error)
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Generate embeddings for multiple text chunks in batch.
 * Processes sequentially to avoid rate limits.
 *
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
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
 * Compute cosine similarity between two embedding vectors.
 * Used for testing and debugging.
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score between -1 and 1 (1 = identical)
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
