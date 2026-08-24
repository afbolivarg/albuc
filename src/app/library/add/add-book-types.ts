import type { BookSearchResult } from "@/lib/open-library.shared";

export type BookStatus = "WANT" | "OWNED" | "READING" | "READ";

export const STATUS_OPTIONS = [
  { value: "WANT", color: "bg-gray-500" },
  { value: "OWNED", color: "bg-red-500" },
  { value: "READING", color: "bg-yellow-500" },
  { value: "READ", color: "bg-green-500" },
] as const satisfies ReadonlyArray<{
  value: BookStatus;
  color: string;
}>;

export type SavedShelfEntry = {
  id: string;
  status: BookStatus;
  rating: number;
};

export type AddBookDetailProps = {
  book: BookSearchResult;
  status: BookStatus;
  rating: number;
  statusLabels: Record<BookStatus, string>;
  savedEntry?: SavedShelfEntry;
  isAdding: boolean;
  addError: string | null;
  onBack: () => void;
  onStatusChange: (status: BookStatus) => void;
  onRatingChange: (rating: number) => void;
  onAdd: () => void;
};

export type AddBookResultsProps = {
  results: BookSearchResult[];
  selectedWorkKey: string | null;
  added: Record<string, SavedShelfEntry>;
  onSelect: (book: BookSearchResult) => void;
};
