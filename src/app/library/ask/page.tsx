import { redirect } from "next/navigation";
import { hasFullAccess } from "@/lib/billing/entitlement";
import { getUser } from "@/lib/db/queries";
import { AskContainer } from "./ask-container";

export default async function AskPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex h-full flex-col">
      <AskContainer canAsk={hasFullAccess(user)} />
    </div>
  );
}
