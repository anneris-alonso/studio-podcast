import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import * as React from "react";

interface GlassSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    noPadding?: boolean;
}

export function GlassSection({ 
    children, 
    className, 
    containerClassName,
    noPadding = false,
    ...props 
}: GlassSectionProps) {
    return (
        <section className={cn("relative z-10", containerClassName)}>
             {/* Optional background glow for section */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-violet/5 to-transparent pointer-events-none opacity-30" />
             
             <div className={cn("max-w-7xl mx-auto px-6", className)}>
                {children}
             </div>
        </section>
    );
}

export function PremiumGlassCard({ children, className, hoverEffect = true }: { children: React.ReactNode; className?: string; hoverEffect?: boolean }) {
    return (
        <GlassCard 
            className={cn(
                "relative overflow-hidden transition-all duration-300 border-white/10 bg-white/[0.03]",
                hoverEffect && "hover:bg-white/[0.08] hover:border-white/20 hover:shadow-glow hover:-translate-y-1",
                className
            )}
        >
            {children}
            {/* Inner shimmer or gradient could go here */}
        </GlassCard>
    )
}
