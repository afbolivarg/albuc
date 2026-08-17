"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { AskSource } from "@/lib/ai/citations";
import { cn } from "@/lib/utils";

function BookCover({
  source,
  className,
}: {
  source: AskSource;
  className?: string;
}) {
  if (!source.coverUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted font-serif text-[10px] text-muted-foreground",
          className,
        )}
      >
        {source.title.slice(0, 1)}
      </div>
    );
  }

  return (
    <Image
      src={source.coverUrl}
      alt=""
      width={48}
      height={72}
      className={cn("object-cover", className)}
    />
  );
}

export function CitationCard({
  source,
  className,
}: {
  source: AskSource;
  className?: string;
}) {
  const authors = source.authors.join(", ");

  return (
    <div
      className={cn(
        "w-[240px] rounded-xl border border-border bg-background p-3 shadow-[0_12px_32px_-16px_rgba(35,26,14,0.35)]",
        className,
      )}
    >
      <div className="flex gap-3">
        <BookCover
          source={source}
          className="h-[72px] w-12 shrink-0 rounded-[4px]"
        />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[15px] leading-tight font-semibold text-foreground">
            {source.title}
          </p>
          {authors && (
            <p className="mt-1 truncate text-[12px] text-muted-foreground">
              {authors}
              {source.year ? ` · ${source.year}` : ""}
            </p>
          )}
          <Link
            href={`/library/${source.bookId}`}
            className="mt-2 inline-flex items-center gap-0.5 text-[12px] font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Open book
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CitationChip({ n, source }: { n: number; source?: AskSource }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);
  const labelId = useId();
  const visible = pinned || hovered;

  const keepOpen = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHovered(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
    }
    closeTimer.current = window.setTimeout(() => {
      setHovered(false);
      closeTimer.current = null;
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pinned) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPinned(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  if (!source) {
    return (
      <span className="relative -top-0.5 mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center text-[10px] font-medium text-muted-foreground">
        {n}
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      className="relative -top-0.5 mx-0.5 inline-flex align-middle"
      onMouseEnter={keepOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-describedby={labelId}
        aria-expanded={visible}
        onClick={() => setPinned((value) => !value)}
        className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-border bg-background px-1 text-[10px] leading-none font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        {n}
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 z-30 flex -translate-x-1/2 flex-col items-center">
          <CitationCard source={source} />
          <span className="h-2 w-full" aria-hidden />
        </span>
      )}
      <span id={labelId} className="sr-only">
        {source.title}
      </span>
    </span>
  );
}

export function SourceBooks({ sources }: { sources: AskSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
        From your notes
      </span>
      {sources.map((source) => (
        <Link
          key={source.bookId}
          href={`/library/${source.bookId}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-2.5 pl-2.5 transition-colors hover:border-foreground/20"
        >
          <BookCover source={source} className="h-6 w-4 rounded-[2px]" />
          <span className="max-w-[140px] truncate font-serif text-[12.5px] text-foreground">
            {source.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
