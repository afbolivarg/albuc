"use client";

import { BookOpen, Loader, Plus, Search } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchBooksAction } from "./actions";
import { SearchResultItem } from "./search-result-item";

export function AddBook() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
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

  const handleClose = () => {
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
    setOpen(false);
    handleClose();
  };

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col focus-visible:ring-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-foreground">
            Add Book to Albuc
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                ref={inputRef}
                name="query"
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 focus-visible:ring-0"
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              Search
            </Button>
          </form>

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
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
                <p className="text-foreground">
                  No books found for your search
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or check the spelling
                </p>
                <p className="text-sm text-destructive mt-1">{state.error}</p>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                <Search className="w-10 h-10 text-muted-foreground" />
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
