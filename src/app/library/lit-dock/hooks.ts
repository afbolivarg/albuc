"use client";

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SORTS } from "./constants";
import type { ShelfBook, SortDir, SortKey, StatusFilter } from "./types";
import { sortBooks } from "./utils";

const SHELF_SNAPSHOT_KEY = "albuc:shelf-books:v1";

function useRafResizeObserver(
  ref: RefObject<HTMLElement | null>,
  readSize: (el: HTMLElement) => number,
  fallback: number,
) {
  const [size, setSize] = useState(fallback);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setSize(readSize(el) || fallback);
      });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [fallback, readSize, ref]);

  return size;
}

export function useElementWidth(fallback = 1112) {
  const ref = useRef<HTMLDivElement>(null);
  const readSize = useMemo(
    () => (el: HTMLElement) => (el as HTMLDivElement).clientWidth,
    [],
  );
  const w = useRafResizeObserver(ref, readSize, fallback);
  return [ref, w] as const;
}

export function useElementHeight(fallback = 600) {
  const ref = useRef<HTMLDivElement>(null);
  const readSize = useMemo(
    () => (el: HTMLElement) => (el as HTMLDivElement).clientHeight,
    [],
  );
  const h = useRafResizeObserver(ref, readSize, fallback);
  return [ref, h] as const;
}

function shelfSignature(books: ShelfBook[]) {
  return books
    .map((book) => `${book.id}:${book.status}:${book.rating}`)
    .join("|");
}

/** Instant shelf on revisit: overlay a cached snapshot until server data paints. */
export function useShelfBooksSnapshot(serverBooks: ShelfBook[]): ShelfBook[] {
  const [cacheOverride, setCacheOverride] = useState<ShelfBook[] | null>(null);
  const signature = shelfSignature(serverBooks);
  const [prevSignature, setPrevSignature] = useState(signature);

  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setCacheOverride(null);
  }

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(SHELF_SNAPSHOT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ShelfBook[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCacheOverride(parsed);
      }
    } catch {
      // ignore corrupt snapshot
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SHELF_SNAPSHOT_KEY, JSON.stringify(serverBooks));
    } catch {
      // quota or private mode
    }
  }, [serverBooks]);

  return cacheOverride ?? serverBooks;
}

export function useLibrary(allBooks: ShelfBook[]) {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("added");
  const [dir, setDir] = useState<SortDir>("desc");
  const [query, setQuery] = useState("");

  const setSortKey = (key: SortKey) => {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(key);
    setDir(SORTS.find((s) => s.key === key)?.defaultDir ?? "asc");
  };

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      ALL: allBooks.length,
      WANT: 0,
      OWNED: 0,
      READING: 0,
      READ: 0,
    };
    allBooks.forEach((b) => {
      c[b.status] = (c[b.status] || 0) + 1;
    });
    return c;
  }, [allBooks]);

  const books = useMemo(() => {
    let list = allBooks;
    if (status !== "ALL") list = list.filter((b) => b.status === status);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q)),
      );
    }
    return sortBooks(list, sort, dir);
  }, [allBooks, status, query, sort, dir]);

  return {
    books,
    all: allBooks,
    status,
    setStatus,
    sort,
    setSortKey,
    dir,
    query,
    setQuery,
    counts,
  };
}

export type LibraryState = ReturnType<typeof useLibrary>;
