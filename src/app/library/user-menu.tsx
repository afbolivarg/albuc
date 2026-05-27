"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/db/schema";
import { signOut } from "./actions";

function UserAvatar({ email }: { email: string }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
      <span className="text-sm font-semibold text-muted-foreground">
        {email.charAt(0).toUpperCase() || "?"}
      </span>
    </div>
  );
}

export function UserMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline-none"
        >
          <UserAvatar email={user.email} />
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
            <UserAvatar email={user.email} />
            <span className="truncate font-medium">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <form action={signOut} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center text-left"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
