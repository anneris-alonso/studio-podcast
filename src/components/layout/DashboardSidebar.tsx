"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CreditCard,
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: any;
}

const navItems: SidebarItemProps[] = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Bookings", href: "/account/bookings", icon: Calendar },
  { label: "Invoices", href: "/account/invoices", icon: FileText },
  { label: "Billing", href: "/account/billing", icon: CreditCard },
];

export function DashboardSidebar({ user, handleLogout }: { user: any, handleLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-6 flex flex-col relative z-10 shadow-sm">
      <div className="mb-8 hidden md:block text-center border-b border-slate-100 pb-6">
        <Link href="/" className="text-xl font-black bg-gradient-to-r from-accent-pink via-accent-violet to-accent-blue bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tighter">
          STUDIO SUITE
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "brand-gradient text-white shadow-lg shadow-accent-violet/20" 
                  : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-accent-pink"
              )} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
              
              {isActive && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white shadow-sm ring-2 ring-white">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">{user.role}</p>
          </div>
        </div>

        {/* Admin Switcher */}
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <Link
            href="/admin/studios"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-sm group"
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-accent-violet transition-colors" />
            <span className="text-sm font-bold tracking-tight">Admin Portal</span>
          </Link>
        )}
        
        <form action={handleLogout}>
          <button
             type="submit"
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-all group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
