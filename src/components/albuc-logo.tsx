import { cn } from "@/lib/utils";

type AlbucLogoProps = {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
};

function AlbucLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 7v10" />
      <path d="M11 7v10" />
      <path d="m15 7 2 10" />
    </svg>
  );
}

export function AlbucLogo({
  className,
  iconClassName = "w-6 h-6",
  showText = true,
}: AlbucLogoProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-serif font-bold text-2xl",
        className,
      )}
    >
      <AlbucLogoIcon className={iconClassName} />
      {showText && "Albuc"}
    </span>
  );
}
