"use client";

import { Activity, Users, Settings, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/staff", icon: Users, label: "Staff Management" },
    { href: "/admin/analytics", icon: Activity, label: "System Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Platform Settings" },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-teal-500/20 shadow-2xl z-10 hidden md:block relative">
      <div className="p-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">MEDICARE ADMIN</h2>
      </div>
      <nav className="mt-8 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? "bg-teal-500/10 text-teal-300 border border-teal-500/20" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" /> {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-teal-500/20">
        <Link href="/api/auth/signout" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
