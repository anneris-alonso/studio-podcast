import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatAED, formatDubaiDate } from '@/lib/format';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  MoreHorizontal 
} from 'lucide-react';
import { BookingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; time?: string }>;
}) {
  await requireAdmin();
  
  const { q: searchQ, status: searchStatus, time: searchTime } = await searchParams;
  const q = searchQ || '';
  const statusFilter = searchStatus || 'ALL';
  const timeFilter = searchTime || 'UPCOMING';

  // Build Query
  const where: any = {};

  // Status Filter
  if (statusFilter !== 'ALL') {
     where.status = statusFilter as BookingStatus;
  }

  // Time Filter
  const now = new Date();
  if (timeFilter === 'UPCOMING') {
    where.startTime = { gte: now };
  } else if (timeFilter === 'PAST') {
    where.startTime = { lt: now };
  }

  // Search Filter (ID, Email, Studio Name)
  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { room: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
      room: { select: { name: true } }
    },
    take: 50, // Pagination can be added later
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground text-sm">Manage studio sessions and reservations.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 bg-fg/[0.02]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form>
            <input 
              name="q" 
              defaultValue={q} 
              placeholder="Search by ID, email, or studio..." 
              className="w-full bg-fg/[0.05] border border-border/10 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
             {/* Preserve other params */}
             {statusFilter !== 'ALL' && <input type="hidden" name="status" value={statusFilter} />}
             {timeFilter !== 'UPCOMING' && <input type="hidden" name="time" value={timeFilter} />}
          </form>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <LinkButton href="?time=UPCOMING&status=ALL" active={timeFilter === 'UPCOMING'}>Upcoming</LinkButton>
            <LinkButton href="?time=PAST&status=ALL" active={timeFilter === 'PAST'}>Past</LinkButton>
            <div className="w-px bg-border/20 mx-2" />
            <LinkButton href={`?time=${timeFilter}&status=ALL`} active={statusFilter === 'ALL'}>All Status</LinkButton>
            <LinkButton href={`?time=${timeFilter}&status=CONFIRMED`} active={statusFilter === 'CONFIRMED'}>Confirmed</LinkButton>
            <LinkButton href={`?time=${timeFilter}&status=PAID`} active={statusFilter === 'PAID'}>Paid</LinkButton>
             <LinkButton href={`?time=${timeFilter}&status=CANCELLED`} active={statusFilter === 'CANCELLED'}>Canceled</LinkButton>
        </div>
      </GlassCard>

      {/* Bookings Table */}
      <GlassCard className="p-0 overflow-hidden border-border/10 bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-fg/[0.02] text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Studio</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                         <span className="font-bold">{formatDubaiDate(booking.startTime, 'MMM dd, yyyy')}</span>
                         <span className="text-xs text-muted-foreground">
                           {formatDubaiDate(booking.startTime, 'HH:mm')} - {formatDubaiDate(booking.endTime, 'HH:mm')}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[150px]">{booking.user.email}</span>
                        <span className="text-xs text-muted-foreground">{booking.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <StatusBadge status={booking.status} />
                       {booking.paidAt && (
                         <Badge variant="outline" className="ml-2 border-emerald-500/50 text-emerald-500 text-[10px]">PAID</Badge>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatAED(booking.totalPriceMinorSnapshot)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/bookings/${booking.id}`} 
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-fg/[0.05] transition-colors text-muted hover:text-primary"
                      >
                         <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function LinkButton({ href, active, children }: any) {
    return (
        <Link 
          href={href} 
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-fg/[0.05] hover:bg-fg/[0.1] text-muted'
          }`}
        >
            {children}
        </Link>
    )
}
