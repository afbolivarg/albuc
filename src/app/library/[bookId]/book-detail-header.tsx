import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Book } from "@/lib/db/schema"
import { getCoverUrl } from "@/lib/open-library"
import { StatusSelector } from "./status-selector"
import { RatingSelector } from "./rating-selector"
import { Label } from "@/components/ui/label"

interface BookDetailHeaderProps {
  book: Book
}

export function BookDetailHeader({ book }: BookDetailHeaderProps) {
  const coverUrl = getCoverUrl(book.coverId || undefined, "L")

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" asChild>
        <Link href="/library">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
      </Button>

      <div className="bg-card rounded-2xl border p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 h-72 mx-auto md:mx-0 flex-shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center shadow-lg">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={book.title}
                width={192}
                height={288}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-center p-6 flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-10 h-10" />
                <div className="text-sm font-medium">No Cover Available</div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
                {book.title}
              </h1>

              <div className="text-lg text-muted-foreground">
                {book.authors && book.authors.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    by{" "}
                    {book.authors.map((author, index) => (
                      <span key={index}>
                        {author}
                        {index < book.authors!.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                ) : (
                  "Unknown Author"
                )}
              </div>

              {book.publishYear && (
                <p className="text-muted-foreground">
                  First published: {book.publishYear}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label>Status</Label>
              <StatusSelector bookId={book.id} currentStatus={book.status} />
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label>Rating</Label>
              <RatingSelector
                bookId={book.id}
                currentRating={book.rating ? parseFloat(book.rating) : 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
