"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Package {
  id: string;
  name: string;
  price: any;
  credits: number;
  validityDays: number;
  studioRoomId: string | null;
  unit: 'HOUR' | 'DAY' | 'FIXED_MINUTES';
  minQuantity: number;
  maxQuantity: number;
  stepQuantity: number;
  pricePerUnitMinor: number;
  durationMinutes: number;
}

interface StepPackageProps {
  studioId: string | undefined;
  selected: Package | null;
  packageQuantity: number;
  onSelect: (pkg: Package, quantity: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPackage({ studioId, selected, packageQuantity, onSelect, onNext, onBack }: StepPackageProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studioId) return;
    fetch(`/api/packages?studioRoomId=${studioId}`)
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      });
  }, [studioId]);

  const handleQuantityChange = (newQty: number) => {
    if (selected) {
      const clampedQty = Math.max(selected.minQuantity, Math.min(selected.maxQuantity, newQty));
      onSelect(selected, clampedQty);
    }
  };

  if (loading) return <div className="text-center py-12">Loading packages...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`glass-card-premium p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] flex flex-col h-full relative group ${
              selected?.id === pkg.id 
                ? "ring-1 ring-accent-pink/50 shadow-[0_0_30px_rgba(255,42,133,0.15)]" 
                : "hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
            }`}
            onClick={() => onSelect(pkg, pkg.minQuantity)}
          >
             {/* Active/Hover Glows */}
             <div className={`absolute inset-0 bg-brand-gradient mix-blend-overlay transition-opacity duration-500 pointer-events-none rounded-3xl ${selected?.id === pkg.id ? "opacity-10" : "opacity-0 group-hover:opacity-5"}`} />

            <div className="flex-1 space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white group-hover:text-accent-pink transition-colors">{pkg.name}</h3>
                {pkg.studioRoomId === null && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/5 text-accent-violet px-3 py-1 rounded-full border border-white/10">
                    GLOBAL
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white">
                  {pkg.unit === 'FIXED_MINUTES' ? Number(pkg.price) : Number(pkg.pricePerUnitMinor / 100)} 
                  <span className="text-sm uppercase tracking-widest text-white/40 font-bold ml-2">
                    AED {pkg.unit !== 'FIXED_MINUTES' ? `/ ${pkg.unit.toLowerCase()}` : ""}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                  {pkg.credits} Credits included
                </div>
              </div>

              {selected?.id === pkg.id && pkg.unit !== 'FIXED_MINUTES' && (
                <div className="pt-4 space-y-3 border-t border-white/10 mt-4" onClick={(e) => e.stopPropagation()}>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Select Duration ({pkg.unit.toLowerCase()}s)
                  </label>
                  <div className="flex items-center gap-4 bg-black/50 p-2 rounded-xl border border-white/10 w-fit">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                      onClick={() => handleQuantityChange(packageQuantity - pkg.stepQuantity)}
                      disabled={packageQuantity <= pkg.minQuantity}
                    >
                      -
                    </Button>
                    <span className="text-lg font-bold w-6 text-center text-white">{packageQuantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                      onClick={() => handleQuantityChange(packageQuantity + pkg.stepQuantity)}
                      disabled={packageQuantity >= pkg.maxQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              <ul className="space-y-2 pt-4 mt-auto border-t border-white/10">
                <li className="flex items-center gap-2 text-xs font-medium text-white/50">
                  <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center border border-white/10">
                     <Check className="w-3 h-3 text-accent-violet" />
                  </div>
                  Validity: {pkg.validityDays} Days
                </li>
              </ul>
            </div>
            {selected?.id === pkg.id && (
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-brand-gradient text-white rounded-full p-1.5 shadow-[0_0_15px_rgba(255,42,133,0.5)]">
                  <Check className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack} className="text-white/50 hover:text-white hover:bg-white/5">Back</Button>
        <Button 
          disabled={!selected} 
          onClick={onNext}
          className="px-8 h-14 rounded-2xl text-md font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          Select Date & Time
        </Button>
      </div>
    </div>
  );
}
