import { Book } from "@/lib/db/schema"
import { BookCard } from "./book-card"
import { SquareLibrary } from "lucide-react"

interface BookGridProps {
  books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <SquareLibrary className="w-10 h-10 mb-4" />
        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
          Your Albuc is empty
        </h3>
        <p className="text-muted-foreground mb-6">
          Start building your collection by adding your first book
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
