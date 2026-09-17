import { redirect } from "next/navigation";
import { SubscribeCta } from "@/components/billing/subscribe-cta";
import { hasFullAccess } from "@/lib/billing/entitlement";
import { getUserWithBooks } from "@/lib/db/queries";
import { t } from "@/lib/i18n/server";
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

  if (!hasFullAccess(user)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl">{await t("billing.priceLine")}</p>
        <p className="max-w-sm text-muted-foreground">
          {await t("billing.addLocked")}
        </p>
        <SubscribeCta />
      </div>
    );
  }

  return <AddBookView savedBooks={savedBooks} />;
}
