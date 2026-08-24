import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { translate } from "@/lib/i18n/translate";

function BuiltByCredit({ label }: { label: string }) {
  return (
    <p className="text-sm text-primary-foreground/90">
      {label}{" "}
      <a
        href="https://afbolivarg.com?utm_source=albuc"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 hover:text-primary-foreground hover:underline"
      >
        Andrés Bolívar
      </a>
    </p>
  );
}

export function LandingFooter({
  locale,
  year,
}: {
  locale: Locale;
  year: number;
}) {
  const t = (key: MessageKey) => translate(locale, key);
  const builtBy = t("footer.builtBy");
  return (
    <footer className="bg-primary py-8 text-primary-foreground md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8 md:px-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="mr-4 flex cursor-pointer items-center space-x-2 select-auto"
            aria-label="Albuc"
          >
            <AlbucLogo />
          </Link>
          <p className="text-sm text-primary-foreground/90">© {year} Albuc</p>
          <div className="sm:hidden">
            <BuiltByCredit label={builtBy} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary-foreground/90">
            <li>
              <Link
                href="/why"
                className="underline-offset-4 hover:text-primary-foreground hover:underline"
              >
                {t("nav.why")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-primary-foreground hover:underline"
              >
                {t("nav.privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="underline-offset-4 hover:text-primary-foreground hover:underline"
              >
                {t("nav.terms")}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/afbolivarg/albuc"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-primary-foreground hover:underline"
              >
                {t("nav.github")}
              </a>
            </li>
          </ul>
          <LocaleSwitcher className="sm:justify-end" tone="onDark" />
          <div className="hidden sm:block">
            <BuiltByCredit label={builtBy} />
          </div>
        </div>
      </div>
    </footer>
  );
}
