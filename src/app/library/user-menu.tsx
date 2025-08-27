"use client"

import { User } from "@/lib/db/schema"
import { PlanType } from "@/lib/billing/plan"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { LogOut, CreditCard, Library } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "./actions"
import { openCustomerPortal } from "@/app/actions/billing"
import { PlansDialog } from "./plans"

type UserWithPlan = User & { plan: PlanType; bookLimit: number }

export function UserMenu({ user }: { user: UserWithPlan }) {
  return (
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

        <PlansDialog currentPlan={user.plan}>
          <DropdownMenuItem
            className="flex items-center cursor-pointer"
            onSelect={e => e.preventDefault()}
          >
            <Library className="h-4 w-4" />
            <span>Plans</span>
          </DropdownMenuItem>
        </PlansDialog>

        <DropdownMenuItem asChild>
          <form action={openCustomerPortal} className="w-full">
            <button
              type="submit"
              className="flex items-center w-full text-left"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </button>
          </form>
        </DropdownMenuItem>

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
  )
}
