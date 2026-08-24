"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createBook, getUser, getUserBookByWorkKey } from "@/lib/db/queries";
import { createLogger, toError } from "@/lib/logger";
import {
  type BookSearchResult,
  MIN_SEARCH_QUERY_LENGTH,
  SEARCH_RESULT_LIMIT,
  searchBooks as searchOpenLibrary,
} from "@/lib/open-library";
import { persistBookCoverFromOpenLibrary } from "@/lib/supabase/book-covers.server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";

const log = createLogger("library.actions");

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { error } = await supabase.auth.signOut();

  if (error) {
    log.warn("signOut supabase error", { message: error.message });
  }

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.delete(cookie.name);
    }
  }

  revalidatePath("/");
  revalidatePath("/library");
  redirect("/sign-in");
}

export async function searchBooksAction(
  _prevState: { results: BookSearchResult[]; error?: string },
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    return { results: [], error: "errors.searchSignIn" };
  }

  const query = formData.get("query") as string;

  if (!query?.trim()) {
    return { results: [] };
  }

  if (query.trim().length < MIN_SEARCH_QUERY_LENGTH) {
    return {
      results: [],
      error: "errors.searchMin",
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
      error: "errors.searchFailed",
    };
  }
}

export async function addBookAction(
  _prevState: { success: boolean; error?: string; bookId?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string; bookId?: string }> {
  try {
    const user = await getUser();

    if (!user) {
      return { success: false, error: "errors.signInAgain" };
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
        error: "errors.bookExists",
      };
    }

    const [createdBook] = await createBook({
      userId: user.id,
      workKey: bookData.workKey,
      editionKey: bookData.editionKey,
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

    if (bookData.coverId) {
      const coverJob = {
        supabaseUserId: user.supabaseUserId,
        bookId: createdBook.id,
        coverId: bookData.coverId,
      };

      after(async () => {
        await persistBookCoverFromOpenLibrary(coverJob);
      });
    }

    revalidatePath("/library");
    revalidatePath("/library/add");
    return { success: true, bookId: createdBook.id };
  } catch (error) {
    log.error("addBookAction failed", toError(error));
    return {
      success: false,
      error: "errors.addBookFailed",
    };
  }
}
