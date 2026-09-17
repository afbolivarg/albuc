import { notFound } from "next/navigation";

import { getPublicNoteBySlug } from "@/lib/db/queries";
import { translate } from "@/lib/i18n/translate";
import { NoteOgImage } from "@/lib/og/images";
import { renderOgImage, resolveCoverSrc } from "@/lib/og/render";
import { parseOgLocale } from "@/lib/public-metadata";
import { APP_NAME } from "@/lib/pwa";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; locale: string }> },
) {
  const { slug, locale: rawLocale } = await params;
  const locale = parseOgLocale(rawLocale);
  if (!locale || !slug) notFound();

  const book = await getPublicNoteBySlug(slug);
  if (!book) notFound();

  const handleLabel = book.user.handle ? `@${book.user.handle}` : APP_NAME;
  const eyebrow = translate(locale, "public.notesOn", { handle: handleLabel });
  const authors = book.authors?.filter(Boolean).join(", ") || null;
  const coverSrc = await resolveCoverSrc(getBookDisplayCoverUrl(book, "L"));

  return renderOgImage(
    <NoteOgImage
      authors={authors}
      coverSrc={coverSrc}
      eyebrow={eyebrow}
      title={book.title}
    />,
  );
}
