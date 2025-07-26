import { UserBook } from "@/lib/db/schema"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StatusPill } from "./status-pill"
import { StarRating } from "@/components/star-rating"

interface BookCardProps {
  book: UserBook
}

export function BookCard({ book }: BookCardProps) {
  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null

  return (
    <Link href={`/library/${book.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 bg-card backdrop-blur-sm hover:scale-105 cursor-pointer">
        <CardContent>
          {/* Cover */}
          <div className="aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
            <StatusPill
              status={book.status}
              className="absolute top-2 right-2 z-10"
            />
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={book.title}
                width={120}
                height={180}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-center p-4">
                <div className="text-2xl mb-2">📖</div>
                <div className="text-xs font-medium">No Cover</div>
              </div>
            )}
          </div>

          {/* Title and Author */}
          <div className="mb-2">
            <h3 className="font-serif font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {book.authors?.join(", ") || "Unknown Author"}
            </p>
          </div>

          {/* Rating */}
          <StarRating
            rating={book.rating ? parseFloat(book.rating) : 0}
            size="sm"
            readonly
          />
        </CardContent>
      </Card>
    </Link>
  )
}
