"use client";

import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlbucLogo } from "@/components/albuc-logo";
import type { User } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { AddBookTriggerButton } from "../add-book";
import { UserMenu } from "../user-menu";
import { GAP } from "./constants";
import { EmptyShelf, FilterBar } from "./filter-bar";
import {
  useElementHeight,
  useElementWidth,
  useLibrary,
  useShelfBooksSnapshot,
} from "./hooks";
import { SpineBook } from "./spine-book";
import type { ShelfBook } from "./types";
import { packShelvesFill } from "./utils";

const AddBookDialog = dynamic(
  () =>
    import("../add-book-dialog").then((m) => ({ default: m.AddBookDialog })),
  { ssr: false },
);

const SHELF_GAP = 42;
const ROW_H = 226 + 11 + SHELF_GAP;

type PageArrowProps = {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  size: number;
  offset: number;
  iconSize: number;
};

function PageArrow({
  side,
  disabled,
  onClick,
  size,
  offset,
  iconSize,
}: PageArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous page" : "Next page"}
      className={cn(
        "absolute top-[47%] z-[25] flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_4px_14px_-6px_rgba(35,26,14,.2)] transition-[background,opacity] duration-[140ms]",
        disabled
          ? "cursor-default opacity-[0.32]"
          : "cursor-pointer opacity-100 hover:bg-accent",
        side === "left"
          ? "left-[var(--arrow-offset)]"
          : "right-[var(--arrow-offset)]",
      )}
      style={
        {
          width: size,
          height: size,
          "--arrow-offset": `${offset}px`,
        } as React.CSSProperties
      }
    >
      {side === "left" ? (
        <ChevronLeft style={{ width: iconSize, height: iconSize }} />
      ) : (
        <ChevronRight style={{ width: iconSize, height: iconSize }} />
      )}
    </button>
  );
}

type LitDockLibraryProps = {
  books: ShelfBook[];
  user: User;
};

export function LitDockLibrary({ books: all, user }: LitDockLibraryProps) {
  const snapshotBooks = useShelfBooksSnapshot(all);
  const lib = useLibrary(snapshotBooks);
  const [rootRef, rootW] = useElementWidth(1112);
  const mobile = rootW < 560;
  const pad = mobile ? 20 : 40;
  const aSz = mobile ? 30 : 44;
  const aOff = mobile ? 10 : 14;
  const aIcon = mobile ? 16 : 20;
  const gutter = aOff + aSz + (mobile ? 10 : 14);
  const toolbarPadX = mobile ? 18 : gutter;
  const [shelfRef, shelfW] = useElementWidth(1112);
  const maxW = Math.max(120, shelfW - pad * 2);
  const allRows = useMemo(
    () => packShelvesFill(lib.books, maxW, GAP),
    [lib.books, maxW],
  );
  const [scrollRef, scrollH] = useElementHeight(600);
  const usableH = Math.max(0, scrollH - 100);
  const per = Math.max(1, Math.floor((usableH + SHELF_GAP) / ROW_H));
  const pageCount = Math.max(1, Math.ceil(allRows.length / per));
  const filterKey = `${lib.status}|${lib.query}|${lib.sort}|${lib.dir}`;
  const [pageState, setPageState] = useState({ filterKey, page: 0 });
  const page = pageState.filterKey === filterKey ? pageState.page : 0;
  const setPage = (next: number | ((prev: number) => number)) => {
    setPageState((prev) => {
      const current = prev.filterKey === filterKey ? prev.page : 0;
      const page = typeof next === "function" ? next(current) : next;
      return { filterKey, page };
    });
  };
  const [addBookOpen, setAddBookOpen] = useState(false);

  const cur = Math.min(page, pageCount - 1);
  const rows = allRows.slice(cur * per, cur * per + per);
  const multi = pageCount > 1;

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-screen flex-col overflow-hidden bg-[#faf9f6] font-sans text-foreground"
    >
      <div
        className="shrink-0"
        style={{ padding: `22px ${toolbarPadX}px 16px` }}
      >
        <FilterBar lib={lib} />
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col justify-center overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ padding: `8px ${gutter}px 92px` }}
      >
        <div
          ref={shelfRef}
          className="flex flex-col justify-center"
          style={{ gap: SHELF_GAP }}
        >
          {rows.map((row) => (
            <div
              key={`${cur}-${row.map((b) => b.id).join("-")}`}
              className="relative [perspective:1200px]"
            >
              <div className="relative w-full">
                <div
                  className="pointer-events-none absolute bottom-1 left-1/2 h-[80px] w-[94%] -translate-x-1/2"
                  style={{
                    background:
                      "radial-gradient(62% 70% at 50% 100%, rgba(45,34,20,.06), rgba(45,34,20,0) 72%)",
                  }}
                />
                <div
                  className="relative flex items-end justify-center"
                  style={{ gap: GAP, padding: `0 ${pad}px` }}
                >
                  {row.map((b) => (
                    <SpineBook key={b.id} book={b} />
                  ))}
                </div>
                <div
                  className="h-[11px] w-full rounded-[7px]"
                  style={{
                    background: "linear-gradient(180deg,#ffffff,#e4e1d9)",
                    boxShadow:
                      "0 12px 20px -10px rgba(35,26,14,.22), inset 0 1px 0 rgba(255,255,255,.9)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {lib.books.length === 0 && (
          <EmptyShelf
            variant={all.length === 0 ? "empty" : "filtered"}
            onAddBook={() => setAddBookOpen(true)}
          />
        )}
      </div>

      {multi && (
        <PageArrow
          side="left"
          disabled={cur === 0}
          onClick={() => setPage(Math.max(0, cur - 1))}
          size={aSz}
          offset={aOff}
          iconSize={aIcon}
        />
      )}
      {multi && (
        <PageArrow
          side="right"
          disabled={cur >= pageCount - 1}
          onClick={() => setPage(Math.min(pageCount - 1, cur + 1))}
          size={aSz}
          offset={aOff}
          iconSize={aIcon}
        />
      )}

      <div className="absolute bottom-[22px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3.5 rounded-full border border-border bg-background px-3 py-[9px] pl-[18px] shadow-[0_3px_12px_-4px_rgba(35,26,14,.16)]">
        <Link href="/library" aria-label="Go to Library">
          <AlbucLogo iconClassName="size-5" className="text-xl" />
        </Link>
        <span className="h-6 w-px bg-border" />
        <AddBookTriggerButton
          trigger="dock"
          onClick={() => setAddBookOpen(true)}
        />
        <Link
          href="/library/ask"
          className="inline-flex h-9 cursor-pointer items-center gap-[7px] rounded-full border-none bg-foreground px-3.5 text-[13.5px] font-medium text-background"
        >
          <MessageSquare className="size-[15px]" />
          Ask
        </Link>
        <UserMenu user={user} avatarSize={36} />
      </div>

      <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
    </div>
  );
}
