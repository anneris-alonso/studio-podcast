"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: any;
  unit: 'PER_BOOKING' | 'PER_HOUR' | 'PER_DAY' | 'FIXED';
  minQuantity: number;
  maxQuantity: number;
  stepQuantity: number;
  priceMinor: number;
}

interface StepServicesProps {
  selected: { id: string; name: string; price: any; quantity: number }[];
  packageQuantity: number;
  packageUnit: string;
  onUpdate: (newList: { id: string; name: string; price: any; quantity: number }[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepServices({ selected, packageQuantity, packageUnit, onUpdate, onNext, onBack }: StepServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      });
  }, []);

  const getSelected = (id: string) => selected.find(s => s.id === id);

  const toggleService = (service: Service) => {
    const existing = getSelected(service.id);
    if (existing) {
      onUpdate(selected.filter(s => s.id !== service.id));
    } else {
      onUpdate([...selected, { 
        id: service.id, 
        name: service.name, 
        price: service.price, 
        quantity: service.minQuantity 
      }]);
    }
  };

  const updateQuantity = (id: string, newQty: number, svc: Service) => {
    const clampedQty = Math.max(svc.minQuantity, Math.min(svc.maxQuantity, newQty));
    onUpdate(selected.map(s => s.id === id ? { ...s, quantity: clampedQty } : s));
  };

  const calculateUnitDisplay = (unit: string) => {
    switch(unit) {
      case 'PER_HOUR': return '/ hr';
      case 'PER_DAY': return '/ day';
      default: return '';
    }
  };

  if (loading) return <div className="text-center py-12">Loading services...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const sel = getSelected(service.id);
          return (
            <div 
              key={service.id}
              className={`glass-card-premium p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] flex flex-col group relative ${
                sel 
                  ? "ring-1 ring-accent-pink/50 shadow-[0_0_30px_rgba(255,42,133,0.15)]" 
                  : "hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
              }`}
              onClick={() => toggleService(service)}
            >
               {/* Active/Hover Glows */}
               <div className={`absolute inset-0 bg-brand-gradient mix-blend-overlay transition-opacity duration-500 pointer-events-none rounded-3xl ${sel ? "opacity-10" : "opacity-0 group-hover:opacity-5"}`} />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-accent-pink transition-colors">{service.name}</h3>
                  <p className="text-sm text-white/50">{service.description}</p>
                  <div className="text-lg font-bold text-white pt-1">
                    +{Number(service.priceMinor / 100)} <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">AED {calculateUnitDisplay(service.unit)}</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-lg ${
                  sel 
                    ? "bg-brand-gradient border-transparent text-white shadow-[0_0_15px_rgba(255,42,133,0.5)]" 
                    : "border-white/20 text-white/50"
                }`}>
                  {sel ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>

              {sel && (
                <div className="mt-6 pt-4 border-t border-white/10 space-y-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center gap-4 bg-black/50 p-2 rounded-xl border border-white/10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                        onClick={() => updateQuantity(service.id, sel.quantity - service.stepQuantity, service)}
                        disabled={sel.quantity <= service.minQuantity}
                      >
                        -
                      </Button>
                      <span className="text-md font-bold w-6 text-center text-white">{sel.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                        onClick={() => updateQuantity(service.id, sel.quantity + service.stepQuantity, service)}
                        disabled={sel.quantity >= service.maxQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack} className="text-white/50 hover:text-white hover:bg-white/5">Back</Button>
        <Button 
          onClick={onNext}
          className="px-8 h-14 rounded-2xl text-md font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          Review Booking
        </Button>
      </div>
    </div>
  );
}
