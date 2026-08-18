import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { needsOnboarding } from "@/lib/user-profile";

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (needsOnboarding(user)) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-[#faf9f6]">
      <div className="app-titlebar-drag shrink-0" />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
