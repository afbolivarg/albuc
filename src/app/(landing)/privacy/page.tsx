import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/lib/i18n/config";
import type { MessageKey } from "@/lib/i18n/en";
import { getRequestLocale, t } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await t("privacy.title"),
    description: await t("privacy.metaDescription"),
  };
}

function PrivacyView({ locale }: { locale: Locale }) {
  const copy = (key: MessageKey) => translate(locale, key);
  return (
    <article className="mx-auto max-w-prose space-y-6 pt-10 pb-12 text-foreground md:pt-12 md:pb-20">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        {copy("privacy.title")}
      </h1>
      <p className="leading-relaxed text-muted-foreground">
        {copy("privacy.intro")}
      </p>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy("privacy.whatTitle")}</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>{copy("privacy.itemEmail")}</li>
          <li>{copy("privacy.itemBooks")}</li>
          <li>{copy("privacy.itemNotes")}</li>
          <li>{copy("privacy.itemAsk")}</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy("privacy.whoTitle")}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("privacy.whoBody")}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {copy("privacy.analyticsTitle")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("privacy.analyticsBody")}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{copy("privacy.dontTitle")}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {copy("privacy.dontBody")}
        </p>
      </section>
    </article>
  );
}

async function CachedPrivacy({ locale }: { locale: Locale }) {
  "use cache";
  cacheTag("landing", `landing-privacy-${locale}`);
  cacheLife("weeks");
  return <PrivacyView locale={locale} />;
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  return <CachedPrivacy locale={locale} />;
}
