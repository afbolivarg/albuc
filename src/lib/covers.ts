import { env } from "@/lib/env";
import { getCoverUrl } from "@/lib/open-library.shared";

export const BOOK_COVERS_BUCKET = "albuc-covers";
export const BOOK_COVER_CACHE_CONTROL = "31536000";

export function getBookCoverUrl(
  coverPath: string | null | undefined,
): string | null {
  if (!coverPath || !env.NEXT_PUBLIC_COVERS_URL) {
    return null;
  }
  const base = env.NEXT_PUBLIC_COVERS_URL.replace(/\/$/, "");
  return `${base}/${coverPath}`;
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
