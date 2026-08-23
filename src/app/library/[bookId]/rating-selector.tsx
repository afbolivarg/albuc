"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
} from "react";
import { StarRating } from "@/components/star-rating";
import { updateBookRatingAction } from "./actions";

interface RatingSelectorProps {
  bookId: string;
  currentRating: number;
}

export function RatingSelector({ bookId, currentRating }: RatingSelectorProps) {
  const [state, formAction, isPending] = useActionState(
    updateBookRatingAction,
    null,
  );

  const [optimisticRating, setOptimisticRating] = useOptimistic(
    currentRating,
    (_currentRating, newRating: number) => newRating,
  );

  useEffect(() => {
    if (state?.error) {
      setOptimisticRating(currentRating);
    }
  }, [state, currentRating, setOptimisticRating]);

  const handleRatingChange = (newRating: number) => {
    startTransition(() => {
      setOptimisticRating(newRating);
      const formData = new FormData();
      formData.append("bookId", bookId);
      formData.append("rating", newRating.toString());
      formAction(formData);
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <StarRating
          rating={optimisticRating}
          onChange={handleRatingChange}
          size="lg"
          className={isPending ? "pointer-events-none opacity-50" : ""}
        />
        {optimisticRating === 0 && (
          <span className="text-[11px] text-neutral-400">Unrated</span>
        )}
      </div>
      {state?.error && (
        <div className="text-xs text-destructive">Error: {state.error}</div>
      )}
    </div>
  );
}
