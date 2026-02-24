import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { logout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  async function handleLogout() {
    "use server";
    await logout();
    redirect("/login");
  }


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative z-0 overflow-hidden">
        {/* Background Accents (Subtle Light Mode) */}
        <div className="absolute inset-0 z-[-1] pointer-events-none opacity-[0.4]">
          <div className="absolute top-[0%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-pink/5 blur-[120px] rounded-full" />
        </div>

        {/* Sidebar */}
        <DashboardSidebar user={user} handleLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
