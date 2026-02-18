"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

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
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-bg text-fg selection:bg-accent-violet/30 selection:text-accent-violet">
      {/* Fixed Radial Glow Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-radial-glow transition-all duration-300 ease-out"
        style={{ 
          "--x": mousePosition.x, 
          "--y": mousePosition.y 
        } as any}
      />
      
      {/* Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-grain" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation could go here */}
        <main className="flex-grow">
          {children}
        </main>
        {/* Footer could go here */}
      </div>
    </div>
  );
}
