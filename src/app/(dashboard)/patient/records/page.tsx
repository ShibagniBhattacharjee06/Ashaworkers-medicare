import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db/mongodb";
import mongoose from "mongoose";
import Patient from "@/models/Patient";
import { FileText, ShieldAlert, Stethoscope, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function PatientRecordsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "patient") {
    redirect("/login");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const userObjectId = mongoose.isValidObjectId(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  const patientInfo: any = await Patient.findOne({ userId: userObjectId }).lean();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
          Medical Records
        </h2>
        <p className="text-slate-400 mt-2">
          Your complete health history registered by your ASHA worker.
        </p>
      </div>

      {!patientInfo ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
          <p>No health records found. Contact your ASHA worker to register your data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Stethoscope className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Personal Health Profile</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: "Name", value: patientInfo.name },
                { label: "Age", value: `${patientInfo.age} years` },
                { label: "Gender", value: patientInfo.gender },
                { label: "Occupation", value: patientInfo.occupation || "—" },
                { label: "Nutrition Status", value: patientInfo.nutritionStatus },
                { label: "Anemia Status", value: patientInfo.anemiaStatus || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-500 text-xs">{label}</p>
                  <p className="text-white font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Chronic Diseases */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-semibold text-white">Chronic Conditions</h3>
            </div>
            {patientInfo.chronicDiseases?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patientInfo.chronicDiseases.map((d: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No chronic conditions recorded.</p>
            )}
          </GlassCard>

          {/* Infectious Diseases */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Infectious / Outbreak History</h3>
            </div>
            {patientInfo.infectiousDiseases?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patientInfo.infectiousDiseases.map((d: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm"
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No infectious disease records found.</p>
            )}
          </GlassCard>

          {/* Healthcare Access */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Healthcare Access</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-500 text-xs">Nearest PHC</p>
                <p className="text-white font-medium mt-0.5">{patientInfo.nearestPhc || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-500 text-xs">PHC Visits (last 12 months)</p>
                <p className="text-white font-medium mt-0.5">{patientInfo.phcVisitsLastYear ?? 0}</p>
              </div>
            </div>
          </GlassCard>

          {/* Focus Group flags */}
          {(patientInfo.isElderly || patientInfo.isDisabled) && (
            <GlassCard className="p-6 border border-yellow-500/20 bg-yellow-500/5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-400" /> Special Care Flags
              </h3>
              <div className="flex gap-3">
                {patientInfo.isElderly && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
                    👴 Elderly (65+)
                  </span>
                )}
                {patientInfo.isDisabled && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
                    ♿ Differently Abled
                  </span>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
