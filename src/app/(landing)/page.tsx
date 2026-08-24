import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/pwa";
import { LandingFeatures } from "./landing-features";

export const metadata: Metadata = {
  title: { absolute: APP_NAME },
  description: APP_DESCRIPTION,
};

function copy(locale: Locale, key: MessageKey) {
  return translate(locale, key);
}

function HeroImage() {
  return (
    <Image
      alt=""
      aria-hidden
      className="object-cover object-center"
      decoding="sync"
      fetchPriority="high"
      fill
      priority
      quality={70}
      sizes="(min-width: 80rem) 80rem, 100vw"
      src="/hero-bg.webp"
    />
  );
}

function HeroCopy({ locale }: { locale: Locale }) {
  return (
    <div className="relative z-10 pt-8 text-center md:pt-16">
      <h1 className="mb-6 font-serif text-4xl leading-none font-bold tracking-tight md:text-5xl">
        {copy(locale, "home.heroTitle1")}
        <br />
        {copy(locale, "home.heroTitle2")}
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-lg leading-tight text-foreground/80 md:text-xl">
        {copy(locale, "home.heroLede")}
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/sign-in">{copy(locale, "home.getStarted")}</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="hover:bg-foreground/10 hover:text-foreground"
        >
          <Link href="/why">{copy(locale, "home.whyBuilt")}</Link>
        </Button>
      </div>
    </div>
  );
}

function HomeBelowFold({ locale }: { locale: Locale }) {
  return (
    <>
      <LandingFeatures locale={locale} />
      <Card className="rounded-3xl border-none bg-muted shadow-none">
        <CardContent className="p-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {copy(locale, "home.ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {copy(locale, "home.ctaLede")}
          </p>
          <Button asChild>
            <Link href="/sign-in">{copy(locale, "home.getStarted")}</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

async function CachedHeroCopy({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-hero-${locale}`);
  cacheLife("weeks");
  return <HeroCopy locale={locale} />;
}

async function CachedBelowFold({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-home-${locale}`);
  cacheLife("weeks");
  return <HomeBelowFold locale={locale} />;
}

async function LocalizedHeroCopy() {
  const locale = await getRequestLocale();
  return <CachedHeroCopy locale={locale} />;
}

async function LocalizedBelowFold() {
  const locale = await getRequestLocale();
  return <CachedBelowFold locale={locale} />;
}

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-12 md:gap-40 md:pb-20">
      <Card className="overflow-hidden rounded-xl border-none bg-muted p-0 shadow-none">
        <CardContent className="relative min-h-[600px] overflow-hidden p-4 md:min-h-[700px] md:p-6">
          <HeroImage />
          <Suspense fallback={<HeroCopy locale={DEFAULT_LOCALE} />}>
            <LocalizedHeroCopy />
          </Suspense>
        </CardContent>
      </Card>
      <Suspense fallback={null}>
        <LocalizedBelowFold />
      </Suspense>
    </div>
  );
}
