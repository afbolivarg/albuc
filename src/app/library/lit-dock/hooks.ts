"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { SORTS } from "./constants";
import type { ShelfBook, SortDir, SortKey, StatusFilter } from "./types";
import { sortBooks } from "./utils";

export function useElementWidth(fallback = 1112) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setW(el.clientWidth || fallback);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);

  return [ref, w] as const;
}

export function useElementHeight(fallback = 600) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setH(el.clientHeight || fallback);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);

  return [ref, h] as const;
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
