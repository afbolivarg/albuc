"use client";

import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import type { User } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { UserMenu } from "../user-menu";
import { Book3d } from "./book-3d";
import { EmptyShelf, FilterBar } from "./filter-bar";
import { useElementWidth, useLibrary, useShelfBooksSnapshot } from "./hooks";
import type { ShelfBook } from "./types";

type LitDockLibraryProps = {
  books: ShelfBook[];
  user: User;
};

export function LitDockLibrary({ books: all, user }: LitDockLibraryProps) {
  const t = useT();
  const snapshotBooks = useShelfBooksSnapshot(all);
  const lib = useLibrary(snapshotBooks);
  const [rootRef, rootW] = useElementWidth(1112);
  const mobile = rootW < 560;
  const pad = mobile ? 20 : 40;

  return (
    <div
      ref={rootRef}
      className="relative h-full overflow-hidden bg-background font-sans text-foreground"
    >
      <div className="h-full overflow-y-auto overscroll-contain">
        <div
          className="grid w-full grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-x-6 gap-y-10"
          style={{
            paddingLeft: pad,
            paddingRight: pad,
            paddingTop: "calc(88px + env(safe-area-inset-top, 0px))",
            paddingBottom: "calc(108px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {lib.books.map((book) => (
            <Book3d key={book.id} book={book} />
          ))}
        </div>
        {lib.books.length === 0 && (
          <EmptyShelf variant={all.length === 0 ? "empty" : "filtered"} />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{
          paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: 56,
          backgroundImage:
            "linear-gradient(to bottom, var(--background) 0%, color-mix(in srgb, var(--background) 70%, transparent) 42%, color-mix(in srgb, var(--background) 28%, transparent) 72%, transparent 100%)",
        }}
      >
        <div className="pointer-events-auto">
          <FilterBar lib={lib} />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="pointer-events-auto flex items-center gap-3.5 rounded-full border border-border bg-background px-3 py-[9px] pl-[18px] shadow-[0_3px_12px_-4px_rgba(35,26,14,.16)]">
          <Link href="/library" aria-label="Go to Library">
            <AlbucLogo iconClassName="size-5" className="text-xl" />
          </Link>
          <span className="h-6 w-px bg-border" />
          <Link
            href="/library/add"
            className="inline-flex h-9 cursor-pointer items-center gap-[7px] rounded-full border border-border bg-background px-3.5 text-[13.5px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Plus className="size-[15px]" />
            {t("nav.add")}
          </Link>
          <Link
            href="/library/ask"
            className="inline-flex h-9 cursor-pointer items-center gap-[7px] rounded-full border-none bg-foreground px-3.5 text-[13.5px] font-medium text-background"
          >
            <MessageSquare className="size-[15px]" />
            {t("nav.ask")}
          </Link>
          <UserMenu user={user} avatarSize={36} />
        </div>
      </div>
    </div>
  );
}
