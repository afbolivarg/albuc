#!/usr/bin/env tsx

/**
 * Test script for Stage 3 AI Q&A functionality
 * Tests the askQuestion action without requiring UI and displays the full AI answer
 *
 * Usage: pnpm test:ai-query
 */

import "dotenv/config"
import { db } from "@/lib/db"
import { users, books } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { generateEmbedding } from "@/lib/ai/embedding"
import { semanticSearchNotes } from "@/lib/db/queries"
import { checkAIUsageAllowed, incrementAIUsage } from "@/lib/billing/usage"
import { streamText } from "ai"
import { google } from "@ai-sdk/google"

async function testAIQuery() {
  console.log("🧪 Testing AI Q&A Functionality (Stage 3)\n")

  // 1. Check environment
  console.log("1️⃣ Checking environment...")
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY not set")
    process.exit(1)
  }
  console.log("✅ API key is set\n")

  // 2. Find a test user with books and notes
  console.log("2️⃣ Finding test user with notes...")
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .limit(5)

  if (allUsers.length === 0) {
    console.error("❌ No users found in database")
    process.exit(1)
  }

  let testUser = null
  let userBooks = []

  for (const user of allUsers) {
    userBooks = await db
      .select()
      .from(books)
      .where(eq(books.userId, user.id))
      .limit(10)

    const booksWithNotes = userBooks.filter(
      book => book.noteMarkdown && book.noteMarkdown.length > 50
    )

    if (booksWithNotes.length > 0) {
      testUser = user
      console.log(`✅ Found test user: ${user.email} (${user.name})`)
      console.log(
        `   Books: ${userBooks.length} total, ${booksWithNotes.length} with notes\n`
      )
      break
    }
  }

  if (!testUser) {
    console.error("❌ No users found with books that have notes")
    console.log("💡 Tip: Add some notes to a book in the UI first")
    process.exit(1)
  }

  // 3. Check usage allowance
  console.log("3️⃣ Checking AI usage allowance...")
  const usageCheck = await checkAIUsageAllowed(testUser.id)
  if (!usageCheck.allowed) {
    console.error(`❌ AI usage not allowed: ${usageCheck.reason}`)
    process.exit(1)
  }
  console.log(
    `✅ Usage allowed: ${usageCheck.queriesUsed}/${usageCheck.queryLimit} queries used\n`
  )

  // 4. Test embedding generation
  console.log("4️⃣ Testing query embedding generation...")
  const testQuestion = "What are the main ideas discussed in my notes?"
  try {
    const queryEmbedding = await generateEmbedding(testQuestion)
    console.log(`✅ Generated embedding: ${queryEmbedding.length} dimensions\n`)

    // 5. Test semantic search
    console.log("5️⃣ Testing semantic search...")
    const results = await semanticSearchNotes(testUser.id, queryEmbedding, 8)
    console.log(`✅ Found ${results.length} relevant chunks\n`)

    if (results.length === 0) {
      console.log(
        "⚠️  No embeddings found. Run 'pnpm embeddings:process' first"
      )
      process.exit(1)
    }

    console.log("📚 Top 3 results:")
    results.slice(0, 3).forEach((result, idx) => {
      console.log(
        `\n   [${idx + 1}] "${result.title}" by ${result.authors?.join(", ") || "Unknown"}`
      )
      console.log(`       Distance: ${result.distance.toFixed(4)}`)
      console.log(`       Chunk: ${result.chunk.substring(0, 150)}...`)
    })

    // 6. Build context and test full AI response
    console.log("\n\n6️⃣ Testing full AI Q&A pipeline...")
    console.log(`\n❓ Question: "${testQuestion}"\n`)

    // Build context from chunks with book citations
    const contextParts = results.map((chunk, index) => {
      const citation = chunk.publish_year
        ? `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}, ${chunk.publish_year}`
        : `"${chunk.title}" by ${chunk.authors?.join(", ") || "Unknown"}`

      return `[${index + 1}] From ${citation}:\n${chunk.chunk}`
    })

    const context = contextParts.join("\n\n")

    // Compose the system prompt
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

    const userPrompt = `Question: ${testQuestion}`

    // Increment usage counter
    await incrementAIUsage(testUser.id)
    console.log("📊 Usage counter incremented\n")

    // Stream the AI response
    console.log("🤖 AI Answer:")
    console.log("─".repeat(80))

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
      maxRetries: 2,
    })

    let fullAnswer = ""
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart)
      fullAnswer += textPart
    }

    console.log("\n" + "─".repeat(80))
    console.log("\n✅ AI response completed!")
    console.log(`📝 Answer length: ${fullAnswer.length} characters`)
  } catch (error) {
    console.error("❌ Error during testing:", error)
    process.exit(1)
  }

  console.log("\n\n🎉 All tests passed!")
  console.log("\n📝 Next steps:")
  console.log("   1. The AI action is ready at src/app/library/ai-actions.ts")
  console.log(
    "   2. Call askQuestionAction({ question: 'your question' }) from the UI"
  )
  console.log(
    "   3. Use the returned textStream with readStreamableValue() in client components"
  )
  console.log("   4. Stage 4 will build the chat interface component")

  process.exit(0)
}

testAIQuery().catch(error => {
  console.error("Fatal error:", error)
  process.exit(1)
})
