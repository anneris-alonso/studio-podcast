import { requireUser } from "@/lib/auth-guards";
import { listUserBookings } from "@/server/data-access";
import { formatAED, formatDubaiDate } from "@/lib/format";
import Link from "next/link";
import { ChevronRight, Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";

type FilterType = "UPCOMING" | "PAST" | "CANCELED";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { filter } = await searchParams;
  const currentFilter = (filter?.toUpperCase() as FilterType) || "UPCOMING";
  
  const bookings = await listUserBookings(user.id, currentFilter);

  const tabs: { label: string; value: FilterType }[] = [
    { label: "Upcoming", value: "UPCOMING" },
    { label: "Past Sessions", value: "PAST" },
    { label: "Canceled", value: "CANCELED" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Bookings</h1>
          <p className="mt-1 text-slate-500">View and manage your studio sessions.</p>
        </div>
        <Link 
          href="/book" 
          className="inline-flex items-center justify-center rounded-lg bg-accent-pink/10 px-6 py-3 text-sm font-semibold text-accent-pink hover:bg-accent-pink hover:text-white transition-colors gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          New Booking
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/account/bookings?filter=${tab.value}`}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              currentFilter === tab.value 
                ? "text-accent-pink" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {currentFilter === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-pink" />
            )}
          </Link>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Link 
              key={booking.id} 
              href={`/account/bookings/${booking.id}`}
              className="block group"
            >
              <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-pink/30 transition-all shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 text-center group-hover:bg-accent-pink/5 group-hover:border-accent-pink/20 transition-colors">
                      <span className="text-[10px] uppercase text-slate-400 font-bold group-hover:text-accent-pink/80 transition-colors">
                        {formatDubaiDate(booking.startTime, "MMM")}
                      </span>
                      <span className="text-xl font-bold leading-none text-slate-700 group-hover:text-accent-pink transition-colors">
                        {formatDubaiDate(booking.startTime, "dd")}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-accent-pink transition-colors text-slate-900">
                        {booking.room.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-accent-pink/60" />
                          {formatDubaiDate(booking.startTime, "p")} - {formatDubaiDate(booking.endTime, "p")}
                        </span>
                        <span>•</span>
                        <span>{booking.lineItems[0]?.nameSnapshot || "Package Plan"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-bold text-slate-900">{formatAED(booking.totalPriceMinorSnapshot)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <StatusBadge status={booking.status} />
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4 text-slate-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
            <p className="text-slate-500 text-sm mt-1">You don't have any {currentFilter.toLowerCase()} bookings at the moment.</p>
            <Link href="/book" className="mt-6 inline-block text-accent-pink font-semibold hover:text-accent-violet transition-colors">
              Schedule a session now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
