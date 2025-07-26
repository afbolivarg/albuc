import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { UserBook } from "@/lib/db/schema"
import { getCoverUrl } from "@/lib/open-library"
import { StatusSelector } from "./status-selector"
import { RatingSelector } from "./rating-selector"

interface BookDetailHeaderProps {
  book: UserBook
}

export function BookDetailHeader({ book }: BookDetailHeaderProps) {
  const coverUrl = getCoverUrl(book.coverId || undefined, "L")

  return (
    <div className="mb-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/library">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>

      {/* Header Content */}
      <div className="bg-card backdrop-blur-sm rounded-2xl border p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
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

          {/* Metadata */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 leading-tight">
                {book.title}
              </h1>

              <div className="text-lg text-muted-foreground mb-4">
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
                <p className="text-muted-foreground mb-4">
                  First published: {book.publishYear}
                </p>
              )}
            </div>

            {/* Status and Rating Controls */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <StatusSelector bookId={book.id} currentStatus={book.status} />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Rating:
                </span>
                <RatingSelector
                  bookId={book.id}
                  currentRating={book.rating ? parseFloat(book.rating) : 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
