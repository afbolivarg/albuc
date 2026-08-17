import type { UIMessage } from "ai";

export type AskSource = {
  n: number;
  bookId: string;
  title: string;
  authors: string[];
  year?: number | null;
  coverUrl: string | null;
  excerpt: string;
};

export type AskMessage = UIMessage<{
  sources: AskSource[];
}>;

export function stripBlockedMarkers(text: string): string {
  return text.replace(/\[blocked\]/gi, "");
}

export function uniqueSourcesByBook(sources: AskSource[]): AskSource[] {
  const seen = new Set<string>();
  const unique: AskSource[] = [];
  for (const source of sources) {
    if (seen.has(source.bookId)) continue;
    seen.add(source.bookId);
    unique.push(source);
  }
  return unique;
}
