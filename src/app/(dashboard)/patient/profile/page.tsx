import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db/mongodb";
import mongoose from "mongoose";
import Patient from "@/models/Patient";
import User from "@/models/User";
import { GlassCard } from "@/components/ui/GlassCard";
import { User as UserIcon, ShieldCheck, CheckCircle2 } from "lucide-react";

const SCHEMES_INFO: Record<string, { description: string; color: string }> = {
  "Ayushman Bharat": { description: "Health coverage up to ₹5 lakh/year per family.", color: "green" },
  "Janani Suraksha Yojana": { description: "Cash assistance to poor pregnant women for institutional delivery.", color: "pink" },
  "PM Poshan Abhiyaan": { description: "Supplementary nutrition to children under 6 and pregnant/nursing mothers.", color: "blue" },
  "Rashtriya Swasthya Bima Yojana": { description: "Health insurance for BPL families.", color: "teal" },
};

const colorMap: Record<string, string> = {
  green: "bg-green-500/10 border-green-500/30 text-green-300",
  pink: "bg-pink-500/10 border-pink-500/30 text-pink-300",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  teal: "bg-teal-500/10 border-teal-500/30 text-teal-300",
};

export default async function PatientProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "patient") {
    redirect("/login");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const userObjectId = mongoose.isValidObjectId(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  const userInfo: any = await User.findById(userObjectId).lean();
  const patientInfo: any = await Patient.findOne({ userId: userObjectId }).lean();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
          Profile & Schemes
        </h2>
        <p className="text-slate-400 mt-2">
          Your account information and enrolled government schemes.
        </p>
      </div>

      {/* Account Info */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{session.user?.name}</h3>
            <p className="text-slate-400 text-sm">{session.user?.email}</p>
            <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs">
              Patient Account
            </span>
          </div>
        </div>

        {patientInfo && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Date of Birth / Age", value: `${patientInfo.age} years` },
              { label: "Gender", value: patientInfo.gender },
              { label: "Occupation", value: patientInfo.occupation || "—" },
              { label: "Nearest PHC", value: patientInfo.nearestPhc || "—" },
              { label: "Nutrition Status", value: patientInfo.nutritionStatus },
              { label: "Focus Group", value: patientInfo.isElderly ? "Elderly" : patientInfo.isDisabled ? "Disabled" : "General" },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-500 text-xs">{label}</p>
                <p className="text-white font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Government Schemes */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Enrolled Government Schemes</h3>
        </div>

        {patientInfo?.schemesAvailed?.length > 0 ? (
          <div className="space-y-4">
            {patientInfo.schemesAvailed.map((scheme: string, i: number) => {
              const info = SCHEMES_INFO[scheme];
              const colorClass = info ? colorMap[info.color] : colorMap["teal"];
              return (
                <div key={i} className={`p-5 rounded-xl border flex items-start gap-4 ${colorClass}`}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">{scheme}</h4>
                    {info && <p className="text-sm opacity-80 mt-1">{info.description}</p>}
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-white/10 text-xs border border-white/20">
                      Status: Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-4">No schemes currently enrolled. You may be eligible for the following:</p>
            <div className="space-y-4">
              {Object.entries(SCHEMES_INFO).map(([name, { description, color }]) => (
                <div key={name} className="p-5 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-200">{name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{description}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full border border-white/10 text-xs text-slate-500">
                      Contact your ASHA worker to enroll
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
