import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
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
            <Link href="/why">Why</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
