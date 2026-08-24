"use client";

import { Globe } from "lucide-react";
import { updatePublicProfileAction } from "@/app/library/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useActionMessage, useT } from "@/lib/i18n/client";
import { normalizeHandle } from "@/lib/sharing";

export function SettingsProfilePage({
  handle,
  publicProfile,
  error,
  canSave,
  onHandleChange,
  onPublicProfileChange,
  onErrorChange,
  onSaved,
}: {
  handle: string;
  publicProfile: boolean;
  error: string | null;
  canSave: boolean;
  onHandleChange: (value: string) => void;
  onPublicProfileChange: (value: boolean) => void;
  onErrorChange: (value: string | null) => void;
  onSaved: (handle: string, publicProfile: boolean) => void;
}) {
  const t = useT();
  const actionMessage = useActionMessage();

  return (
    <form
      className="space-y-5"
      action={async (formData) => {
        formData.set("handle", handle);
        formData.set("publicProfile", publicProfile ? "on" : "");
        const result = await updatePublicProfileAction(formData);
        onErrorChange(result.error ?? null);
        if (result.success) {
          onSaved(normalizeHandle(handle), publicProfile);
        }
      }}
    >
      <div>
        <h2 className="text-base font-medium">{t("profile.title")}</h2>
      </div>
      <div className="space-y-2">
        <Label htmlFor="handle">{t("profile.handle")}</Label>
        <Input
          id="handle"
          name="handle"
          onChange={(event) => onHandleChange(event.target.value)}
          placeholder="@andres"
          value={handle}
        />
        <p className="text-xs text-muted-foreground">
          {t("profile.handleHint", {
            handle: normalizeHandle(handle) || t("profile.handleExample"),
          })}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label className="font-normal" htmlFor="publicProfile">
          {t("profile.public")}
        </Label>
        <Switch
          checked={publicProfile}
          id="publicProfile"
          onCheckedChange={onPublicProfileChange}
          thumb={<Globe aria-hidden strokeWidth={2.25} />}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive">{actionMessage(error)}</p>
      ) : null}
      <Button disabled={!canSave} type="submit">
        {t("profile.save")}
      </Button>
    </form>
  );
}
