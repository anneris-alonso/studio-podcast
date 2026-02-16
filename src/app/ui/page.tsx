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
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  return (
    <div className="min-h-screen p-8 bg-background transition-colors duration-500">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-16"
      >
        <motion.header variants={item} className="flex justify-between items-end border-b border-white/10 pb-8">
          <div>
            <Badge variant="secondary" className="mb-4">v1.0.1 (Corrected Theme)</Badge>
            <h1 className="text-5xl font-bold premium-gradient-text tracking-tight">
              Studio Suite UI Kit
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Refined premium glassmorphism components with correct project branding (Violet/Zinc).
            </p>
          </div>
          <ThemeToggle />
        </motion.header>

        {/* Buttons Section */}
        <motion.section variants={item} className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Interactive Buttons
          </h2>
          <GlassCard className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Violet</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="glass">Glass Variant</Button>
            <Button variant="primary" size="lg">Large Button</Button>
            <Button variant="primary" size="sm">Small Button</Button>
            <Button disabled>Disabled</Button>
          </GlassCard>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <motion.section variants={item} className="space-y-6">
            <h2 className="text-2xl font-semibold">Form Elements</h2>
            <GlassCard className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70">Text Input</label>
                <Input placeholder="Enter your name..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70">Select Menu</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opt1">Podcast Studio A</SelectItem>
                    <SelectItem value="opt2">Recording Room B</SelectItem>
                    <SelectItem value="opt3">Editing Suite C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          </motion.section>

          {/* Badges & Modals */}
          <motion.section variants={item} className="space-y-6">
            <h2 className="text-2xl font-semibold">Status & Overlays</h2>
            <GlassCard className="space-y-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">Pending</Badge>
                <Badge variant="outline">Planned</Badge>
                <Badge variant="ghost">Draft</Badge>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <Modal>
                  <ModalTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Open Glass Modal
                    </Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Refined Modal Component</ModalTitle>
                      <ModalDescription>
                        Corrected theme colors: Primary is now Violet, reflecting the original project identity.
                      </ModalDescription>
                    </ModalHeader>
                    <div className="py-4">
                      <p className="text-sm opacity-80">
                        Smooth entry/exit animations powered by Radix + Framer CSS animations.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="ghost">Cancel</Button>
                      <Button variant="primary">Confirm Action</Button>
                    </div>
                  </ModalContent>
                </Modal>
              </div>
            </GlassCard>
          </motion.section>
        </div>

        {/* Layout Examples */}
        <motion.section variants={item} className="space-y-6">
          <h2 className="text-2xl font-semibold">Layout Examples (Glass Cards)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="group cursor-pointer hover:border-primary/30 transition-colors">
                <div className="h-32 w-full rounded-lg bg-primary/5 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  Studio Package {i}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  High-quality recording with professional gear and acoustics.
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold tracking-tight">$99/hr</span>
                  <Badge variant="outline">Available</Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>

        <motion.footer variants={item} className="text-center pt-8 border-t border-white/10 text-muted-foreground text-sm">
          <p>© 2026 Studio Suite. Built with Next.js, Radix, Tailwind and Framer.</p>
        </motion.footer>
      </motion.div>
    </div>
  )
}
