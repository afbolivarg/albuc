"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { userBooks } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { searchBooks as searchOpenLibrary } from "@/lib/open-library"

export async function searchBooks(query: string, page: number = 1) {
  if (!query.trim()) {
    return { results: [], total: 0, page: 1 }
  }

  try {
    return await searchOpenLibrary(query, page, 12)
  } catch (error) {
    console.error("Error searching books:", error)
    throw new Error("Failed to search books")
  }
}

export async function addBookToLibrary(bookData: {
  workKey: string
  editionKey?: string
  title: string
  authors: string[]
  authorKeys?: string[]
  publishYear?: number
  coverId?: number
  isbn10?: string[]
  isbn13?: string[]
  status?: "WANT" | "OWNED" | "READING" | "READ"
  rating?: number
  noteMarkdown?: string
}) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  try {
    // Check if book already exists in user's library
    const existingBook = await db
      .select()
      .from(userBooks)
      .where(
        and(
          eq(userBooks.userId, user.id),
          eq(userBooks.workKey, bookData.workKey)
        )
      )
      .limit(1)

    if (existingBook.length > 0) {
      throw new Error("Book already exists in your library")
    }

    // Process markdown if provided
    let noteHtml: string | undefined
    if (bookData.noteMarkdown) {
      // For now, store markdown as-is. In production, you'd want proper sanitization
      noteHtml = bookData.noteMarkdown
    }

    const [newBook] = await db
      .insert(userBooks)
      .values({
        userId: user.id,
        workKey: bookData.workKey,
        editionKey: bookData.editionKey,
        title: bookData.title,
        authors: bookData.authors,
        authorKeys: bookData.authorKeys,
        publishYear: bookData.publishYear,
        coverId: bookData.coverId,
        isbn10: bookData.isbn10,
        isbn13: bookData.isbn13,
        status: bookData.status || "WANT",
        rating: bookData.rating?.toString(),
        noteMarkdown: bookData.noteMarkdown,
        noteHtml,
      })
      .returning()

    revalidatePath("/library")
    return newBook
  } catch (error) {
    console.error("Error adding book to library:", error)
    throw error
  }
}

export async function updateBookStatus(
  bookId: string,
  status: "WANT" | "OWNED" | "READING" | "READ"
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  try {
    const [updatedBook] = await db
      .update(userBooks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, user.id)))
      .returning()

    if (!updatedBook) {
      throw new Error("Book not found")
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return updatedBook
  } catch (error) {
    console.error("Error updating book status:", error)
    throw error
  }
}

export async function updateBookRating(bookId: string, rating: number) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  // Validate rating (0-5 in 0.5 increments)
  if (rating < 0 || rating > 5 || (rating * 2) % 1 !== 0) {
    throw new Error("Rating must be between 0 and 5 in 0.5 increments")
  }

  try {
    const [updatedBook] = await db
      .update(userBooks)
      .set({
        rating: rating.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, user.id)))
      .returning()

    if (!updatedBook) {
      throw new Error("Book not found")
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return updatedBook
  } catch (error) {
    console.error("Error updating book rating:", error)
    throw error
  }
}

export async function updateBookNotes(bookId: string, noteMarkdown: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }

  try {
    // Process markdown - in production, you'd want proper sanitization
    const noteHtml = noteMarkdown.trim() || null

    const [updatedBook] = await db
      .update(userBooks)
      .set({
        noteMarkdown: noteMarkdown.trim() || null,
        noteHtml,
        updatedAt: new Date(),
      })
      .where(and(eq(userBooks.id, bookId), eq(userBooks.userId, user.id)))
      .returning()

    if (!updatedBook) {
      throw new Error("Book not found")
    }

    revalidatePath("/library")
    revalidatePath(`/library/${bookId}`)
    return updatedBook
  } catch (error) {
    console.error("Error updating book notes:", error)
    throw error
  }
}
