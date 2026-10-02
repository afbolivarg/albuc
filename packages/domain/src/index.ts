export const BOOK_STATUSES = ["WANT", "OWNED", "READING", "READ"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const NOTE_VISIBILITIES = ["private", "public"] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const SEARCH_RESULT_LIMIT = 20;
export const MIN_SEARCH_QUERY_LENGTH = 3;

export const RATING_MIN = 0;
export const RATING_MAX = 5;

export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])?$/;

export const COVERS_BASE_URL = "https://covers.openlibrary.org";
export const BOOK_COVERS_BUCKET = "book-covers";

export const SOFT_MONTHLY_QUERY_LIMIT = 200;
export const HARD_MONTHLY_QUERY_LIMIT = 2_000;

export type CoverSize = "S" | "M" | "L";

export type BookSearchHit = {
  workKey: string;
  editionKey?: string;
  title: string;
  authors: string[];
  authorKeys: string[];
  publishYear?: number;
  coverId?: number;
  isbn10?: string[];
  isbn13?: string[];
};

export type Profile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  handle: string | null;
  locale: Locale;
  publicProfile: boolean;
  needsOnboarding: boolean;
};

export type Book = {
  id: string;
  workKey: string;
  editionKey: string | null;
  title: string;
  authors: string[];
  publishYear: number | null;
  coverUrl: string | null;
  status: BookStatus;
  rating: number | null;
  noteMarkdown: string | null;
  visibility: NoteVisibility;
  shareUrl: string | null;
  updatedAt: string;
};

export type AskSource = {
  n: number;
  bookId: string;
  title: string;
  authors: string[];
  year: number | null;
  coverUrl: string | null;
  excerpt: string;
};

export type AskAnswer = {
  answer: string;
  sources: AskSource[];
  overSoftCap: boolean;
};

export type ApiErrorCode =
  | "auth_required"
  | "invalid_request"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal";

export type ApiError = {
  error: ApiErrorCode;
  message: string;
};

export function isBookStatus(value: string): value is BookStatus {
  return (BOOK_STATUSES as readonly string[]).includes(value);
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "es";
}

export function isNoteVisibility(value: string): value is NoteVisibility {
  return value === "private" || value === "public";
}

export function normalizeHandle(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase().replace(/^@+/, "");
}

export function isValidHandle(raw: string) {
  return HANDLE_RE.test(normalizeHandle(raw));
}

export function isValidRating(rating: number) {
  return (
    Number.isInteger(rating) && rating >= RATING_MIN && rating <= RATING_MAX
  );
}

export function needsOnboarding(completedAt: Date | string | null | undefined) {
  return completedAt == null;
}

export function displayName(profile: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [profile.firstName, profile.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();
  return name || profile.email;
}

export function nameInitial(profile: {
  firstName: string | null;
  email: string;
}) {
  const source = profile.firstName?.trim() || profile.email;
  return source.charAt(0).toUpperCase() || "?";
}

export function openLibraryCoverUrl(
  coverId: number | null | undefined,
  size: CoverSize = "M",
): string | null {
  if (!coverId) return null;
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`;
}

export function storedCoverUrl(
  supabaseUrl: string,
  coverPath: string | null | undefined,
): string | null {
  if (!coverPath) return null;
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BOOK_COVERS_BUCKET}/${coverPath}`;
}

export function displayCoverUrl(
  book: { coverPath?: string | null; coverId?: number | null },
  supabaseUrl: string,
  size: CoverSize = "M",
): string | null {
  return (
    storedCoverUrl(supabaseUrl, book.coverPath) ??
    openLibraryCoverUrl(book.coverId, size)
  );
}

export function statusLabel(status: BookStatus, locale: Locale = "en") {
  const labels: Record<Locale, Record<BookStatus, string>> = {
    en: {
      WANT: "Want",
      OWNED: "Owned",
      READING: "Reading",
      READ: "Read",
    },
    es: {
      WANT: "Quiero",
      OWNED: "Tengo",
      READING: "Leyendo",
      READ: "Leído",
    },
  };
  return labels[locale][status];
}
