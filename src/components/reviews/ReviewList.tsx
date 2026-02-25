"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  user?: { name: string } | null;
}

interface ReviewListProps {
  reviews: Review[];
  avgRating: number;
  count: number;
}

function StarRow({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-${size} h-${size} ${i <= rating ? "fill-accent-pink text-accent-pink" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, avgRating, count }: ReviewListProps) {
  if (count === 0) {
    return (
      <div className="glass-card-premium p-8 border border-white/10 text-center">
        <p className="text-white/40 text-sm">No reviews yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="glass-card-premium p-6 border border-white/10 flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-white">{avgRating.toFixed(1)}</div>
          <StarRow rating={Math.round(avgRating)} size={4} />
          <div className="text-white/40 text-xs mt-1">{count} review{count > 1 ? "s" : ""}</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const cnt = reviews.filter(r => r.rating === star).length;
            const pct = count > 0 ? (cnt / count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-white/40">
                <span className="w-3">{star}</span>
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div
                    className="bg-brand-gradient h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` } as React.CSSProperties}
                  />
                </div>
                <span className="w-4 text-right">{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-premium p-6 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(review.user?.name || review.authorName).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{review.user?.name || review.authorName}</p>
                  <p className="text-white/30 text-xs">{new Date(review.createdAt).toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <StarRow rating={review.rating} size={4} />
            </div>
            <p className="text-white/70 text-sm mt-4 leading-relaxed">{review.comment}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
