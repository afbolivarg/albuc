import { SquareLibrary } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-4 md:py-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center space-x-2 cursor-pointer select-auto mr-4"
            aria-label="Go to home"
          >
            <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <SquareLibrary className="w-6 h-6" />
              Albuc
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Albuc
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/why"
              className="hover:text-foreground transition-colors"
            >
              Why Albuc
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
