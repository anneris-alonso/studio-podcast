"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle2, Clock, Receipt, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button as UIButton } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          setBooking(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [bookingId]);

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payments/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-12 h-12 text-accent-violet animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <GlassCard className="text-center p-12 space-y-4">
          <h1 className="text-4xl font-bold text-fg">Booking Not Found</h1>
          <p className="text-muted">We couldn't locate your booking details.</p>
          <Link href="/book">
            <UIButton variant="primary">Try Again</UIButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const isPaid = booking.status === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-bold text-fg">Booking {isPaid ? "Confirmed & Paid" : "Confirmed"}</h1>
        <p className="text-muted text-lg">Your recording session is scheduled at {booking.room?.name || "The Zenith Suite"}.</p>
      </div>

      <GlassCard className="p-8 space-y-8 border-accent-violet/20">
        <div className="flex justify-between items-start border-b border-white/5 pb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted uppercase tracking-[0.2em]">Booking Reference</p>
            <p className="text-xl font-bold text-fg">#{booking.id}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-muted uppercase tracking-[0.2em]">Status</p>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-accent-violet/10 text-accent-violet border border-accent-violet/20"}`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Schedule
            </h3>
            <div className="space-y-2">
               <p className="text-fg font-medium">{new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               <p className="text-muted text-sm capitalize">{booking.timeZone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Summary
            </h3>
            <div className="space-y-2">
               <p className="text-fg font-medium">{booking.totalPriceAedSnapshot} AED Total</p>
               {isPaid && booking.paidAt && (
                 <p className="text-green-400 text-xs">Paid on {new Date(booking.paidAt).toLocaleString()}</p>
               )}
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="pt-6 border-t border-white/5 text-center space-y-6">
            <div className="p-6 bg-accent-violet/5 rounded-r-lg border border-accent-violet/10">
               <p className="text-sm text-fg/80 mb-4 lowercase">Payment is required to secure your session. You can pay now or through your dashboard later.</p>
               <UIButton 
                 onClick={handlePayNow} 
                 disabled={paying}
                 className="w-full bg-brand-gradient text-white h-14 text-lg"
               >
                 {paying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Pay Now with Stripe"}
               </UIButton>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted italic lowercase">A confirmation email has been sent to you.</span>
                <Link href="/dashboard">
                  <UIButton variant="ghost" size="sm">Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" /></UIButton>
                </Link>
             </div>
          </div>
        )}
      </GlassCard>

      <div className="text-center opacity-40">
        <p className="text-xs uppercase tracking-[0.3em]">Studio Suite Dubai • Premium Podcast Production</p>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-12 h-12 text-accent-violet animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
