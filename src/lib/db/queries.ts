import { getCurrentUser } from "@/lib/supabase/user"
import { db } from "@/lib/db"
import {
  Book,
  NewBook,
  NewUser,
  User,
  books,
  users,
  subscriptions,
  orders,
  noteChunks,
  NewNoteChunk,
} from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import { PlanType } from "@/lib/billing/plan"

export async function getUser() {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
  })

  return user ?? null
}

export async function getUserWithPlan(): Promise<
  (User & { plan: PlanType; bookLimit: number }) | null
> {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      subscriptions: true,
      orders: true,
    },
  })

  if (!user) {
    return null
  }

  // Determine plan based on subscriptions and orders
  const lifetimeVariantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME

  // Check for lifetime access first
  if (lifetimeVariantId) {
    const hasLifetime = user.orders.some(
      order => order.variantId === lifetimeVariantId && order.status === "paid"
    )

    if (hasLifetime) {
      return {
        ...user,
        plan: "lifetime" as PlanType,
        bookLimit: Number.POSITIVE_INFINITY,
      }
    }
  }

  // Check for active subscription
  const activeSubscription = user.subscriptions.find(sub =>
    ["active", "on_trial"].includes(sub.status)
  )

  if (activeSubscription) {
    return {
      ...user,
      plan: "monthly" as PlanType,
      bookLimit: Number.POSITIVE_INFINITY,
    }
  }

  // No active plan - return null to require subscription
  return null
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

// export async function getUserUsageAndPlan(userId: string) {
//   const [{ total }] = await db
//     .select({ total: count(userBooks.id) })
//     .from(userBooks)
//     .where(eq(userBooks.userId, userId))

//   const plan = await getUserPlan(userId)

//   return {
//     current: Number(total ?? 0),
//     limit: plan.bookLimit,
//     plan: plan.plan,
//     canAddMore:
//       plan.bookLimit === Infinity || Number(total ?? 0) < plan.bookLimit,
//   } as const
// }

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
