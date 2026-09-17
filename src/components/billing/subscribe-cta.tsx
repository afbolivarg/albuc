"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

export function SubscribeCta({
  className,
  href = "/subscribe",
}: {
  className?: string;
  href?: string;
}) {
  const t = useT();
  return (
    <Button asChild className={className}>
      <Link href={href}>{t("billing.subscribeCta")}</Link>
    </Button>
  );
}
