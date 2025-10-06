"use server"

import { revalidatePath } from "next/cache"
import { getUserBook, updateBook, getUser } from "@/lib/db/queries"
import { processBookEmbeddingsAsync } from "@/lib/ai/embedding-pipeline"

export async function updateBookStatusAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  console.log("updateBookStatusAction - called with FormData")
  const bookId = formData.get("bookId") as string
  const status = formData.get("status") as "WANT" | "OWNED" | "READING" | "READ"

  console.log("updateBookStatusAction - bookId:", bookId)
  console.log("updateBookStatusAction - status:", status)

  if (!bookId || !status) {
    console.log("updateBookStatusAction - Missing required fields")
    return { error: "Missing required fields" }
  }

  try {
    const user = await getUser()
    console.log("updateBookStatusAction - user:", user?.id)
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get the current book data
    const currentBook = await getUserBook(user.id, bookId)
    console.log(
      "updateBookStatusAction - currentBook:",
      currentBook?.id,
      currentBook?.status
    )
    if (!currentBook) {
      return { error: "Book not found" }
    }

    // Update the book with new status
    console.log(
      "updateBookStatusAction - updating from",
      currentBook.status,
      "to",
      status
    )
    const updatedBook = await updateBook({
      ...currentBook,
      status,
      updatedAt: new Date(),
    })

    console.log(
      "updateBookStatusAction - updatedBook result:",
      updatedBook?.length,
      updatedBook?.[0]?.status
    )

    if (!updatedBook || updatedBook.length === 0) {
      console.log("updateBookStatusAction - Failed to update book")
      return { error: "Failed to update book" }
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    console.log("updateBookStatusAction - Success!")
    return { success: true }
  } catch (error) {
    console.error("updateBookStatusAction - Error:", error)
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
    console.error("Failed to update rating:", error)
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
    console.error("Failed to update notes:", error)
    return { error: "Failed to update notes" }
  }
}
