"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-pink/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-grain" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg text-center space-y-8 relative z-10"
      >
        {/* Icon & Badge */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center relative">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
              Access Restricted
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-white pt-4">
              Forbidden <span className="premium-gradient-text tracking-tighter"><span>Area.</span></span>
            </h1>
          </div>
        </div>

        {/* Message */}
        <div className="glass-card-premium p-8 border-white/10 bg-white/[0.03] space-y-6">
          <p className="text-slate-400 text-lg leading-relaxed">
            It looks like you don&apos;t have the necessary administrative privileges to access this section.
            If you believe this is an error, please contact your system administrator.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              asChild
              className="w-full h-12 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-all"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <Link href="/account/bookings">
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
            Logged in as a different user?
          </p>
          <button
            onClick={handleLoginRedirect}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Switch Account
          </button>
        </div>
      </motion.div>
    </div>
  );

  function handleLoginRedirect() {
    handleLogout();
  }
}
