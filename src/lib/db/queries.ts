import { getCurrentUser } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { userBooks } from "@/lib/db/schema"
import { eq, desc, and, or, ilike } from "drizzle-orm"

export async function getUser() {
  return await getCurrentUser()
}

export async function getUserBooks(
  userId: string,
  filters?: {
    status?: "WANT" | "OWNED" | "READING" | "READ"
    search?: string
    sortBy?: "updated_at" | "rating" | "title" | "author" | "publish_year"
    sortOrder?: "asc" | "desc"
  }
) {
  // Build where conditions
  const conditions = [eq(userBooks.userId, userId)]

  // Apply search filter
  if (filters?.search) {
    conditions.push(
      or(
        ilike(userBooks.title, `%${filters.search}%`)
        // TODO: Add array search for authors when needed
      )!
    )
  }

  // Apply status filter
  if (filters?.status) {
    conditions.push(eq(userBooks.status, filters.status))
  }

  // Apply sorting
  const sortColumn = filters?.sortBy || "updated_at"
  const sortDirection = filters?.sortOrder || "desc"

  let orderByClause
  if (sortColumn === "updated_at") {
    orderByClause =
      sortDirection === "desc" ? desc(userBooks.updatedAt) : userBooks.updatedAt
  } else if (sortColumn === "title") {
    orderByClause =
      sortDirection === "desc" ? desc(userBooks.title) : userBooks.title
  } else if (sortColumn === "rating") {
    orderByClause =
      sortDirection === "desc" ? desc(userBooks.rating) : userBooks.rating
  } else if (sortColumn === "publish_year") {
    orderByClause =
      sortDirection === "desc"
        ? desc(userBooks.publishYear)
        : userBooks.publishYear
  } else {
    orderByClause = desc(userBooks.updatedAt)
  }

  return await db
    .select()
    .from(userBooks)
    .where(and(...conditions))
    .orderBy(orderByClause)
}

export async function getUserBook(userId: string, bookId: string) {
  const books = await db
    .select()
    .from(userBooks)
    .where(and(eq(userBooks.userId, userId), eq(userBooks.id, bookId)))
    .limit(1)

  return books.length > 0 ? books[0] : null
}
