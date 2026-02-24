import { requireUser } from "@/lib/auth-guards";
import { listUserBookings, getCreditBalanceMinutes, getActiveSubscription } from "@/server/data-access";
import { formatAED, formatDuration } from "@/lib/format";
import Link from "next/link";
import { 
  Calendar, 
  ChevronRight, 
  CreditCard, 
  PlusCircle, 
  ArrowUpRight 
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export default async function AccountPage() {
  const user = await requireUser();
  const [upcomingBookings, creditBalance, activeSub] = await Promise.all([
    listUserBookings(user.id, "UPCOMING"),
    getCreditBalanceMinutes(user.id),
    getActiveSubscription(user.id)
  ]);

  return (
    <div className="space-y-6">
      <div className="hero-banner-premium !bg-white border border-slate-100 overflow-hidden">
        {/* Vibrant Mesh Gradient Mottled Blobs */}
        <div className="hero-banner-glow mesh-blob-pink top-[-40%] left-[-10%] opacity-40" />
        <div className="hero-banner-glow mesh-blob-blue bottom-[-30%] right-[-5%] opacity-30" />
        <div className="hero-banner-glow mesh-blob-violet top-[10%] left-[25%] opacity-25" />
        <div className="hero-banner-glow mesh-blob-pink bottom-[10%] left-[40%] w-[300px] h-[300px] blur-[80px] opacity-20" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-slate-600 text-lg">Manage your studio sessions and billing from your premium command center.</p>
        </div>

        {/* Summary Cards Floating Over Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <GlassCard className="premium-card-relief group border-none bg-white/95 hover:bg-white transition-all duration-500 hover:-translate-y-1 shadow-premium">
            <div className="flex justify-between items-start mb-6">
              <div className="brand-icon-container">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bookings</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Upcoming</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">{upcomingBookings.length}</span>
                <span className="text-sm text-slate-400">sessions</span>
              </div>
            </div>
            
            <Link 
              href="/account/bookings" 
              className="mt-6 flex items-center text-xs font-bold text-accent-pink hover:gap-2 transition-all"
            >
              Manage <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </GlassCard>

          <GlassCard className="premium-card-relief group border-none bg-white/95 hover:bg-white transition-all duration-500 hover:-translate-y-1 shadow-premium">
            <div className="flex justify-between items-start mb-6">
              <div className="brand-icon-container !from-accent-violet !to-accent-blue">
                <PlusCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Balance</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Credits</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">{formatDuration(creditBalance)}</span>
                <span className="text-sm text-slate-400">remaining</span>
              </div>
            </div>
            
            <Link 
              href="/pricing"
              className="mt-6 flex items-center text-xs font-bold text-accent-violet hover:gap-2 transition-all"
            >
              Add more <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </GlassCard>

          <GlassCard className="premium-card-relief group border-none bg-white/95 hover:bg-white transition-all duration-500 hover:-translate-y-1 shadow-premium">
            <div className="flex justify-between items-start mb-6">
              <div className="brand-icon-container !from-accent-blue !to-accent-pink">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Account</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Subscription</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 truncate max-w-full">
                  {activeSub ? activeSub.plan.name : "No Active Plan"}
                </span>
                <span className="text-xs text-slate-400">
                  {activeSub ? `Active until ${activeSub.currentPeriodEnd.toLocaleDateString()}` : "Upgrade today"}
                </span>
              </div>
            </div>
            
            <Link 
              href="/account/billing"
              className="mt-6 flex items-center text-xs font-bold text-accent-blue hover:gap-2 transition-all"
            >
              Billing <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/book" className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-pink/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-pink/5 text-accent-pink group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 group-hover:text-slate-900 transition-colors">Book a Session</p>
                  <p className="text-xs text-slate-500">Schedule your next studio visit</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-accent-pink transition-colors" />
            </Link>

            <Link href="/pricing" className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-blue/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-blue/5 text-accent-blue group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 group-hover:text-slate-900 transition-colors">Upgrade Plan</p>
                  <p className="text-xs text-slate-500">Unlock premium benefits</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-accent-blue transition-colors" />
            </Link>
          </div>
        </section>

        {/* Next Session Snippet */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Next Session</h2>
          {upcomingBookings.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-pink/30 transition-all overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/[0.02] to-transparent pointer-events-none" />
              <div className="flex justify-between items-start relative z-10 p-5">
                <div>
                  <p className="text-lg font-bold text-slate-900">{upcomingBookings[0].room.name}</p>
                  <p className="text-accent-pink font-medium">{upcomingBookings[0].startTime.toLocaleString('en-AE', { timeZone: 'Asia/Dubai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Booking #{upcomingBookings[0].id.slice(-8)}</p>
                </div>
                <Link 
                  href={`/account/bookings/${upcomingBookings[0].id}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold transition-colors text-slate-600 hover:text-slate-900"
                >
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center text-center">
              <Calendar className="w-8 h-8 mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No upcoming sessions scheduled.</p>
              <Link href="/book" className="text-accent-pink text-sm font-semibold mt-2 hover:text-accent-violet transition-colors">
                Book your first session
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
