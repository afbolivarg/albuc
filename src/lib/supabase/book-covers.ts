import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { getCoverUrl } from "@/lib/open-library.shared";
import { createLogger, toError } from "@/lib/logger";

const log = createLogger("supabase.book-covers");

export const BOOK_COVERS_BUCKET = "book-covers";
export const BOOK_COVER_CACHE_CONTROL = "31536000";

export function getBookCoverUrl(
  coverPath: string | null | undefined,
): string | null {
  if (!coverPath) return null;
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BOOK_COVERS_BUCKET}/${coverPath}`;
}

export async function uploadBookCoverFromOpenLibrary(
  supabase: SupabaseClient,
  options: {
    supabaseUserId: string;
    bookId: string;
    coverId: number;
  },
): Promise<string | null> {
  const sourceUrl = getCoverUrl(options.coverId, "M");
  if (!sourceUrl) {
    return null;
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Albuc (https://albuc.com)",
      },
    });

    if (!response.ok) {
      log.warn("cover fetch failed", {
        bookId: options.bookId,
        coverId: options.coverId,
        status: response.status,
      });
      return null;
    }

    const coverPath = `${options.supabaseUserId}/${options.bookId}.jpg`;
    const imageBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from(BOOK_COVERS_BUCKET)
      .upload(coverPath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: BOOK_COVER_CACHE_CONTROL,
      });

    if (error) {
      log.error("cover upload failed", toError(error), {
        bookId: options.bookId,
        coverPath,
      });
      return null;
    }

    return coverPath;
  } catch (error) {
    log.error("cover upload failed", toError(error), {
      bookId: options.bookId,
      coverId: options.coverId,
    });
    return null;
  }
}
