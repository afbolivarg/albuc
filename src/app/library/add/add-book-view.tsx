"use client";

import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader,
  Plus,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/open-library";
import { type BookSearchResult, getCoverUrl } from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import { addBookAction, searchBooksAction } from "../actions";

type BookStatus = "WANT" | "OWNED" | "READING" | "READ";

const STATUS_OPTIONS = [
  { value: "WANT", label: "Want to Read", color: "bg-gray-500" },
  { value: "OWNED", label: "Owned", color: "bg-red-500" },
  { value: "READING", label: "Currently Reading", color: "bg-yellow-500" },
  { value: "READ", label: "Finished", color: "bg-green-500" },
] as const satisfies ReadonlyArray<{
  value: BookStatus;
  label: string;
  color: string;
}>;

const SEARCH_DEBOUNCE_MS = 350;

type AddBookViewProps = {
  savedBooks: Record<string, string>;
};

export function AddBookView({ savedBooks }: AddBookViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<BookSearchResult | null>(null);
  const [status, setStatus] = useState<BookStatus>("WANT");
  const [rating, setRating] = useState(0);

  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, string | undefined>>(
    () => ({ ...savedBooks }),
  );

  const latestQuery = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();
    latestQuery.current = trimmed;

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handle = window.setTimeout(async () => {
      const formData = new FormData();
      formData.append("query", trimmed);
      try {
        const result = await searchBooksAction({ results: [] }, formData);

        if (latestQuery.current !== trimmed) return;

        setResults(result.results);
        setSearchError(result.error ?? null);
      } catch {
        if (latestQuery.current !== trimmed) return;
        setResults([]);
        setSearchError("Could not reach the catalog. Try again in a moment.");
      } finally {
        if (latestQuery.current === trimmed) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [query]);

  const handleSelect = (book: BookSearchResult) => {
    setSelected(book);
    setStatus("WANT");
    setRating(0);
    setAddError(null);
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchError(null);
    inputRef.current?.focus();
  };

  const handleAdd = async () => {
    if (!selected) return;

    setIsAdding(true);
    setAddError(null);

    const formData = new FormData();
    formData.append("workKey", selected.workKey);
    formData.append("editionKey", selected.editionKey || "");
    formData.append("title", selected.title);
    formData.append("authors", JSON.stringify(selected.authors));
    formData.append("authorKeys", JSON.stringify(selected.authorKeys || []));
    formData.append("publishYear", selected.publishYear?.toString() || "");
    formData.append("coverId", selected.coverId?.toString() || "");
    formData.append("isbn10", JSON.stringify(selected.isbn10 || []));
    formData.append("isbn13", JSON.stringify(selected.isbn13 || []));
    formData.append("status", status);
    formData.append("rating", rating.toString());

    const result = await addBookAction({ success: false }, formData);

    setIsAdding(false);

    if (result.success) {
      setAdded((prev) => ({ ...prev, [selected.workKey]: result.bookId }));
      router.refresh();
    } else {
      setAddError(result.error ?? "Failed to add book");
    }
  };

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === status);
  const savedBookId = selected ? added[selected.workKey] : undefined;
  const isSelectedSaved = selected ? selected.workKey in added : false;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background font-sans text-foreground md:flex-row">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div
        className={cn(
          "w-full flex-1 flex-col overflow-hidden border-border bg-background md:flex md:w-80 md:flex-none md:border-r",
          selected ? "hidden" : "flex",
        )}
      >
        <div className="flex-shrink-0 px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-3.5">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to library
          </Link>
          <h1 className="mt-3 font-serif text-[22px] font-semibold tracking-tight">
            Add a book
          </h1>
        </div>

        <div className="flex-shrink-0 px-4 pb-3.5">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN…"
              autoFocus
              autoComplete="off"
              className="h-9 bg-muted pr-9 pl-9 text-[13.5px] focus-visible:bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 [scrollbar-width:thin]">
          {isSearching ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center text-[13px] text-muted-foreground">
              <Loader className="size-5 animate-spin" />
              <span>Searching the catalog…</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((book) => {
                const isSelected = selected?.workKey === book.workKey;
                const isSaved = book.workKey in added;
                const cover = getCoverUrl(book.coverId, "S");
                const meta = [
                  book.authors.length > 0
                    ? book.authors.join(", ")
                    : "Unknown Author",
                  book.publishYear?.toString(),
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <li key={book.workKey}>
                    <button
                      type="button"
                      onClick={() => handleSelect(book)}
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
                            isSelected
                              ? "text-white/50"
                              : "text-muted-foreground",
                          )}
                        >
                          {meta}
                        </div>
                      </div>

                      {isSaved ? (
                        <span
                          className={cn(
                            "inline-flex flex-shrink-0 items-center gap-1 text-[10.5px]",
                            isSelected
                              ? "text-white/60"
                              : "text-muted-foreground",
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
          ) : query.trim().length >= MIN_SEARCH_QUERY_LENGTH ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <p className="font-serif text-[17px] text-neutral-400 italic">
                No books found
              </p>
              <p className="text-xs text-neutral-400">
                {searchError ?? "Try different keywords or check the spelling."}
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <p className="font-serif text-[17px] text-neutral-400 italic">
                Find your next book
              </p>
              <p className="text-xs text-neutral-400">
                Search by title, author, or ISBN to get started.
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] text-center text-[11px] text-neutral-400">
          Book data from Open Library
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex-col overflow-y-auto bg-muted md:flex",
          selected ? "flex" : "hidden",
        )}
      >
        {selected ? (
          <div className="flex flex-1 flex-col">
            <div className="flex-shrink-0 px-5 pt-7 pb-3.5 md:hidden">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
                Back to results
              </button>
            </div>

            <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-9 px-6 pt-16 pb-10 md:flex-row md:items-start md:px-12 md:pt-24 md:pb-12">
              <DetailCover book={selected} />

              <div className="flex w-full min-w-0 flex-1 flex-col">
                <h1 className="mb-[7px] text-center font-serif text-[26px] font-bold leading-[1.1] tracking-tight md:text-left">
                  {selected.title}
                </h1>
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  {selected.authors.length > 0
                    ? selected.authors.join(", ")
                    : "Unknown Author"}
                </p>
                {selected.publishYear && (
                  <p className="text-center text-xs text-neutral-500 md:text-left">
                    First published {selected.publishYear}
                  </p>
                )}

                <div className="mt-7 flex flex-col gap-5">
                  <div className="flex flex-col gap-[7px]">
                    <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      Status
                    </span>
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as BookStatus)}
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
                            <span>{currentStatus?.label}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-2.5 rounded-full",
                                  option.color,
                                )}
                              />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-[7px]">
                    <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                      Rating
                      <span className="ml-1.5 text-[10px] font-normal tracking-normal text-neutral-400 normal-case">
                        optional
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={rating}
                        onChange={isSelectedSaved ? undefined : setRating}
                        readonly={isSelectedSaved}
                        size="lg"
                      />
                      {rating === 0 && (
                        <span className="text-[11px] text-neutral-400">
                          Unrated
                        </span>
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
                          href={
                            savedBookId ? `/library/${savedBookId}` : "/library"
                          }
                        >
                          View in library
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleAdd}
                        disabled={isAdding}
                        className="h-10 w-full text-sm font-medium md:w-[220px]"
                      >
                        {isAdding ? (
                          <Loader className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        Add to library
                      </Button>
                    )}

                    {addError && (
                      <p className="text-xs text-destructive">{addError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-2.5 px-6 py-10 text-center text-neutral-400">
              <BookOpen className="size-12 opacity-35" />
              <p className="font-serif text-[19px] text-neutral-400 italic">
                Select a book to add
              </p>
              <p className="text-xs text-neutral-400">
                Search and pick a result to see its details and add it to your
                library.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCover({ book }: { book: BookSearchResult }) {
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
