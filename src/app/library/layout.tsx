import { LibraryHeader } from "./library-header"

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <LibraryHeader />
      {children}
    </div>
  )
}
