"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";

export function BillingBanner() {
  const t = useT();
  return (
    <div className="border-border border-b bg-white/80 px-4 py-2 text-center text-sm backdrop-blur">
      <Link href="/subscribe" className="underline-offset-4 hover:underline">
        {t("billing.banner")}
      </Link>
    </div>
  );
}
