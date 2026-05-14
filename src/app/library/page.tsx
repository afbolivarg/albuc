import { getUserWithBooks } from "@/lib/db/queries"
import { BookGrid } from "./book-grid"
import { AddBook } from "./add-book"
import { redirect } from "next/navigation"

export default async function LibraryPage() {
  const user = await getUserWithBooks()

  if (!user) {
    redirect("/")
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            My Library
          </h1>
          <p className="text-muted-foreground">
            {user.books.length} {user.books.length === 1 ? "book" : "books"} in
            your collection
          </p>
        </div>
        <AddBook />
      </div>

      <BookGrid books={user.books} />
    </main>
  )
}
