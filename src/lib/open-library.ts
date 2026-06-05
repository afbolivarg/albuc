import { unstable_cache } from "next/cache";
import { createLogger, toError } from "@/lib/logger";
import type { BookSearchResult } from "@/lib/open-library.shared";

export type { BookSearchResult } from "@/lib/open-library.shared";

const log = createLogger("open-library");

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const SEARCH_CACHE_SECONDS = 3600;

export const SEARCH_RESULT_LIMIT = 10;
export const MIN_SEARCH_QUERY_LENGTH = 3;

interface OpenLibrarySearchResult {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_key?: string[];
  isbn?: string[];
  oclc?: string[];
  lccn?: string[];
}

interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibrarySearchResult[];
}

async function searchBooksUncached(
  query: string,
  page: number,
  limit: number,
): Promise<{ results: BookSearchResult[]; total: number; page: number }> {
  try {
    const offset = (page - 1) * limit;
    const searchParams = new URLSearchParams({
      q: query,
      fields:
        "key,title,author_name,author_key,first_publish_year,cover_i,edition_key,isbn,oclc,lccn",
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/search.json?${searchParams}`,
      {
        headers: {
          "User-Agent": "Albuc (https://albuc.com)",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();

    const results: BookSearchResult[] = data.docs.map((doc) => {
      const isbn10: string[] = [];
      const isbn13: string[] = [];

      if (doc.isbn) {
        doc.isbn.forEach((isbn) => {
          if (isbn.length === 10) {
            isbn10.push(isbn);
          } else if (isbn.length === 13) {
            isbn13.push(isbn);
          }
        });
      }

      return {
        workKey: doc.key,
        editionKey: doc.edition_key?.[0],
        title: doc.title,
        authors: doc.author_name || [],
        authorKeys: doc.author_key || [],
        publishYear: doc.first_publish_year,
        coverId: doc.cover_i,
        isbn10: isbn10.length > 0 ? isbn10 : undefined,
        isbn13: isbn13.length > 0 ? isbn13 : undefined,
      };
    });

    return {
      results,
      total: data.numFound,
      page,
    };
  } catch (error) {
    log.error("searchBooks failed", toError(error));
    throw new Error("Failed to search books");
  }
}

export async function searchBooks(
  query: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ results: BookSearchResult[]; total: number; page: number }> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return { results: [], total: 0, page };
  }

  const cachedSearch = unstable_cache(
    () => searchBooksUncached(normalizedQuery, page, limit),
    ["open-library-search", normalizedQuery, String(page), String(limit)],
    { revalidate: SEARCH_CACHE_SECONDS, tags: ["open-library-search"] },
  );

  return cachedSearch();
}
