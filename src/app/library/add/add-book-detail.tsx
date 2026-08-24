"use client";

import { BookOpen, ChevronLeft, Loader, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n/client";
import { getCoverUrl } from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import {
  type AddBookDetailProps,
  type BookStatus,
  STATUS_OPTIONS,
} from "./add-book-types";

export function AddBookDetail({
  book,
  status,
  rating,
  statusLabels,
  savedEntry,
  isAdding,
  addError,
  onBack,
  onStatusChange,
  onRatingChange,
  onAdd,
}: AddBookDetailProps) {
  const t = useT();
  const currentStatus = STATUS_OPTIONS.find((o) => o.value === status);
  const isSelectedSaved = Boolean(savedEntry);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-shrink-0 px-5 pt-7 pb-3.5 md:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to results
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-9 px-6 pt-16 pb-10 md:flex-row md:items-start md:px-12 md:pt-24 md:pb-12">
        <DetailCover book={book} />

        <div className="flex w-full min-w-0 flex-1 flex-col">
          <h1 className="mb-[7px] text-center font-serif text-[26px] font-bold leading-[1.1] tracking-tight md:text-left">
            {book.title}
          </h1>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            {book.authors.length > 0
              ? book.authors.join(", ")
              : "Unknown Author"}
          </p>
          {book.publishYear ? (
            <p className="text-center text-xs text-neutral-500 md:text-left">
              First published {book.publishYear}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col gap-5">
            <div className="flex flex-col gap-[7px]">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Status
              </span>
              <Select
                value={status}
                onValueChange={(value) => onStatusChange(value as BookStatus)}
                disabled={isSelectedSaved}
              >
                <SelectTrigger className="h-9 w-full bg-background shadow-none md:w-[220px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2.5 rounded-full",
                          currentStatus?.color ?? "bg-gray-400",
                        )}
                      />
                      <span>{statusLabels[status]}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("size-2.5 rounded-full", option.color)}
                        />
                        <span>{statusLabels[option.value]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-[7px]">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Rating
              </span>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={rating}
                  onChange={isSelectedSaved ? undefined : onRatingChange}
                  readonly={isSelectedSaved}
                  size="lg"
                />
                {rating === 0 && (
                  <span className="text-[11px] text-neutral-400">Unrated</span>
                )}
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-2">
              {isSelectedSaved ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full bg-background text-[13.5px] font-medium md:w-[220px]"
                >
                  <Link
                    href={savedEntry ? `/library/${savedEntry.id}` : "/library"}
                  >
                    View in library
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onAdd}
                  disabled={isAdding}
                  className="h-10 w-full text-sm font-medium md:w-[220px]"
                >
                  {isAdding ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {t("add.toLibrary")}
                </Button>
              )}

              {addError ? (
                <p className="text-xs text-destructive">{addError}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCover({ book }: { book: AddBookDetailProps["book"] }) {
  const cover = getCoverUrl(book.coverId, "L");

  return (
    <div className="h-[180px] w-[120px] flex-shrink-0 overflow-hidden rounded-[14px] bg-border shadow-[0_4px_24px_rgba(0,0,0,0.10)] md:h-[300px] md:w-[200px]">
      {cover ? (
        <Image
          src={cover}
          alt={book.title}
          width={200}
          height={300}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <BookOpen className="size-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
