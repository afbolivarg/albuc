"use client"

import { useTransition } from "react"
import { StarRating } from "@/components/star-rating"
import { updateBookRating } from "@/app/actions/books"

interface RatingSelectorProps {
  bookId: string
  currentRating: number
}

export function RatingSelector({ bookId, currentRating }: RatingSelectorProps) {
  const [isPending, startTransition] = useTransition()

  const handleRatingChange = (newRating: number) => {
    startTransition(async () => {
      try {
        await updateBookRating(bookId, newRating)
      } catch (error) {
        console.error("Failed to update rating:", error)
        // TODO: Show error toast
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating
        rating={currentRating}
        onChange={handleRatingChange}
        size="md"
        className={isPending ? "opacity-50 pointer-events-none" : ""}
      />
    </div>
  )
}
