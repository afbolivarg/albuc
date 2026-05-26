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
import { updateBookStatusAction } from "./actions";

interface StatusSelectorProps {
  bookId: string;
  currentStatus: Book["status"];
}

const statusOptions = [
  { value: "WANT", label: "Want to Read", color: "bg-gray-500" },
  { value: "OWNED", label: "Owned", color: "bg-red-500" },
  { value: "READING", label: "Currently Reading", color: "bg-yellow-500" },
  { value: "READ", label: "Finished", color: "bg-green-500" },
] as const;

export function StatusSelector({ bookId, currentStatus }: StatusSelectorProps) {
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
        <SelectTrigger className="w-50 shadow-none">
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
