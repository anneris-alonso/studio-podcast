import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <h1 className="text-[150px] font-black text-amber-500/10 leading-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="space-y-2">
               <h2 className="text-3xl font-bold text-[#0A0C12]">Page Not Found</h2>
               <p className="text-muted text-sm">Oops! The page you're looking for doesn't exist.</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
           <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient text-white rounded-xl font-bold shadow-glow hover:scale-105 transition-transform"
           >
            <Home className="w-4 h-4" />
            Go Home
           </Link>
           <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0A0C12] border border-border/10 rounded-xl font-bold hover:bg-fg/5 transition-colors"
           >
            <ArrowLeft className="w-4 h-4" />
            Go Back
           </button>
        </div>
      </div>
    </div>
  );
}
