/**
 * AI provider abstraction. Configure via env:
 * - AI_PROVIDER: "google" | "openai" | "anthropic" (chat)
 * - AI_CHAT_MODEL: optional model id (defaults: gemini-2.0-flash-exp, gpt-4o, claude-3-5-sonnet-20241022)
 * - AI_EMBEDDING_PROVIDER: "google" | "openai" (default: same as AI_PROVIDER for google, else "google")
 * - AI_EMBEDDING_MODEL: optional (defaults: text-embedding-004, text-embedding-3-small)
 * - GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY
 */

import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

const DEFAULT_CHAT_MODELS = {
  google: "gemini-2.0-flash-exp",
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
} as const

const DEFAULT_EMBEDDING_MODELS = {
  google: "text-embedding-004",
  openai: "text-embedding-3-small",
} as const

export const EMBEDDING_DIMENSIONS: Record<string, number> = {
  "text-embedding-004": 768,
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
}

function getChatProvider(): "google" | "openai" | "anthropic" {
  const p = process.env.AI_PROVIDER?.toLowerCase()
  if (p === "openai" || p === "anthropic" || p === "google") return p
  return "google"
}

function getEmbeddingProvider(): "google" | "openai" {
  const p = process.env.AI_EMBEDDING_PROVIDER?.toLowerCase()
  if (p === "openai" || p === "google") return p
  const chat = getChatProvider()
  return chat === "google" ? "google" : "google"
}

/**
 * Returns the chat model for streamText/generateText. Throws if the provider or API key is missing.
 */
export function getChatModel() {
  const provider = getChatProvider()
  const modelId = process.env.AI_CHAT_MODEL || DEFAULT_CHAT_MODELS[provider]

  switch (provider) {
    case "google": {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error(
          "GOOGLE_GENERATIVE_AI_API_KEY is required when AI_PROVIDER=google"
        )
      }
      return google(modelId)
    }
    case "openai": {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai")
      }
      return openai(modelId)
    }
    case "anthropic": {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic"
        )
      }
      return anthropic(modelId)
    }
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`)
  }
}

export type EmbeddingModelConfig = {
  /** Model instance for use with embed({ model, value }) from "ai" */
  model: unknown
  dimensions: number
  modelId: string
}

/**
 * Returns the embedding model and dimensions for embed(). Throws if provider or API key is missing.
 * Note: Changing the embedding model invalidates existing embeddings; run pnpm embeddings:process after switching.
 */
export function getEmbeddingModel(): EmbeddingModelConfig {
  const provider = getEmbeddingProvider()
  const modelId =
    process.env.AI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODELS[provider]
  const dimensions =
    EMBEDDING_DIMENSIONS[modelId] ?? (provider === "google" ? 768 : 1536)

  switch (provider) {
    case "google": {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error(
          "GOOGLE_GENERATIVE_AI_API_KEY is required for embedding when AI_EMBEDDING_PROVIDER=google"
        )
      }
      return {
        model: google.textEmbeddingModel(modelId),
        dimensions,
        modelId,
      }
    }
    case "openai": {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error(
          "OPENAI_API_KEY is required for embedding when AI_EMBEDDING_PROVIDER=openai"
        )
      }
      return {
        model: openai.embedding(modelId),
        dimensions,
        modelId,
      }
    }
    default:
      throw new Error(`Unsupported AI_EMBEDDING_PROVIDER: ${provider}`)
  }
}
