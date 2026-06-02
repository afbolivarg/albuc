"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Search,
} from "lucide-react";
import { useState } from "react";
import { AlbucLogo } from "@/components/albuc-logo";
import { cn } from "@/lib/utils";
import { AddBookTriggerButton } from "../add-book";
import { SORTS, STATUS_META, STATUS_ORDER } from "./constants";
import { type LibraryState, useElementWidth } from "./hooks";
import type { StatusFilter } from "./types";

function StatusTabs({ lib }: { lib: LibraryState }) {
  const items: Array<[StatusFilter, string]> = [
    ["ALL", "All"],
    ...STATUS_ORDER.map(
      (s) => [s, STATUS_META[s].label] as [StatusFilter, string],
    ),
  ];

  return (
    <div className="flex flex-wrap gap-[7px]">
      {items.map(([key, label]) => {
        const active = lib.status === key;
        const dot = key === "ALL" ? null : STATUS_META[key].dot;

        return (
          <button
            key={key}
            type="button"
            onClick={() => lib.setStatus(key)}
            className={cn(
              "inline-flex h-[34px] cursor-pointer items-center gap-[7px] rounded-full px-[13px] text-[13px] font-medium whitespace-nowrap transition-all duration-[140ms]",
              active
                ? "border border-foreground bg-foreground text-background"
                : "border border-border bg-background text-foreground",
            )}
          >
            {dot && (
              <span
                className="size-2 rounded-full"
                style={{ background: dot }}
              />
            )}
            {label}
            <span className="text-[11.5px] tabular-nums opacity-55">
              {lib.counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SearchSort({
  lib,
  width = 200,
}: {
  lib: LibraryState;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const cur = SORTS.find((s) => s.key === lib.sort);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-[11px] size-[15px] -translate-y-1/2 text-muted-foreground" />
        <input
          value={lib.query}
          onChange={(e) => lib.setQuery(e.target.value)}
          placeholder="Search library…"
          className="h-[38px] min-w-[130px] rounded-[10px] border border-border bg-background pr-3 pl-[34px] text-sm text-foreground outline-none"
          style={{ width }}
        />
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title={`Sort: ${cur?.label} (${lib.dir === "asc" ? "ascending" : "descending"})`}
          aria-label="Sort"
          className={cn(
            "inline-flex size-[38px] cursor-pointer items-center justify-center rounded-[10px] border border-border text-foreground transition-[background] duration-[140ms]",
            open ? "bg-accent" : "bg-background hover:bg-accent",
          )}
        >
          <ArrowUpDown className="size-4" />
        </button>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close sort menu"
              className="fixed inset-0 z-[55] cursor-default border-none bg-transparent"
              onClick={() => setOpen(false)}
            />
            <div className="absolute top-[calc(100%+6px)] right-0 z-[60] flex w-[200px] flex-col gap-1 rounded-[10px] border border-border bg-popover p-2 shadow-[0_12px_32px_rgba(0,0,0,.12)]">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    lib.setSortKey(s.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg border-none px-3 py-2.5 text-[13.5px] text-foreground transition-colors duration-[140ms]",
                    s.key === lib.sort
                      ? "bg-accent"
                      : "bg-transparent hover:bg-accent",
                  )}
                >
                  {s.label}
                  {s.key === lib.sort &&
                    (lib.dir === "asc" ? (
                      <ArrowUp className="size-[13px]" />
                    ) : (
                      <ArrowDown className="size-[13px]" />
                    ))}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusSelect({ lib }: { lib: LibraryState }) {
  const [open, setOpen] = useState(false);
  const items: Array<[StatusFilter, string]> = [
    ["ALL", "All"],
    ...STATUS_ORDER.map(
      (s) => [s, STATUS_META[s].label] as [StatusFilter, string],
    ),
  ];
  const curKey = lib.status;
  const curLabel = curKey === "ALL" ? "All" : STATUS_META[curKey].label;
  const curDot = curKey === "ALL" ? null : STATUS_META[curKey].dot;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by status"
        className={cn(
          "inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-[10px] border border-border px-3 text-[13.5px] font-medium whitespace-nowrap transition-[background] duration-[140ms]",
          open ? "bg-accent text-foreground" : "bg-background text-foreground",
        )}
      >
        {curDot && (
          <span
            className="size-2 rounded-full"
            style={{ background: curDot }}
          />
        )}
        {curLabel}
        <span className="text-[11.5px] tabular-nums opacity-55">
          {lib.counts[curKey]}
        </span>
        <ChevronDown className="ml-0.5 size-3.5 opacity-60" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close status filter"
            className="fixed inset-0 z-[55] cursor-default border-none bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-[calc(100%+6px)] left-0 z-[60] flex w-[220px] flex-col gap-1 rounded-[10px] border border-border bg-popover p-2 shadow-[0_12px_32px_rgba(0,0,0,.12)]">
            {items.map(([key, label]) => {
              const active = lib.status === key;
              const dot = key === "ALL" ? null : STATUS_META[key].dot;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    lib.setStatus(key);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-[9px] rounded-lg border-none px-3 py-2.5 text-[13.5px] text-foreground transition-colors duration-[140ms]",
                    active
                      ? "bg-accent font-semibold"
                      : "bg-transparent font-normal hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      !dot && "border border-border bg-transparent",
                    )}
                    style={dot ? { background: dot } : undefined}
                  />
                  <span className="flex-1 text-left">{label}</span>
                  <span className="text-[11.5px] tabular-nums opacity-55">
                    {lib.counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function FilterBar({
  lib,
  searchWidth,
  collapseBelow = 710,
}: {
  lib: LibraryState;
  searchWidth?: number;
  collapseBelow?: number;
}) {
  const [ref, w] = useElementWidth(900);
  const collapsed = w < collapseBelow;

  return (
    <div ref={ref} className="flex items-center justify-between gap-3.5">
      {collapsed ? <StatusSelect lib={lib} /> : <StatusTabs lib={lib} />}
      <SearchSort lib={lib} width={searchWidth} />
    </div>
  );
}

export function EmptyShelf({
  tone = "var(--muted-foreground)",
  variant = "filtered",
  onAddBook,
}: {
  tone?: string;
  variant?: "empty" | "filtered";
  onAddBook?: () => void;
}) {
  const message =
    variant === "empty"
      ? "Your Albuc is empty"
      : "No books match these filters";

  return (
    <div
      className="mt-10 flex flex-col items-center gap-3"
      style={{ color: tone }}
    >
      <AlbucLogo
        showText={false}
        iconClassName="size-8"
        className="text-inherit"
      />
      <p className="text-center font-serif text-[19px] italic">{message}</p>
      {variant === "empty" && onAddBook && (
        <AddBookTriggerButton trigger="empty-cta" onClick={onAddBook} />
      )}
    </div>
  );
}
