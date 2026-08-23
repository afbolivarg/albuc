import { notFound } from "next/navigation";
import { getUserWithBook } from "@/lib/db/queries";
import { BookNotes } from "./book-notes";
import { BookSidebar } from "./book-sidebar";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  const user = await getUserWithBook(bookId);

  if (!user) {
    notFound();
  }

  const book = user.books[0];

  if (!book) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto overscroll-contain bg-background font-sans text-foreground md:flex-row md:overflow-hidden">
      <BookSidebar book={book} />
      <div className="md:min-h-0 md:flex-1 md:overflow-hidden">
        <BookNotes book={book} />
      </div>
    </div>
  );
}
