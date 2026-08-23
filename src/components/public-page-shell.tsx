import Link from "next/link";
import type { ReactNode } from "react";
import { LandingFooter } from "@/app/(landing)/landing-footer";
import { AlbucLogo } from "@/components/albuc-logo";

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 md:px-6 md:py-12">
        <Link aria-label="Albuc" className="inline-flex w-fit" href="/">
          <AlbucLogo />
        </Link>
        <div className="mt-6 w-full flex-1">{children}</div>
      </div>
      <LandingFooter />
    </div>
  );
}
