"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookSearchResult, getCoverUrl } from "@/lib/open-library"
import { addBookToLibrary } from "@/app/actions/books"
import { StarRating } from "@/components/star-rating"
import { Plus, Check, Loader2, BookOpen } from "lucide-react"

interface SearchResultItemProps {
  book: BookSearchResult
  onAdd: () => void
}

export function SearchResultItem({ book, onAdd }: SearchResultItemProps) {
  const [status, setStatus] = useState<"WANT" | "OWNED" | "READING" | "READ">(
    "WANT"
  )
  const [rating, setRating] = useState(0)
  const [isAdding, startAddTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)

  const coverUrl = getCoverUrl(book.coverId, "M")

  const handleAdd = () => {
    startAddTransition(async () => {
      try {
        await addBookToLibrary({
          workKey: book.workKey,
          editionKey: book.editionKey,
          title: book.title,
          authors: book.authors,
          authorKeys: book.authorKeys,
          publishYear: book.publishYear,
          coverId: book.coverId,
          isbn10: book.isbn10,
          isbn13: book.isbn13,
          status,
          rating: rating > 0 ? rating : undefined,
        })
        setIsAdded(true)
        setTimeout(onAdd, 1500) // Close modal after success
      } catch (error) {
        console.error("Error adding book:", error)
        // TODO: Show error toast
      }
    })
  }

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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Select
                value={status}
                onValueChange={(value: "WANT" | "OWNED" | "READING" | "READ") =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WANT">Want</SelectItem>
                  <SelectItem value="OWNED">Owned</SelectItem>
                  <SelectItem value="READING">Reading</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rating:</span>
              <StarRating rating={rating} onChange={setRating} size="sm" />
            </div>

            <Button
              onClick={handleAdd}
              disabled={isAdding || isAdded}
              size="sm"
              className={`${isAdded ? "bg-green-600 hover:bg-green-600" : ""}`}
            >
              {isAdding ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : isAdded ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              {isAdding ? "Adding..." : isAdded ? "Added!" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
