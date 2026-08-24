"use client";

import { BookOpen, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getCoverUrl } from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import type { AddBookResultsProps } from "./add-book-types";

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
              className={cn(
                "mb-[3px] flex w-full items-center gap-[11px] rounded-[10px] border border-transparent px-[11px] py-2.5 text-left transition-colors",
                isSelected ? "bg-foreground" : "hover:bg-muted",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-[30px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted",
                  isSelected && "bg-neutral-700",
                )}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={book.title}
                    width={30}
                    height={44}
                    unoptimized
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="size-4 text-muted-foreground" />
                )}
              </div>

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
