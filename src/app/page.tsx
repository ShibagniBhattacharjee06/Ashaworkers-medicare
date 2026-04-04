import Link from "next/link";
import { ArrowRight, Shield, Activity, User } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function Home() {
  // Fix: Intercept the user and send them directly to their role-specific dashboard!
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === 'admin') redirect('/admin');
    if (role === 'asha_worker') redirect('/asha');
    if (role === 'patient') redirect('/patient');
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
      <div className="max-w-3xl glass-card p-12 relative overflow-hidden">
        {/* Glow effect behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/10 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 glow-text">MEDICARE</span>
          <br /> ALL IN ONE
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
          The futuristic, unified platform for tracking household health, empowering ASHA workers, and connecting patients to their care.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-teal-400 mb-4" />
            <h3 className="font-semibold text-lg">Admin View</h3>
            <p className="text-sm text-slate-400 mt-2">Manage systems and overview global insights</p>
          </div>
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
            <Activity className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="font-semibold text-lg">ASHA Portal</h3>
            <p className="text-sm text-slate-400 mt-2">Track households and maternal care efficiently</p>
          </div>
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
            <User className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="font-semibold text-lg">Patient Hub</h3>
            <p className="text-sm text-slate-400 mt-2">Access records and connect with your provider</p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-all glow-btn"
        >
          Access Portal <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </main>
  );
}
