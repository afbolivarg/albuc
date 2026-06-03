import "server-only";

import { revalidatePath } from "next/cache";
import { updateBookCover } from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";
import { getCoverUrl } from "@/lib/open-library.shared";
import { extractSpineColorsFromImage } from "@/lib/spine-colors.server";
import type { SpinePalette } from "@/lib/spine-colors.shared";
import { serializeSpineColors } from "@/lib/spine-colors.shared";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BOOK_COVER_CACHE_CONTROL,
  BOOK_COVERS_BUCKET,
} from "./book-covers.shared";

const log = createLogger("supabase.book-covers");

type UploadedBookCover = {
  coverPath: string;
  spineColors: SpinePalette | null;
};

async function uploadBookCoverFromOpenLibrary(options: {
  supabaseUserId: string;
  bookId: string;
  coverId: number;
}): Promise<UploadedBookCover | null> {
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

    const supabase = createAdminClient();
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

export async function persistBookCoverFromOpenLibrary(options: {
  supabaseUserId: string;
  bookId: string;
  coverId: number;
}): Promise<void> {
  try {
    const uploaded = await uploadBookCoverFromOpenLibrary(options);
    if (!uploaded) return;

    await updateBookCover(
      options.bookId,
      uploaded.coverPath,
      uploaded.spineColors ? serializeSpineColors(uploaded.spineColors) : null,
    );

    revalidatePath("/library");
    revalidatePath(`/library/${options.bookId}`);
  } catch (error) {
    log.error("persistBookCoverFromOpenLibrary failed", toError(error), {
      bookId: options.bookId,
      coverId: options.coverId,
    });
  }
}
