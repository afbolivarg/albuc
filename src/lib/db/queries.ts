import type { User as SupabaseUser } from "@supabase/supabase-js";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type Book,
  books,
  type NewBook,
  noteChunks,
  type User,
  users,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/supabase/user";

/**
 * Ensure an app user exists for the given Supabase auth user (create if missing).
 * Used after sign-in so library and other features have a local user record.
 */
export async function ensureAppUser(supabaseUser: SupabaseUser): Promise<User> {
  const existing = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, supabaseUser.id),
  });
  if (existing) {
    return existing;
  }
  const [created] = await db
    .insert(users)
    .values({
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email ?? "",
    })
    .returning();
  if (!created) throw new Error("Failed to create app user");
  return created;
}

export async function getUser() {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  let user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, supabaseUser.id),
  });

  if (!user) {
    user = await ensureAppUser(supabaseUser);
  }

  return user;
}

export async function getUserWithBooks() {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, supabaseUser.id),
    with: {
      books: {
        orderBy: desc(books.updatedAt),
      },
    },
  });

  return user ?? null;
}

export async function getUserWithBook(bookId: string) {
  const supabaseUser = await getCurrentUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, supabaseUser.id),
    with: {
      books: {
        where: eq(books.id, bookId),
      },
    },
  });
  return user ?? null;
}

export async function getUserBookByWorkKey(userId: string, workKey: string) {
  const result = await db.query.books.findFirst({
    where: and(eq(books.userId, userId), eq(books.workKey, workKey)),
  });
  return result ?? null;
}

export async function getUserBook(userId: string, bookId: string) {
  const result = await db
    .select()
    .from(books)
    .where(and(eq(books.userId, userId), eq(books.id, bookId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createBook(book: NewBook) {
  return await db.insert(books).values(book).returning();
}

export async function updateBook(book: Book) {
  return await db
    .update(books)
    .set(book)
    .where(eq(books.id, book.id))
    .returning();
}

export async function updateBookCoverPath(bookId: string, coverPath: string) {
  const [updated] = await db
    .update(books)
    .set({ coverPath, updatedAt: new Date() })
    .where(eq(books.id, bookId))
    .returning();

  return updated ?? null;
}

/**
 * Perform semantic search across a user's note chunks
 * Returns the top K most similar chunks with their book metadata
 */
export async function semanticSearchNotes(
  userId: string,
  queryEmbedding: number[],
  limit: number = 8,
  modelVersion?: string,
) {
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const modelFilter = modelVersion
    ? sql`AND nc.model_version = ${modelVersion}`
    : sql``;

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
  `);

  return results as unknown as Array<{
    id: string;
    chunk: string;
    book_id: string;
    model_version: string;
    title: string;
    authors: string[];
    publish_year: number;
    distance: number;
  }>;
}
