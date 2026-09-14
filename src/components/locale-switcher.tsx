"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { setPreferredLocaleAction } from "@/lib/i18n/actions";
import { useLocale, useT } from "@/lib/i18n/client";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { persistLocaleCookies } from "@/lib/i18n/persist-cookie";
import { LANG_PARAM } from "@/lib/sharing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher(props: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  return (
    <Suspense fallback={null}>
      <LocaleSwitcherInner {...props} />
    </Suspense>
  );
}

function LocaleSwitcherInner({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const cookieLocale = useLocale();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlLang = searchParams.get(LANG_PARAM);
  const locale = isLocale(urlLang) ? urlLang : cookieLocale;
  const isPublicShare =
    pathname.startsWith("/@") || /^\/n\/[^/]+$/.test(pathname);

  const choose = async (next: Locale) => {
    if (next === locale) return;
    persistLocaleCookies(next);
    if (isPublicShare) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set(LANG_PARAM, next);
      router.replace(`${pathname}?${nextParams.toString()}`);
    } else {
      router.refresh();
    }
    void setPreferredLocaleAction(next);
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
                ? "text-primary-foreground/90 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(code === "en" ? "lang.en" : "lang.es")}
        </button>
      ))}
    </div>
  );
}
