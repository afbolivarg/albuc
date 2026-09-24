import {
  BOOK_COVERS_BUCKET,
  type CoverSize,
  displayCoverUrl,
  storedCoverUrl,
} from "@albuc/domain";
import { env } from "@/lib/env";

export { BOOK_COVERS_BUCKET };

export const BOOK_COVER_CACHE_CONTROL = "31536000";

export function getBookCoverUrl(
  coverPath: string | null | undefined,
): string | null {
  return storedCoverUrl(env.NEXT_PUBLIC_SUPABASE_URL, coverPath);
}

export function getBookDisplayCoverUrl(
  book: {
    coverPath?: string | null;
    coverId?: number | null;
  },
  size: CoverSize = "M",
): string | null {
  return displayCoverUrl(book, env.NEXT_PUBLIC_SUPABASE_URL, size);
}
