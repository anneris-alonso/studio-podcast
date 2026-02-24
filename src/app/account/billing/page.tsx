"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // For demo purposes, we'll use a hardcoded userId. 
  // In a real app, this would come from an auth session.
  const userId = "test-user-uuid"; // This should match the seeded test user or current user

  useEffect(() => {
    async function fetchBillingInfo() {
      try {
        // We'll simulate fetching data from their own API or use a real fetch
        // For now, let's just use the status from URL or mock it
        const status = searchParams.get("status");
        if (status === "success") {
          // You might want to wait a bit for webhooks to process
          setTimeout(() => {}, 2000);
        }

        // Mock data for initial UI implementation
        setData({
          subscription: {
            planName: "Creator Plan",
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            includedCredits: 10,
          },
          credits: {
            balance: 600, // 10 hours in minutes
            used: 120,
            remaining: 480,
          }
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load billing information");
        setLoading(false);
      }
    }

    fetchBillingInfo();
  }, [searchParams]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Failed to redirect to billing portal");
      }
    } catch (err: any) {
      alert(err.message);
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Billing & Subscription</h1>
          <p className="text-slate-500">Manage your subscription, credits, and invoices.</p>
        </div>

        {searchParams.get("status") === "success" && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center space-x-3 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">Subscription updated successfully! Your credits are being processed.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Info */}
          <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-blue/30 transition-all shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2 text-slate-900">
                <CreditCard className="w-5 h-5 text-accent-blue" />
                <span>Active Plan</span>
              </h2>
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {data.subscription.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-bold text-slate-900">{data.subscription.planName}</p>
                <p className="text-slate-400 text-sm mt-1">
                  Next renewal on {data.subscription.currentPeriodEnd}
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  variant="glass" 
                  className="w-full" 
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    "Manage Subscription"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Credits Info */}
          <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-violet/30 transition-all shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2 text-slate-900">
                <Clock className="w-5 h-5 text-accent-violet" />
                <span>Studio Credits</span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-accent-violet">{Math.floor(data.credits.balance / 60)}h</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{Math.floor(data.credits.remaining / 60)}h</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Available</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Usage</span>
                  <span className="font-medium text-slate-900">{Math.floor(data.credits.used / 60)}h / {Math.floor(data.credits.balance / 60)}h</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${(data.credits.used / data.credits.balance) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center italic">
                Credits reset at the start of each billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 rounded-lg p-6 flex space-x-4 border border-slate-200">
          <AlertCircle className="w-6 h-6 text-slate-400 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900">How credits work</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your subscription includes monthly recording hours. When you book a studio session, 
              the duration will be deducted from your balance. If you run out of credits, 
              you can still book sessions at our standard hourly rates.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/book" className="text-sm text-primary hover:underline font-medium">
            ← Back to Studio Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
