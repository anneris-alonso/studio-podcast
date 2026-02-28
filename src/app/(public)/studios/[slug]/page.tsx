"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Video, Users, CheckCircle2, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { MediaGallery } from "@/components/studios/MediaGallery";

export default function StudioDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [studio, setStudio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<{ reviews: any[]; avgRating: number; count: number }>({ reviews: [], avgRating: 0, count: 0 });

  const fetchReviews = useCallback((studioSlug: string) => {
    fetch(`/api/studios/${studioSlug}/reviews`)
      .then(res => res.json())
      .then(data => setReviewData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/studios/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStudio(null);
        } else {
          setStudio({
            ...data,
            price: `${data.hourlyRate} AED/hr`,
            capacity: `Up to ${data.capacity} People`,
            features: data.equipmentSummary ? data.equipmentSummary.split(',').map((s: string) => s.trim()) : [
              "Absolute Sound Isolation",
              "Professional Microphones",
              "4K Cinema Cameras",
              "Professional Lighting Grid"
            ]
          });
          fetchReviews(slug);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black text-white pt-32 text-center animate-pulse">Loading Room Details...</div>;
  if (!studio) return <div className="min-h-screen bg-black text-white pt-32 text-center">Studio not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <div className="space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link href="/" className="text-accent-violet flex items-center gap-2 text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Studios
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight">{studio.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-accent-pink">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(reviewData.avgRating) ? "fill-current" : "opacity-20"}`} />
                ))}
              </div>
              <span className="text-white/50 text-sm">
                {reviewData.count > 0 ? `${reviewData.avgRating.toFixed(1)} (${reviewData.count} review${reviewData.count > 1 ? "s" : ""})` : "No reviews yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image / Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MediaGallery media={studio.media} studioName={studio.name} />
          </div>
          
          <div className="hidden lg:flex flex-col gap-6">
            <div className="flex-grow rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/20 overflow-hidden relative group">
                {studio.coverImageUrl && <img src={studio.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm group-hover:scale-110 transition-transform duration-700" />}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Premium Experience</span>
                </div>
            </div>
            <div className="flex-grow rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/20 overflow-hidden relative group">
                {studio.coverImageUrl && <img src={studio.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-110 transition-transform duration-700" />}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="uppercase tracking-[0.2em] text-[10px] font-bold">State-of-the-Art Gear</span>
                </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Overview</h2>
              <p className="text-white/60 text-lg leading-relaxed">{studio.description}</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studio.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-white/80 bg-white/5 p-4 rounded-2xl border border-white/10 glass-card-premium">
                    <CheckCircle2 className="w-5 h-5 text-accent-violet flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="glass-card-premium p-8 space-y-8 sticky top-32 border border-white/10 shadow-[0_0_30px_rgba(122,92,255,0.1)]">
              <div className="relative z-10 space-y-2">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Booking Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{studio.price}</span>
                </div>
              </div>

              <div className="relative z-10 space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Users className="w-4 h-4" /> Capacity</span>
                  <span className="text-white font-medium">{studio.capacity}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Mic className="w-4 h-4" /> Microphones</span>
                  <span className="text-white font-medium">4x Pro Mic</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40 flex items-center gap-2"><Video className="w-4 h-4" /> Cameras</span>
                  <span className="text-white font-medium">Included (4K)</span>
                </div>
              </div>

              <Link href="/book" className="block relative z-10">
                <Button size="lg" className="w-full bg-brand-gradient text-white border-none h-14 text-lg font-bold shadow-glow hover:scale-[1.02] transition-transform">
                  <Calendar className="w-5 h-5 mr-3" /> Book Now
                </Button>
              </Link>
              
              <p className="text-center text-[10px] text-white/30 uppercase tracking-wider relative z-10">Secure Transaction • Professional Support</p>
            </div>
          </aside>
        </div>

        {/* Reviews Section */}
        <div className="space-y-8 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white">Studio Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReviewList
              reviews={reviewData.reviews}
              avgRating={reviewData.avgRating}
              count={reviewData.count}
            />
            <ReviewForm
              studioId={slug}
              onSuccess={() => fetchReviews(slug)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
