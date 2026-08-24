import { redirect } from "next/navigation";
import { getUserWithBooks } from "@/lib/db/queries";
import { LitDockLibrary } from "./lit-dock/lit-dock-library";
import { adaptBook } from "./lit-dock/utils";

export default async function LibraryPage() {
  const user = await getUserWithBooks();

  if (!user) {
    redirect("/sign-in");
  }

  return <LitDockLibrary books={user.books.map(adaptBook)} user={user} />;
}
