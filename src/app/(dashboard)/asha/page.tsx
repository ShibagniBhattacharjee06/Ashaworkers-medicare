import { Search } from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db/mongodb";
import Household from "@/models/Household";
import Patient from "@/models/Patient";

export default async function AshaDashboardPage() {
  const session = await getServerSession(authOptions);
  let totalHouseholds = 0;
  let maternalCases = 0;
  let totalPatients = 0;
  
  if (session?.user) {
    await dbConnect();
    const ashaId = (session.user as any).id;
    totalHouseholds = await Household.countDocuments({ assignedAshaId: ashaId });
    
    // Find patients belonging to these households
    const households = await Household.find({ assignedAshaId: ashaId });
    const householdIds = households.map(h => h._id);
    
    totalPatients = await Patient.countDocuments({ householdId: { $in: householdIds } });
    // This is an approximate since we save maternalStatus on the patient explicitly in our new form
    maternalCases = await Patient.countDocuments({ 
      householdId: { $in: householdIds }, 
      maternalStatus: { $in: ['Pregnant', 'Postpartum'] }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Welcome, {session?.user?.name || "ASHA Worker"}</h2>
        <p className="text-slate-400 mt-2">Manage your designated households and pending medical visits.</p>
      </div>

      {/* Smart Search Panel */}
      <div className="glass-panel p-2 rounded-2xl flex items-center max-w-2xl border border-blue-500/30 glow-btn transition-shadow bg-blue-500/5">
        <div className="pl-4">
          <Search className="w-5 h-5 text-blue-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search by Patient ID, Aadhar, or Household No..." 
          className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-500"
        />
        <GlowButton variant="blue" className="px-8 shadow-none py-2 rounded-xl">
          Search
        </GlowButton>
      </div>

      {/* Quick Metrics & Modules row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Maternal Cases", count: maternalCases, color: "from-pink-400 to-rose-400" },
          { title: "Avg Members/Family", count: totalHouseholds ? (totalPatients / totalHouseholds).toFixed(1) : 0, color: "from-yellow-400 to-orange-400" },
          { title: "Total Individuals", count: totalPatients, color: "from-teal-400 to-emerald-400" },
          { title: "Total Households", count: totalHouseholds, color: "from-blue-400 to-indigo-400" }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col justify-between">
            <h3 className="text-sm font-medium text-slate-400">{stat.title}</h3>
            <p className={`text-4xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Daily Tasks List */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Pending Follow-ups for Today</h3>
          <Link href="/asha/modules">
            <GlowButton variant="teal" className="text-sm py-2">
              + Register New Household
            </GlowButton>
          </Link>
        </div>
        <div className="space-y-3">
          {[1,2,3].map((task) => (
            <div key={task} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-blue-200">Household #{800 + task} - Routine Checkup</p>
                <p className="text-sm text-slate-400 mt-1">Scheduled at: 10:00 AM</p>
              </div>
              <Link href="/asha/modules">
                <button className="text-sm px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500 hover:text-white transition-all">
                  Update
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
