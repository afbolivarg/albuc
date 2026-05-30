import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import { Card, CardContent } from "@/components/ui/card";
import type { Book } from "@/lib/db/schema";
import { getBookCoverUrl } from "@/lib/supabase/book-covers";
import { StatusPill } from "./status-pill";

interface BookCardProps {
  book: Book;
  priority?: boolean;
}

export function BookCard({ book, priority = false }: BookCardProps) {
  const coverUrl = getBookCoverUrl(book.coverPath);

  return (
    <Link href={`/library/${book.id}`}>
      <Card className="group bg-card cursor-pointer">
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
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                priority={priority}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-center p-4 flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-10 h-10" />
                <div className="text-xs font-medium">No Cover</div>
              </div>
            )}
          </div>

          {/* Title and Author */}
          <div className="mb-2">
            <h3 className="font-serif font-semibold text-foreground text-md leading-tight line-clamp-1 group-hover:text-primary transition-colors">
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
  );
}
