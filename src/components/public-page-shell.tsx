import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { LandingFooter } from "@/app/(landing)/landing-footer";
import { AlbucLogo } from "@/components/albuc-logo";
import type { Locale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

async function CachedPublicHeader({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing-chrome", `public-shell-${locale}`);
  cacheLife("weeks");
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {translate(locale, "a11y.skip")}
      </a>
      <Link aria-label="Albuc" className="inline-flex w-fit" href="/">
        <AlbucLogo />
      </Link>
    </>
  );
}

async function LocalizedPublicShell({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 md:px-6 md:py-12">
        <CachedPublicHeader locale={locale} />
        <main id="main" className="mt-6 w-full flex-1">
          {children}
        </main>
      </div>
      <LandingFooter locale={locale} year={new Date().getFullYear()} />
    </div>
  );
}

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LocalizedPublicShell>{children}</LocalizedPublicShell>
    </Suspense>
  );
}
