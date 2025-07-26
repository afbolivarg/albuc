"use client"

import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateBookStatus } from "@/app/actions/books"
import { UserBook } from "@/lib/db/schema"

interface StatusSelectorProps {
  bookId: string
  currentStatus: UserBook["status"]
}

const statusOptions = [
  { value: "WANT", label: "Want to Read", color: "text-blue-700" },
  { value: "OWNED", label: "Owned", color: "text-green-700" },
  { value: "READING", label: "Currently Reading", color: "text-orange-700" },
  { value: "READ", label: "Finished", color: "text-purple-700" },
] as const

export function StatusSelector({ bookId, currentStatus }: StatusSelectorProps) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateBookStatus(bookId, newStatus as UserBook["status"])
      } catch (error) {
        console.error("Failed to update status:", error)
        // TODO: Show error toast
      }
    })
  }

  const currentOption = statusOptions.find(
    option => option.value === currentStatus
  )

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-50">
        <SelectValue>
          <span className={currentOption?.color}>
            {currentOption?.label || "Select Status"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <span className={option.color}>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
