import { redirect } from "next/navigation";
import { getUserWithBooks } from "@/lib/db/queries";
import { LitDockLibrary } from "./lit-dock/lit-dock-library";
import { adaptBook } from "./lit-dock/utils";

export default async function LibraryPage() {
  const user = await getUserWithBooks();

  if (!user) {
    redirect("/");
  }

  const baseBooks = user.books.map(adaptBook);
  const books = baseBooks;

  return <LitDockLibrary books={books} user={user} />;
}
