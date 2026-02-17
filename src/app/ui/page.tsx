"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function UIShowcase() {
  return (
    <div className="min-h-screen p-8 bg-bg transition-colors duration-500">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-16"
      >
        <motion.header variants={item} className="flex justify-between items-end border-b border-border pb-8">
          <div>
            <Badge variant="ghost" className="mb-4">Official Branding v2.0</Badge>
            <h1 className="text-5xl font-bold premium-gradient-text tracking-tight">
              Studio Suite UI Kit
            </h1>
            <p className="text-muted mt-2 text-lg">
              Official brand components using mandated HSL tokens and radial gradients.
            </p>
          </div>
          <ThemeToggle />
        </motion.header>

        {/* Buttons Section */}
        <motion.section variants={item} className="space-y-6">
          <h2 className="text-2xl font-bold text-fg">Component Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <GlassCard className="space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">Brand Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Brand Gradient</Button>
                  <Button variant="secondary">Dark / Light</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-border/10">
                  <Button variant="primary" size="lg">Large Scale</Button>
                  <Button variant="primary" size="sm">Small Scale</Button>
                </div>
             </GlassCard>

             <GlassCard className="space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">Accent Tokens</h3>
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2 bg-accent-pink text-white rounded-r-lg text-xs font-bold shadow-glow">PINK</div>
                   <div className="px-4 py-2 bg-accent-violet text-white rounded-r-lg text-xs font-bold shadow-glow">VIOLET</div>
                   <div className="px-4 py-2 bg-accent-blue text-white rounded-r-lg text-xs font-bold shadow-glow">BLUE</div>
                </div>
                <div className="p-4 rounded-r-lg brand-gradient text-white text-center font-bold">
                  BRAND GRADIENT UTILITY
                </div>
             </GlassCard>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <motion.section variants={item} className="space-y-6">
            <h2 className="text-2xl font-bold text-fg">Form Elements</h2>
            <GlassCard className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Text Input</label>
                <Input placeholder="Enter your name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Select Menu</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a studio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opt1">Zenith Suite</SelectItem>
                    <SelectItem value="opt2">Acoustic Lounge</SelectItem>
                    <SelectItem value="opt3">Video Bay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          </motion.section>

          {/* Badges & Modals */}
          <motion.section variants={item} className="space-y-6">
            <h2 className="text-2xl font-bold text-fg">Status & Overlays</h2>
            <GlassCard className="space-y-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Confirmed</Badge>
                <Badge variant="secondary">Processing</Badge>
                <Badge variant="outline">Manual Check</Badge>
                <Badge variant="ghost">Legacy Item</Badge>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Modal>
                  <ModalTrigger asChild>
                    <Button variant="outline" className="w-full h-12">
                      Open Brand Modal
                    </Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Verbatim Branding</ModalTitle>
                      <ModalDescription>
                        This modal uses shadow-glow and glass-blur based on official brand tokens.
                      </ModalDescription>
                    </ModalHeader>
                    <div className="py-8 text-center bg-accent-violet/5 rounded-r-lg border border-accent-violet/10">
                      <p className="text-sm text-accent-violet font-bold">
                        PREMIUM OVERLAY ACTIVE
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="ghost">Close</Button>
                      <Button variant="primary">Confirm</Button>
                    </div>
                  </ModalContent>
                </Modal>
              </div>
            </GlassCard>
          </motion.section>
        </div>

        {/* Typography Section */}
        <motion.section variants={item} className="space-y-6">
          <h2 className="text-2xl font-bold text-fg">Design Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="p-6 rounded-r-lg border border-border bg-card space-y-2">
                <p className="text-xs text-muted font-bold">BG / FG</p>
                <div className="h-4 bg-bg rounded w-full border border-border" />
                <div className="h-4 bg-fg rounded w-full" />
             </div>
             <div className="p-6 rounded-r-lg border border-border bg-card space-y-2">
                <p className="text-xs text-muted font-bold">RADIUS LG (18px)</p>
                <div className="h-10 bg-accent-violet/20 rounded-r-lg border border-accent-violet/30" />
             </div>
             <div className="p-6 rounded-r-lg border border-border bg-card space-y-2">
                <p className="text-xs text-muted font-bold">RADIUS XL (24px)</p>
                <div className="h-10 bg-accent-blue/20 rounded-r-xl border border-accent-blue/30" />
             </div>
             <div className="p-6 rounded-r-lg border border-border bg-card space-y-2">
                <p className="text-xs text-muted font-bold">GLOW SHADOW</p>
                <div className="h-10 bg-accent-pink rounded-r-lg shadow-glow" />
             </div>
          </div>
        </motion.section>

        <motion.footer variants={item} className="text-center pt-8 border-t border-border text-muted text-sm">
          <p>© 2026 Studio Suite. All UI elements follow the verbatím branding mandate.</p>
        </motion.footer>
      </motion.div>
    </div>
  )
}
