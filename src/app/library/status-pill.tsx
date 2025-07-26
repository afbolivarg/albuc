import { UserBook } from "@/lib/db/schema"

interface StatusPillProps {
  status: UserBook["status"]
  onClick?: () => void
  className?: string
}

const statusConfig = {
  WANT: { label: "Want", color: "bg-blue-100 text-blue-800 border-blue-200" },
  OWNED: {
    label: "Owned",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  READING: {
    label: "Reading",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  READ: {
    label: "Read",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
}

export function StatusPill({ status, onClick, className }: StatusPillProps) {
  const config = statusConfig[status]

  const baseClasses =
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors"
  const clickableClasses = onClick ? "cursor-pointer hover:opacity-80" : ""

  return (
    <span
      className={`${baseClasses} ${config.color} ${clickableClasses} ${className || ""}`}
      onClick={onClick}
    >
      {config.label}
    </span>
  )
}
