"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Book } from "@/lib/db/schema";
import { useT } from "@/lib/i18n/client";
import { updateBookStatusAction } from "./actions";

interface StatusSelectorProps {
  bookId: string;
  currentStatus: Book["status"];
}

export function StatusSelector({ bookId, currentStatus }: StatusSelectorProps) {
  const t = useT();
  const statusOptions = [
    {
      value: "WANT" as const,
      label: t("library.status.WANT_LONG"),
      color: "bg-gray-500",
    },
    {
      value: "OWNED" as const,
      label: t("library.status.OWNED_LONG"),
      color: "bg-red-500",
    },
    {
      value: "READING" as const,
      label: t("library.status.READING_LONG"),
      color: "bg-yellow-500",
    },
    {
      value: "READ" as const,
      label: t("library.status.READ_LONG"),
      color: "bg-green-500",
    },
  ];
  const [state, formAction, isPending] = useActionState(
    updateBookStatusAction,
    null,
  );

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    currentStatus,
    (_currentStatus, newStatus: Book["status"]) => newStatus,
  );

  useEffect(() => {
    if (state?.error) {
      setOptimisticStatus(currentStatus);
    }
  }, [state, currentStatus, setOptimisticStatus]);

  const handleStatusChange = (newStatus: string) => {
    const status = newStatus as Book["status"];

    startTransition(() => {
      setOptimisticStatus(status);
      const formData = new FormData();
      formData.append("bookId", bookId);
      formData.append("status", status);
      formAction(formData);
    });
  };

  const currentOption = statusOptions.find(
    (option) => option.value === optimisticStatus,
  );

  return (
    <div className="space-y-1">
      <Select
        value={optimisticStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="h-9 w-full shadow-none">
          <SelectValue>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${currentOption?.color || "bg-gray-400"}`}
              />
              <span>{currentOption?.label || "Select Status"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {state?.error && (
        <div className="text-xs text-destructive">Error: {state.error}</div>
      )}
    </div>
  );
}
