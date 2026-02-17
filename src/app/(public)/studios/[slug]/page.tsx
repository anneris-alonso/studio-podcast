"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Video, Users, CheckCircle2, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StudioDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Mock data for UI alignment
  const studio = {
    name: slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Zenith Suite",
    description: "The pinnacle of recording technology in Dubai. Designed for high-end podcasting and video production with absolute sound isolation.",
    price: "250 AED/hr",
    capacity: "Up to 4 People",
    features: [
      "Absolute Sound Isolation (STC 65)",
      "4x Shure SM7B Microphones",
      "Sony FX3 Cinema Cameras (4K)",
      "Professional Lighting Grid",
      "Live Streaming Capabilities",
      "Dedicated Operator Desk"
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <div className="space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link href="/" className="text-accent-violet flex items-center gap-2 text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Studios
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-5xl lg:text-7xl font-bold text-fg tracking-tight">{studio.name}</h1>
            <div className="flex items-center gap-3">
               <div className="flex items-center text-accent-pink">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
               </div>
               <span className="text-muted text-sm">(48 Reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero Image / Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 rounded-r-xl bg-accent-violet/10 border border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-radial-glow opacity-30" />
             <div className="absolute inset-0 flex items-center justify-center text-fg/20 uppercase tracking-[1em]">Main Studio View</div>
          </div>
          <div className="hidden lg:flex flex-col gap-6">
             <div className="flex-grow rounded-r-xl bg-accent-pink/5 border border-white/5 flex items-center justify-center text-fg/10">Angle 2</div>
             <div className="flex-grow rounded-r-xl bg-accent-blue/5 border border-white/5 flex items-center justify-center text-fg/10">Angle 3</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-fg">Overview</h2>
              <p className="text-muted text-lg leading-relaxed">{studio.description}</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-fg">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {studio.features.map((f, i) => (
                   <div key={i} className="flex items-center gap-3 text-fg/80 bg-fg/5 p-4 rounded-r-lg border border-white/5">
                     <CheckCircle2 className="w-5 h-5 text-accent-violet flex-shrink-0" />
                     {f}
                   </div>
                 ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <GlassCard className="p-8 space-y-8 sticky top-32 border-accent-violet/30 shadow-glow">
              <div className="space-y-2">
                <p className="text-muted text-sm uppercase tracking-widest">Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-fg">{studio.price}</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-muted flex items-center gap-2"><Users className="w-4 h-4" /> Capacity</span>
                   <span className="text-fg font-medium">{studio.capacity}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-muted flex items-center gap-2"><Mic className="w-4 h-4" /> Microphones</span>
                   <span className="text-fg font-medium">4x Pro Mic</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-muted flex items-center gap-2"><Video className="w-4 h-4" /> Cameras</span>
                   <span className="text-fg font-medium">Included (4K)</span>
                </div>
              </div>

              <Link href="/book" className="block">
                <Button size="lg" className="w-full bg-brand-gradient text-white border-none h-14 text-lg">
                  <Calendar className="w-5 h-5 mr-3" /> Book Now
                </Button>
              </Link>
              
              <p className="text-center text-[10px] text-muted uppercase tracking-wider">Secure Transaction • Professional Support</p>
            </GlassCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
