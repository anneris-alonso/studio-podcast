"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  isApproved: boolean;
  createdAt: string;
  user?: { name: string; email: string } | null;
  studioRoom?: { name: string } | null;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  async function loadReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, []);

  async function handleApprove(id: string, isApproved: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved }),
    });
    loadReviews();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadReviews();
  }

  const filtered = reviews.filter(r =>
    filter === "all" ? true : filter === "pending" ? !r.isApproved : r.isApproved
  );

  const pendingCount = reviews.filter(r => !r.isApproved).length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500">{pendingCount} pending approval</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f} {f === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No reviews {filter !== "all" ? `that are ${filter}` : ""}.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`border rounded-2xl p-6 bg-white shadow-sm ${review.isApproved ? "border-green-200" : "border-amber-200 bg-amber-50/30"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{review.user?.name || review.authorName}</span>
                    {review.user && <span className="text-xs text-gray-400">{review.user.email}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <StarDisplay rating={review.rating} />
                    <span>·</span>
                    <span>{review.studioRoom?.name}</span>
                    <span>·</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.isApproved ? (
                    <Button
                      onClick={() => handleApprove(review.id, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white border-none gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApprove(review.id, false)}
                      size="sm"
                      variant="outline"
                      className="gap-1 border-gray-300"
                    >
                      <XCircle className="w-4 h-4" /> Unapprove
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(review.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-500 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
