import { env } from "@/lib/env";
import { getCoverUrl } from "@/lib/open-library.shared";

export const BOOK_COVERS_BUCKET = "book-covers";
export const BOOK_COVER_CACHE_CONTROL = "31536000";

export function getBookCoverUrl(
  coverPath: string | null | undefined,
): string | null {
  if (!coverPath) return null;
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BOOK_COVERS_BUCKET}/${coverPath}`;
}

export function getBookDisplayCoverUrl(
  book: {
    coverPath?: string | null;
    coverId?: number | null;
  },
  size: "S" | "M" | "L" = "M",
): string | null {
  return (
    getBookCoverUrl(book.coverPath) ??
    getCoverUrl(book.coverId ?? undefined, size)
  );
}
