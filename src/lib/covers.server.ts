import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { updateBookCover } from "@/lib/db/queries";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";
import { getCoverUrl } from "@/lib/open-library.shared";
import { extractSpineColorsFromImage } from "@/lib/spine-colors.server";
import type { SpinePalette } from "@/lib/spine-colors.shared";
import { serializeSpineColors } from "@/lib/spine-colors.shared";
import { BOOK_COVER_CACHE_CONTROL, BOOK_COVERS_BUCKET } from "./covers";

const log = createLogger("covers");

type UploadedBookCover = {
  coverPath: string;
  spineColors: SpinePalette | null;
};

function r2Client(): S3Client | null {
  if (
    !env.R2_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY
  ) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadBookCoverFromOpenLibrary(options: {
  subjectId: string;
  bookId: string;
  coverId: number;
}): Promise<UploadedBookCover | null> {
  const sourceUrl = getCoverUrl(options.coverId, "M");
  const client = r2Client();
  if (!sourceUrl || !client) {
    return null;
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": `Albuc (${env.NEXT_PUBLIC_SITE_URL})`,
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

    const coverPath = `${options.subjectId}/${options.bookId}.webp`;
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const webpBuffer = await sharp(imageBuffer)
      .rotate()
      .resize(480, 720, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const spineColors = await extractSpineColorsFromImage(webpBuffer);

    await client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET || BOOK_COVERS_BUCKET,
        Key: coverPath,
        Body: webpBuffer,
        ContentType: "image/webp",
        CacheControl: `public, max-age=${BOOK_COVER_CACHE_CONTROL}`,
      }),
    );

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
  subjectId: string;
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
