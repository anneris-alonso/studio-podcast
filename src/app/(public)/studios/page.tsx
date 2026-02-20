"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { StudioCard } from "@/components/landing/StudioCard";
import { ArrowRight, Mic, Video, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const studios = [
    { 
        id: "1", 
        name: "Zenith Suite Main", 
        price: "250 AED/hr", 
        description: "Our flagship 4-microphone setup with 4K multi-cam recording.",
        imageUrl: "/gallery/gallery-1.jpg", 
        slug: "zenith-suite-main"
    },
    { 
        id: "2", 
        name: "Acoustic Lounge", 
        price: "150 AED/hr", 
        description: "Intimate 2-person setup optimized for acoustic quality and interviews.",
        imageUrl: "/gallery/gallery-2.jpg", 
        slug: "acoustic-lounge"
    },
    { 
        id: "3", 
        name: "Podcast Setup A", 
        price: "200 AED/hr", 
        description: "Versatile creator space with green screen and professional lighting.",
        imageUrl: "/gallery/gallery-3.jpg", 
        slug: "podcast-setup-a"
    },
];

export default function StudiosPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <Navbar />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-6xl font-bold tracking-tight mb-4">
                            Our <span className="premium-gradient-text tracking-tighter"><span>Studios.</span></span>
                        </h1>
                        <p className="text-xl text-white/50 max-w-xl">
                            Elite spaces meticulously designed for sound purity and visual impact. Choose your stage.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {studios.map((studio, idx) => (
                        <motion.div
                            key={studio.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={`/studios/${studio.slug}`}>
                                <div className="glass-card-premium group cursor-pointer h-full">
                                    <div className="relative h-64 overflow-hidden rounded-t-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                        <img 
                                            src={studio.imageUrl} 
                                            alt={studio.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="bg-brand-gradient px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {studio.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-accent-pink transition-colors">{studio.name}</h3>
                                        <p className="text-white/50 text-sm mb-6 line-clamp-2">{studio.description}</p>
                                        
                                        <div className="flex gap-4 mb-8">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Mic className="w-4 h-4 text-accent-violet" />
                                            </div>
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Video className="w-4 h-4 text-accent-pink" />
                                            </div>
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                <Zap className="w-4 h-4 text-accent-blue" />
                                            </div>
                                        </div>

                                        <Button className="w-full bg-white/5 border border-white/10 hover:bg-brand-gradient hover:border-none group-hover:shadow-glow transition-all rounded-xl">
                                            View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
