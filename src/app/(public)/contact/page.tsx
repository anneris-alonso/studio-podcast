"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Float, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { useRef, Suspense, useState, useEffect } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

function StarField() {
    return (
        <group>
            {/* Estrellas en órbita interna ultra-lenta - SIN rotación de grupo */}
            <Sparkles count={1200} scale={25} size={0.3} speed={0.02} opacity={0.4} color="#6A47F2" />
            <Sparkles count={400} scale={20} size={0.7} speed={0.02} opacity={0.5} color="#D936F1" />
            <Sparkles count={150} scale={22} size={0.5} speed={0.02} opacity={0.3} color="#3B82F6" />
            
            {/* Estrellas más grandes con "órbita" estática e imperceptible */}
            <Sparkles count={40} scale={15} size={2.5} speed={0.01} opacity={0.1} color="#6A47F2" />
            <Sparkles count={20} scale={18} size={3.5} speed={0.01} opacity={0.05} color="#D936F1" />
        </group>
    );
}

function ContactScene() {
    return (
        <>
            <color attach="background" args={["#000000"]} />
            <Suspense fallback={null}>
                <StarField />
            </Suspense>
        </>
    );
}

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <Navbar />
            
            {/* 3D Nebula Background - Totalmente libre de mouse interaction */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                    <ContactScene />
                </Canvas>
            </div>

            <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                {/* Left: Info */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl font-bold font-heading mb-8 tracking-tight">
                        Let's Talk <span className="premium-gradient-text tracking-tighter"><span>Elite.</span></span>
                    </h1>
                    <p className="text-xl text-white/50 mb-12 max-w-lg">
                        Questions about our studios or bespoke production packages? Our concierge is ready to elevate your creative journey.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                <Mail className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Email</p>
                                <p className="text-lg font-medium">concierge@studiosuite.io</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                <Phone className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Phone</p>
                                <p className="text-lg font-medium">+1 (555) 000-DUBAI</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                                <MapPin className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Location</p>
                                <p className="text-lg font-medium">Business Bay, Dubai, UAE</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Premium Form */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="glass-card-premium p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    <form className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">First Name</label>
                                <input type="text" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-accent-violet/50 focus:bg-white/10 transition-all text-sm" placeholder="John" />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">Last Name</label>
                                <input type="text" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-accent-violet/50 focus:bg-white/10 transition-all text-sm" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">Email Address</label>
                            <input type="email" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-accent-violet/50 focus:bg-white/10 transition-all text-sm" placeholder="john@example.com" />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-1">Message</label>
                            <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-accent-violet/50 focus:bg-white/10 transition-all text-sm resize-none" placeholder="How can we help?" />
                        </div>

                        <Button className="w-full h-16 bg-brand-gradient text-white border-none shadow-glow rounded-2xl text-lg font-bold group">
                            Send Message
                            <Send className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </motion.div>
            </div>
        </main>
    );
}
