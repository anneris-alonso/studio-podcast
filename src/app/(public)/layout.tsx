"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mousePosition, setMousePosition] = useState({ x: "50%", y: "30%" });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x: `${x}%`, y: `${y}%` });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // We don't necessarily remove 'dark' here if we want other pages to potentially stay dark
      // but if the user wants light for account/admin, we should ideally revert if they aren't forced.
      // However, root layout ThemeProvider might handle it.
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-accent-violet/30 selection:text-accent-violet">
        {/* Fixed Radial Glow Overlay - Saturated and Premium */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_30%),_rgba(217,54,241,0.15),_rgba(106,71,242,0.1),_transparent_70%)]"
          style={{ 
            "--x": mousePosition.x, 
            "--y": mousePosition.y 
          } as any}
        />
        
        {/* Grain/Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[1] bg-grain opacity-[0.05]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          {/* Footer could go here */}
        </div>
      </div>
    </ThemeProvider>
  );
}
