"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createBook,
  getUser,
  getUserBookByWorkKey,
  updateBookCover,
} from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";
import {
  type BookSearchResult,
  MIN_SEARCH_QUERY_LENGTH,
  SEARCH_RESULT_LIMIT,
  searchBooks as searchOpenLibrary,
} from "@/lib/open-library";
import { serializeSpineColors } from "@/lib/spine-colors.shared";
import { uploadBookCoverFromOpenLibrary } from "@/lib/supabase/book-covers.server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

const log = createLogger("library.actions");

export async function signOut() {
  const supabase = createServerClient(await cookies());

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Failed to sign out");
  }

  revalidatePath("/");
  revalidatePath("/library");
  redirect("/");
}

export async function searchBooksAction(
  _prevState: { results: BookSearchResult[]; error?: string },
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const query = formData.get("query") as string;

  if (!query?.trim()) {
    return { results: [] };
  }

  if (query.trim().length < MIN_SEARCH_QUERY_LENGTH) {
    return {
      results: [],
      error: `Enter at least ${MIN_SEARCH_QUERY_LENGTH} characters to search.`,
    };
  }

  try {
    const result = await searchOpenLibrary(query, 1, SEARCH_RESULT_LIMIT);

    return {
      results: result.results || [],
    };
  } catch (error) {
    log.error("searchBooksAction failed", toError(error));
    return {
      results: [],
      error: "Failed to search books",
    };
  }
}

export async function addBookAction(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
) {
  try {
    const user = await getUser();

    if (!user) {
      throw new Error("Authentication required");
    }

    const bookData = {
      workKey: formData.get("workKey") as string,
      editionKey: (formData.get("editionKey") as string) || undefined,
      title: formData.get("title") as string,
      authors: JSON.parse(formData.get("authors") as string),
      authorKeys: JSON.parse((formData.get("authorKeys") as string) || "[]"),
      publishYear:
        parseInt(formData.get("publishYear") as string, 10) || undefined,
      coverId: parseInt(formData.get("coverId") as string, 10) || undefined,
      isbn10: JSON.parse((formData.get("isbn10") as string) || "[]"),
      isbn13: JSON.parse((formData.get("isbn13") as string) || "[]"),
      status: formData.get("status") as "WANT" | "OWNED" | "READING" | "READ",
      rating: parseFloat(formData.get("rating") as string) || undefined,
    };

    const existingBook = await getUserBookByWorkKey(user.id, bookData.workKey);

    if (existingBook) {
      return {
        success: false,
        error: "Book already exists in your library",
      };
    }

    const [createdBook] = await createBook({
      userId: user.id,
      workKey: bookData.workKey,
      title: bookData.title,
      status: bookData.status,
      authors: bookData.authors,
      authorKeys: bookData.authorKeys,
      publishYear: bookData.publishYear,
      coverId: bookData.coverId,
      isbn10: bookData.isbn10,
      isbn13: bookData.isbn13,
      rating: bookData.rating?.toString() || undefined,
    });

    if (!createdBook) {
      throw new Error("Failed to add book");
    }

    if (createdBook && bookData.coverId) {
      const supabaseUser = await getCurrentUser();
      if (supabaseUser) {
        const supabase = createServerClient(await cookies());
        const uploaded = await uploadBookCoverFromOpenLibrary(supabase, {
          supabaseUserId: supabaseUser.id,
          bookId: createdBook.id,
          coverId: bookData.coverId,
        });

        if (uploaded) {
          await updateBookCover(
            createdBook.id,
            uploaded.coverPath,
            uploaded.spineColors
              ? serializeSpineColors(uploaded.spineColors)
              : null,
          );
        }
      }
    }

    revalidatePath("/library");
    revalidatePath(`/library/${createdBook.id}`);
    return { success: true };
  } catch (error) {
    log.error("addBookAction failed", toError(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add book",
    };
  }
}
