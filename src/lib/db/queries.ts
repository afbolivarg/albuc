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

  let user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, supabaseUser.id),
    with: {
      books: {
        orderBy: desc(books.updatedAt),
      },
    },
  });

  if (!user) {
    await ensureAppUser(supabaseUser);
    user = await db.query.users.findFirst({
      where: eq(users.supabaseUserId, supabaseUser.id),
      with: {
        books: {
          orderBy: desc(books.updatedAt),
        },
      },
    });
  }

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
    .where(and(eq(books.id, book.id), eq(books.userId, book.userId)))
    .returning();
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string | null;
    lastName?: string | null;
    onboardingCompletedAt?: Date | null;
    handle?: string | null;
    publicProfile?: boolean;
    locale?: string;
    localeLocked?: boolean;
  },
) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();

  return updated ?? null;
}

export async function listUserBooksForAsk(userId: string) {
  return db
    .select({
      id: books.id,
      title: books.title,
      authors: books.authors,
      status: books.status,
      publishYear: books.publishYear,
      hasNotes: sql<boolean>`${books.noteMarkdown} is not null and length(trim(${books.noteMarkdown})) > 0`,
    })
    .from(books)
    .where(eq(books.userId, userId))
    .orderBy(desc(books.updatedAt));
}

export async function updateBookCover(
  bookId: string,
  coverPath: string,
  spineColors: string[] | null,
) {
  const [updated] = await db
    .update(books)
    .set({ coverPath, spineColors, updatedAt: new Date() })
    .where(eq(books.id, bookId))
    .returning();

  return updated ?? null;
}

/** @deprecated Use updateBookCover */
export async function updateBookCoverPath(bookId: string, coverPath: string) {
  return updateBookCover(bookId, coverPath, null);
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
      b.cover_path,
      b.cover_id,
      (nc.embedding <=> ${embeddingString}::vector) as distance
    FROM ${noteChunks} nc
    JOIN ${books} b ON nc.book_id = b.id
    WHERE b.user_id = ${userId}
    ${modelFilter}
    ORDER BY nc.embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `);

  return results as unknown as Array<{
    id: string;
    chunk: string;
    book_id: string;
    model_version: string;
    title: string;
    authors: string[];
    publish_year: number | null;
    cover_path: string | null;
    cover_id: number | null;
    distance: number;
  }>;
}

export async function getPublicProfileByHandle(handle: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.handle, handle.toLowerCase()),
  });
  if (!user?.publicProfile || !user.handle) return null;
  const shelf = await db
    .select({
      id: books.id,
      title: books.title,
      authors: books.authors,
      status: books.status,
      rating: books.rating,
      coverPath: books.coverPath,
      coverId: books.coverId,
      spineColors: books.spineColors,
      workKey: books.workKey,
      shareSlug: books.shareSlug,
      visibility: books.visibility,
    })
    .from(books)
    .where(eq(books.userId, user.id))
    .orderBy(desc(books.updatedAt));
  return { user, shelf };
}

export async function getPublicNoteBySlug(slug: string) {
  const book = await db.query.books.findFirst({
    where: and(eq(books.shareSlug, slug), eq(books.visibility, "public")),
    with: { user: true },
  });
  if (!book) return null;
  return book;
}
