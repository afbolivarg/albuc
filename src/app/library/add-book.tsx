"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AddBookTrigger = "dock" | "empty-cta";

export function AddBookTriggerButton({
  trigger,
  className,
  onClick,
}: {
  trigger: AddBookTrigger;
  className?: string;
  onClick: () => void;
}) {
  if (trigger === "empty-cta") {
    return (
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          "mt-1 h-10 rounded-full px-6 font-serif text-[15px]",
          className,
        )}
      >
        <Plus className="size-4" />
        Add your first book
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-[7px] rounded-full border-border bg-background px-3.5 text-[13.5px] font-medium text-foreground hover:bg-accent",
        className,
      )}
    >
      <Plus className="size-[15px]" />
      Add
    </Button>
  );
}
