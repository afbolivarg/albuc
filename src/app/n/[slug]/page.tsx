import { BookOpen, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageShell } from "@/components/public-page-shell";
import { getPublicNoteBySlug } from "@/lib/db/queries";
import { t } from "@/lib/i18n/server";
import { APP_DESCRIPTION } from "@/lib/pwa";
import { publicProfilePath } from "@/lib/sharing";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";
import { PublicNoteMarkdown } from "./public-note-markdown";

export const metadata: Metadata = {
  title: "Note",
  description: APP_DESCRIPTION,
};

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getPublicNoteBySlug(slug);
  if (!book) notFound();

  const handleLabel = book.user.handle ? `@${book.user.handle}` : null;
  const from = handleLabel
    ? await t("public.from", { handle: handleLabel })
    : null;
  const backLabel = await t("public.back");
  const cover = getBookDisplayCoverUrl(book, "L");
  const profileHref = book.user.handle
    ? publicProfilePath(book.user.handle)
    : "/";

  return (
    <PublicPageShell>
      <Link
        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        href={profileHref}
      >
        <ChevronLeft className="size-4" />
        {backLabel}
      </Link>
      <div className="mt-6 flex items-start gap-5">
        <div className="h-[140px] w-[92px] shrink-0 overflow-hidden rounded-[10px] bg-muted shadow-sm">
          {cover ? (
            <Image
              alt={book.title}
              className="h-full w-full object-cover"
              height={140}
              loading="eager"
              priority
              sizes="92px"
              src={cover}
              width={92}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="size-7 text-muted-foreground" />
            </div>
          )}
        </div>
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
