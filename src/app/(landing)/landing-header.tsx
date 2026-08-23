"use client";

import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

export function LandingHeader() {
  const t = useT();
  return (
    <header className="mb-4 md:mb-6">
      <nav className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2"
          aria-label="Go to home"
        >
          <AlbucLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/why">{t("nav.why")}</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">{t("nav.signIn")}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
