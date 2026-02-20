"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
            <div className="glass-card-premium group cursor-pointer h-full flex flex-col">
                <div className="relative h-64 overflow-hidden rounded-t-3xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    {studio.imageUrl ? (
                        <Image 
                            src={studio.imageUrl} 
                            alt={studio.name} 
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    
                    <div className="absolute top-4 right-4 z-20">
                         <span className="bg-brand-gradient px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                            {studio.price}
                         </span>
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-accent-pink transition-colors">{studio.name}</h3>
                    <p className="text-white/50 text-sm mb-6 line-clamp-2">{studio.description}</p>
                    
                    <div className="flex gap-4 mb-8 mt-auto">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <ArrowRight className="w-4 h-4 text-accent-violet -rotate-45" />
                        </div>
                    </div>

                    <Link href="/book" className="w-full">
                        <Button className="w-full bg-white/5 border border-white/10 hover:bg-brand-gradient hover:border-none group-hover:shadow-glow transition-all rounded-xl h-12">
                            View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
