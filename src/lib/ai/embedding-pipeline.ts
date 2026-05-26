/**
 * Embedding Pipeline Worker
 * Processes book notes by splitting them into chunks and generating embeddings.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewNoteChunk, noteChunks } from "@/lib/db/schema";
import { logError } from "@/lib/logger";
import { generateEmbeddings, getEmbeddingModelId } from "./embedding";
import { splitNoteIntoChunks } from "./note-splitter";

export interface EmbeddingJobResult {
  success: boolean;
  chunksProcessed: number;
  error?: string;
}

/**
 * Process a book's notes and generate embeddings.
 * This is the main entry point for the embedding pipeline.
 *
 * Flow:
 * 1. Split the note into chunks
 * 2. Generate embeddings for each chunk
 * 3. In a transaction: delete existing chunks and insert new ones
 *    (ensures atomicity - if insert fails, delete is rolled back)
 *
 * @param bookId - The ID of the book
 * @param noteMarkdown - The markdown content of the note
 * @returns Result indicating success and number of chunks processed
 */
export async function processBookEmbeddings(
  bookId: string,
  noteMarkdown: string | null,
): Promise<EmbeddingJobResult> {
  const startTime = Date.now();
  console.log(`[Embedding Pipeline] Starting for book ${bookId}`);

  try {
    // If note is empty or null, delete existing chunks and return
    if (!noteMarkdown || noteMarkdown.trim().length === 0) {
      console.log(
        `[Embedding Pipeline] Note is empty, deleting existing chunks for book ${bookId}`,
      );
      await db.delete(noteChunks).where(eq(noteChunks.bookId, bookId));
      console.log(
        `[Embedding Pipeline] Completed for book ${bookId} (0 chunks) in ${Date.now() - startTime}ms`,
      );
      return {
        success: true,
        chunksProcessed: 0,
      };
    }

    // Step 1: Split the note into chunks (outside transaction)
    const chunks = splitNoteIntoChunks(noteMarkdown);
    console.log(
      `[Embedding Pipeline] Split note into ${chunks.length} chunks for book ${bookId}`,
    );

    if (chunks.length === 0) {
      // No chunks to process, delete existing ones
      console.log(
        `[Embedding Pipeline] No chunks generated, deleting existing ones for book ${bookId}`,
      );
      await db.delete(noteChunks).where(eq(noteChunks.bookId, bookId));
      console.log(
        `[Embedding Pipeline] Completed for book ${bookId} (0 chunks) in ${Date.now() - startTime}ms`,
      );
      return {
        success: true,
        chunksProcessed: 0,
      };
    }

    // Step 2: Generate embeddings for all chunks (outside transaction)
    console.log(
      `[Embedding Pipeline] Generating embeddings for ${chunks.length} chunks (book ${bookId})`,
    );
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);
    console.log(
      `[Embedding Pipeline] Generated ${embeddings.length} embeddings for book ${bookId}`,
    );

    // Step 3: Prepare chunks for insertion with current model version
    const modelVersion = getEmbeddingModelId();
    const noteChunksToInsert: NewNoteChunk[] = chunks.map((chunk, index) => ({
      bookId,
      chunk: chunk.text,
      embedding: embeddings[index],
      modelVersion,
    }));

    // Step 4: Delete old chunks and insert new ones in a transaction
    // This ensures atomicity - if insert fails, delete is rolled back
    console.log(
      `[Embedding Pipeline] Starting database transaction for book ${bookId}`,
    );
    await db.transaction(async (tx) => {
      // Delete existing chunks for this book
      await tx.delete(noteChunks).where(eq(noteChunks.bookId, bookId));

      // Insert new chunks with embeddings
      if (noteChunksToInsert.length > 0) {
        await tx.insert(noteChunks).values(noteChunksToInsert);
      }
    });
    console.log(
      `[Embedding Pipeline] Transaction completed for book ${bookId}`,
    );

    const duration = Date.now() - startTime;
    console.log(
      `[Embedding Pipeline] Successfully processed book ${bookId}: ${chunks.length} chunks in ${duration}ms`,
    );

    return {
      success: true,
      chunksProcessed: chunks.length,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, {
      operation: "processBookEmbeddings",
      bookId,
      durationMs: duration,
    });
    return {
      success: false,
      chunksProcessed: 0,
      error: error instanceof Error ? error.message : "Unknown embedding error",
    };
  }
}

/**
 * Process embeddings for a book asynchronously without blocking.
 * Useful for background processing.
 *
 * @param bookId - The ID of the book
 * @param noteMarkdown - The markdown content of the note
 */
export async function processBookEmbeddingsAsync(
  bookId: string,
  noteMarkdown: string | null,
): Promise<void> {
  console.log(
    `[Embedding Pipeline] Queued async processing for book ${bookId}`,
  );

  // Fire and forget - process in background
  processBookEmbeddings(bookId, noteMarkdown)
    .then((result) => {
      if (result.success) {
        console.log(
          `[Embedding Pipeline] ✓ Async processing complete for book ${bookId}: ${result.chunksProcessed} chunks`,
        );
      } else {
        logError(new Error(result.error ?? "Embedding failed"), {
          operation: "processBookEmbeddingsAsync",
          bookId,
        });
      }
    })
    .catch((error) => {
      logError(error, {
        operation: "processBookEmbeddingsAsync",
        bookId,
      });
    });
}
