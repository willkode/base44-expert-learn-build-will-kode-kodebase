import React from "react";
import { Star, StarHalf } from "lucide-react";

// Deterministic rating per product (stable across reloads): mix of 4, 4.5, and 5 stars
export function getProductRating(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const ratings = [4, 4.5, 4.5, 5, 5];
  const rating = ratings[hash % ratings.length];
  const reviews = 18 + (hash % 54);
  return { rating, reviews };
}

export default function ProductStars({ seed, className = "" }) {
  const { rating, reviews } = getProductRating(seed);
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
        ))}
        {half && (
          <span className="relative inline-block w-3.5 h-3.5">
            <Star className="absolute inset-0 w-3.5 h-3.5 text-[#facc15]" />
            <StarHalf className="absolute inset-0 w-3.5 h-3.5 text-[#facc15] fill-[#facc15]" />
          </span>
        )}
        {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
          <Star key={`e${i}`} className="w-3.5 h-3.5 text-[#facc15]" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating.toFixed(1)} ({reviews})
      </span>
    </div>
  );
}