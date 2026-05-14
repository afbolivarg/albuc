import { getCurrentUser } from "@/lib/supabase/user"
import { db } from "@/lib/db"
import {
  Book,
  NewBook,
  NewUser,
  User,
  books,
  users,
  noteChunks,
  NewNoteChunk,
} from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import type { User as SupabaseUser } from "@supabase/supabase-js"

/**
 * Ensure an app user exists for the given Supabase auth user (create if missing).
 * Used after sign-in so library and other features have a local user record.
 */
export async function ensureAppUser(supabaseUser: SupabaseUser): Promise<User> {
  const existing = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
  })
  if (existing) {
    return existing
  }
  const name =
    (supabaseUser.user_metadata?.full_name as string) ||
    (supabaseUser.user_metadata?.name as string) ||
    null
  const imageUrl =
    (supabaseUser.user_metadata?.avatar_url as string) ||
    (supabaseUser.user_metadata?.picture as string) ||
    null
  const [created] = await db
    .insert(users)
    .values({
      googleSub: supabaseUser.id,
      email: supabaseUser.email ?? "",
      name,
      imageUrl,
    })
    .returning()
  if (!created) throw new Error("Failed to create app user")
  return created
}

export async function getUser() {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  let user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
  })

  if (!user) {
    user = await ensureAppUser(supabaseUser)
  }

  return user
}

export async function getUserByGoogleSub(googleSub: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, googleSub),
  })

  return user ?? null
}

export async function updateUser(user: User) {
  return await db
    .update(users)
    .set(user)
    .where(eq(users.googleSub, user.googleSub))
    .returning()
}

export async function createUser(user: NewUser) {
  return await db.insert(users).values(user).returning()
}

export async function getUserWithBooks() {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      books: {
        orderBy: desc(books.updatedAt),
      },
    },
  })

  return user ?? null
}

export async function getUserWithBook(bookId: string) {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      books: {
        where: eq(books.id, bookId),
      },
    },
  })
  return user ?? null
}

export async function getUserBookByWorkKey(userId: string, workKey: string) {
  const result = await db.query.books.findFirst({
    where: and(eq(books.userId, userId), eq(books.workKey, workKey)),
  })
  return result ?? null
}

export async function getUserBook(userId: string, bookId: string) {
  const result = await db
    .select()
    .from(books)
    .where(and(eq(books.userId, userId), eq(books.id, bookId)))
    .limit(1)

  return result.length > 0 ? result[0] : null
}

export async function createBook(book: NewBook) {
  return await db.insert(books).values(book).returning()
}

export async function updateBook(book: Book) {
  return await db
    .update(books)
    .set(book)
    .where(eq(books.id, book.id))
    .returning()
}

// ========================================
// Note Chunks Queries
// ========================================

/**
 * Create multiple note chunks for a book (used during embedding pipeline)
 */
export async function createNoteChunks(chunks: NewNoteChunk[]) {
  if (chunks.length === 0) {
    return []
  }
  return await db.insert(noteChunks).values(chunks).returning()
}

/**
 * Delete all note chunks for a specific book
 */
export async function deleteNoteChunksByBookId(bookId: string) {
  return await db.delete(noteChunks).where(eq(noteChunks.bookId, bookId))
}

/**
 * Get all note chunks for a specific book
 */
export async function getNoteChunksByBookId(bookId: string) {
  return await db.select().from(noteChunks).where(eq(noteChunks.bookId, bookId))
}

/**
 * Perform semantic search across a user's note chunks
 * Returns the top K most similar chunks with their book metadata
 *
 * @param userId - User ID to search within
 * @param queryEmbedding - The embedding vector of the search query
 * @param limit - Maximum number of results to return
 * @param modelVersion - Optional: only search chunks from specific model version
 */
export async function semanticSearchNotes(
  userId: string,
  queryEmbedding: number[],
  limit: number = 8,
  modelVersion?: string
) {
  // Convert the embedding array to the pgvector format string
  const embeddingString = `[${queryEmbedding.join(",")}]`

  // Build WHERE clause with optional model version filter
  const modelFilter = modelVersion
    ? sql`AND nc.model_version = ${modelVersion}`
    : sql``

  const results = await db.execute(sql`
    SELECT 
      nc.id,
      nc.chunk,
      nc.book_id,
      nc.model_version,
      b.title,
      b.authors,
      b.publish_year,
      (nc.embedding <-> ${embeddingString}::vector) as distance
    FROM ${noteChunks} nc
    JOIN ${books} b ON nc.book_id = b.id
    WHERE b.user_id = ${userId}
    ${modelFilter}
    ORDER BY nc.embedding <-> ${embeddingString}::vector
    LIMIT ${limit}
  `)

  return results as unknown as Array<{
    id: string
    chunk: string
    book_id: string
    model_version: string
    title: string
    authors: string[]
    publish_year: number
    distance: number
  }>
}
