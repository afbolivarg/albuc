import type { bookStatusEnum } from "@/lib/db/schema";

export type BookStatus = (typeof bookStatusEnum.enumValues)[number];

export type ShelfBook = {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  status: BookStatus;
  rating: number;
  added: number;
  pages: number;
  cover: string;
  spine: readonly [string, string, string];
};

export type SortKey = "added" | "title" | "author" | "rating";
export type SortDir = "asc" | "desc";

export type StatusFilter = "ALL" | BookStatus;
