import { UserBook } from "@/lib/db/schema"
import { BookCard } from "./book-card"

interface BookGridProps {
  books: UserBook[]
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
          Your library is empty
        </h3>
        <p className="text-muted-foreground mb-6">
          Start building your cozy collection by adding your first book
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
