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
          <GlassCard 
            key={pkg.id}
            className={`cursor-pointer transition-all duration-300 border-2 flex flex-col h-full ${
              selected?.id === pkg.id 
                ? "border-premium-gold bg-premium-gold/5 scale-[1.02]" 
                : "border-transparent hover:border-premium-gold/30"
            }`}
            onClick={() => onSelect(pkg, pkg.minQuantity)}
          >
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                {pkg.studioRoomId === null && (
                  <span className="text-[10px] bg-premium-purple/20 text-premium-purple px-2 py-0.5 rounded-full border border-premium-purple/30">
                    GLOBAL
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-premium-gold">
                  {pkg.unit === 'FIXED_MINUTES' ? Number(pkg.price) : Number(pkg.pricePerUnitMinor / 100)} 
                  <span className="text-sm text-muted-foreground font-normal ml-1">
                    AED {pkg.unit !== 'FIXED_MINUTES' ? `/ ${pkg.unit.toLowerCase()}` : ""}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {pkg.credits} Credits included
                </div>
              </div>

              {selected?.id === pkg.id && pkg.unit !== 'FIXED_MINUTES' && (
                <div className="pt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Select Duration ({pkg.unit.toLowerCase()}s)
                  </label>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-premium-gold/30"
                      onClick={() => handleQuantityChange(packageQuantity - pkg.stepQuantity)}
                      disabled={packageQuantity <= pkg.minQuantity}
                    >
                      -
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">{packageQuantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-premium-gold/30"
                      onClick={() => handleQuantityChange(packageQuantity + pkg.stepQuantity)}
                      disabled={packageQuantity >= pkg.maxQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-premium-gold" />
                  Validity: {pkg.validityDays} Days
                </li>
              </ul>
            </div>
            {selected?.id === pkg.id && (
              <div className="pt-4 flex justify-center">
                <div className="bg-premium-gold text-black rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button 
          variant="glass" 
          disabled={!selected} 
          onClick={onNext}
          className="px-8"
        >
          Select Date & Time
        </Button>
      </div>
    </div>
  );
}
