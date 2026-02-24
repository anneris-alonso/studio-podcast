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
  coverImageUrl?: string;
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
          <div 
            key={studio.id}
            className={`glass-card-premium p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] group relative ${
              selected?.id === studio.id 
                ? "ring-1 ring-accent-pink/50 shadow-[0_0_30px_rgba(255,42,133,0.15)]" 
                : "hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
            }`}
            onClick={() => onSelect(studio)}
          >
             {/* Active/Hover Glows */}
             <div className={`absolute inset-0 bg-brand-gradient mix-blend-overlay transition-opacity duration-500 pointer-events-none rounded-3xl ${selected?.id === studio.id ? "opacity-10" : "opacity-0 group-hover:opacity-5"}`} />

            <div className="space-y-4 relative z-10">
              <div className="h-48 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                {studio.coverImageUrl ? (
                  <img src={studio.coverImageUrl} alt={studio.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 bg-black/50">
                    <span className="text-4xl font-bold">{studio.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-accent-violet border border-white/10">
                  {studio.type}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent-pink transition-colors">{studio.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2">{studio.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <Users className="w-3.5 h-3.5" />
                    {studio.capacity} People
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    Hourly
                  </div>
                </div>
                <div className="text-xl font-bold text-white">
                  {Number(studio.hourlyRate)} <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">AED/hr</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-8">
        <Button 
          disabled={!selected} 
          onClick={onNext}
          className="px-8 h-14 rounded-2xl text-md font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
        >
          Continue to Packages
        </Button>
      </div>
    </div>
  );
}
