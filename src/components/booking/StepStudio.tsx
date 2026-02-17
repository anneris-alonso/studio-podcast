"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Users, Clock } from "lucide-react";

interface Studio {
  id: string;
  name: string;
  description: string;
  capacity: number;
  hourlyRate: any; // Decimal type from Prisma
  imageUrl?: string;
  type: string;
}

interface StepStudioProps {
  selected: Studio | null;
  onSelect: (studio: Studio) => void;
  onNext: () => void;
}

export function StepStudio({ selected, onSelect, onNext }: StepStudioProps) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studios")
      .then(res => res.json())
      .then(data => {
        setStudios(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12">Loading studios...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studios.map((studio) => (
          <GlassCard 
            key={studio.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              selected?.id === studio.id 
                ? "border-premium-gold bg-premium-gold/5 scale-[1.02]" 
                : "border-transparent hover:border-premium-gold/30"
            }`}
            onClick={() => onSelect(studio)}
          >
            <div className="space-y-4">
              <div className="h-48 rounded-lg overflow-hidden bg-muted relative">
                {studio.imageUrl ? (
                  <img src={studio.imageUrl} alt={studio.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted bg-fg/10">
                    <span className="text-4xl font-bold">{studio.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-premium-gold border border-premium-gold/30">
                  {studio.type.toUpperCase()}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{studio.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{studio.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {studio.capacity} People
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Hourly
                  </div>
                </div>
                <div className="text-lg font-bold text-premium-gold">
                  {Number(studio.hourlyRate)} <span className="text-[10px] text-muted-foreground">AED/hr</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button 
          variant="glass" 
          disabled={!selected} 
          onClick={onNext}
          className="px-8"
        >
          Continue to Packages
        </Button>
      </div>
    </div>
  );
}
