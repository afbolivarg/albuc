/**
 * Script to verify the embedding pipeline setup
 * Run with: npx tsx scripts/verify-embeddings-setup.ts
 */

import { db, client } from "../src/lib/db"
import { books, noteChunks } from "../src/lib/db/schema"
import { eq, sql } from "drizzle-orm"

async function verifySetup() {
  console.log("🔍 Verifying Embedding Pipeline Setup\n")

  // 1. Check pgvector extension
  console.log("1. Checking pgvector extension...")
  try {
    const result = await db.execute(sql`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as has_vector
    `)
    const hasVector = (result as any)[0]?.has_vector

    if (hasVector) {
      console.log("   ✓ pgvector extension is installed\n")
    } else {
      console.log("   ✗ pgvector extension is NOT installed")
      console.log("   Run: CREATE EXTENSION IF NOT EXISTS vector;\n")
      return
    }
  } catch (error) {
    console.log("   ✗ Error checking pgvector:", error)
    return
  }

  // 2. Check note_chunks table exists
  console.log("2. Checking note_chunks table...")
  try {
    const result = await db.select().from(noteChunks).limit(1)
    console.log("   ✓ note_chunks table exists\n")
  } catch (error) {
    console.log("   ✗ note_chunks table does not exist")
    console.log("   Run: pnpm db:push\n")
    return
  }

  // 3. Check environment variable
  console.log("3. Checking GOOGLE_GENERATIVE_AI_API_KEY...")
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log("   ✓ API key is set\n")
  } else {
    console.log("   ✗ API key is NOT set")
    console.log("   Add to .env.local: GOOGLE_GENERATIVE_AI_API_KEY=your_key\n")
  }

  // 4. Check for books with notes but no chunks
  console.log("4. Checking for books with notes...")
  try {
    const booksWithNotes = await db
      .select({
        id: books.id,
        title: books.title,
        noteLength: sql<number>`LENGTH(${books.noteMarkdown})`,
      })
      .from(books)
      .where(
        sql`${books.noteMarkdown} IS NOT NULL AND ${books.noteMarkdown} != ''`
      )

    console.log(`   Found ${booksWithNotes.length} book(s) with notes`)

    if (booksWithNotes.length > 0) {
      // Check which ones have chunks
      for (const book of booksWithNotes) {
        const chunks = await db
          .select()
          .from(noteChunks)
          .where(eq(noteChunks.bookId, book.id))

        const status = chunks.length > 0 ? "✓" : "✗"
        console.log(
          `   ${status} "${book.title}" - ${chunks.length} chunks (note: ${book.noteLength} chars)`
        )
      }
    }
    console.log()
  } catch (error) {
    console.log("   Error checking books:", error, "\n")
  }

  // 5. Summary
  console.log("✅ Setup verification complete!")
  console.log("\nNext steps:")
  console.log("1. Make sure GOOGLE_GENERATIVE_AI_API_KEY is set in .env.local")
  console.log(
    "2. Update or add notes to a book to trigger embedding generation"
  )
  console.log("3. Check server logs for '[Embedding Pipeline]' messages")
}

verifySetup()
  .then(() => {
    client.end()
    process.exit(0)
  })
  .catch(error => {
    console.error("Fatal error:", error)
    client.end()
    process.exit(1)
  })
