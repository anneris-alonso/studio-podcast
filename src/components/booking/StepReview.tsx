"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, Check, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface StepReviewProps {
  data: {
    studio: any;
    package: {
      id: string;
      name: string;
      unit: 'HOUR' | 'DAY' | 'FIXED_MINUTES';
      pricePerUnitMinor: number;
      durationMinutes: number;
    } | null;
    packageQuantity: number;
    dateTime: { date: string | null; startTime: string | null; endTime: string | null };
    services: { id: string; name: string; price: any; quantity: number }[];
    timeZone: string;
  };
  userId: string;
  onBack: () => void;
}

export function StepReview({ data, userId, onBack }: StepReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [creditBalance, setCreditBalance] = useState(0);

  const router = useRouter();

  useEffect(() => {
    async function fetchSubInfo() {
      try {
        const res = await fetch(`/api/user/subscription-info?userId=${userId}`);
        const info = await res.json();
        if (res.ok) {
          setActiveSub(info.subscription);
          setCreditBalance(info.credits.balance);
        }
      } catch (e) {
        console.error("Failed to fetch sub info:", e);
      } finally {
        setSubLoading(false);
      }
    }
    fetchSubInfo();
  }, []);

  // Client-side Price mirroring (Minor Units)
  const pkgUnit = data.package?.unit || 'FIXED_MINUTES';
  const pkgQty = data.packageQuantity || 1;
  const pkgUnitPriceMinor = data.package?.pricePerUnitMinor || 0;
  
  let pkgTotalMinor = 0;
  if (pkgUnit === 'HOUR' || pkgUnit === 'DAY') {
    pkgTotalMinor = pkgUnitPriceMinor * pkgQty;
  } else {
    pkgTotalMinor = pkgUnitPriceMinor;
  }

  // Simplified service pricing logic mirroring the server
  // Actually, for better accuracy we fetch service details or assume the price provided in 'data.services' is per unit
  const servicesTotalMinor = data.services.reduce((acc, s) => {
    // Note: This is an approximation on client. Server does the real math.
    return acc + (Number(s.price) * 100 * s.quantity);
  }, 0);
  
  // Credit calculation
  let requiredMinutes = 0;
  if (pkgUnit === 'HOUR') requiredMinutes = pkgQty * 60;
  else if (pkgUnit === 'DAY') requiredMinutes = pkgQty * 24 * 60;
  else requiredMinutes = data.package?.durationMinutes || 60;

  const canUseCredits = activeSub && creditBalance >= requiredMinutes;
  
  const finalPriceMinor = (canUseCredits ? 0 : pkgTotalMinor) + servicesTotalMinor;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    const serviceQuantities: Record<string, number> = {};
    data.services.forEach(s => { serviceQuantities[s.id] = s.quantity; });

    const bookingPayload = {
      userId,
      roomId: data.studio.id,
      packageId: data.package?.id,
      packageQuantity: pkgQty,
      serviceQuantities: serviceQuantities,
      startTime: new Date(`${data.dateTime.date}T${data.dateTime.startTime}`).toISOString(),
      timeZone: data.timeZone,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      router.push(`/book/success?bookingId=${result.bookingId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card-premium p-8 border-gradient-fine space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-violet">Studio & Duration</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-white/50">Studio</span>
              <span className="text-sm font-bold text-white">{data.studio?.name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-white/50">Package</span>
              <span className="text-sm font-bold text-white">{data.package?.name}</span>
            </div>
            {pkgUnit !== 'FIXED_MINUTES' && (
              <div className="flex justify-between border-b border-white/5 pb-2 text-white">
                <span className="text-sm text-white/50">Quantity</span>
                <span className="text-sm font-bold">{pkgQty} {pkgUnit.toLowerCase()}(s)</span>
              </div>
            )}
            <div className="flex justify-between pt-2">
              <span className="text-sm text-white/50">Date</span>
              <span className="text-sm font-bold text-white">{data.dateTime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/50">Start Time</span>
              <span className="text-sm font-bold text-white">{data.dateTime.startTime}</span>
            </div>
          </div>
        </div>

        <div className="glass-card-premium p-8 border-gradient-fine space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-pink">Investment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
              <span className="text-white/70">
                {data.package?.name} 
                {pkgUnit !== 'FIXED_MINUTES' ? ` (x${pkgQty} ${pkgUnit.toLowerCase()})` : ""}
              </span>
              {canUseCredits ? (
                <div className="flex items-center space-x-1 text-accent-violet">
                  <Check className="w-4 h-4" />
                  <span className="font-bold">Credits Used</span>
                </div>
              ) : (
                <span className="font-bold text-white">{(pkgTotalMinor / 100).toFixed(2)} AED</span>
              )}
            </div>
            {data.services.map(s => (
              <div key={s.id} className="flex justify-between text-white/50 border-b border-white/5 pb-2">
                <span className="text-xs">{s.name} (x{s.quantity})</span>
                <span className="text-xs font-bold text-white">{(Number(s.price) * s.quantity).toFixed(2)} AED</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-6 mt-4 text-xl font-bold text-white border-t border-white/20">
              <span>Total Investment</span>
              <span>{(finalPriceMinor / 100).toFixed(2)} <span className="text-[10px] text-white/50 uppercase tracking-widest ml-1">AED</span></span>
            </div>
          </div>
          {activeSub && canUseCredits && (
             <div className="pt-2 flex items-start space-x-2 text-[10px] text-accent-violet italic bg-accent-violet/10 rounded-lg p-3">
               <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
               <span className="font-bold">This session is covered by your plan. Remaining balance: {Math.floor((creditBalance - requiredMinutes)/60)}h remaining.</span>
             </div>
          )}
          {activeSub && !canUseCredits && !subLoading && (
            <div className="pt-2 flex items-start space-x-2 text-xs text-accent-pink bg-accent-pink/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-bold">
                Not enough credits. 
                Available: {Math.floor(creditBalance / 60)}h. required: {Math.floor(requiredMinutes / 60)}h.
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack} disabled={loading} className="text-white/50 hover:text-white hover:bg-white/5">Back</Button>
        <Button 
          onClick={handleConfirm}
          disabled={loading || subLoading}
          className="px-8 h-14 rounded-2xl text-md font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>
    </div>
  );
}
