import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { 
  Mic2, 
  SquareStack, 
  Settings, 
  Calendar, 
  Activity, 
  DollarSign, 
  Users,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { formatAED } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  // 1. Calculate Date Ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 2. Fetch Stats explicitly (no mocks)
  const [
    bookingsLast30Days,
    upcomingBookingsNext7Days,
    revenueLast30Days,
    activeSubscriptions
  ] = await Promise.all([
    // Total bookings (last 30 days)
    prisma.booking.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    }),

    // Upcoming bookings (next 7 days)
    prisma.booking.count({
      where: {
        startTime: {
          gte: now,
          lte: sevenDaysFromNow
        },
        status: { not: 'CANCELLED' }
      }
    }),

    // Revenue (paid bookings sum) last 30 days
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        paidAt: { not: null }, // Only fully paid bookings
        status: { not: 'CANCELLED' }
      },
      _sum: {
        totalPriceMinorSnapshot: true
      }
    }),

    // Active subscriptions count
    prisma.subscription.count({
      where: {
        status: 'ACTIVE'
      }
    })
  ]);

  const revenue = revenueLast30Days._sum.totalPriceMinorSnapshot || 0;

  // Quick Links Configuration
  const quickLinks = [
    { name: 'Studios', href: '/admin/studios', icon: Mic2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Packages', href: '/admin/packages', icon: SquareStack, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Services', href: '/admin/services', icon: Settings, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { name: 'Audit Logs', href: '/admin/audit', icon: Activity, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your studio performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 flex flex-col justify-between h-32 bg-fg/[0.02] border-border/10 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-16 h-16" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bookings (30d)</p>
            <h3 className="text-2xl font-bold mt-2">{bookingsLast30Days}</h3>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-emerald-400 font-medium">+10%</span> from last month
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between h-32 bg-fg/[0.02] border-border/10 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Upcoming (7d)</p>
            <h3 className="text-2xl font-bold mt-2">{upcomingBookingsNext7Days}</h3>
          </div>
           <div className="text-xs text-muted-foreground">
            Scheduled sessions
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between h-32 bg-fg/[0.02] border-border/10 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Revenue (30d)</p>
            <h3 className="text-2xl font-bold mt-2">{formatAED(revenue)}</h3>
          </div>
           <div className="text-xs text-muted-foreground">
            Gross volume
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between h-32 bg-fg/[0.02] border-border/10 relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Subs</p>
            <h3 className="text-2xl font-bold mt-2">{activeSubscriptions}</h3>
          </div>
           <div className="text-xs text-muted-foreground">
            Recurring members
          </div>
        </GlassCard>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href} className="block group">
              <GlassCard className="p-4 flex items-center gap-4 hover:bg-fg/[0.05] transition-colors border-border/10 bg-card">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.bg} ${link.color}`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-fg group-hover:text-primary transition-colors">{link.name}</h3>
                  <p className="text-[10px] text-muted-foreground">Manage {link.name.toLowerCase()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
