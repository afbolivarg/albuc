/**
 * Script to process embeddings for all existing books with notes
 * Run with: npx tsx scripts/process-existing-notes.ts
 *
 * WARNING: This will make API calls to Google AI for every book with notes.
 * Ensure you have GOOGLE_GENERATIVE_AI_API_KEY set before running.
 */

import { db, client } from "../src/lib/db"
import { books } from "../src/lib/db/schema"
import { sql } from "drizzle-orm"
import { processBookEmbeddings } from "../src/lib/ai/embedding-pipeline"

async function processExistingNotes() {
  console.log("📚 Processing Embeddings for Existing Notes\n")

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is not set!")
    console.error("Add it to .env.local before running this script.\n")
    return
  }

  // Get all books with notes
  const booksWithNotes = await db
    .select({
      id: books.id,
      title: books.title,
      noteMarkdown: books.noteMarkdown,
    })
    .from(books)
    .where(
      sql`${books.noteMarkdown} IS NOT NULL AND ${books.noteMarkdown} != ''`
    )

  console.log(`Found ${booksWithNotes.length} book(s) with notes\n`)

  if (booksWithNotes.length === 0) {
    console.log("No books with notes to process.")
    return
  }

  let processed = 0
  let failed = 0
  let totalChunks = 0

  for (const book of booksWithNotes) {
    console.log(`Processing: "${book.title}"...`)

    try {
      const result = await processBookEmbeddings(book.id, book.noteMarkdown)

      if (result.success) {
        processed++
        totalChunks += result.chunksProcessed
        console.log(`  ✓ Success - ${result.chunksProcessed} chunks\n`)
      } else {
        failed++
        console.log(`  ✗ Failed - ${result.error}\n`)
      }
    } catch (error) {
      failed++
      console.log(`  ✗ Error - ${error}\n`)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Summary:")
  console.log(`  Total books: ${booksWithNotes.length}`)
  console.log(`  Processed: ${processed}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total chunks created: ${totalChunks}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

processExistingNotes()
  .then(() => {
    console.log("✅ Done!")
    client.end()
    process.exit(0)
  })
  .catch(error => {
    console.error("Fatal error:", error)
    client.end()
    process.exit(1)
  })
