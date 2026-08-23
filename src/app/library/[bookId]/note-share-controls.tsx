"use client";

import { Check, Globe, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Book } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { publicNoteUrl } from "@/lib/sharing";
import { togglePublicNoteAction } from "./actions";

export function NoteShareControls({ book }: { book: Book }) {
  const t = useT();
  const [visibility, setVisibility] = useState(book.visibility);
  const [slug, setSlug] = useState(book.shareSlug);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  const url = slug ? publicNoteUrl(slug) : null;
  const isPublic = visibility === "public";

  return (
    <div className="flex items-center gap-1">
      {isPublic && url ? (
        <Button
          aria-label={copied ? t("book.copied") : t("book.copyLink")}
          className="size-7 text-muted-foreground"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          size="icon-sm"
          variant="ghost"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </Button>
      ) : null}
      <Switch
        aria-label={t("book.sharePublic")}
        checked={isPublic}
        disabled={pending}
        thumb={<Globe aria-hidden strokeWidth={2.25} />}
        onCheckedChange={async (checked) => {
          setPending(true);
          const result = await togglePublicNoteAction(book.id, checked);
          setPending(false);
          if ("visibility" in result && result.visibility) {
            setVisibility(result.visibility);
            setSlug(result.shareSlug ?? slug);
          }
        }}
      />
    </div>
  );
}
