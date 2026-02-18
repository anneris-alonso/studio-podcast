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
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-white/60 mt-2">Manage your studio sessions and billing from your dashboard.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
            <Calendar className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-white/50">Upcoming Bookings</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{upcomingBookings.length}</span>
            <span className="text-white/40 text-sm">sessions scheduled</span>
          </div>
          <Link 
            href="/account/bookings" 
            className="mt-6 flex items-center text-xs font-semibold text-amber-500 hover:text-amber-400 gap-1"
          >
            View all bookings <ChevronRight className="w-3 h-3" />
          </Link>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
            <PlusCircle className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-white/50">Credit Balance</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatDuration(creditBalance)}</span>
            <span className="text-white/40 text-sm">available</span>
          </div>
          <Link 
            href="/pricing"
            className="mt-6 flex items-center text-xs font-semibold text-emerald-500 hover:text-emerald-400 gap-1"
          >
            Buy more credits <ChevronRight className="w-3 h-3" />
          </Link>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
            <CreditCard className="w-16 h-16" />
          </div>
          <p className="text-sm font-medium text-white/50">Subscription</p>
          <div className="mt-4 flex flex-col items-start gap-1">
            {activeSub ? (
              <>
                <span className="text-2xl font-bold">{activeSub.plan.name}</span>
                <span className="text-white/40 text-xs">Active until {activeSub.currentPeriodEnd.toLocaleDateString()}</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold">No Active Plan</span>
                <span className="text-white/40 text-xs text-wrap">Subscribe for lower hourly rates</span>
              </>
            )}
          </div>
          <Link 
            href="/account/billing"
            className="mt-6 flex items-center text-xs font-semibold text-blue-500 hover:text-blue-400 gap-1"
          >
            Manage billing <ChevronRight className="w-3 h-3" />
          </Link>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/book" className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                   <p className="font-medium">Book a Session</p>
                   <p className="text-xs text-white/50">Schedule your next studio visit</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
            </Link>

            <Link href="/pricing" className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                   <p className="font-medium">Upgrade Plan</p>
                   <p className="text-xs text-white/50">Unlock premium benefits</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </section>

        {/* Next Session Snippet */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Next Session</h2>
          {upcomingBookings.length > 0 ? (
            <GlassCard className="border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold">{upcomingBookings[0].room.name}</p>
                  <p className="text-amber-500 font-medium">{upcomingBookings[0].startTime.toLocaleString('en-AE', { timeZone: 'Asia/Dubai', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-white/50 mt-1">Booking #{upcomingBookings[0].id.slice(-8)}</p>
                </div>
                <Link 
                  href={`/account/bookings/${upcomingBookings[0].id}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
                >
                  View Details
                </Link>
              </div>
            </GlassCard>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
              <Calendar className="w-8 h-8 text-white/20 mb-3" />
              <p className="text-white/50 text-sm">No upcoming sessions scheduled.</p>
              <Link href="/book" className="text-amber-500 text-sm font-semibold mt-2 hover:underline">
                Book your first session
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
