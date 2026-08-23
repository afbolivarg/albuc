"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (starIndex: number) => {
    if (readonly || !onChange) return;
    onChange(starIndex);
  };

  const handleMouseEnter = (starIndex: number) => {
    if (readonly) return;
    setHoverRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center space-x-1 ${className || ""}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayRating >= star;

        return (
          <StarButton
            key={star}
            filled={filled}
            readonly={readonly}
            sizeClass={sizeClasses[size]}
            star={star}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}

function StarButton({
  star,
  readonly,
  sizeClass,
  filled,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  star: number;
  readonly: boolean;
  sizeClass: string;
  filled: boolean;
  onClick: (starIndex: number) => void;
  onMouseEnter: (starIndex: number) => void;
  onMouseLeave: () => void;
}) {
  const stars = (
    <>
      <Star className={`${sizeClass} fill-gray-300 text-gray-300`} />
      {filled && (
        <Star
          className={`${sizeClass} absolute top-0 left-0 fill-yellow-400 text-yellow-400`}
        />
      )}
    </>
  );

  if (readonly) {
    return <div className="relative">{stars}</div>;
  }

  return (
    <button
      type="button"
      aria-label={`Rate ${star} stars`}
      className="relative cursor-pointer"
      onClick={() => onClick(star)}
      onMouseEnter={() => onMouseEnter(star)}
      onMouseLeave={onMouseLeave}
    >
      {stars}
    </button>
  );
}
