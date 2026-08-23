"use client";

import { useRouter } from "next/navigation";
import { setPreferredLocaleAction } from "@/lib/i18n/actions";
import { useLocale, useT } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();

  const choose = async (next: Locale) => {
    if (next === locale) return;
    await setPreferredLocaleAction(next);
    router.refresh();
  };

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={cn("inline-flex items-center gap-1 text-sm", className)}
    >
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          className={cn(
            "rounded-full px-2 py-0.5 transition-colors",
            locale === code
              ? tone === "onDark"
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "bg-foreground text-background"
              : tone === "onDark"
                ? "text-primary-foreground/70 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(code === "en" ? "lang.en" : "lang.es")}
        </button>
      ))}
    </div>
  );
}
