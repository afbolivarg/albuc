import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";
import { t } from "@/lib/i18n/server";

export async function PublicGone() {
  const title = await t("billing.publicGoneTitle");
  const body = await t("billing.publicGoneBody");
  const home = await t("notFound.home");
  return (
    <PublicPageShell>
      <h1 className="font-serif text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">{body}</p>
      <Link href="/" className="mt-8 inline-block underline underline-offset-4">
        {home}
      </Link>
    </PublicPageShell>
  );
}
