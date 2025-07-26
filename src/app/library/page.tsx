import { getCurrentUser } from "@/lib/auth/user"
import { getUserBooks } from "@/lib/db/queries"
import { BookGrid } from "./book-grid"
import { AddBookButton } from "./add-book-button"

interface SearchParams {
  status?: "WANT" | "OWNED" | "READING" | "READ"
  search?: string
  sortBy?: "updated_at" | "rating" | "title" | "author" | "publish_year"
  sortOrder?: "asc" | "desc"
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status, search, sortBy, sortOrder } = await searchParams

  const user = await getCurrentUser()

  const books = await getUserBooks(user!.id, {
    status,
    search,
    sortBy,
    sortOrder,
  })

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            My Library
          </h1>
          <p className="text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"} in your
            collection
          </p>
        </div>
        <AddBookButton />
      </div>

      <BookGrid books={books} />
    </main>
  )
}
