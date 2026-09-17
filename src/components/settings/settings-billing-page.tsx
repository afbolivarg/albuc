"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  REFUND_EMAIL,
  SUPPORT_EMAIL,
  type BillingUser,
  hasFullAccess,
  toBillingDate,
} from "@/lib/billing/entitlement";
import { useT } from "@/lib/i18n/client";

function SupportEmail() {
  const t = useT();
  return (
    <p className="text-sm text-muted-foreground">
      {t("billing.supportIntro")}{" "}
      <a
        className="underline underline-offset-4 hover:text-foreground"
        href={`mailto:${SUPPORT_EMAIL}`}
      >
        {SUPPORT_EMAIL}
      </a>
    </p>
  );
}

function formatDate(value: Date | string | null, locale: string) {
  const date = toBillingDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function SettingsBillingPage({ user }: { user: BillingUser }) {
  const t = useT();
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  const entitled = hasFullAccess(user);

  if (user.billingExempt) {
    return (
      <div className="space-y-3">
        <h2 className="text-base font-medium">{t("billing.settingsTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("billing.exempt")}</p>
        <SupportEmail />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-medium">{t("billing.settingsTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("billing.priceLine")}
        </p>
      </div>

      {entitled ? (
        <p className="text-sm">
          {user.subscriptionCancelAtPeriodEnd
            ? t("billing.accessUntil", {
                date: formatDate(user.subscriptionPeriodEnd, locale),
              })
            : t("billing.renewsOn", {
                date: formatDate(user.subscriptionPeriodEnd, locale),
              })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("billing.teaserLede")}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {!entitled || user.subscriptionCancelAtPeriodEnd ? (
          <Button asChild>
            <a href="/subscribe">{t("billing.subscribeCta")}</a>
          </Button>
        ) : null}

        {user.creemCustomerId ? (
          <Button asChild variant={entitled ? "default" : "outline"}>
            <a href="/api/portal">{t("billing.manage")}</a>
          </Button>
        ) : null}
      </div>

      <SupportEmail />

      <p className="text-sm text-muted-foreground">
        {t("billing.refundIntro")}{" "}
        <a
          className="underline underline-offset-4 hover:text-foreground"
          href={`mailto:${REFUND_EMAIL}`}
        >
          {REFUND_EMAIL}
        </a>
        . {t("billing.refundTermsBefore")}{" "}
        <Link
          className="underline underline-offset-4 hover:text-foreground"
          href="/terms"
        >
          {t("nav.terms")}
        </Link>{" "}
        {t("billing.refundTermsAfter")}
      </p>
    </div>
  );
}
