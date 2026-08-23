"use client";

import { Globe, Languages } from "lucide-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { normalizeHandle } from "@/lib/sharing";
import { cn } from "@/lib/utils";
import { SettingsLanguagePage } from "./settings-language-page";
import { SettingsProfilePage } from "./settings-profile-page";

type SettingsPage = "language" | "profile";

export function SettingsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [page, setPage] = useState<SettingsPage>("profile");
  const [handle, setHandle] = useState(user.handle ?? "");
  const [publicProfile, setPublicProfile] = useState(user.publicProfile);
  const [savedHandle, setSavedHandle] = useState(user.handle ?? "");
  const [savedPublicProfile, setSavedPublicProfile] = useState(
    user.publicProfile,
  );
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nav = [
    { id: "profile" as const, label: t("profile.title"), icon: Globe },
    { id: "language" as const, label: t("settings.language"), icon: Languages },
  ];

  const reset = () => {
    setPage("profile");
    setHandle(savedHandle);
    setPublicProfile(savedPublicProfile);
    setError(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent
        className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{t("settings.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("settings.title")}
        </DialogDescription>
        <SidebarProvider className="h-[480px] min-h-0 items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {nav.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={page === item.id}
                          onClick={() => setPage(item.id)}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <div className="flex gap-1 px-4 pt-4 md:hidden">
              {nav.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    page === item.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setPage(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div
              className="flex flex-1 flex-col overflow-y-auto p-4"
              ref={scrollRef}
            >
              <div
                className={cn(
                  page === "language"
                    ? "animate-in fade-in slide-in-from-right-2 duration-200"
                    : "hidden",
                )}
              >
                <SettingsLanguagePage />
              </div>
              <div
                className={cn(
                  page === "profile"
                    ? "animate-in fade-in slide-in-from-right-2 duration-200"
                    : "hidden",
                )}
              >
                <SettingsProfilePage
                  canSave={
                    normalizeHandle(handle) !== normalizeHandle(savedHandle) ||
                    publicProfile !== savedPublicProfile
                  }
                  error={error}
                  handle={handle}
                  onErrorChange={setError}
                  onHandleChange={setHandle}
                  onPublicProfileChange={setPublicProfile}
                  onSaved={(nextHandle, nextPublic) => {
                    setSavedHandle(nextHandle);
                    setSavedPublicProfile(nextPublic);
                    setHandle(nextHandle);
                  }}
                  publicProfile={publicProfile}
                />
              </div>
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
