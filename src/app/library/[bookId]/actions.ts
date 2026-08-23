"use server";

import { revalidatePath } from "next/cache";
import { processBookEmbeddingsAsync } from "@/lib/ai/embedding-pipeline";
import { getUser, getUserBook, updateBook } from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";
import {
  createShareSlug,
  publicNoteUrl,
  publicProfilePath,
} from "@/lib/sharing";

const log = createLogger("library.book-actions");

export async function updateBookStatusAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const bookId = formData.get("bookId") as string;
  const status = formData.get("status") as
    | "WANT"
    | "OWNED"
    | "READING"
    | "READ";

  if (!bookId || !status) {
    return { error: "Missing required fields" };
  }

  try {
    const user = await getUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    const currentBook = await getUserBook(user.id, bookId);
    if (!currentBook) {
      return { error: "Book not found" };
    }

    const updatedBook = await updateBook({
      ...currentBook,
      status,
      updatedAt: new Date(),
    });

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" };
    }

    revalidatePath("/library");
    revalidatePath(`/library/${bookId}`);
    return { success: true };
  } catch (error) {
    log.error("updateBookStatusAction failed", toError(error), { bookId });
    return { error: "Failed to update status" };
  }
}

export async function updateBookRatingAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const bookId = formData.get("bookId") as string;
  const rating = parseFloat(formData.get("rating") as string);

  if (!bookId || Number.isNaN(rating)) {
    return { error: "Missing required fields" };
  }

  if (rating < 0 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating must be a whole number from 0 to 5" };
  }

  try {
    const user = await getUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    // Get the current book data
    const currentBook = await getUserBook(user.id, bookId);
    if (!currentBook) {
      return { error: "Book not found" };
    }

    // Update the book with new rating
    const updatedBook = await updateBook({
      ...currentBook,
      rating: rating.toString(),
      updatedAt: new Date(),
    });

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" };
    }

    revalidatePath("/library");
    revalidatePath(`/library/${bookId}`);
    return { success: true };
  } catch (error) {
    log.error("updateBookRatingAction failed", toError(error), { bookId });
    return { error: "Failed to update rating" };
  }
}

export async function updateBookNotesAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const bookId = formData.get("bookId") as string;
  const noteMarkdown = formData.get("noteMarkdown") as string;

  if (!bookId) {
    return { error: "Missing required fields" };
  }

  try {
    const user = await getUser();
    if (!user) {
      return { error: "Authentication required" };
    }

    // Get the current book data
    const currentBook = await getUserBook(user.id, bookId);
    if (!currentBook) {
      return { error: "Book not found" };
    }

    // Update the book with new notes
    const updatedBook = await updateBook({
      ...currentBook,
      noteMarkdown: noteMarkdown?.trim() || null,
      updatedAt: new Date(),
    });

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" };
    }

    // Trigger embedding pipeline asynchronously (Stage 2)
    // This processes the note chunks and generates embeddings in the background
    processBookEmbeddingsAsync(bookId, noteMarkdown?.trim() || null);

    revalidatePath("/library");
    revalidatePath(`/library/${bookId}`);
    return { success: true };
  } catch (error) {
    log.error("updateBookNotesAction failed", toError(error), { bookId });
    return { error: "Failed to update notes" };
  }
}

export async function togglePublicNoteAction(
  bookId: string,
  makePublic: boolean,
) {
  const user = await getUser();
  if (!user) return { error: "Authentication required" };
  const currentBook = await getUserBook(user.id, bookId);
  if (!currentBook) return { error: "Book not found" };

  const shareSlug = currentBook.shareSlug ?? createShareSlug();
  const updated = await updateBook({
    ...currentBook,
    visibility: makePublic ? "public" : "private",
    shareSlug,
    updatedAt: new Date(),
  });
  if (!updated?.[0]) return { error: "Failed to update sharing" };
  revalidatePath(`/library/${bookId}`);
  if (user.handle) revalidatePath(publicProfilePath(user.handle));
  return {
    success: true as const,
    visibility: updated[0].visibility,
    shareSlug: updated[0].shareSlug,
    url:
      makePublic && updated[0].shareSlug
        ? publicNoteUrl(updated[0].shareSlug)
        : null,
  };
}
