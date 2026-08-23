import { redirect } from "next/navigation";
import { getUserWithBooks } from "@/lib/db/queries";
import { AddBookView } from "./add-book-view";

export default async function AddBookPage() {
  const user = await getUserWithBooks();

  if (!user) {
    redirect("/sign-in");
  }

  const savedBooks = Object.fromEntries(
    user.books.map((book) => [
      book.workKey,
      {
        id: book.id,
        status: book.status,
        rating: book.rating ? Number.parseFloat(book.rating) : 0,
      },
    ]),
  );

  return <AddBookView savedBooks={savedBooks} />;
}
