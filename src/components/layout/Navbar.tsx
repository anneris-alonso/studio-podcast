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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/40 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2 group">
          <span className="text-white group-hover:text-accent-pink transition-colors">Studio</span>
          <span className="text-accent-violet">Suite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/book" className={`text-[18px] font-bold transition-colors ${pathname === '/book' ? 'text-accent-pink' : 'text-accent-pink hover:text-accent-pink/80'}`}>
            Book Now
          </Link>
          <Link href="/studios" className={`text-[18px] font-bold hover:text-white transition-colors ${pathname === '/studios' ? 'text-white' : 'text-white/60'}`}>
            Studios
          </Link>
          <Link href="/gallery" className={`text-[18px] font-bold hover:text-white transition-colors ${pathname === '/gallery' ? 'text-white' : 'text-white/60'}`}>
            Gallery
          </Link>
          <Link href="/about" className={`text-[18px] font-bold hover:text-white transition-colors ${pathname === '/about' ? 'text-white' : 'text-white/60'}`}>
            About
          </Link>
          <Link href="/contact" className={`text-[18px] font-bold hover:text-white transition-colors ${pathname === '/contact' ? 'text-white' : 'text-white/60'}`}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[18px] font-bold text-white hover:text-accent-pink transition-colors px-4 py-2">
              Log In
          </Link>
          <Link href="/book">
            <Button 
                variant="outline"
                className="rounded-full bg-transparent border-white text-white hover:bg-brand-gradient hover:border-none shadow-glow hover:scale-105 transition-all text-[18px] font-bold h-12 px-10"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
