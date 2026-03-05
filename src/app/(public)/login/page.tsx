"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from 'next/link';

function LoginFormContent() {
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
        const userRole = data.user.role;
        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

        if (returnTo) {
          // If a client is trying to go to an admin page, redirect to account instead
          if (!isAdmin && returnTo.startsWith('/admin')) {
            router.push("/account/bookings");
          } else {
            router.push(returnTo);
          }
        } else if (isAdmin) {
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
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Ambient Glows (Saturated for Dark Mode) */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-accent-pink/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-violet/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-grain" />

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
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" title="Password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-bold uppercase tracking-wider text-accent-violet hover:text-accent-pink transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
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

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/50 font-bold bg-[#0a0a0c] px-4">
                Or continue with
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-2xl text-lg font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3 group"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>
          </form>
        </div>

        <div className="text-center space-y-6">
          <Link href="/register" className="text-lg text-slate-400 hover:text-white transition-colors">
            New here? <span className="font-bold text-accent-pink">Create an Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
        <Loader2 className="w-12 h-12 animate-spin text-accent-pink" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
