"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  studioId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ studioId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 5) { setError("Comment must be at least 5 characters."); return; }
    if (!authorName.trim()) { setError("Please enter your name."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/studios/${studioId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, authorName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit. Please try again.");
      } else {
        setSubmitted(true);
        onSuccess?.();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-card-premium p-8 border border-white/10 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-accent-violet mx-auto" />
        <p className="text-white font-bold">Review Submitted!</p>
        <p className="text-white/40 text-sm">Your review is pending approval and will appear shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card-premium p-8 border border-white/10 space-y-6">
      <h3 className="text-white font-bold text-lg">Leave a Review</h3>

      {/* Star picker */}
      <div className="space-y-2">
        <label className="text-white/40 text-xs uppercase tracking-widest">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${star <= (hovered || rating) ? "fill-accent-pink text-accent-pink" : "text-white/20"}`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-white/50 text-sm">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</span>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-white/40 text-xs uppercase tracking-widest">Your Name</label>
        <input
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="John Doe"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-violet/50 transition-colors"
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-white/40 text-xs uppercase tracking-widest">Your Review</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-violet/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-gradient text-white border-none h-12 font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
      >
        <Send className="w-4 h-4 mr-2" />
        {loading ? "Submitting..." : "Submit Review"}
      </Button>

      <p className="text-white/20 text-xs text-center">Reviews are manually approved before appearing publicly.</p>
    </form>
  );
}
