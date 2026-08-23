"use client";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { useT } from "@/lib/i18n/client";

export function SettingsLanguagePage() {
  const t = useT();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">{t("settings.language")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.languageLede")}
        </p>
      </div>
      <LocaleSwitcher />
    </div>
  );
}
