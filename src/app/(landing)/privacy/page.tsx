import type { Metadata } from "next";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Albuc handles your data.",
};

export default async function PrivacyPage() {
  return (
    <article className="mx-auto max-w-prose space-y-6 pt-10 pb-12 md:pt-12 md:pb-20 text-foreground">
      <h1 className="text-3xl font-serif font-bold tracking-tight">
        {await t("privacy.title")}
      </h1>

      <p className="text-muted-foreground leading-relaxed">
        {await t("privacy.intro")}
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {await t("privacy.whatTitle")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Your account email</li>
          <li>Books you add and their metadata (title, author, cover)</li>
          <li>Notes you write for each book</li>
          <li>How often you use the Ask feature (for basic usage stats)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{await t("privacy.whoTitle")}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {await t("privacy.whoBody")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {await t("privacy.analyticsTitle")}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          We use Vercel Analytics to understand basic usage — page views, where
          visitors come from, that kind of thing. No ad tracking, no selling
          that data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {await t("privacy.dontTitle")}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {await t("privacy.dontBody")}
        </p>
      </section>
    </article>
  );
}
