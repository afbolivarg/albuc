import { logError } from "@/lib/logger"

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org"
const COVERS_BASE_URL = "https://covers.openlibrary.org"

export interface OpenLibrarySearchResult {
  key: string // work key like "/works/OL166894W"
  title: string
  author_name?: string[]
  author_key?: string[]
  first_publish_year?: number
  cover_i?: number
  edition_key?: string[]
  isbn?: string[]
  oclc?: string[]
  lccn?: string[]
}

export interface OpenLibrarySearchResponse {
  numFound: number
  start: number
  numFoundExact: boolean
  docs: OpenLibrarySearchResult[]
}

export interface BookSearchResult {
  workKey: string
  editionKey?: string
  title: string
  authors: string[]
  authorKeys: string[]
  publishYear?: number
  coverId?: number
  isbn10?: string[]
  isbn13?: string[]
}

export async function searchBooks(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ results: BookSearchResult[]; total: number; page: number }> {
  try {
    const offset = (page - 1) * limit
    const searchParams = new URLSearchParams({
      q: query,
      fields:
        "key,title,author_name,author_key,first_publish_year,cover_i,edition_key,isbn,oclc,lccn",
      limit: limit.toString(),
      offset: offset.toString(),
    })

    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/search.json?${searchParams}`,
      {
        headers: {
          "User-Agent": "Cozy Books App (contact@cozybooks.app)",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`)
    }

    const data: OpenLibrarySearchResponse = await response.json()

    const results: BookSearchResult[] = data.docs.map(doc => {
      // Extract ISBN-10 and ISBN-13 from the isbn array
      const isbn10: string[] = []
      const isbn13: string[] = []

      if (doc.isbn) {
        doc.isbn.forEach(isbn => {
          if (isbn.length === 10) {
            isbn10.push(isbn)
          } else if (isbn.length === 13) {
            isbn13.push(isbn)
          }
        })
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
      }
    })

    return {
      results,
      total: data.numFound,
      page,
    }
  } catch (error) {
    logError(error, { operation: "searchBooks" })
    throw new Error("Failed to search books")
  }
}

export function getCoverUrl(
  coverId: number | undefined,
  size: "S" | "M" | "L" = "M"
): string | null {
  if (!coverId) return null
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`
}

export function getAuthorPhotoUrl(
  authorKey: string,
  size: "S" | "M" | "L" = "M"
): string | null {
  if (!authorKey) return null
  // Remove the /authors/ prefix if present
  const cleanKey = authorKey.replace("/authors/", "")
  return `${COVERS_BASE_URL}/a/olid/${cleanKey}-${size}.jpg`
}
