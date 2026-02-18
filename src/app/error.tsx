"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#0A0C12]">System Error</h1>
          <p className="text-muted text-sm">Something went wrong on our end. We've been notified and are looking into it.</p>
          {error.digest && (
            <p className="text-[10px] text-muted uppercase font-mono mt-4">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
           <button 
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient text-white rounded-xl font-bold shadow-glow hover:scale-105 transition-transform"
           >
            <RefreshCw className="w-4 h-4" />
            Try Again
           </button>
           <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0A0C12] border border-border/10 rounded-xl font-bold hover:bg-fg/5 transition-colors"
           >
            <Home className="w-4 h-4" />
            Go Home
           </Link>
        </div>
      </div>
    </div>
  );
}
