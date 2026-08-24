import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { getRequestLocale, t } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await t("why.metaTitle"),
    description: await t("why.metaDescription"),
  };
}

function WhyView({ locale }: { locale: Locale }) {
  const copy = (key: MessageKey) => translate(locale, key);
  return (
    <article className="mx-auto max-w-prose space-y-6 pt-10 pb-12 text-foreground md:pt-12 md:pb-20">
      <h1 className="mb-8 text-center font-serif text-4xl font-bold tracking-tight md:mb-12 md:text-5xl">
        {copy("why.title")}
      </h1>
      <p className="leading-relaxed text-muted-foreground">{copy("why.p1")}</p>
      <p className="leading-relaxed text-muted-foreground">{copy("why.p2")}</p>
      <p className="leading-relaxed text-muted-foreground">{copy("why.p3")}</p>
      <h2 className="text-lg font-semibold">{copy("why.freeTitle")}</h2>
      <p className="leading-relaxed text-muted-foreground">
        {copy("why.freeBody")}
      </p>
      <p className="leading-relaxed text-muted-foreground">
        {copy("why.codeBefore")}{" "}
        <a
          href="https://github.com/afbolivarg/albuc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          GitHub
        </a>{" "}
        {copy("why.codeAfter")}
      </p>
      <p className="leading-relaxed text-muted-foreground">— Andrés Bolívar</p>
      <Button asChild>
        <Link href="/sign-in">{copy("why.cta")}</Link>
      </Button>
    </article>
  );
}

async function CachedWhy({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-why-${locale}`);
  cacheLife("weeks");
  return <WhyView locale={locale} />;
}

export default async function WhyPage() {
  const locale = await getRequestLocale();
  return <CachedWhy locale={locale} />;
}
