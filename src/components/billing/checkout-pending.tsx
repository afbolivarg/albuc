"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

export function CheckoutPending() {
  const t = useT();
  const router = useRouter();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      router.refresh();
      if (Date.now() - started > 20_000) {
        setWaited(true);
        clearInterval(id);
      }
    }, 1500);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="mt-10 space-y-3">
      <p className="font-serif text-2xl">{t("billing.confirming")}</p>
      <p className="text-muted-foreground">{t("billing.confirmingHint")}</p>
      {waited ? (
        <p className="text-sm text-muted-foreground">
          {t("billing.confirmingSlow")}
        </p>
      ) : null}
    </div>
  );
}
