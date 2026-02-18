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
    // For this flow, we don't strictly "verify" against server yet, 
    // we let them proceed to enter details and verify everything at the end.
    // However, it's better UX to verify OTP first.
    // Let's implement a quick verification or just move to DETAILS step 
    // and let the final submit handle it all.
    // Ideally we'd have a specific verify endpoint, but let's assume valid for UI 
    // and if it fails at the end, they go back.
    // Actually, let's just move to next step to keep it simple as per creating endpoints.
    setStep("DETAILS");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground italic">Join Studio Suite</p>
        </div>

        <GlassCard className="p-8 border-white/10 shadow-2xl">
          {step === "EMAIL" && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                  placeholder="name@example.com"
                />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold group" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Send Registration Code <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                  placeholder="000000"
                />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold" disabled={loading}>
                Next Step
              </Button>
              <button type="button" onClick={() => setStep("EMAIL")} className="w-full text-xs text-muted-foreground hover:text-white mt-4">Change Email</button>
            </form>
          )}

          {step === "DETAILS" && (
            <form onSubmit={handleCompleteRegistration} className="space-y-6">
               <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Create Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                  placeholder="Min 8 chars"
                />
              </div>

               {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          )}

        </GlassCard>

        <div className="text-center">
             <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Already have an account? <span className="font-bold text-primary">Log In</span>
             </Link>
        </div>
      </div>
    </div>
  );
}
