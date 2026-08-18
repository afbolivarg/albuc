import { notFound } from "next/navigation";
import { getUserWithBook } from "@/lib/db/queries";
import { BookDetailHeader } from "./book-detail-header";
import { BookNotes } from "./book-notes";

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
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="container mx-auto max-w-4xl space-y-4 p-6 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        <BookDetailHeader book={book} />
        <BookNotes book={book} />
      </div>
    </div>
  );
}
