import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";
import type { AskSource } from "./citations";

export type RetrievedChunk = {
  id: string;
  chunk: string;
  book_id: string;
  model_version: string;
  title: string;
  authors: string[];
  publish_year: number | null;
  cover_path: string | null;
  cover_id: number | null;
  distance: number;
};

const MAX_CHUNKS_PER_BOOK = 3;

export function selectContextChunks(
  chunks: RetrievedChunk[],
  limit = 10,
): RetrievedChunk[] {
  const counts = new Map<string, number>();
  const selected: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    const used = counts.get(chunk.book_id) ?? 0;
    if (used >= MAX_CHUNKS_PER_BOOK) continue;
    counts.set(chunk.book_id, used + 1);
    selected.push(chunk);
    if (selected.length >= limit) break;
  }

  return selected;
}

export function toAskSources(chunks: RetrievedChunk[]): AskSource[] {
  return chunks.map((chunk, index) => ({
    n: index + 1,
    bookId: chunk.book_id,
    title: chunk.title,
    authors: chunk.authors ?? [],
    year: chunk.publish_year,
    coverUrl: getBookDisplayCoverUrl(
      {
        coverPath: chunk.cover_path,
        coverId: chunk.cover_id,
      },
      "M",
    ),
    excerpt: chunk.chunk.trim().slice(0, 220),
  }));
}
