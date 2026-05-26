import type { bookStatusEnum } from "@/lib/db/schema";

interface StatusPillProps {
  status: (typeof bookStatusEnum.enumValues)[number];
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  WANT: { label: "Want", color: "bg-gray-100 text-gray-800 border-gray-200" },
  OWNED: {
    label: "Owned",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  READING: {
    label: "Reading",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  READ: {
    label: "Read",
    color: "bg-green-100 text-green-800 border-green-200",
  },
};

export function StatusPill({ status, onClick, className }: StatusPillProps) {
  const config = statusConfig[status];

  const baseClasses =
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors";
  const clickableClasses = onClick ? "cursor-pointer hover:opacity-80" : "";

  return (
    <span
      className={`${baseClasses} ${config.color} ${clickableClasses} ${className || ""}`}
      onClick={onClick}
    >
      {config.label}
    </span>
  );
}
