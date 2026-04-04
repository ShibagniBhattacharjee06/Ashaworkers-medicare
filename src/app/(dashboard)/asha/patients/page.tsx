import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db/mongodb";
import Patient from "@/models/Patient";
import Household from "@/models/Household";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Activity } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

export default async function AshaPatientsDirectory() {
  const session = await getServerSession(authOptions);
  let patients: any[] = [];
  
  if (session?.user) {
    await dbConnect();
    const ashaId = (session.user as any).id;
    const households = await Household.find({ assignedAshaId: ashaId }).select('_id locality');
    const householdIds = households.map(h => h._id);
    
    patients = await Patient.find({ householdId: { $in: householdIds } }).lean();
    
    // Attach locality to patients for display
    patients = patients.map(p => {
      const h = households.find(h => h._id.toString() === p.householdId.toString());
      return { ...p, locality: h?.locality || 'Unknown' };
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Patient Directory</h2>
        <p className="text-slate-400 mt-2">Manage vitals and health records for individuals in your designated households.</p>
      </div>

      <div className="glass-panel p-2 rounded-2xl flex items-center border border-teal-500/30 glow-btn transition-shadow bg-teal-500/5">
        <div className="pl-4">
          <Search className="w-5 h-5 text-teal-400" />
        </div>
        <input 
          type="text" 
          placeholder="Search by Patient Name or ID..." 
          className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400">
            No patients registered yet. Please add a household through the Modules wizard first.
          </div>
        ) : (
          patients.map((patient: any) => (
            <GlassCard key={patient._id.toString()} className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{patient.age} years • {patient.gender}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Locality:</span>
                    <span className="text-slate-300">{patient.locality}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-teal-400 capitalize">{patient.nutritionStatus}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/asha/patients/${patient._id}`}>
                  <GlowButton variant="teal" className="w-full flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" /> Manage Vitals
                  </GlowButton>
                </Link>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
