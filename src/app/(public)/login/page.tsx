"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("from") || null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        if (returnTo) {
          router.push(returnTo);
        } else if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
          router.push("/admin/studios");
        } else {
          router.push("/account/bookings");
        }
      } else {
        const data = await res.json();
        setError(data.error === "invalid_credentials" ? "Invalid email or password." : "Login failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Ambient Glows (Saturated for Dark Mode) */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-accent-pink/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-violet/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-white inline-flex items-baseline gap-2 whitespace-nowrap justify-center">
             Welcome <span className="premium-gradient-text tracking-tighter !px-4 !py-0.5 !mx-0"><span>Back.</span></span>
          </h1>
          <p className="text-slate-400 text-lg">Sign in to your Studio Portal</p>
        </div>

        <div className="glass-card-premium p-8 lg:p-10 border-white/10 bg-white/[0.03] shadow-2xl shadow-black">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold group bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Log In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center space-y-6">
          <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">
            Secured by Argon2ID & Session Hardening
          </p>
          <div className="pt-2">
             <Link href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">
                New here? <span className="font-bold text-accent-pink">Create an Account</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
