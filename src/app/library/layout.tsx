import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LocaleSync } from "@/components/locale-sync";
import { getUser } from "@/lib/db/queries";
import { isLocale } from "@/lib/i18n/config";
import { needsOnboarding } from "@/lib/user-profile";

async function LibraryGuard({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (needsOnboarding(user)) {
    redirect("/onboarding");
  }

  const locale = isLocale(user.locale) ? user.locale : "en";

  return (
    <>
      <LocaleSync localeLocked={user.localeLocked} userLocale={locale} />
      <div className="min-h-0 flex-1">{children}</div>
    </>
  );
}

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-background">
      <div className="app-titlebar-drag shrink-0" />
      <Suspense fallback={null}>
        <LibraryGuard>{children}</LibraryGuard>
      </Suspense>
    </div>
  );
}
