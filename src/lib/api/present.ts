import {
  type Book as BookDTO,
  displayCoverUrl,
  isLocale,
  type Locale,
  needsOnboarding,
  type Profile,
} from "@albuc/domain";
import type { Book, User } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { publicNoteUrl } from "@/lib/sharing";

export function presentProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    handle: user.handle,
    locale: isLocale(user.locale) ? user.locale : "en",
    publicProfile: user.publicProfile,
    needsOnboarding: needsOnboarding(user.onboardingCompletedAt),
  };
}

export function presentBook(book: Book, locale: Locale): BookDTO {
  const shareUrl =
    book.visibility === "public" && book.shareSlug
      ? publicNoteUrl(book.shareSlug, locale)
      : null;

  return {
    id: book.id,
    workKey: book.workKey,
    editionKey: book.editionKey,
    title: book.title,
    authors: book.authors ?? [],
    publishYear: book.publishYear,
    coverUrl: displayCoverUrl(book, env.NEXT_PUBLIC_SUPABASE_URL, "L"),
    status: book.status,
    rating: book.rating == null ? null : Number(book.rating),
    noteMarkdown: book.noteMarkdown,
    visibility: book.visibility,
    shareUrl,
    updatedAt: book.updatedAt.toISOString(),
  };
}
