"use client";

import { BookOpen, Loader, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/open-library";
import { cn } from "@/lib/utils";
import { searchBooksAction } from "./actions";
import { SearchResultItem } from "./search-result-item";

export type AddBookTrigger = "dock" | "empty-cta";

export function AddBookTriggerButton({
  trigger,
  className,
  onClick,
}: {
  trigger: AddBookTrigger;
  className?: string;
  onClick: () => void;
}) {
  if (trigger === "empty-cta") {
    return (
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "mt-1 h-10 rounded-full px-6 font-serif text-[15px]",
          className,
        )}
      >
        <Plus className="size-4" />
        Add your first book
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-[7px] rounded-full border-border bg-background px-3.5 text-[13.5px] font-medium text-foreground hover:bg-accent",
        className,
      )}
    >
      <Plus className="size-[15px]" />
      Add
    </Button>
  );
}

type AddBookDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [state, formAction, isPending] = useActionState(searchBooksAction, {
    results: [],
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;
    if (!query?.trim()) return;

    startTransition(() => {
      formAction(formData);
    });
  };

  const resetSearch = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    const formData = new FormData();
    formData.append("query", "");
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleBookAdded = () => {
    onOpenChange(false);
    resetSearch();
    router.refresh();
  };

  const handleOpenChange = (openState: boolean) => {
    onOpenChange(openState);
    if (!openState) {
      resetSearch();
    }
  };

  const canSearch = query.trim().length >= MIN_SEARCH_QUERY_LENGTH;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden focus-visible:ring-0">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground">
            Add Book to Albuc
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 focus-visible:ring-0"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending || !canSearch}>
              Search
            </Button>
          </form>

          {!canSearch && query.trim().length > 0 && (
            <p className="text-xs text-muted-foreground">
              Enter at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
            </p>
          )}

          <div className="flex-1 overflow-y-auto">
            {isPending ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Searching Albuc...</span>
                </div>
              </div>
            ) : state.results.length > 0 ? (
              <div className="space-y-3">
                {state.results.map((book) => (
                  <SearchResultItem
                    key={book.workKey}
                    book={book}
                    onAdd={handleBookAdded}
                  />
                ))}
              </div>
            ) : state.error ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <p className="text-foreground">
                  No books found for your search
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try different keywords or check the spelling
                </p>
                <p className="mt-1 text-sm text-destructive">{state.error}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Search for books to add to your library
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
