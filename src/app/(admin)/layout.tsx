import { requireAdmin } from '@/lib/auth-guards';
import { logout } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { LayoutDashboard, Mic2, SquareStack, Settings, Package as PackageIcon, Calendar as CalendarIcon, Activity, LogOut, MessageSquare } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

import { AdminNav } from '@/components/layout/AdminNav';
import { logoutAction } from '@/app/actions/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce Admin Access for the entire layout
  const user = await requireAdmin();

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-bg text-fg flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/10 bg-card/50 backdrop-blur-xl p-6 flex flex-col gap-8 fixed h-full z-20">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">Studio Admin</span>
          </div>

          <AdminNav />

          <div className="mt-auto pt-6 border-t border-border/10 px-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold truncate max-w-[120px]">{user.name}</span>
                <span className="text-[10px] text-muted uppercase">{user.role}</span>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
