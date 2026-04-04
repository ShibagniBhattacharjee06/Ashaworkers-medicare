"use client";

import { Activity, FileText, Calendar, User, LogOut, HeartPulse, Stethoscope } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PatientSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/patient", icon: Activity, label: "Health Overview", exact: true },
    { href: "/patient/vitals", icon: Stethoscope, label: "My Vitals" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
    { href: "/patient/profile", icon: User, label: "Profile & Schemes" },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-purple-500/30 shadow-2xl z-10 hidden md:flex flex-col">
      <div className="p-6">
        <HeartPulse className="w-8 h-8 text-purple-400 mb-2" />
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
          PATIENT HUB
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
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-500/20">
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
