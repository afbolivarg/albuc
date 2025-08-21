import { getUserWithBook } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { BookDetailHeader } from "./book-detail-header"
import { BookNotes } from "./book-notes"

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>
}) {
  const { bookId } = await params

  const user = await getUserWithBook(bookId)

  if (!user) {
    notFound()
  }

  const book = user.books[0]

  if (!book) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-4">
      <BookDetailHeader book={book} />
      <BookNotes book={book} />
    </div>
  )
}
