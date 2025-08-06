"use client"

import { signOut } from "@/app/actions/auth"
import { User } from "@/lib/db/schema"
import Image from "next/image"
import { SquareLibrary, LogOut } from "lucide-react"
import { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LibraryHeaderProps {
  user: User & { supabaseUser?: SupabaseUser }
}

export function LibraryHeader({ user }: LibraryHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/library"
            className="flex items-center space-x-2 cursor-pointer select-auto"
            tabIndex={0}
            aria-label="Go to Library"
          >
            <span className="text-2xl font-serif font-bold text-foreground flex items-center gap-2 select-text">
              <SquareLibrary className="w-6 h-6" />
              Albuc
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:outline-none">
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
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
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
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut} className="w-full">
                  <button
                    type="submit"
                    className="flex items-center w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
