"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Mic2, SquareStack, Settings, Calendar, Activity, MessageSquare } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Studios", href: "/admin/studios", icon: Mic2 },
    { name: "Packages", href: "/admin/packages", icon: SquareStack },
    { name: "Services", href: "/admin/services", icon: Settings },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Audit Logs", href: "/admin/audit", icon: Activity },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                    <Link key={item.href} href={item.href}>
                        <div
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium group",
                                isActive
                                    ? "bg-primary/10 text-primary border-r-4 border-primary pl-5"
                                    : "text-muted hover:bg-fg/5 hover:text-fg hover:pl-5"
                            )}
                        >
                            <span
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-primary opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:text-primary"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                            </span>
                            {item.name}
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
