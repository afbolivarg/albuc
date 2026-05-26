import { SquareLibrary } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <nav className="flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center space-x-2"
        aria-label="Go to home"
      >
        <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <SquareLibrary className="w-6 h-6" />
          Albuc
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link href="/why">Why Albuc</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    </nav>
  );
}
