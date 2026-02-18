"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStep("OTP");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send code. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
          router.push("/admin/studios");
        } else {
          router.push("/account/bookings");
        }
      } else {
        const data = await res.json();
        setError(data.error === "invalid_code" ? "Invalid or expired code." : "Verification failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground italic">Sign in to your Studio Portal</p>
        </div>

        <GlassCard className="p-8 border-white/10 shadow-2xl">
          {step === "EMAIL" ? (
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold group" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Send Login Code <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 text-center mb-4">
                <p className="text-xs text-muted-foreground">We sent a verification code to</p>
                <p className="text-sm font-bold text-primary">{email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="000000"
                />
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

              <div className="space-y-4">
                <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="w-full text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  Change email or resend
                </button>
              </div>
            </form>
          )}
        </GlassCard>

        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          Secured by SHA-256 OTP & Session Hardening
        </p>
      </div>
    </div>
  );
}
