"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { STATUS_META } from "./constants";
import type { ShelfBook } from "./types";
import { hashJitter, spineWidth } from "./utils";

type SpineBookProps = {
  book: ShelfBook;
  hLo?: number;
  hHi?: number;
};

function SpineBookComponent({ book, hLo = 188, hHi = 226 }: SpineBookProps) {
  const [b1, b2, ink] = book.spine;
  const w = spineWidth(book);
  const h = hashJitter(book.id, hLo, hHi);
  const coverW = Math.round(h * 0.66);
  const st = STATUS_META[book.status];
  const author = (book.authors[0] || "").split(" ").slice(-1)[0];

  return (
    <Link
      href={`/library/${book.id}`}
      className="relative shrink-0 cursor-pointer transition-transform duration-200 hover:z-50"
      style={{ width: w, height: h }}
      title={`${book.title} — ${book.authors.join(", ")}`}
    >
      <div className="group/bk absolute inset-0">
        <div
          className="absolute inset-0 flex flex-col items-center overflow-hidden rounded-[2px] opacity-100 transition-opacity duration-[220ms] ease-in-out group-hover/bk:opacity-0"
          style={{
            background: `linear-gradient(95deg, ${b2} 0%, ${b1} 16%, ${b1} 84%, ${b2} 100%)`,
            boxShadow:
              "inset 2px 0 3px rgba(255,255,255,.16), inset -3px 0 5px rgba(0,0,0,.3)",
            color: ink,
          }}
        >
          <span
            className="h-[5px] w-full shrink-0 rounded-t-[2px] opacity-90"
            style={{ background: st.dot }}
          />
          <span
            className="mt-2.5 h-px w-[64%] shrink-0 opacity-30"
            style={{ background: ink }}
          />
          <span
            className="mt-2.5 flex-1 overflow-hidden font-serif font-semibold [mask-image:linear-gradient(to_bottom,#000_85%,transparent)] [writing-mode:vertical-rl] whitespace-nowrap"
            style={{
              fontSize: w > 46 ? 13.5 : 12.5,
            }}
          >
            {book.title}
          </span>
          <span
            className="mt-2.5 h-px w-[64%] shrink-0 opacity-30"
            style={{ background: ink }}
          />
          <span className="mt-2.5 mb-3 max-h-[46px] shrink-0 overflow-hidden font-sans text-[8px] tracking-[0.06em] uppercase opacity-70 [writing-mode:vertical-rl]">
            {author}
          </span>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 z-[3] overflow-hidden rounded-[2px_4px_4px_2px] bg-[#ddd] opacity-0 transition-[transform,opacity,box-shadow] duration-400 [transform:rotateY(-84deg)_translateY(-2px)] [transform-origin:center_bottom] [transition-timing-function:cubic-bezier(0.2,0.75,0.25,1)] group-hover/bk:opacity-100 group-hover/bk:[transform:rotateY(0deg)_translateY(-14px)]"
          style={{
            left: (w - coverW) / 2,
            width: coverW,
            height: h,
            boxShadow:
              "0 2px 4px rgba(0,0,0,.22), 0 22px 34px -14px rgba(0,0,0,.55)",
          }}
        >
          <Image
            src={book.cover}
            alt=""
            width={coverW}
            height={h}
            unoptimized={book.cover.startsWith("data:")}
            className="block h-full w-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
}

export const SpineBook = memo(SpineBookComponent);
