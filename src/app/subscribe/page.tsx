import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlbucLogo } from "@/components/albuc-logo";
import { CheckoutPending } from "@/components/billing/checkout-pending";
import { Button } from "@/components/ui/button";
import {
  hasBillingHistory,
  hasFullAccess,
  hasGivenName,
  SUPPORT_EMAIL,
  signedInPath,
} from "@/lib/billing/entitlement";
import { getUser } from "@/lib/db/queries";
import { t } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await t("billing.metaTitle"),
    description: await t("billing.metaDescription"),
  };
}

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (!hasGivenName(user)) {
    redirect("/onboarding");
  }

  if (hasFullAccess(user) && !user.subscriptionCancelAtPeriodEnd) {
    redirect(signedInPath(user));
  }

  const { checkout } = await searchParams;
  const confirming = checkout === "success" && !hasFullAccess(user);
  const logoHref = hasBillingHistory(user) ? "/library" : "/";

  const title = await t("billing.price");
  const unit = await t("billing.perYear");
  const lede = await t("billing.lede");
  const refund = await t("billing.refund");
  const cta = await t("billing.continuePayment");
  const terms = await t("nav.terms");
  const privacy = await t("nav.privacy");
  const support = await t("nav.support");
  const feature1 = await t("billing.featureLibrary");
  const feature2 = await t("billing.featureNotes");
  const feature3 = await t("billing.featureAsk");
  const legal = await t("billing.legalUnder");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <Link
        href={logoHref}
        className="mb-10 inline-flex w-fit"
        aria-label="Albuc"
      >
        <AlbucLogo />
      </Link>
      <p className="font-serif text-7xl font-medium tracking-tight">{title}</p>
      <p className="mt-2 text-lg text-muted-foreground">{unit}</p>
      {confirming ? (
        <CheckoutPending />
      ) : (
        <>
          <p className="mt-8 text-pretty text-muted-foreground">{lede}</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>{feature1}</li>
            <li>{feature2}</li>
            <li>{feature3}</li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{refund}</p>
          <Button asChild className="mt-8 h-11 w-full">
            <a href="/api/checkout">{cta}</a>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {legal}{" "}
            <Link href="/terms" className="underline underline-offset-4">
              {terms}
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              {privacy}
            </Link>{" "}
            ·{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="underline underline-offset-4"
            >
              {support}
            </a>
          </p>
        </>
      )}
      <p className="mt-10 text-center text-sm">
        <Link
          href="/auth/sign-out"
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          {await t("auth.signOut")}
        </Link>
      </p>
    </main>
  );
}
