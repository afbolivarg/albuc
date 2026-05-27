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

export function getCoverUrl(
  coverId: number | undefined,
  size: "S" | "M" | "L" = "M",
): string | null {
  if (!coverId) return null;
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`;
}
