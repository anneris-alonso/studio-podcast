"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, LayoutGrid, Info } from "lucide-react";
import Link from "next/link";

const photos = [
  { id: 1, title: "Zenith Suite Main", category: "Recording", color: "bg-accent-violet/20" },
  { id: 2, title: "Acoustic Lounge", category: "Lounge", color: "bg-accent-blue/20" },
  { id: 3, title: "Podcast Setup A", category: "Gear", color: "bg-accent-pink/20" },
  { id: 4, title: "Editing Bay", category: "Post-Production", color: "bg-accent-violet/10" },
  { id: 5, title: "Green Room", category: "Talent", color: "bg-accent-blue/10" },
  { id: 6, title: "Control Room", category: "Recording", color: "bg-accent-pink/10" },
];

export default function GalleryPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/" className="text-accent-violet flex items-center gap-2 text-sm font-medium hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-fg">Studio <span className="premium-gradient-text">Gallery</span></h1>
          <p className="text-muted text-lg">A visual tour of the most premium recording spaces in Dubai.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="border border-white/10">
            <LayoutGrid className="w-4 h-4 mr-2" /> All Photos
          </Button>
          <Button variant="ghost" className="border border-white/10 opacity-50">
            <Camera className="w-4 h-4 mr-2" /> Virtual Tour
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-0 overflow-hidden group border-white/5 hover:border-accent-violet/30 transition-all duration-500">
              <div className={`aspect-[4/3] ${photo.color} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                   <Camera className="w-12 h-12 text-fg" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div>
                     <span className="text-[10px] uppercase tracking-widest text-accent-violet font-bold mb-1 block">{photo.category}</span>
                     <h3 className="text-lg font-bold text-fg">{photo.title}</h3>
                   </div>
                   <Button size="icon" variant="ghost" className="rounded-full bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                     <Info className="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
