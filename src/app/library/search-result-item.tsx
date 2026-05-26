"use client";

import { BookOpen, Check, Loader, Plus } from "lucide-react";
import Image from "next/image";
import { startTransition, useActionState, useRef, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookStatusEnum } from "@/lib/db/schema";
import { type BookSearchResult, getCoverUrl } from "@/lib/open-library";
import { addBookAction } from "./actions";

type BookStatus = (typeof bookStatusEnum.enumValues)[number];

interface SearchResultItemProps {
  book: BookSearchResult;
  onAdd: () => void;
}

export function SearchResultItem({ book, onAdd }: SearchResultItemProps) {
  const statusRef = useRef<BookStatus>(bookStatusEnum.enumValues[0]);
  const [rating, setRating] = useState<number>(0);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { success: boolean; error?: string },
      formData: FormData,
    ) => {
      const result = await addBookAction(prevState, formData);
      if (result.success) {
        onAdd();
      }
      return result;
    },
    { success: false },
  );

  const coverUrl = getCoverUrl(book.coverId, "M");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.append("workKey", book.workKey);
    formData.append("editionKey", book.editionKey || "");
    formData.append("title", book.title);
    formData.append("authors", JSON.stringify(book.authors));
    formData.append("authorKeys", JSON.stringify(book.authorKeys || []));
    formData.append("publishYear", book.publishYear?.toString() || "");
    formData.append("coverId", book.coverId?.toString() || "");
    formData.append("isbn10", JSON.stringify(book.isbn10 || []));
    formData.append("isbn13", JSON.stringify(book.isbn13 || []));

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="p-4 bg-card backdrop-blur-sm hover:bg-accent/10 transition-colors shadow-none">
      <div className="flex gap-4">
        {/* Cover */}
        <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={book.title}
              width={64}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-center flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
              <div className="text-xs">No Cover</div>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {book.authors.length > 0
              ? book.authors.join(", ")
              : "Unknown Author"}
          </p>
          {book.publishYear && (
            <p className="text-xs text-muted-foreground mb-3">
              First published: {book.publishYear}
            </p>
          )}

          {/* Controls */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-4 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select
                name="status"
                defaultValue={statusRef.current}
                onValueChange={(value: BookStatus) => {
                  statusRef.current = value;
                }}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookStatusEnum.enumValues.map((statusValue) => (
                    <SelectItem key={statusValue} value={statusValue}>
                      {statusValue.charAt(0) +
                        statusValue.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rating:</span>
              <StarRating rating={rating} onChange={setRating} size="sm" />
              <input type="hidden" name="rating" value={rating.toString()} />
            </div>

            <Button
              type="submit"
              disabled={isPending || state.success}
              size="sm"
              className={`${state.success ? "bg-green-600 hover:bg-green-600" : ""}`}
            >
              {isPending ? (
                <Loader className="h-3 w-3 animate-spin mr-1" />
              ) : state.success ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Add
            </Button>

            {state.error && (
              <span className="text-xs text-destructive">{state.error}</span>
            )}
          </form>
        </div>
      </div>
    </Card>
  );
}
