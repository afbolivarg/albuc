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

  const handleClick = (event: React.MouseEvent, starIndex: number) => {
    if (readonly || !onChange) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;

    const value = isLeftHalf ? starIndex - 0.5 : starIndex;
    onChange(value);
  };

  const handleMouseEnter = (event: React.MouseEvent, starIndex: number) => {
    if (readonly) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;

    const value = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoverRating(value);
  };

  const handleMouseMove = (event: React.MouseEvent, starIndex: number) => {
    if (readonly) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;

    const value = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoverRating(value);
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
        const halfFilled = displayRating >= star - 0.5 && displayRating < star;

        return (
          <StarButton
            key={star}
            star={star}
            readonly={readonly}
            sizeClass={sizeClasses[size]}
            filled={filled}
            halfFilled={halfFilled}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      {!readonly && (
        <span className="text-xs text-muted-foreground ml-2">
          {displayRating > 0 ? displayRating.toFixed(1) : ""}
        </span>
      )}
    </div>
  );
}

function StarButton({
  star,
  readonly,
  sizeClass,
  filled,
  halfFilled,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}: {
  star: number;
  readonly: boolean;
  sizeClass: string;
  filled: boolean;
  halfFilled: boolean;
  onClick: (event: React.MouseEvent, starIndex: number) => void;
  onMouseEnter: (event: React.MouseEvent, starIndex: number) => void;
  onMouseMove: (event: React.MouseEvent, starIndex: number) => void;
  onMouseLeave: () => void;
}) {
  const stars = (
    <>
      <Star className={`${sizeClass} text-gray-300 fill-gray-300`} />
      {(filled || halfFilled) && (
        <Star
          className={`${sizeClass} absolute top-0 left-0 text-yellow-400 fill-yellow-400 ${
            halfFilled ? "clip-path-half" : ""
          }`}
          style={halfFilled ? { clipPath: "inset(0 50% 0 0)" } : {}}
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
      onClick={(e) => onClick(e, star)}
      onMouseEnter={(e) => onMouseEnter(e, star)}
      onMouseMove={(e) => onMouseMove(e, star)}
      onMouseLeave={onMouseLeave}
    >
      {stars}
    </button>
  );
}
