/**
 * Note Splitter Utility
 * Splits markdown notes into chunks of approximately 200 tokens for embedding.
 * A simple heuristic: 1 token ≈ 4 characters for English text.
 * Target: 200 tokens ≈ 800 characters per chunk
 */

const TARGET_CHUNK_SIZE = 800; // ~200 tokens

export interface NoteChunk {
  text: string;
  index: number;
}

/**
 * Splits a note into chunks suitable for embedding.
 * Attempts to split on paragraph boundaries first, then sentences, then character limit.
 */
export function splitNoteIntoChunks(noteMarkdown: string): NoteChunk[] {
  if (!noteMarkdown || noteMarkdown.trim().length === 0) {
    return [];
  }

  const chunks: NoteChunk[] = [];
  const paragraphs = noteMarkdown.split(/\n\n+/); // Split on double newlines

  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // If adding this paragraph would exceed target size
    if (
      currentChunk.length > 0 &&
      currentChunk.length + trimmedParagraph.length > TARGET_CHUNK_SIZE
    ) {
      // Save current chunk and start new one
      if (currentChunk.trim().length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
        });
      }
      currentChunk = trimmedParagraph;
    } else {
      // Add to current chunk
      currentChunk +=
        (currentChunk.length > 0 ? "\n\n" : "") + trimmedParagraph;
    }
  }

  // Add remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex++,
    });
  }

  // Handle case where we have very large paragraphs that need to be split further
  const finalChunks: NoteChunk[] = [];
  let finalIndex = 0;

  for (const chunk of chunks) {
    if (chunk.text.length <= TARGET_CHUNK_SIZE * 1.5) {
      // Chunk is reasonable size, keep it
      finalChunks.push({
        text: chunk.text,
        index: finalIndex++,
      });
    } else {
      // Split large chunk by sentences
      const sentences = chunk.text.split(/(?<=[.!?])\s+/);
      let subChunk = "";

      for (const sentence of sentences) {
        if (
          subChunk.length > 0 &&
          subChunk.length + sentence.length > TARGET_CHUNK_SIZE
        ) {
          if (subChunk.trim().length > 0) {
            finalChunks.push({
              text: subChunk.trim(),
              index: finalIndex++,
            });
          }
          subChunk = sentence;
        } else {
          subChunk += (subChunk.length > 0 ? " " : "") + sentence;
        }
      }

      if (subChunk.trim().length > 0) {
        finalChunks.push({
          text: subChunk.trim(),
          index: finalIndex++,
        });
      }
    }
  }

  return finalChunks;
}

/**
 * Estimates the token count for a given text.
 * Uses simple heuristic: 1 token ≈ 4 characters
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
