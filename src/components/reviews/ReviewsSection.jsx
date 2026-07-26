import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { getReviews } from "@/lib/reviews";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 text-[#facc15] ${i < rating ? "fill-[#facc15]" : ""}`}
        />
      ))}
    </div>
  );
}

function relative(daysAgo) {
  if (daysAgo < 14) return `${daysAgo} days ago`;
  if (daysAgo < 60) return `${Math.round(daysAgo / 7)} weeks ago`;
  return `${Math.round(daysAgo / 30)} months ago`;
}

export default function ReviewsSection({ seed, title = "What customers are saying", className = "" }) {
  const { reviews, average, count } = getReviews(seed);

  return (
    <section className={`py-20 relative ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Reviews</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">{title}</h2>
          <div className="flex items-center justify-center gap-2.5">
            <Stars rating={Math.round(average)} />
            <span className="text-sm text-muted-foreground">
              {average.toFixed(1)} average · {count} reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
            >
              <Stars rating={r.rating} />
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-5 flex-1">"{r.body}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.role} · {relative(r.daysAgo)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}