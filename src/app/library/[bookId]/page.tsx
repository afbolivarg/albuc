import { getCurrentUser } from "@/lib/auth/user"
import { getUserBook } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { BookDetailHeader } from "./book-detail-header"
import { BookNotes } from "./book-notes"

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>
}) {
  const user = await getCurrentUser()

  const { bookId } = await params

  const book = await getUserBook(user!.id, bookId)

  if (!book) {
    notFound()
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <BookDetailHeader book={book} />
      <BookNotes book={book} />
    </div>
  )
}
