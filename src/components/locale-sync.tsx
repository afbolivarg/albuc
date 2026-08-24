"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n/config";
import { persistLocaleCookies } from "@/lib/i18n/persist-cookie";

export function LocaleSync({
  userLocale,
  localeLocked,
}: {
  userLocale: Locale;
  localeLocked: boolean;
}) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !localeLocked) return;
    ran.current = true;
    const cookie = document.cookie
      .split("; ")
      .find((part) => part.startsWith("albuc_locale="))
      ?.split("=")[1];
    if (cookie === userLocale) return;
    persistLocaleCookies(userLocale);
  }, [localeLocked, userLocale]);

  return null;
}
