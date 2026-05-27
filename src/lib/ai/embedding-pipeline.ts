/**
 * Embedding Pipeline Worker
 * Processes book notes by splitting them into chunks and generating embeddings.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewNoteChunk, noteChunks } from "@/lib/db/schema";
import { createLogger, toError } from "@/lib/logger";
import { generateEmbeddings, getEmbeddingModelId } from "./embedding";
import { splitNoteIntoChunks } from "./note-splitter";

const log = createLogger("embedding-pipeline");

interface EmbeddingJobResult {
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
async function processBookEmbeddings(
  bookId: string,
  noteMarkdown: string | null,
): Promise<EmbeddingJobResult> {
  const startTime = Date.now();
  log.debug("Starting", { bookId });

  try {
    // If note is empty or null, delete existing chunks and return
    if (!noteMarkdown || noteMarkdown.trim().length === 0) {
      log.debug("Note is empty, deleting existing chunks", { bookId });
      await db.delete(noteChunks).where(eq(noteChunks.bookId, bookId));
      log.debug("Completed with empty note", {
        bookId,
        chunksProcessed: 0,
        durationMs: Date.now() - startTime,
      });
      return {
        success: true,
        chunksProcessed: 0,
      };
    }

    // Step 1: Split the note into chunks (outside transaction)
    const chunks = splitNoteIntoChunks(noteMarkdown);
    log.debug("Split note into chunks", { bookId, chunkCount: chunks.length });

    if (chunks.length === 0) {
      // No chunks to process, delete existing ones
      log.debug("No chunks generated, deleting existing ones", { bookId });
      await db.delete(noteChunks).where(eq(noteChunks.bookId, bookId));
      log.debug("Completed with empty note", {
        bookId,
        chunksProcessed: 0,
        durationMs: Date.now() - startTime,
      });
      return {
        success: true,
        chunksProcessed: 0,
      };
    }

    // Step 2: Generate embeddings for all chunks (outside transaction)
    log.debug("Generating embeddings", { bookId, chunkCount: chunks.length });
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts);
    log.debug("Generated embeddings", {
      bookId,
      embeddingCount: embeddings.length,
    });

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
    log.debug("Starting database transaction", { bookId });
    await db.transaction(async (tx) => {
      // Delete existing chunks for this book
      await tx.delete(noteChunks).where(eq(noteChunks.bookId, bookId));

      // Insert new chunks with embeddings
      if (noteChunksToInsert.length > 0) {
        await tx.insert(noteChunks).values(noteChunksToInsert);
      }
    });
    log.debug("Transaction completed", { bookId });

    const duration = Date.now() - startTime;
    log.info("Successfully processed book", {
      bookId,
      chunksProcessed: chunks.length,
      durationMs: duration,
    });

    return {
      success: true,
      chunksProcessed: chunks.length,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error("processBookEmbeddings failed", toError(error), {
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
  log.debug("Queued async processing", { bookId });

  // Fire and forget - process in background
  processBookEmbeddings(bookId, noteMarkdown)
    .then((result) => {
      if (result.success) {
        log.info("Async processing complete", {
          bookId,
          chunksProcessed: result.chunksProcessed,
        });
      } else {
        log.error(
          "processBookEmbeddingsAsync failed",
          new Error(result.error ?? "Embedding failed"),
          { bookId },
        );
      }
    })
    .catch((error) => {
      log.error("processBookEmbeddingsAsync failed", toError(error), {
        bookId,
      });
    });
}
