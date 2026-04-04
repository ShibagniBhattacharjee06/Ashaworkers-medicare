import { Activity, Users, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-teal-500/20 sticky top-0 z-20 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-200">Admin Control Center</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <span className="text-sm font-bold text-teal-300">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
