"use client";

import { ChevronLeft, Loader, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlbucLogo } from "@/components/albuc-logo";
import { Input } from "@/components/ui/input";
import { useActionMessage, useT } from "@/lib/i18n/client";
import {
  type BookSearchResult,
  getCoverUrl,
  MIN_SEARCH_QUERY_LENGTH,
} from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import { addBookAction, searchBooksAction } from "../actions";
import { AddBookDetail } from "./add-book-detail";
import { AddBookResults } from "./add-book-results";
import type { BookStatus, SavedShelfEntry } from "./add-book-types";

const SEARCH_DEBOUNCE_MS = 350;
const COVER_WARMUP_MS = 800;

function preloadCover(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

async function warmupResultCovers(books: BookSearchResult[]) {
  const urls = books
    .map((book) => getCoverUrl(book.coverId, "S"))
    .filter((url): url is string => Boolean(url));
  if (urls.length === 0) return;

  await Promise.race([
    Promise.all(urls.map(preloadCover)),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, COVER_WARMUP_MS);
    }),
  ]);
}

type AddBookViewProps = {
  savedBooks: Record<string, SavedShelfEntry>;
};

export function AddBookView({ savedBooks }: AddBookViewProps) {
  const t = useT();
  const actionMessage = useActionMessage();
  const statusLabels: Record<BookStatus, string> = {
    WANT: t("library.status.WANT_LONG"),
    OWNED: t("library.status.OWNED_LONG"),
    READING: t("library.status.READING_LONG"),
    READ: t("library.status.READ_LONG"),
  };
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<BookSearchResult | null>(null);
  const [status, setStatus] = useState<BookStatus>("WANT");
  const [rating, setRating] = useState(0);

  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, SavedShelfEntry>>(() => ({
    ...savedBooks,
  }));

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

        await warmupResultCovers(result.results);
        if (latestQuery.current !== trimmed) return;

        setResults(result.results);
        setSearchError(result.error ?? null);
      } catch {
        if (latestQuery.current !== trimmed) return;
        setResults([]);
        setSearchError("errors.catalogUnreachable");
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
    const saved = added[book.workKey];
    setStatus(saved?.status ?? "WANT");
    setRating(saved?.rating ?? 0);
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

    try {
      const result = await addBookAction({ success: false }, formData);

      if (result.success && result.bookId) {
        setAdded((prev) => ({
          ...prev,
          [selected.workKey]: {
            id: result.bookId as string,
            status,
            rating,
          },
        }));
        router.refresh();
      } else {
        setAddError(result.error ?? "errors.addBookFailed");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const savedEntry = selected ? added[selected.workKey] : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background font-sans text-foreground md:flex-row">
      <div
        className={cn(
          "w-full flex-1 flex-col overflow-hidden border-border bg-white md:flex md:w-80 md:flex-none md:border-r",
          selected ? "hidden" : "flex",
        )}
      >
        <div className="flex-shrink-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {t("nav.library")}
          </Link>
          <h1 className="mt-3 font-serif text-[22px] font-semibold tracking-tight">
            {t("add.title")}
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
            {query ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 [scrollbar-width:thin]">
          {isSearching ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center text-[13px] text-muted-foreground">
              <Loader className="size-5 animate-spin" />
              <span>Searching the catalog…</span>
            </div>
          ) : results.length > 0 ? (
            <AddBookResults
              added={added}
              onSelect={handleSelect}
              results={results}
              selectedWorkKey={selected?.workKey ?? null}
            />
          ) : query.trim().length >= MIN_SEARCH_QUERY_LENGTH ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <p className="font-serif text-[17px] text-neutral-400 italic">
                {t("add.noResults")}
              </p>
              <p className="text-xs text-neutral-400">
                {actionMessage(searchError, { n: MIN_SEARCH_QUERY_LENGTH }) ??
                  t("add.searchRetry")}
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <p className="text-xs text-neutral-400">
                Search by title, author, or ISBN to get started.
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] text-center text-[11px] text-neutral-400">
          Book data from{" "}
          <a
            href="https://openlibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer hover:underline underline-offset-4"
          >
            Open Library
          </a>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex-col overflow-y-auto bg-background md:flex",
          selected ? "flex" : "hidden",
        )}
      >
        {selected ? (
          <AddBookDetail
            addError={actionMessage(addError)}
            book={selected}
            isAdding={isAdding}
            onAdd={handleAdd}
            onBack={() => setSelected(null)}
            onRatingChange={setRating}
            onStatusChange={setStatus}
            rating={rating}
            savedEntry={savedEntry}
            status={status}
            statusLabels={statusLabels}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex w-full max-w-sm flex-col items-center gap-2.5 px-6 py-10 text-center text-neutral-400">
              <AlbucLogo
                className="text-neutral-400"
                iconClassName="size-12 opacity-35"
                showText={false}
              />
              <p className="font-serif text-[19px] text-neutral-400">
                Select a book to add
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
