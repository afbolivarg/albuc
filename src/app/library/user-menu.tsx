"use client";

import { LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { userDisplayName, userInitial } from "@/lib/user-profile";
import { signOut } from "./actions";

function UserAvatar({ user, size = 32 }: { user: User; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-muted"
      style={{ width: size, height: size }}
    >
      <span
        className="font-semibold text-muted-foreground"
        style={{ fontSize: size * 0.375 }}
      >
        {userInitial(user)}
      </span>
    </div>
  );
}

export function UserMenu({
  user,
  avatarSize = 32,
}: {
  user: User;
  avatarSize?: number;
}) {
  const t = useT();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center transition-opacity hover:opacity-80 focus:outline-none focus-visible:outline-none"
          >
            <UserAvatar user={user} size={avatarSize} />
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
              <UserAvatar user={user} size={avatarSize} />
              <div className="min-w-0">
                <p className="truncate font-medium">{userDisplayName(user)}</p>
                {user.firstName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings />
            {t("settings.title")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void signOut()}>
            <LogOut />
            {t("auth.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog
        onOpenChange={setSettingsOpen}
        open={settingsOpen}
        user={user}
      />
    </>
  );
}
