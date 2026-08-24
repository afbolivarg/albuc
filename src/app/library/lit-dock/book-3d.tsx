"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { STATUS_META } from "./constants";
import type { ShelfBook } from "./types";

type Book3dProps = {
  book: ShelfBook;
};

function Book3dComponent({ book }: Book3dProps) {
  const st = STATUS_META[book.status];
  const author = book.authors[0] || "";

  return (
    <Link
      href={`/library/${book.id}`}
      prefetch
      className="bk3d-cell flex w-full flex-col items-center gap-4 rounded-lg text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`${book.title} — ${book.authors.join(", ")}`}
    >
      <span className="bk3d-scene" aria-hidden="true">
        <span className="bk3d">
          <span className="bk3d-back" />
          <span className="bk3d-inside">
            <span className="bk3d-page" />
            <span className="bk3d-page" />
            <span className="bk3d-page" />
          </span>
          <span className="bk3d-cover">
            <Image
              src={book.cover}
              alt=""
              width={188}
              height={282}
              unoptimized={book.cover.startsWith("data:")}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </span>
          <span className="bk3d-effect" />
          <span className="bk3d-light" />
        </span>
      </span>
      <span className="flex w-full flex-col gap-0 px-1 leading-tight">
        <span className="line-clamp-2 font-serif text-[14.5px] font-semibold text-foreground">
          {book.title}
        </span>
        {author ? (
          <span className="line-clamp-1 text-[12px] text-muted-foreground">
            {author}
          </span>
        ) : null}
        <span className="mt-0.5 inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <span
            className="size-1.5 rounded-full"
            style={{ background: st.dot }}
          />
          {st.label}
        </span>
      </span>
    </Link>
  );
}

export const Book3d = memo(Book3dComponent);
