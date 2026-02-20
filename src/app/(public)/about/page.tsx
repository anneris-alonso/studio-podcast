"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden">
            <Navbar />
            
            {/* Optimized High-Performance Background (CSS Ambient Glows) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Fixed Glow 1 - Pink Top Left */}
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-accent-pink/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                
                {/* Fixed Glow 2 - Violet Middle Right */}
                <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-violet/10 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
                
                {/* Fixed Glow 3 - Blue Bottom Left */}
                <div className="absolute -bottom-[10%] -left-[5%] w-[45%] h-[45%] rounded-full bg-accent-blue/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
                
                {/* Grain Overlay for Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
                        Our <span className="premium-gradient-text">Story</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Elevating the art of sound through precision engineering and immersive design.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-card-premium p-12 group"
                    >
                        <h2 className="text-4xl font-bold mb-8 leading-tight">The Dubai <br/><span className="premium-gradient-text tracking-tighter">Standard</span></h2>
                        <p className="text-white/60 leading-relaxed mb-10 text-lg">
                            Born from a desire to redefine podcasting, Studio Suite brings the luxury of Dubai's high-tech scene to every creator. We believe that professional quality shouldn't come with friction.
                        </p>
                        <div className="flex gap-6">
                            <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-pink transition-colors">
                                <span className="text-3xl font-bold text-accent-pink">100%</span>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-2">Acoustic Purity</p>
                            </div>
                            <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-violet transition-colors">
                                <span className="text-3xl font-bold text-accent-violet">4K</span>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-2">Precision Gear</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative h-[600px] rounded-[40px] overflow-hidden glass-card-premium p-0 border-none shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-transparent z-10 pointer-events-none" />
                        <img 
                            src="/images/premium-mic-pro.jpg" 
                            alt="Premium Content Station"
                            className="w-full h-full object-cover transform scale-110 hover:scale-100 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-8 left-8 right-8 p-8 glass-card rounded-3xl z-20 backdrop-blur-3xl border-white/10">
                            <h3 className="text-2xl font-bold mb-1">Elite Infrastructure</h3>
                            <p className="text-white/40 text-[10px] tracking-[0.25em] font-bold uppercase">Business Bay • Dubai Edition</p>
                        </div>
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Excellence", desc: "No compromises on hardware or software in every session.", color: "accent-pink" },
                        { title: "Immersive", desc: "Environments designed to inspire your best creative content.", color: "accent-violet" },
                        { title: "Instant", desc: "Cloud delivery and instant access at the speed of thought.", color: "accent-blue" }
                    ].map((val, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card-premium p-10 group relative"
                        >
                            <div className={`absolute top-0 right-10 w-20 h-20 bg-${val.color}/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <h4 className={`text-2xl font-bold mb-4 text-${val.color}`}>{val.title}</h4>
                            <p className="text-white/50 leading-relaxed">{val.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
