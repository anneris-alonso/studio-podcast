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
  onBack: () => void;
}

export function StepReview({ data, onBack }: StepReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [creditBalance, setCreditBalance] = useState(0);

  const router = useRouter();
  const userId = "test-user-uuid"; // Simulated current user

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
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Studio & Duration</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Studio</span>
              <span className="text-sm font-medium">{data.studio?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Package</span>
              <span className="text-sm font-medium">{data.package?.name}</span>
            </div>
            {pkgUnit !== 'FIXED_MINUTES' && (
              <div className="flex justify-between text-premium-gold">
                <span className="text-sm">Quantity</span>
                <span className="text-sm font-bold">{pkgQty} {pkgUnit.toLowerCase()}(s)</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-white/5">
              <span className="text-sm">Date</span>
              <span className="text-sm font-medium">{data.dateTime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Start Time</span>
              <span className="text-sm font-medium">{data.dateTime.startTime}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Investment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>
                {data.package?.name} 
                {pkgUnit !== 'FIXED_MINUTES' ? ` (x${pkgQty} ${pkgUnit.toLowerCase()})` : ""}
              </span>
              {canUseCredits ? (
                <div className="flex items-center space-x-1 text-premium-gold">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Credits Used</span>
                </div>
              ) : (
                <span className="font-medium text-accent-violet">{(pkgTotalMinor / 100).toFixed(2)} AED</span>
              )}
            </div>
            {data.services.map(s => (
              <div key={s.id} className="flex justify-between text-muted">
                <span className="text-xs">{s.name} (x{s.quantity})</span>
                <span className="text-xs">{(Number(s.price) * s.quantity).toFixed(2)} AED</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t border-white/10 text-lg font-bold text-premium-gold shadow-[0_4px_12px_-4px_rgba(232,189,95,0.2)]">
              <span>Total Investment</span>
              <span>{(finalPriceMinor / 100).toFixed(2)} AED</span>
            </div>
          </div>
          {activeSub && canUseCredits && (
             <div className="pt-2 flex items-start space-x-2 text-[10px] text-premium-gold/80 italic">
               <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
               <span>This session is covered by your plan. Remaining balance: {Math.floor((creditBalance - requiredMinutes)/60)}h remaining.</span>
             </div>
          )}
          {activeSub && !canUseCredits && !subLoading && (
            <div className="pt-2 flex items-start space-x-2 text-xs text-amber-500/80">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Not enough credits. 
                Available: {Math.floor(creditBalance / 60)}h. required: {Math.floor(requiredMinutes / 60)}h.
              </span>
            </div>
          )}
        </GlassCard>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={loading}>Back</Button>
        <Button 
          variant="glass" 
          onClick={handleConfirm}
          disabled={loading || subLoading}
          className="px-8 border-premium-gold/30 hover:border-premium-gold/50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
