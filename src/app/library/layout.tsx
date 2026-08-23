import { redirect } from "next/navigation";
import { LocaleSync } from "@/components/locale-sync";
import { getUser } from "@/lib/db/queries";
import { isLocale } from "@/lib/i18n/config";
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

  const locale = isLocale(user.locale) ? user.locale : "en";

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-background">
      <LocaleSync localeLocked={user.localeLocked} userLocale={locale} />
      <div className="app-titlebar-drag shrink-0" />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
