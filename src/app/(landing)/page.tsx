import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { getRequestLocale, t } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { APP_NAME } from "@/lib/pwa";
import { LandingFeatures } from "./landing-features";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    description: await t("home.metaDescription"),
  };
}

function HomeView({ locale }: { locale: Locale }) {
  const copy = (key: MessageKey) => translate(locale, key);
  return (
    <div className="flex flex-col gap-16 pb-12 md:gap-40 md:pb-20">
      <Card className="overflow-hidden rounded-xl border-none bg-muted p-0 shadow-none">
        <CardContent className="relative min-h-[600px] bg-[radial-gradient(120%_80%_at_50%_0%,#fffdf8_0%,#f3eee6_55%,#ebe4d8_100%)] p-4 md:min-h-[700px] md:p-6">
          <div className="pt-8 text-center md:pt-16">
            <h1 className="mb-6 font-serif text-4xl leading-none font-bold tracking-tight md:text-5xl">
              {copy("home.heroTitle1")}
              <br />
              {copy("home.heroTitle2")}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-tight text-foreground/80 md:text-xl">
              {copy("home.heroLede")}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/sign-in">{copy("home.getStarted")}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="hover:bg-foreground/10 hover:text-foreground"
              >
                <Link href="/why">{copy("home.whyBuilt")}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LandingFeatures locale={locale} />

      <Card className="rounded-3xl border-none bg-muted shadow-none">
        <CardContent className="p-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {copy("home.ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {copy("home.ctaLede")}
          </p>
          <Button asChild>
            <Link href="/sign-in">{copy("home.getStarted")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

async function CachedHome({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-home-${locale}`);
  cacheLife("weeks");
  return <HomeView locale={locale} />;
}

export default async function Home() {
  const locale = await getRequestLocale();
  return <CachedHome locale={locale} />;
}
