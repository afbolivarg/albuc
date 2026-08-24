import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/translate";

export function LandingHeader({ locale }: { locale: Locale }) {
  const t = (key: "nav.why" | "nav.signIn") => translate(locale, key);
  return (
    <header className="mb-4 md:mb-6">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2"
          aria-label="Albuc"
        >
          <AlbucLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/why">{t("nav.why")}</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">{t("nav.signIn")}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
