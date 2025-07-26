import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import { User } from "@/lib/db/schema"
import Image from "next/image"
import { SquareLibrary } from "lucide-react"
import { User as SupabaseUser } from "@supabase/supabase-js"

interface LibraryHeaderProps {
  user: User & { supabaseUser?: SupabaseUser }
}

export function LibraryHeader({ user }: LibraryHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <SquareLibrary className="w-6 h-6" />
              Alexandria
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full border"
                />
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground font-semibold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <div className="font-medium text-foreground">
                  {user.name || "User"}
                </div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
