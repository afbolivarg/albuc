import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicGone } from "@/components/billing/public-gone";
import { Book3dCover } from "@/components/book-3d-cover";
import { PublicPageShell } from "@/components/public-page-shell";
import { getPublicNoteBySlug } from "@/lib/db/queries";
import { translate } from "@/lib/i18n/translate";
import {
  publicNoteMetadata,
  resolvePublicLocaleFrom,
} from "@/lib/public-metadata";
import { publicProfilePath } from "@/lib/sharing";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";
import { PublicNoteMarkdown } from "./public-note-markdown";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([
    params,
    resolvePublicLocaleFrom(searchParams),
  ]);
  return publicNoteMetadata(slug, locale);
}

export default async function PublicNotePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const [book, locale] = await Promise.all([
    getPublicNoteBySlug(slug),
    resolvePublicLocaleFrom(searchParams),
  ]);
  if (!book) return <PublicGone />;

  const handleLabel = book.user.handle ? `@${book.user.handle}` : null;
  const from = handleLabel
    ? translate(locale, "public.from", { handle: handleLabel })
    : null;
  const backLabel = translate(locale, "public.back");
  const cover = getBookDisplayCoverUrl(book, "L");
  const profileHref = book.user.handle
    ? publicProfilePath(book.user.handle, locale)
    : "/";

  return (
    <PublicPageShell locale={locale}>
      <Link
        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        href={profileHref}
      >
        <ChevronLeft className="size-4" />
        {backLabel}
      </Link>
      <div className="mt-6 flex items-start gap-5">
        <Book3dCover
          src={cover}
          title={book.title}
          className="w-[92px] shrink-0"
          width={92}
          height={140}
          sizes="92px"
          priority
        />
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            {book.title}
          </h1>
          {from ? (
            <p className="mt-2 text-sm text-muted-foreground">{from}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-10">
        {book.noteMarkdown ? (
          <PublicNoteMarkdown markdown={book.noteMarkdown} />
        ) : null}
      </div>
    </PublicPageShell>
  );
}
