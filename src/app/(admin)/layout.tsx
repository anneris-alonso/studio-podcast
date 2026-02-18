import { requireAdmin } from '@/lib/auth-guards';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { LayoutDashboard, Mic2, SquareStack, Settings, Package as PackageIcon } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce Admin Access for the entire layout
  const user = await requireAdmin();

  const navItems = [
    { name: 'Studios', href: '/admin/studios', icon: <Mic2 className="w-4 h-4" /> },
    { name: 'Packages', href: '/admin/packages', icon: <SquareStack className="w-4 h-4" /> },
    { name: 'Services', href: '/admin/services', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg text-fg flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/10 bg-card/50 backdrop-blur-xl p-6 flex flex-col gap-8 fixed h-full z-10">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight">Studio Admin</span>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-fg/5 transition-all text-sm font-medium text-muted hover:text-fg hover:pl-5 group">
                <span className="opacity-70 group-hover:opacity-100 group-hover:text-primary transition-colors">
                  {item.icon}
                </span>
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border/10 px-2">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user.email?.[0].toUpperCase() || 'A'}
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold truncate max-w-[120px]">{user.name}</span>
                <span className="text-[10px] text-muted uppercase">{user.role}</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
