import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db/mongodb";
import Patient from "@/models/Patient";
import Household from "@/models/Household";
import VitalRecord from "@/models/VitalRecord";
import { AlertTriangle, Heart, Wind, Baby, Syringe } from "lucide-react";
import Link from "next/link";

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "asha_worker") {
    redirect("/login");
  }

  await dbConnect();
  const ashaId = (session.user as any).id;
  const households = await Household.find({ assignedAshaId: ashaId }).lean();
  const householdIds = households.map((h: any) => h._id);

  const patients = await Patient.find({ householdId: { $in: householdIds } }).lean();

  // 1. High-risk pregnancies
  const highRiskPregnancies = patients.filter(
    (p: any) => p.isHighRisk === true
  );

  // 2. Unvaccinated / missed vaccine children
  const missedVaccines = patients.filter(
    (p: any) => p.childVaccinesStatus === "Missed" || p.childVaccinesStatus === "Pending"
  );

  // 3. Collect all patient IDs
  const patientIds = patients.map((p: any) => p._id);

  // 4. Fetch latest vitals for each patient & filter critical
  const criticalVitals: { patient: any; vital: any; alerts: string[] }[] = [];
  for (const pid of patientIds) {
    const latest = await VitalRecord.findOne({ patientId: pid }).sort({ createdAt: -1 }).lean();
    if (!latest) continue;
    const alerts: string[] = [];
    if ((latest as any).spo2 !== undefined && (latest as any).spo2 < 90)
      alerts.push(`SpO2 CRITICAL: ${(latest as any).spo2}%`);
    if ((latest as any).heartRate !== undefined && ((latest as any).heartRate < 40 || (latest as any).heartRate > 150))
      alerts.push(`Heart Rate CRITICAL: ${(latest as any).heartRate} bpm`);
    if ((latest as any).bloodPressureSys > 180)
      alerts.push(`BP Crisis: ${(latest as any).bloodPressureSys}/${(latest as any).bloodPressureDia}`);
    if ((latest as any).cholesterol > 240)
      alerts.push(`Cholesterol HIGH: ${(latest as any).cholesterol} mg/dL`);
    if ((latest as any).sugarLevel > 126)
      alerts.push(`Blood Sugar HIGH: ${(latest as any).sugarLevel} mg/dL`);
    if (alerts.length > 0) {
      const patient = patients.find((p: any) => p._id.toString() === pid.toString());
      criticalVitals.push({ patient, vital: latest, alerts });
    }
  }

  const totalAlerts = highRiskPregnancies.length + missedVaccines.length + criticalVitals.length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
          Alerts & Warnings
        </h2>
        <p className="text-slate-400 mt-2">
          {totalAlerts > 0
            ? `${totalAlerts} active alert${totalAlerts > 1 ? "s" : ""} requiring attention.`
            : "All patients are currently within normal parameters."}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`glass-card p-6 ${criticalVitals.length > 0 ? "border-red-500/40 bg-red-500/5" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-slate-200">Critical Vitals</h3>
          </div>
          <p className={`text-3xl font-bold ${criticalVitals.length > 0 ? "text-red-300" : "text-teal-300"}`}>
            {criticalVitals.length}
          </p>
        </div>
        <div className={`glass-card p-6 ${highRiskPregnancies.length > 0 ? "border-pink-500/40 bg-pink-500/5" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <Baby className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold text-slate-200">High Risk Pregnancies</h3>
          </div>
          <p className={`text-3xl font-bold ${highRiskPregnancies.length > 0 ? "text-pink-300" : "text-teal-300"}`}>
            {highRiskPregnancies.length}
          </p>
        </div>
        <div className={`glass-card p-6 ${missedVaccines.length > 0 ? "border-orange-500/40 bg-orange-500/5" : ""}`}>
          <div className="flex items-center gap-3 mb-2">
            <Syringe className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-slate-200">Missed Vaccinations</h3>
          </div>
          <p className={`text-3xl font-bold ${missedVaccines.length > 0 ? "text-orange-300" : "text-teal-300"}`}>
            {missedVaccines.length}
          </p>
        </div>
      </div>

      {/* Critical Vitals Section */}
      {criticalVitals.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-red-400" /> Critical Vitals Alerts
          </h3>
          <div className="space-y-3">
            {criticalVitals.map(({ patient, vital, alerts }, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{patient?.name}</p>
                  <p className="text-xs text-slate-400">{patient?.age} yrs • {patient?.gender}</p>
                  <div className="mt-2 space-y-1">
                    {alerts.map((a, j) => (
                      <span key={j} className="flex items-center gap-1 text-red-300 text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" /> {a}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/asha/patients/${patient?._id}`}
                  className="shrink-0 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
                >
                  View & Update
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Risk Pregnancies */}
      {highRiskPregnancies.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-pink-500/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Baby className="w-5 h-5 text-pink-400" /> High-Risk Pregnancies
          </h3>
          <div className="space-y-3">
            {highRiskPregnancies.map((p: any) => (
              <div key={p._id.toString()} className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-sm text-pink-300 mt-1">⚠ Flagged as High-Risk Pregnancy</p>
                </div>
                <Link
                  href={`/asha/patients/${p._id}`}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missed Vaccinations */}
      {missedVaccines.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-orange-500/20">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-orange-400" /> Pending / Missed Vaccinations
          </h3>
          <div className="space-y-3">
            {missedVaccines.map((p: any) => (
              <div key={p._id.toString()} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-sm text-orange-300 mt-1">Status: {p.childVaccinesStatus}</p>
                </div>
                <Link
                  href={`/asha/patients/${p._id}`}
                  className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all text-sm font-medium"
                >
                  Update
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalAlerts === 0 && (
        <div className="text-center p-12 glass-panel rounded-2xl border border-teal-500/20">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-slate-400">No critical alerts for your assigned households right now.</p>
        </div>
      )}
    </div>
  );
}
