import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";
import type { BookSearchResult } from "@/lib/open-library.shared";

export type { BookSearchResult } from "@/lib/open-library.shared";

const log = createLogger("open-library");

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const SEARCH_CACHE_SECONDS = 3600;
const SEARCH_TIMEOUT_MS = 8000;

export const SEARCH_RESULT_LIMIT = 20;
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

function openLibraryUserAgent() {
  return `Albuc/1.0 (${env.NEXT_PUBLIC_SITE_URL}; book-search)`;
}

function compactIsbn(value: string): string {
  return value.replace(/[-\s]/g, "");
}

function toSearchQuery(query: string): string {
  const isbn = compactIsbn(query);
  if (/^(97[89])?\d{10}$/.test(isbn)) {
    return `isbn:${isbn}`;
  }
  return query;
}

function mapDocs(docs: OpenLibrarySearchResult[]): BookSearchResult[] {
  const seen = new Set<string>();
  const results: BookSearchResult[] = [];

  for (const doc of docs) {
    if (!doc.key || !doc.title || seen.has(doc.key)) continue;
    seen.add(doc.key);

    const isbn10: string[] = [];
    const isbn13: string[] = [];

    if (doc.isbn) {
      for (const isbn of doc.isbn) {
        if (isbn.length === 10) isbn10.push(isbn);
        else if (isbn.length === 13) isbn13.push(isbn);
      }
    }

    results.push({
      workKey: doc.key,
      editionKey: doc.edition_key?.[0],
      title: doc.title,
      authors: doc.author_name || [],
      authorKeys: doc.author_key || [],
      publishYear: doc.first_publish_year,
      coverId: doc.cover_i,
      isbn10: isbn10.length > 0 ? isbn10 : undefined,
      isbn13: isbn13.length > 0 ? isbn13 : undefined,
    });
  }

  return results.sort(
    (a, b) => Number(Boolean(b.coverId)) - Number(Boolean(a.coverId)),
  );
}

async function fetchSearch(
  query: string,
  page: number,
  limit: number,
): Promise<OpenLibrarySearchResponse> {
  const offset = (page - 1) * limit;
  const searchParams = new URLSearchParams({
    q: query,
    fields:
      "key,title,author_name,author_key,first_publish_year,cover_i,edition_key,isbn,oclc,lccn",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const request = async () => {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/search.json?${searchParams}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": openLibraryUserAgent(),
        },
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    return (await response.json()) as OpenLibrarySearchResponse;
  };

  try {
    return await request();
  } catch (error) {
    log.warn("search retrying after failure", {
      error: toError(error).message,
    });
    return await request();
  }
}

async function searchBooksUncached(
  query: string,
  page: number,
  limit: number,
): Promise<{ results: BookSearchResult[]; total: number; page: number }> {
  try {
    const searchQuery = toSearchQuery(query);
    let data = await fetchSearch(searchQuery, page, limit);

    if (data.docs.length === 0 && searchQuery !== query) {
      data = await fetchSearch(query, page, limit);
    }

    return {
      results: mapDocs(data.docs),
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
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return { results: [], total: 0, page };
  }

  const cacheKey = normalizedQuery.toLowerCase();
  const cachedSearch = unstable_cache(
    () => searchBooksUncached(normalizedQuery, page, limit),
    ["open-library-search", cacheKey, String(page), String(limit)],
    { revalidate: SEARCH_CACHE_SECONDS, tags: ["open-library-search"] },
  );

  return cachedSearch();
}
