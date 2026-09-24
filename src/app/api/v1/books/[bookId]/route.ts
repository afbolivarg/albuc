import { isBookStatus, isNoteVisibility, isValidRating } from "@albuc/domain";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { processBookEmbeddingsAsync } from "@/lib/ai/embedding-pipeline";
import { apiError, readJson } from "@/lib/api/http";
import { presentBook } from "@/lib/api/present";
import { appUserFromRequest } from "@/lib/api/session";
import {
  revalidatePublicNote,
  revalidatePublicProfile,
} from "@/lib/cache-revalidate";
import { db } from "@/lib/db";
import { getUserBook, updateBook } from "@/lib/db/queries";
import { books } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n/config";
import { createShareSlug, publicProfilePath } from "@/lib/sharing";

type RouteContext = { params: Promise<{ bookId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");
  const { bookId } = await context.params;
  const book = await getUserBook(user.id, bookId);
  if (!book) return apiError(404, "not_found", "Book not found.");
  return Response.json(
    presentBook(book, isLocale(user.locale) ? user.locale : "en"),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");
  const { bookId } = await context.params;
  const current = await getUserBook(user.id, bookId);
  if (!current) return apiError(404, "not_found", "Book not found.");

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError(400, "invalid_request", "Missing changes.");
  }
  const input = body as Record<string, unknown>;
  const next = { ...current, updatedAt: new Date() };

  if ("status" in input) {
    const status = String(input.status);
    if (!isBookStatus(status)) {
      return apiError(400, "invalid_request", "Unknown status.");
    }
    next.status = status;
  }

  if ("rating" in input) {
    if (input.rating == null) {
      next.rating = null;
    } else {
      const rating = Number(input.rating);
      if (!isValidRating(rating)) {
        return apiError(
          400,
          "invalid_request",
          "Rating must be a whole number from 0 to 5.",
        );
      }
      next.rating = String(rating);
    }
  }

  let notesChanged = false;
  if ("noteMarkdown" in input) {
    const note = input.noteMarkdown == null ? "" : String(input.noteMarkdown);
    next.noteMarkdown = note.trim() || null;
    notesChanged = true;
  }

  if ("visibility" in input) {
    const visibility = String(input.visibility);
    if (!isNoteVisibility(visibility)) {
      return apiError(400, "invalid_request", "Unknown visibility.");
    }
    next.visibility = visibility;
    next.shareSlug = current.shareSlug ?? createShareSlug();
  }

  const updated = await updateBook(next);
  const saved = updated[0];
  if (!saved) return apiError(500, "internal", "Could not save that book.");

  if (notesChanged) {
    processBookEmbeddingsAsync(bookId, saved.noteMarkdown);
  }
  if ("visibility" in input && saved.shareSlug) {
    revalidatePublicNote(saved.shareSlug);
    if (user.handle) {
      revalidatePath(publicProfilePath(user.handle));
      revalidatePublicProfile(user.handle);
    }
  }

  revalidatePath("/library");
  revalidatePath(`/library/${bookId}`);
  return Response.json(
    presentBook(saved, isLocale(user.locale) ? user.locale : "en"),
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");
  const { bookId } = await context.params;
  const removed = await db
    .delete(books)
    .where(and(eq(books.id, bookId), eq(books.userId, user.id)))
    .returning({ id: books.id });
  if (removed.length === 0) {
    return apiError(404, "not_found", "Book not found.");
  }
  revalidatePath("/library");
  return Response.json({ ok: true });
}
