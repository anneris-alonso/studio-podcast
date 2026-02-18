"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simple admin check based on cookie or just show it for now/dev
  // Ideally this should verify the session via an API or useSession hook
  // For this fix, we will simply link to /admin and /login
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-bg/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-heading tracking-tight">
          Studio<span className="text-accent-violet">Suite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/book" className={`text-sm font-medium hover:text-white transition-colors ${pathname === '/book' ? 'text-white' : 'text-muted'}`}>
            Book Now
          </Link>
          <Link href="/gallery" className={`text-sm font-medium hover:text-white transition-colors ${pathname === '/gallery' ? 'text-white' : 'text-muted'}`}>
            Gallery
          </Link>
          <Link href="/onboarding" className="text-sm font-medium text-muted hover:text-white transition-colors">
            Setup
          </Link>
          {/* Admin Link - visible for easy access as requested */}
          <Link href="/admin" className="text-sm font-medium text-accent-pink hover:text-accent-pink/80 transition-colors">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted hover:text-white">
              Log In
            </Button>
          </Link>
          <Link href="/book">
            <Button size="sm" className="bg-brand-gradient text-white border-none shadow-glow">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
