const COVERS_BASE_URL = "https://covers.openlibrary.org";

export interface BookSearchResult {
  workKey: string;
  editionKey?: string;
  title: string;
  authors: string[];
  authorKeys: string[];
  publishYear?: number;
  coverId?: number;
  isbn10?: string[];
  isbn13?: string[];
}

export const SEARCH_RESULT_LIMIT = 20;
export const MIN_SEARCH_QUERY_LENGTH = 3;

export function getCoverUrl(
  coverId: number | undefined,
  size: "S" | "M" | "L" = "M",
): string | null {
  if (!coverId) return null;
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`;
}
