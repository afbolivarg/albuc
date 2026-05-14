"use server"

import { streamText } from "ai"
import { getChatModel } from "@/lib/ai/provider"
import { createStreamableValue } from "@ai-sdk/rsc"
import { z } from "zod"
import { generateEmbedding } from "@/lib/ai/embedding"
import { semanticSearchNotes } from "@/lib/db/queries"
import { checkAIUsageAllowed, incrementAIUsage } from "@/lib/ai/usage"
import { authenticatedAction } from "@/lib/safe-action"
import { logError } from "@/lib/logger"

const askQuestionSchema = z.object({
  question: z
    .string()
    .min(1, "Question cannot be empty")
    .max(1000, "Question is too long"),
})

/**
 * Ask a question about your personal library and get an AI-generated answer
 * based only on your notes and books.
 *
 * Returns a stream of text chunks for real-time UI updates.
 */
export const askQuestionAction = authenticatedAction
  .inputSchema(askQuestionSchema)
  .action(async ({ parsedInput: { question }, ctx: { user } }) => {
    const usageCheck = await checkAIUsageAllowed(user.id)
    if (!usageCheck.allowed) {
      throw new Error(usageCheck.reason || "AI feature access denied.")
    }

    try {
      // 3. Generate embedding for the question
      const queryEmbedding = await generateEmbedding(question)

      // 4. Perform semantic search to retrieve relevant note chunks
      const relevantChunks = await semanticSearchNotes(
        user.id,
        queryEmbedding,
        8 // Top 8 most relevant chunks
      )

      // 5. If no chunks found, return early with a helpful message
      if (relevantChunks.length === 0) {
        const stream = createStreamableValue("")
        stream.done(
          "I couldn't find any relevant information in your library to answer this question. Try adding more notes or asking about content you've already saved."
        )
        return { textStream: stream.value }
      }

      // 6. Build context from chunks with book citations
      const contextParts = relevantChunks.map((chunk, index) => {
        const citation = chunk.publish_year
          ? `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}, ${chunk.publish_year}`
          : `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}`

        return `[${index + 1}] From ${citation}:\n${chunk.chunk}`
      })

      const context = contextParts.join("\n\n")

      // 7. Compose the system prompt
      const systemPrompt = `You are a reading copilot helping the user understand and recall information from their personal library.

CRITICAL RULES:
1. Answer ONLY based on the provided context from the user's notes
2. Do NOT use external knowledge or information not in the context
3. If the context doesn't contain enough information, say so clearly
4. Always cite which source(s) you're using (e.g., "According to [1]...")
5. Be concise but thorough
6. If multiple sources have relevant info, synthesize them together

Context from the user's library:

${context}`

      const userPrompt = `Question: ${question}`

      // 8. Increment usage counter (before streaming to ensure it's counted)
      await incrementAIUsage(user.id)

      // 9. Stream the AI response
      const result = streamText({
        model: getChatModel() as Parameters<typeof streamText>[0]["model"],
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.3, // Lower temperature for more factual responses
        maxRetries: 2,
      })

      // Create a streamable value for the text
      const stream = createStreamableValue(result.textStream)

      return { textStream: stream.value }
    } catch (error) {
      logError(error, { operation: "askQuestionAction" })
      throw new Error(
        error instanceof Error
          ? `Failed to generate answer: ${error.message}`
          : "Failed to generate answer. Please try again."
      )
    }
  })

/**
 * Get current AI usage stats for the authenticated user
 */
export const getAIUsageAction = authenticatedAction.action(
  async ({ ctx: { user } }) => {
    const usageCheck = await checkAIUsageAllowed(user.id)

    return {
      allowed: usageCheck.allowed,
      queriesUsed: usageCheck.queriesUsed,
      queryLimit: usageCheck.queryLimit,
      reason: usageCheck.reason,
    }
  }
)
