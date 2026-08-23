"use client";

import { BookOpen, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { getBookDisplayCoverUrl } from "@/lib/supabase/book-covers.shared";
import { NoteShareControls } from "./note-share-controls";
import { RatingSelector } from "./rating-selector";
import { StatusSelector } from "./status-selector";

export function BookSidebar({ book }: { book: Book }) {
  const t = useT();
  const coverUrl = getBookDisplayCoverUrl(book, "L");
  const authors =
    book.authors && book.authors.length > 0
      ? book.authors.join(", ")
      : t("book.unknownAuthor");
  const rating = book.rating ? Number.parseFloat(book.rating) : 0;

  return (
    <aside className="flex shrink-0 flex-col border-border border-b bg-white md:h-full md:w-80 md:flex-none md:overflow-y-auto md:border-r md:border-b-0">
      <div className="flex flex-shrink-0 items-center justify-between gap-2 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 md:pb-2">
        <Link
          className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/library"
        >
          <ChevronLeft className="size-4" />
          {t("nav.library")}
        </Link>
        <NoteShareControls book={book} />
      </div>

      <div className="flex gap-4 px-5 pb-5 md:flex-col md:items-center md:gap-5 md:pt-2">
        <div className="h-[120px] w-[80px] shrink-0 overflow-hidden rounded-[10px] bg-muted shadow-[0_4px_24px_rgba(0,0,0,0.08)] md:h-[240px] md:w-[160px] md:rounded-[14px]">
          {coverUrl ? (
            <Image
              alt={book.title}
              className="h-full w-full object-cover"
              height={240}
              src={coverUrl}
              width={160}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="size-7 text-muted-foreground md:size-8" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 md:w-full">
          <h1 className="font-serif text-[20px] font-bold leading-[1.15] tracking-tight md:text-center md:text-[22px]">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-center">
            {authors}
          </p>
          {book.publishYear ? (
            <p className="mt-0.5 text-xs text-neutral-500 md:text-center">
              {t("book.firstPublished", { year: book.publishYear })}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-4 md:mt-6">
            <div className="flex flex-col gap-[7px]">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t("book.status")}
              </span>
              <StatusSelector bookId={book.id} currentStatus={book.status} />
            </div>
            <div className="flex flex-col gap-[7px]">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t("book.rating")}
              </span>
              <RatingSelector bookId={book.id} currentRating={rating} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
