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
            <GlassCard 
              key={service.id}
              className={`cursor-pointer transition-all duration-300 border-2 flex flex-col ${
                sel 
                  ? "border-premium-purple bg-premium-purple/5" 
                  : "border-transparent hover:border-premium-purple/30"
              }`}
              onClick={() => toggleService(service)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold">{service.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                  <div className="text-sm font-bold text-premium-purple">
                    +{Number(service.priceMinor / 100)} <span className="text-[10px] font-normal uppercase">AED {calculateUnitDisplay(service.unit)}</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  sel 
                    ? "bg-premium-purple border-premium-purple text-white" 
                    : "border-white/20 text-muted-foreground"
                }`}>
                  {sel ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>

              {sel && (
                <div className="mt-4 pt-4 border-t border-premium-purple/20 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">Quantity</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full p-0 h-min w-min"
                        onClick={() => updateQuantity(service.id, sel.quantity - service.stepQuantity, service)}
                        disabled={sel.quantity <= service.minQuantity}
                      >
                        -
                      </Button>
                      <span className="text-xs font-bold w-4 text-center">{sel.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full p-0 h-min w-min"
                        onClick={() => updateQuantity(service.id, sel.quantity + service.stepQuantity, service)}
                        disabled={sel.quantity >= service.maxQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button 
          variant="glass" 
          onClick={onNext}
          className="px-8 border-premium-purple/30 hover:border-premium-purple/60"
        >
          Review Booking
        </Button>
      </div>
    </div>
  );
}
