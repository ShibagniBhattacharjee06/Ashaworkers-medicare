"use client";

import { Home, Users, Search, Bell, LogOut, HeartPulse, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AshaSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/asha", icon: Home, label: "Dashboard", exact: true },
    { href: "/asha/patients", icon: Users, label: "Patient Directory" },
    { href: "/asha/modules", icon: ClipboardList, label: "Data Collection" },
    { href: "/asha/alerts", icon: Bell, label: "Alerts & Warnings" },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-blue-500/30 shadow-2xl z-10 hidden md:flex flex-col">
      <div className="p-6">
        <HeartPulse className="w-8 h-8 text-blue-400 mb-2" />
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          ASHA WORKER
        </h2>
      </div>

      <nav className="mt-6 px-4 flex flex-col gap-2 flex-grow">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
              {link.href === "/asha/alerts" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500/20">
        <Link
          href="/api/auth/signout"
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
