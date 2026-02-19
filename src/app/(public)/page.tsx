"use client";

import { motion } from "framer-motion";
import { GlassSection } from "@/components/landing/GlassSection";
import { StudioCard } from "@/components/landing/StudioCard";
import { Hero3D } from "@/components/landing/Hero3D";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Mic, ShieldCheck, Video, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { PremiumGlassCard } from "@/components/landing/GlassSection";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const studios = [
    { 
        id: "1", 
        name: "The Zenith Suite", 
        price: "250 AED/hr", 
        description: "Up to 4 People • 4K Video • Pro Audio",
        imageUrl: "/gallery/gallery-1.jpg", 
        available: true 
    },
    { 
        id: "2", 
        name: "Acoustic Lounge", 
        price: "150 AED/hr", 
        description: "Solo/Duo • Intimate Setting • Soundproof",
        imageUrl: "/gallery/gallery-2.jpg", 
        available: true 
    },
    { 
        id: "3", 
        name: "Creator Hub", 
        price: "200 AED/hr", 
        description: "Flexible Space • Green Screen Option",
        imageUrl: "/gallery/gallery-3.jpg", 
        available: true 
    },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (Immersive) */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <Hero3D />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8 lg:text-left text-center">
            {/* Brand / Logo if needed, or kept in Navbar */}
            
            <motion.h1 variants={fadeInUp} className="text-6xl lg:text-8xl font-bold tracking-tight text-white leading-tight">
              Record Without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-violet">Friction.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-white/70 max-w-xl mx-auto lg:mx-0">
              Book. Record. Access your content instantly.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Link href="/book">
                <Button size="lg" className="bg-gradient-to-r from-[#D936F1] to-[#6A47F2] text-white border-none shadow-[0_0_30px_rgba(217,54,241,0.4)] text-lg px-8 h-14 rounded-xl hover:scale-105 transition-transform">
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg border border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                    See Features
              </Button>
              </Link>
            </motion.div>

            {/* Feature Icons Row from Reference */}
            <motion.div variants={fadeInUp} className="flex gap-8 pt-8 justify-center lg:justify-start border-t border-white/10 mt-8">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg border border-white/20 bg-white/5">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white leading-none">Instant</p>
                  <p className="text-sm text-white/50 leading-none mt-1">Booking</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg border border-white/20 bg-white/5">
                  <Check className="w-5 h-5 text-[#D936F1]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white leading-none">Premium</p>
                  <p className="text-sm text-white/50 leading-none mt-1">Studios</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg border border-white/20 bg-white/5">
                  <Video className="w-5 h-5 text-[#6A47F2]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white leading-none">Content</p>
                  <p className="text-sm text-white/50 leading-none mt-1">Delivery</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Spacer (3D Model sits here visually) */}
          <div className="hidden lg:block h-full w-full" />
        </motion.div>
      </section>

      {/* 2. Why Section */}
      <GlassSection className="py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-white">Why Studio Suite?</h2>
          <p className="text-white/60 max-w-xl mx-auto text-lg">Everything you need to grow your podcast without the technical headache.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Mic,
              title: "Pro Acoustics",
              desc: "Studio-grade sound isolation and top-tier microphones.",
            },
            {
              icon: Video,
              title: "4K Multicam",
              desc: "Crystal clear video for YouTube and social media clips.",
            },
            {
              icon: Zap,
              title: "Instant Booking",
              desc: "Check real-time availability and confirm in seconds.",
            },
          ].map((feature, i) => (
            <PremiumGlassCard key={i} className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-r-lg bg-accent-violet/20 flex items-center justify-center text-accent-violet border border-white/5">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </PremiumGlassCard>
            ))}
          </div>
        </GlassSection>

      {/* 3. Studios Grid */}
      <GlassSection className="py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">Our Studios</h2>
              <p className="text-white/60 text-lg">Curated spaces designed for creators.</p>
            </div>
            <Link href="/gallery" className="text-accent-violet font-medium hover:text-accent-pink transition-colors flex items-center gap-2">
              See all spaces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studios.map((studio, i) => (
                <StudioCard key={studio.id} studio={studio} index={i} />
            ))}
          </div>
      </GlassSection>

      {/* 4. Portal Preview Section */}
      <GlassSection className="py-24">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">The Creator Hub</h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Your central command center for all things podcasting.</p>
          </div>
          <PremiumGlassCard className="overflow-hidden p-2 lg:p-4 bg-white/[0.02]">
            <div className="rounded-lg bg-[#0A0A0A] aspect-[16/9] border border-white/10 shadow-2xl overflow-hidden relative group">
                {/* Mock UI elements */}
                <div className="absolute inset-0 bg-radial-glow opacity-10" />
                <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="h-6 w-64 rounded-md bg-white/5" />
                </div>
                <div className="p-8 lg:p-12 grid grid-cols-12 gap-6">
                  {/* Sidebar Mock */}
                  <div className="col-span-3 space-y-3 hidden lg:block">
                     {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-full rounded-md bg-white/5" />)}
                  </div>
                  {/* Dashboard Content Mock */}
                  <div className="col-span-12 lg:col-span-9 space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                          {[1,2,3].map(i => <div key={i} className="h-24 rounded-lg bg-white/5 border border-white/5" />)}
                      </div>
                      <div className="h-64 w-full rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                         <span className="text-white/20 text-sm uppercase tracking-widest font-mono">Analytics Graph Preview</span>
                      </div>
                  </div>
                </div>
                
                {/* Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm">
                   <Button variant="secondary" className="bg-white text-black hover:bg-white/90 shadow-glow">Preview Dashboard</Button>
                </div>
            </div>
          </PremiumGlassCard>
      </GlassSection>

      {/* 5. Pricing Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-violet/5 to-transparent pointer-events-none opacity-20" />
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">Clear, Simple Pricing</h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Choose a plan that fits your recording frequency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Casual", price: "250", features: ["1 Studio Hour", "Basic Lighting", "Raw Export"], accent: "" },
              { name: "Content King", price: "799", features: ["4 Studio Hours", "4K Video Package", "Guest Concierge", "Member Rates"], accent: "border-accent-violet/50 shadow-glow bg-accent-violet/5" },
              { name: "Pro Network", price: "1999", features: ["10 Studio Hours", "Full Production Team", "Podcast Distribution", "Priority Booking"], accent: "" },
            ].map((plan, i) => (
              <PremiumGlassCard key={i} className={`p-10 space-y-8 flex flex-col ${plan.accent}`}>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white/70">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/40">AED</span>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex gap-3 items-center text-sm text-white/80">
                      <Check className="w-4 h-4 text-accent-violet" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-white text-black hover:bg-white/90 h-12">Get Started</Button>
              </PremiumGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="px-6 py-32 relative">
        <PremiumGlassCard className="max-w-5xl mx-auto p-16 text-center space-y-8 border-accent-violet/30 overflow-hidden relative bg-black/40">
          <div className="absolute inset-0 bg-brand-gradient opacity-10 blur-[100px]" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                Your production, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-violet to-accent-blue">simplified.</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">Join 100+ shows producing world-class content in the heart of Dubai.</p>
            <div className="flex justify-center gap-4 pt-4">
                <Link href="/book">
                <Button size="lg" className="bg-brand-gradient text-white border-none shadow-glow h-16 px-12 text-lg rounded-full hover:scale-105 transition-transform duration-300">
                    Book Your Session
                </Button>
                </Link>
            </div>
          </div>
        </PremiumGlassCard>
      </section>
    </div>
  );
}
