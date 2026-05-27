import Link from "next/link";
import { AlbucLogo } from "@/components/albuc-logo";

function BuiltByCredit() {
  return (
    <p className="text-sm text-primary-foreground/70">
      Built by{" "}
      <a
        href="https://afbolivarg.com?utm_source=albuc"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary-foreground transition-colors"
      >
        Andrés Bolívar
      </a>
    </p>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col gap-4 sm:gap-8 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center space-x-2 cursor-pointer select-auto mr-4"
            aria-label="Go to home"
          >
            <AlbucLogo />
          </Link>
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} Albuc
          </p>
          <div className="sm:hidden">
            <BuiltByCredit />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-primary-foreground/70">
            <li>
              <Link
                href="/why"
                className="hover:text-primary-foreground transition-colors"
              >
                Why
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-primary-foreground transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-primary-foreground transition-colors"
              >
                Terms
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/afbolivarg/albuc"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground transition-colors"
              >
                GitHub
              </a>
            </li>
          </ul>
          <div className="hidden sm:block">
            <BuiltByCredit />
          </div>
        </div>
      </div>
    </footer>
  );
}
