"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { updateUserRating } from "@/actions/wine.actions";
import { cn } from "@/lib/utils";

export function StarRatingInput({
  wineId,
  value,
}: {
  wineId: string;
  value: number | null;
}) {
  const [rating, setRating] = useState(value ?? 0);
  const [isPending, startTransition] = useTransition();

  function handleClick(star: number) {
    const next = star === rating ? null : star;
    setRating(next ?? 0);
    startTransition(async () => {
      const { error } = await updateUserRating(wineId, next);
      if (error) {
        alert(error);
        setRating(value ?? 0);
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-1", isPending && "opacity-60")}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={isPending}
          className="text-amber-500 disabled:cursor-not-allowed"
        >
          <Star size={22} fill={star <= rating ? "currentColor" : "none"} />
        </button>
      ))}
      {rating > 0 && (
        <span className="text-sm text-muted-foreground ml-1">{rating}/5</span>
      )}
    </div>
  );
}
