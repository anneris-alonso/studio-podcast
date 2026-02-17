"use client";

import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <GlassCard className="max-w-md w-full p-12 text-center space-y-6 border-accent-pink/20">
        <div className="w-20 h-20 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink mx-auto">
          <XCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-fg">Payment Canceled</h1>
          <p className="text-muted lowercase">Your payment process was interrupted. No charges were made, but your booking is still held as confirmed.</p>
        </div>
        
        <div className="pt-6 border-t border-white/5 space-y-4">
           <Link href={`/book/success?bookingId=${bookingId}`} className="block">
              <Button variant="primary" className="w-full">
                Back to Booking Summary
              </Button>
           </Link>
           <Link href="/book" className="block text-sm text-muted hover:text-fg transition-colors">
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Start New Booking
              </span>
           </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg text-fg">Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
