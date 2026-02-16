import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Settings, LogOut, Disc } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/bookings", label: "My Bookings", icon: Calendar },
    { href: "/ui", label: "UI Showcase", icon: Disc },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 glass-panel border-r border-white/10 z-50 hidden md:flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Disc className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">StudioOne</span>
      </div>

      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25 font-medium" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
            <span className="font-bold text-sm text-white">{user?.name?.charAt(0) || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </nav>
  );
}

export function MobileNavbar() {
  // Simple mobile nav for small screens
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/10 z-50 flex items-center justify-around px-4">
      <Link href="/">
        <div className="p-2 text-muted-foreground hover:text-primary">
          <LayoutDashboard className="w-6 h-6" />
        </div>
      </Link>
      <Link href="/bookings">
        <div className="p-2 text-muted-foreground hover:text-primary">
          <Calendar className="w-6 h-6" />
        </div>
      </Link>
      <Link href="/ui">
        <div className="p-2 text-muted-foreground hover:text-primary">
          <Disc className="w-6 h-6" />
        </div>
      </Link>
    </div>
  );
}
