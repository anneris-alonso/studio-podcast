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
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      alert(`Payment Initialization Failed: ${err.message}`);
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
        <div className="glass-card-premium text-center p-12 space-y-4 border-gradient-fine">
          <h1 className="text-4xl font-bold text-white">Booking Not Found</h1>
          <p className="text-white/50">We couldn't locate your booking details.</p>
          <Link href="/book">
            <UIButton className="bg-brand-gradient text-white border-none py-6 px-8 rounded-full font-bold shadow-[0_0_20px_rgba(122,92,255,0.3)]">Try Again</UIButton>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = booking.status === "PAID";

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet mx-auto shadow-[0_0_30px_rgba(122,92,255,0.2)]">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-bold text-white font-heading">Booking {isPaid ? "Confirmed & Paid" : "Confirmed"}</h1>
        <p className="text-white/50 text-lg">Your recording session is scheduled at {booking.room?.name || "The Zenith Suite"}.</p>
      </div>

      <div className="glass-card-premium p-8 space-y-8 border-gradient-fine relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-pink/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-violet/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="flex justify-between items-start border-b border-white/5 pb-6 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Booking Reference</p>
            <p className="text-2xl font-bold text-white tracking-wider">#{booking.id?.split('-')[0].toUpperCase()}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Status</p>
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-accent-violet/10 text-accent-violet border border-accent-violet/20"}`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-accent-violet uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Schedule
            </h3>
            <div className="space-y-2">
               <p className="text-white font-bold">{new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{booking.timeZone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-accent-pink uppercase tracking-[0.2em] flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Summary
            </h3>
            <div className="space-y-2">
              <p className="text-white font-bold">{booking.totalPriceAedSnapshot} <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest ml-1">AED Total</span></p>
              {isPaid && booking.paidAt && (
                <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Paid on {new Date(booking.paidAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="pt-6 border-t border-white/5 text-center space-y-6 relative z-10">
            <div className="p-8 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-sm text-white/50 mb-6">Payment is required to secure your session. You can pay now or through your dashboard later.</p>
              <UIButton 
                onClick={handlePayNow} 
                disabled={paying}
                className="w-full bg-brand-gradient text-white h-14 rounded-2xl text-lg font-bold border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300"
              >
                {paying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Pay Now with Stripe"}
              </UIButton>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="pt-6 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40 italic text-xs">A confirmation email has been sent to you.</span>
              <Link href="/dashboard">
                <UIButton variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10 uppercase tracking-widest font-bold text-[10px]">Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" /></UIButton>
              </Link>
            </div>
          </div>
        )}
      </div>

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
