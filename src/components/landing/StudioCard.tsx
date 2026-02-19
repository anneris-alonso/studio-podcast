"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { PremiumGlassCard } from "./GlassSection";

interface StudioCardProps {
    studio: {
        id: string;
        name: string;
        price: string;
        description?: string;
        imageUrl?: string;
        available?: boolean;
    };
    index: number;
}

export function StudioCard({ studio, index }: StudioCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
        >
            <PremiumGlassCard className="h-full flex flex-col group p-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                    <div className="absolute inset-0 bg-black/50 z-10 transition-opacity group-hover:opacity-40" />
                    {studio.imageUrl ? (
                        <Image 
                            src={studio.imageUrl} 
                            alt={studio.name} 
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    
                    <div className="absolute top-4 right-4 z-20">
                         <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white border border-white/10 rounded-full">
                            {studio.available !== false ? 'Available' : 'Booked'}
                         </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent">
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-accent-pink transition-colors">{studio.name}</h3>
                        <p className="text-white/70 text-sm line-clamp-1">{studio.description}</p>
                    </div>
                </div>

                <div className="p-6 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting from</span>
                        <span className="text-xl font-bold text-white">{studio.price}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-accent-violet group-hover:text-white transition-all">
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                </div>
            </PremiumGlassCard>
        </motion.div>
    );
}
