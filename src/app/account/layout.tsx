import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  User as UserIcon,
  CreditCard
} from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const navItems = [
    { label: "Dashboard", href: "/account", icon: LayoutDashboard },
    { label: "Bookings", href: "/account/bookings", icon: Calendar },
    { label: "Invoices", href: "/account/invoices", icon: FileText },
    { label: "Billing", href: "/account/billing", icon: CreditCard },
  ];

  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <div className="min-h-screen bg-bg text-fg flex flex-col md:flex-row">
        {/* Sidebar - Mobile Top Bar / Desktop Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/10 bg-card/50 backdrop-blur-xl p-6 flex flex-col">
          <div className="mb-8 hidden md:block text-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              STUDIO SUITE
            </Link>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-fg/5 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-amber-600 group-hover:text-amber-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-border/10 space-y-4">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <UserIcon className="w-4 h-4 text-amber-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </div>

            {/* Admin Switcher */}
            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <Link
                href="/admin/studios"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors border border-primary/20"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Switch to Admin</span>
              </Link>
            )}
            
            <form action="/api/auth/logout" method="POST">
              <button
                 type="submit"
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
