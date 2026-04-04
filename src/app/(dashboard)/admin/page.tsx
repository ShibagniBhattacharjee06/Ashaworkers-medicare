import { AdminChart } from "@/components/AdminChart";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400 mb-2">System Overview</h2>
          <p className="text-slate-400">Welcome back, Super Admin. Here is the operational status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-slate-400">Active ASHA Workers</h3>
          <p className="text-3xl font-bold text-teal-300 mt-2">1,248</p>
          <div className="mt-4 h-1 bg-teal-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 w-[80%] glow-btn"></div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-slate-400">Households Tracked</h3>
          <p className="text-3xl font-bold text-blue-300 mt-2">45K+</p>
          <div className="mt-4 h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 w-[92%] glow-btn"></div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-slate-400">Critical Alerts</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">12</p>
          <div className="mt-4 h-1 bg-red-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 w-[15%]"></div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Onboarding & Alerts Trend</h3>
        <AdminChart />
      </div>
    </div>
  );
}
