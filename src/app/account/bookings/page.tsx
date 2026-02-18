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
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-white/60 mt-1">View and manage your studio sessions.</p>
        </div>
        <Link 
          href="/book" 
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition-colors gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          New Booking
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/account/bookings?filter=${tab.value}`}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              currentFilter === tab.value 
                ? "text-amber-500" 
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
            {currentFilter === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
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
              <GlassCard className="hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[10px] uppercase text-white/40 font-bold">
                        {formatDubaiDate(booking.startTime, "MMM")}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {formatDubaiDate(booking.startTime, "dd")}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-amber-500 transition-colors">
                        {booking.room.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-500/60" />
                          {formatDubaiDate(booking.startTime, "p")} - {formatDubaiDate(booking.endTime, "p")}
                        </span>
                        <span>•</span>
                        <span>{booking.lineItems[0]?.nameSnapshot || "Package Plan"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-bold">{formatAED(booking.totalPriceMinorSnapshot)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <StatusBadge status={booking.status} />
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 text-white/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium">No bookings found</h3>
            <p className="text-white/40 text-sm mt-1">You don't have any {currentFilter.toLowerCase()} bookings at the moment.</p>
            <Link href="/book" className="mt-6 inline-block text-amber-500 font-semibold hover:underline">
              Schedule a session now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
