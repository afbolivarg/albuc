import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { getRequestLocale, t } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await t("terms.title"),
    description: await t("terms.metaDescription"),
  };
}

function TermsView({ locale }: { locale: Locale }) {
  const copy = (key: MessageKey) => translate(locale, key);
  return (
    <article className="mx-auto max-w-prose space-y-6 pt-10 pb-12 text-foreground md:pt-12 md:pb-20">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        {copy("terms.title")}
      </h1>
      <p className="leading-relaxed text-muted-foreground">
        {copy("terms.intro")}
      </p>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {copy("terms.responsibleTitle")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("terms.responsibleBody")}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {copy("terms.guaranteesTitle")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("terms.guaranteesBody")}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy("terms.accountsTitle")}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("terms.accountsBody")}
        </p>
      </section>
      <p className="leading-relaxed text-muted-foreground">
        {copy("terms.closing")}
      </p>
    </article>
  );
}

async function CachedTerms({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-terms-${locale}`);
  cacheLife("weeks");
  return <TermsView locale={locale} />;
}

export default async function TermsPage() {
  const locale = await getRequestLocale();
  return <CachedTerms locale={locale} />;
}
