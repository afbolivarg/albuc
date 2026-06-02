import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createLogger, toError } from "@/lib/logger";
import { getCoverUrl } from "@/lib/open-library.shared";
import { extractSpineColorsFromImage } from "@/lib/spine-colors.server";
import type { SpinePalette } from "@/lib/spine-colors.shared";
import {
  BOOK_COVER_CACHE_CONTROL,
  BOOK_COVERS_BUCKET,
} from "./book-covers.shared";

const log = createLogger("supabase.book-covers");

export type UploadedBookCover = {
  coverPath: string;
  spineColors: SpinePalette | null;
};

export async function uploadBookCoverFromOpenLibrary(
  supabase: SupabaseClient,
  options: {
    supabaseUserId: string;
    bookId: string;
    coverId: number;
  },
): Promise<UploadedBookCover | null> {
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
    const spineColors = await extractSpineColorsFromImage(imageBuffer);

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

    return { coverPath, spineColors };
  } catch (error) {
    log.error("cover upload failed", toError(error), {
      bookId: options.bookId,
      coverId: options.coverId,
    });
    return null;
  }
}
