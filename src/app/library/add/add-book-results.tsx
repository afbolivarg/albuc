"use client";

import { Check, ChevronRight } from "lucide-react";
import { Book3dCover } from "@/components/book-3d-cover";
import { getCoverUrl } from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import type { AddBookResultsProps } from "./add-book-types";
import { preloadCover } from "./cover-preload";

export function AddBookResults({
  results,
  selectedWorkKey,
  added,
  onSelect,
}: AddBookResultsProps) {
  return (
    <ul className="py-1">
      {results.map((book) => {
        const isSelected = selectedWorkKey === book.workKey;
        const isSaved = book.workKey in added;
        const cover = getCoverUrl(book.coverId, "S");
        const meta = [
          book.authors.length > 0 ? book.authors.join(", ") : "Unknown Author",
          book.publishYear?.toString(),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={book.workKey}>
            <button
              type="button"
              onClick={() => onSelect(book)}
              onPointerEnter={() => {
                const large = getCoverUrl(book.coverId, "L");
                if (large) void preloadCover(large);
              }}
              className={cn(
                "bk3d-hover mb-[3px] flex w-full items-center gap-[11px] rounded-[10px] border border-transparent px-[11px] py-2.5 text-left transition-colors",
                isSelected ? "bg-foreground" : "hover:bg-muted",
              )}
            >
              <Book3dCover
                src={cover}
                title={book.title}
                className="w-[30px] shrink-0"
                width={30}
                height={44}
                sizes="30px"
                loading="eager"
                revealOnLoad
              />

              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate font-serif text-[13px] font-semibold leading-tight",
                    isSelected
                      ? "text-white"
                      : isSaved
                        ? "text-muted-foreground"
                        : "text-foreground",
                  )}
                >
                  {book.title}
                </div>
                <div
                  className={cn(
                    "truncate text-[11px]",
                    isSelected ? "text-white/50" : "text-muted-foreground",
                  )}
                >
                  {meta}
                </div>
              </div>

              {isSaved ? (
                <span
                  className={cn(
                    "inline-flex flex-shrink-0 items-center gap-1 text-[10.5px]",
                    isSelected ? "text-white/60" : "text-muted-foreground",
                  )}
                >
                  <Check className="size-3" />
                  Saved
                </span>
              ) : (
                <ChevronRight
                  className={cn(
                    "size-4 flex-shrink-0",
                    isSelected ? "text-white/35" : "text-neutral-400",
                  )}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
