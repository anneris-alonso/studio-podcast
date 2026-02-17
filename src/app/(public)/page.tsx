"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Mic, Video, Users, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

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

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-32">
      {/* 1. Hero Section */}
      <section className="relative px-6 pt-32 lg:pt-48 overflow-hidden">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-7xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <span className="px-4 py-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 text-accent-violet text-sm font-medium">
              Revolutionizing Podcast Production
            </span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-6xl lg:text-8xl font-bold tracking-tight text-fg">
            Produce Your Best <br />
            <span className="premium-gradient-text">Show Ever.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl text-muted max-w-2xl mx-auto">
            Book premium podcast studios in Dubai. Pro gear, soundproof rooms, and 4K video recording. All managed from one intelligent dashboard.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 pt-6">
            <Link href="/book">
              <Button size="lg" className="bg-brand-gradient text-white border-none shadow-glow text-lg px-10 h-14">
                Book a Studio <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="ghost" className="text-fg border border-fg/10 hover:bg-fg/5 text-lg px-10 h-14">
                View Gallery
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Why Section */}
      <section className="px-6 py-24 bg-fg/[0.02]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-fg">Why Studio Suite?</h2>
            <p className="text-muted max-w-xl mx-auto text-lg lowercase">Everything you need to grow your podcast without the technical headache.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Mic, title: "Pro Acoustics", desc: "Studio-grade sound isolation and top-tier microphones." },
              { icon: Video, title: "4K Multicam", desc: "Crystal clear video for YouTube and social media clips." },
              { icon: Zap, title: "Instant Booking", desc: "Check real-time availability and confirm in seconds." },
            ].map((feature, i) => (
              <GlassCard key={i} className="p-8 space-y-4 hover:border-accent-violet/50 transition-colors">
                <div className="w-12 h-12 rounded-r-lg bg-accent-violet/20 flex items-center justify-center text-accent-violet">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-fg">{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Studios Grid */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-fg">Our Studios</h2>
              <p className="text-muted text-lg">Curated spaces designed for creators.</p>
            </div>
            <Link href="/gallery" className="text-accent-violet font-medium hover:underline flex items-center gap-2">
              See all spaces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { name: "The Zenith Suite", size: "Up to 4 People", price: "250 AED/hr", color: "from-accent-pink" },
              { name: "Acoustic Lounge", size: "Solo/Duo", price: "150 AED/hr", color: "from-accent-blue" },
            ].map((studio, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className={`aspect-video rounded-r-xl bg-gradient-to-br ${studio.color} to-bg relative overflow-hidden mb-6`}>
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                   <div className="absolute bottom-6 left-6">
                     <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-md border border-white/10 uppercase tracking-widest">{studio.size}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-fg">{studio.name}</h3>
                  <span className="text-xl font-bold text-accent-violet">{studio.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Eliminates/Replaces Section */}
      <section className="px-6 py-24 bg-accent-violet/5 rounded-r-xl max-w-[90%] mx-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-fg leading-tight">Eliminate the Friction. <br /> Replace the Chaos.</h2>
            <div className="space-y-4">
                {[
                  "No more back-and-forth emails for scheduling",
                  "Replace expensive equipment rentals with all-inclusive suites",
                  "Eliminate inconsistent audio quality across episodes",
                  "Stop wasting hours on technical setup and sound checks"
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-accent-pink/20 flex items-center justify-center text-accent-pink flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <p className="text-muted">{item}</p>
                  </div>
                ))}
            </div>
          </div>
          <div className="relative">
            <GlassCard className="aspect-square flex items-center justify-center border-accent-pink/30 p-12">
               <div className="text-center space-y-4">
                 <div className="w-20 h-20 rounded-r-xl bg-accent-pink/10 flex items-center justify-center text-accent-pink mx-auto">
                   <ShieldCheck className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-bold text-fg">Focus on the Mic. <br /> We handle the rest.</h4>
               </div>
            </GlassCard>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-pink/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* 5. Portal Preview Section */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-fg">The Creator Hub</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">Your central command center for all things podcasting.</p>
          </div>
          <GlassCard className="overflow-hidden border-accent-blue/20 p-2 lg:p-4 mt-8 bg-fg/5">
            <div className="rounded-r-lg bg-bg aspect-[16/9] border border-white/5 shadow-2xl overflow-hidden relative group">
                {/* Mock UI elements */}
                <div className="absolute inset-0 bg-radial-glow opacity-20" />
                <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/5 flex items-center px-6 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-pink/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-violet/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-blue/40" />
                  </div>
                  <div className="h-6 w-64 rounded-full bg-fg/5" />
                </div>
                <div className="p-12 space-y-8">
                  <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-r-lg bg-fg/5 border border-white/5" />)}
                  </div>
                  <div className="h-64 rounded-r-lg bg-fg/[0.02] border border-white/5 flex items-center justify-center">
                    <span className="text-muted text-sm uppercase tracking-widest opacity-30">Interactive Dashboard Preview</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                   <Button variant="secondary" className="bg-white text-black hover:bg-white/90">Preview Sandbox</Button>
                </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section className="px-6 py-24 bg-fg/[0.01]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-fg">Clear, Simple Pricing</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">Choose a plan that fits your recording frequency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Casual", price: "250", features: ["1 Studio Hour", "Basic Lighting", "Raw Export"], accent: "" },
              { name: "Content King", price: "799", features: ["4 Studio Hours", "4K Video Package", "Guest Concierge", "Member Rates"], accent: "border-accent-violet shadow-glow" },
              { name: "Pro Network", price: "1999", features: ["10 Studio Hours", "Full Production Team", "Podcast Distribution", "Priority Booking"], accent: "" },
            ].map((plan, i) => (
              <GlassCard key={i} className={`p-10 space-y-8 flex flex-col ${plan.accent}`}>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-muted">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-fg">{plan.price}</span>
                    <span className="text-muted">AED</span>
                  </div>
                </div>
                <div className="space-y-4 flex-grow">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex gap-3 items-center text-sm text-fg/80">
                      <Check className="w-4 h-4 text-accent-violet" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-fg text-bg hover:bg-fg/90 h-12">Get Started</Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-fg">Loved by Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Sarah K.", role: "Business Talk Dubai", text: "The cleanest audio I've ever recorded. The Zenith Suite is my second home." },
              { name: "James M.", role: "Tech Pulse", text: "The multicam setup saved us hours in editing. Best ROI for our production." },
              { name: "Laila A.", role: "The Creative Edge", text: "Finally, a studio in Dubai that understands what podcasters actually need." },
              { name: "Omar H.", role: "Global Minds", text: "Super smooth booking process. The dashboard makes managing episodes so easy." },
            ].map((t, i) => (
              <GlassCard key={i} className="p-6 space-y-4 bg-fg/[0.02] border-white/5">
                <p className="text-fg/80 italic text-sm">"{t.text}"</p>
                <div>
                  <p className="font-bold text-fg text-sm">{t.name}</p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className="px-6 py-24">
        <GlassCard className="max-w-5xl mx-auto p-16 text-center space-y-8 border-accent-violet/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-gradient opacity-10 blur-3xl" />
          <h2 className="text-5xl font-bold text-fg relative z-10">Start Your Podcast Journey <br /> With the Best.</h2>
          <p className="text-xl text-muted max-w-2xl mx-auto relative z-10">Join 100+ shows producing world-class content in the heart of Dubai.</p>
          <div className="flex justify-center gap-4 relative z-10">
            <Link href="/book">
              <Button size="lg" className="bg-brand-gradient text-white border-none shadow-glow h-14 px-12 text-lg">
                Book Your First Session
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
