"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, Lock, User, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "OTP" | "DETAILS">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/otp", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStep("OTP");
      } else {
        const data = await res.json();
        setError(data.message || (data.error === "user_exists" ? "User already exists. Please login." : "Failed to send code."));
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStep("DETAILS");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid or expired code.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/complete", {
        method: "POST",
        body: JSON.stringify({ email, otp, name, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/account/bookings"); // Auto-login success
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed. Please check your code.");
        if (data.error === "invalid_code") {
          setStep("OTP"); // Go back to OTP if invalid
        }
      }
    } catch (err) {
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Ambient Glows (Saturated for Dark Mode) */}
      <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-pink/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-grain" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-white inline-flex items-baseline gap-2 whitespace-nowrap justify-center">
            Create <span className="premium-gradient-text tracking-tighter !px-4 !py-0.5 !mx-0"><span>Account.</span></span>
          </h1>
          <p className="text-slate-400 text-lg">Join Studio Suite</p>
        </div>

        <div className="glass-card-premium p-8 lg:p-10 border-white/10 bg-white/[0.03] shadow-2xl shadow-black">
          {step === "EMAIL" && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                  placeholder="name@example.com"
                />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold group bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Send Registration Code <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === "OTP" && (
            <form onSubmit={handleVerifyOtpAndProceed} className="space-y-6">
              <div className="space-y-2 text-center mb-4">
                <p className="text-xs text-muted-foreground">Sent to <span className="text-primary font-bold">{email}</span></p>
              </div>
              <div className="space-y-2">
                <label htmlFor="otp" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <ShieldCheck className="w-3 h-3" /> 6-Digit Code
                </label>
                <input
                  id="otp"
                  type="number"
                  inputMode="numeric"
                  aria-label="One-time password code"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="000000"
                />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
              </Button>
              <button type="button" onClick={() => setStep("EMAIL")} className="w-full text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors">Change Email</button>
            </form>
          )}

          {step === "DETAILS" && (
            <form onSubmit={handleCompleteRegistration} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 cursor-pointer">
                  <Lock className="w-3 h-3" /> Create Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50 transition-all font-sans text-white placeholder:text-slate-600"
                  placeholder="Min 8 chars"
                />
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-brand-gradient text-white border-none shadow-[0_0_20px_rgba(122,92,255,0.3)] hover:shadow-[0_0_30px_rgba(122,92,255,0.5)] transition-all duration-300" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          )}

        </div>

        <div className="text-center">
          <Link href="/login" className="text-l text-slate-400 hover:text-white transition-colors">
            Already have an account? <span className="font-bold text-accent-violet">Log In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
