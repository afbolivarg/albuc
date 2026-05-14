"use server"

import { revalidatePath } from "next/cache"
import { getUserBook, updateBook, getUser } from "@/lib/db/queries"
import { processBookEmbeddingsAsync } from "@/lib/ai/embedding-pipeline"
import { logError } from "@/lib/logger"

export async function updateBookStatusAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const bookId = formData.get("bookId") as string
  const status = formData.get("status") as "WANT" | "OWNED" | "READING" | "READ"

  if (!bookId || !status) {
    return { error: "Missing required fields" }
  }

  try {
    const user = await getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    const currentBook = await getUserBook(user.id, bookId)
    if (!currentBook) {
      return { error: "Book not found" }
    }

    const updatedBook = await updateBook({
      ...currentBook,
      status,
      updatedAt: new Date(),
    })

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" }
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return { success: true }
  } catch (error) {
    logError(error, { operation: "updateBookStatusAction", bookId })
    return { error: "Failed to update status" }
  }
}

export async function updateBookRatingAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const bookId = formData.get("bookId") as string
  const rating = parseFloat(formData.get("rating") as string)

  if (!bookId || isNaN(rating)) {
    return { error: "Missing required fields" }
  }

  // Validate rating (0-5 in 0.5 increments)
  if (rating < 0 || rating > 5 || (rating * 2) % 1 !== 0) {
    return { error: "Rating must be between 0 and 5 in 0.5 increments" }
  }

  try {
    const user = await getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get the current book data
    const currentBook = await getUserBook(user.id, bookId)
    if (!currentBook) {
      return { error: "Book not found" }
    }

    // Update the book with new rating
    const updatedBook = await updateBook({
      ...currentBook,
      rating: rating.toString(),
      updatedAt: new Date(),
    })

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" }
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return { success: true }
  } catch (error) {
    logError(error, { operation: "updateBookRatingAction", bookId })
    return { error: "Failed to update rating" }
  }
}

export async function updateBookNotesAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const bookId = formData.get("bookId") as string
  const noteMarkdown = formData.get("noteMarkdown") as string

  if (!bookId) {
    return { error: "Missing required fields" }
  }

  try {
    const user = await getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get the current book data
    const currentBook = await getUserBook(user.id, bookId)
    if (!currentBook) {
      return { error: "Book not found" }
    }

    // Update the book with new notes
    const updatedBook = await updateBook({
      ...currentBook,
      noteMarkdown: noteMarkdown?.trim() || null,
      updatedAt: new Date(),
    })

    if (!updatedBook || updatedBook.length === 0) {
      return { error: "Failed to update book" }
    }

    // Trigger embedding pipeline asynchronously (Stage 2)
    // This processes the note chunks and generates embeddings in the background
    processBookEmbeddingsAsync(bookId, noteMarkdown?.trim() || null)

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return { success: true }
  } catch (error) {
    logError(error, { operation: "updateBookNotesAction", bookId })
    return { error: "Failed to update notes" }
  }
}
