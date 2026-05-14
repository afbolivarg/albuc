import Link from "next/link"
import { SquareLibrary } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-serif font-bold text-foreground mb-8"
      >
        <SquareLibrary className="w-8 h-8" />
        Albuc
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
