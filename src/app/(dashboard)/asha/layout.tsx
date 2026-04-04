import { Menu } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { AshaSidebar } from "@/components/AshaSidebar";

export default async function AshaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'asha_worker') {
    redirect('/login');
  }

  const userName = session.user?.name || "Worker";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Dynamic Sidebar Component */}
      <AshaSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 glass-panel border-b border-blue-500/20 sticky top-0 z-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 md:hidden text-blue-400 cursor-pointer" />
            <h1 className="text-lg font-semibold text-slate-200">Worker Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{session.user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <span className="text-sm font-bold text-blue-300">{initials}</span>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

