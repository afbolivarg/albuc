import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";

async function CachedLandingHeader({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing-chrome", `landing-header-${locale}`);
  cacheLife("weeks");
  return <LandingHeader locale={locale} />;
}

async function CachedLandingFooter({
  locale,
  year,
}: {
  locale: Locale;
  year: number;
}) {
  "use cache";
  cacheTag("landing-chrome", `landing-footer-${locale}-${year}`);
  cacheLife("weeks");
  return <LandingFooter locale={locale} year={year} />;
}

async function LocalizedHeader() {
  const locale = await getRequestLocale();
  return <CachedLandingHeader locale={locale} />;
}

async function LocalizedFooter() {
  const locale = await getRequestLocale();
  return (
    <CachedLandingFooter locale={locale} year={new Date().getFullYear()} />
  );
}

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const skip = translate(DEFAULT_LOCALE, "a11y.skip");
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {skip}
      </a>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 md:p-6">
        <div className="mb-4 min-h-9 md:mb-6">
          <Suspense fallback={null}>
            <LocalizedHeader />
          </Suspense>
        </div>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <LocalizedFooter />
      </Suspense>
    </div>
  );
}
