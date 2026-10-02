import { type BookStatus, isBookStatus, isValidRating } from "@albuc/domain";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { apiError, readJson } from "@/lib/api/http";
import { presentBook } from "@/lib/api/present";
import { appUserFromRequest } from "@/lib/api/session";
import { db } from "@/lib/db";
import { createBook, getUserBookByWorkKey } from "@/lib/db/queries";
import { books } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n/config";
import { persistBookCoverFromOpenLibrary } from "@/lib/supabase/book-covers.server";

export async function GET(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const query = url.searchParams.get("q")?.trim();
  const locale = isLocale(user.locale) ? user.locale : "en";

  if (status && !isBookStatus(status)) {
    return apiError(400, "invalid_request", "Unknown status.");
  }

  const filters = [eq(books.userId, user.id)];
  if (status && isBookStatus(status)) filters.push(eq(books.status, status));
  if (query) {
    const pattern = `%${query}%`;
    filters.push(
      sql`(${books.title} ILIKE ${pattern} OR EXISTS (
        SELECT 1 FROM unnest(${books.authors}) AS author
        WHERE author ILIKE ${pattern}
      ))`,
    );
  }

  const rows = await db
    .select()
    .from(books)
    .where(and(...filters))
    .orderBy(desc(books.updatedAt));

  return Response.json({
    books: rows.map((book) => presentBook(book, locale)),
  });
}

export async function POST(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError(400, "invalid_request", "Missing book.");
  }
  const input = body as Record<string, unknown>;
  const workKey = String(input.workKey ?? "");
  const title = String(input.title ?? "").trim();
  const status = String(input.status ?? "WANT");
  if (!workKey || !title || !isBookStatus(status)) {
    return apiError(400, "invalid_request", "Choose a book and a status.");
  }

  const rating =
    input.rating == null || input.rating === ""
      ? undefined
      : Number(input.rating);
  if (rating != null && !isValidRating(rating)) {
    return apiError(
      400,
      "invalid_request",
      "Rating must be a whole number from 0 to 5.",
    );
  }

  const existing = await getUserBookByWorkKey(user.id, workKey);
  if (existing) {
    return apiError(409, "conflict", "That book is already in your library.");
  }

  const authors = Array.isArray(input.authors)
    ? input.authors.map((author) => String(author))
    : [];
  const authorKeys = Array.isArray(input.authorKeys)
    ? input.authorKeys.map((key) => String(key))
    : [];
  const coverId = Number(input.coverId);
  const publishYear = Number(input.publishYear);

  const [created] = await createBook({
    userId: user.id,
    workKey,
    editionKey: input.editionKey ? String(input.editionKey) : undefined,
    title,
    status: status as BookStatus,
    authors,
    authorKeys,
    publishYear: Number.isFinite(publishYear) ? publishYear : undefined,
    coverId: Number.isFinite(coverId) && coverId > 0 ? coverId : undefined,
    isbn10: Array.isArray(input.isbn10) ? input.isbn10.map(String) : [],
    isbn13: Array.isArray(input.isbn13) ? input.isbn13.map(String) : [],
    rating: rating == null ? undefined : String(rating),
  });

  if (!created) return apiError(500, "internal", "Could not add that book.");

  if (created.coverId) {
    after(async () => {
      await persistBookCoverFromOpenLibrary({
        supabaseUserId: user.supabaseUserId,
        bookId: created.id,
        coverId: created.coverId!,
      });
    });
  }

  revalidatePath("/library");
  const locale = isLocale(user.locale) ? user.locale : "en";
  return Response.json(presentBook(created, locale), { status: 201 });
}
