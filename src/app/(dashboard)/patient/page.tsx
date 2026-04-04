import {
  Activity, Thermometer, Heart, Wind,
  FlaskConical, Scale, AlertTriangle
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db/mongodb";
import mongoose from "mongoose";
import Patient from "@/models/Patient";
import VitalRecord from "@/models/VitalRecord";
import Link from "next/link";

function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  alert,
}: {
  icon: any;
  label: string;
  value: any;
  unit?: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`glass-card p-5 flex flex-col items-center justify-center text-center relative ${
        alert ? "border-red-500/40 bg-red-500/5" : ""
      }`}
    >
      {alert && (
        <span className="absolute top-2 right-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </span>
      )}
      <Icon className={`w-7 h-7 mb-2 ${color}`} />
      <h3 className="text-xs font-medium text-slate-400">{label}</h3>
      <p className="text-xl font-bold mt-1 text-white">
        {value ?? "--"}
        {unit && <span className="text-xs text-slate-500 font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions);
  let latestVitals: any = null;
  let patientInfo: any = null;

  if ((session?.user as any)?.role === "patient") {
    await dbConnect();
    const userId = (session!.user as any).id;
    // Cast string ID to ObjectId for reliable matching
    const userObjectId = mongoose.isValidObjectId(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    patientInfo = await Patient.findOne({ userId: userObjectId }).lean();
    if (patientInfo) {
      latestVitals = await VitalRecord.findOne({ patientId: (patientInfo as any)._id })
        .sort({ createdAt: -1 })
        .lean();
    }
  }

  const bpStr =
    latestVitals?.bloodPressureSys && latestVitals?.bloodPressureDia
      ? `${latestVitals.bloodPressureSys}/${latestVitals.bloodPressureDia}`
      : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
          My Health Overview
        </h2>
        <p className="text-slate-400 mt-2">
          Your latest vitals snapshot and connected care information.
        </p>
      </div>

      {patientInfo ? (
        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-purple-200">
          Viewing records for{" "}
          <strong>{(patientInfo as any).name}</strong> ·{" "}
          {(patientInfo as any).age} yrs · {(patientInfo as any).gender}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 p-4 rounded-xl text-slate-400 text-sm">
          Your health records are not yet linked. Please contact your ASHA worker to connect your account.
        </div>
      )}

      {/* Core Vitals */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Core Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalCard
            icon={Heart} label="Heart Rate" value={latestVitals?.heartRate} unit="bpm"
            color="text-rose-400"
            alert={latestVitals?.heartRate && (latestVitals.heartRate < 40 || latestVitals.heartRate > 150)}
          />
          <VitalCard
            icon={Activity} label="Blood Pressure" value={bpStr} unit="mmHg"
            color="text-purple-400"
            alert={latestVitals?.bloodPressureSys > 180}
          />
          <VitalCard
            icon={Wind} label="SpO2" value={latestVitals?.spo2} unit="%"
            color="text-cyan-400"
            alert={latestVitals?.spo2 !== undefined && latestVitals.spo2 < 90}
          />
          <VitalCard
            icon={Thermometer} label="Body Temp" value={latestVitals?.temperature} unit="°F"
            color="text-orange-400"
            alert={latestVitals?.temperature > 103}
          />
        </div>
      </div>

      {/* Extended Vitals */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Extended Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <VitalCard
            icon={FlaskConical} label="Cholesterol" value={latestVitals?.cholesterol} unit="mg/dL"
            color="text-yellow-400"
            alert={latestVitals?.cholesterol > 240}
          />
          <VitalCard
            icon={FlaskConical} label="Blood Sugar" value={latestVitals?.sugarLevel} unit="mg/dL"
            color="text-violet-400"
            alert={latestVitals?.sugarLevel > 126}
          />
          <VitalCard
            icon={Scale} label="BMI" value={latestVitals?.bmi?.toFixed ? latestVitals.bmi.toFixed(1) : latestVitals?.bmi}
            color="text-teal-400"
            alert={latestVitals?.bmi > 30 || (latestVitals?.bmi > 0 && latestVitals.bmi < 18.5)}
          />
        </div>
      </div>

      {latestVitals && (
        <p className="text-xs text-slate-500">
          Last updated: {new Date(latestVitals.createdAt).toLocaleString("en-IN")}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick links */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
          <div className="space-y-3">
            <Link href="/patient/vitals" className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-purple-200 font-medium">View Full Vitals History</span>
            </Link>
            <Link href="/patient/records" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Heart className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 font-medium">Medical Records</span>
            </Link>
            <Link href="/patient/profile" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Scale className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 font-medium">Govt Schemes & Profile</span>
            </Link>
          </div>
        </div>

        {/* Active Govt Scheme */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Active Govt Schemes</h3>
          {(patientInfo as any)?.schemesAvailed?.length > 0 ? (
            <div className="space-y-2">
              {(patientInfo as any).schemesAvailed.map((s: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                  ✓ {s}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <span className="text-green-400 font-bold text-xs">PM</span>
                </div>
                <div>
                  <h4 className="text-green-300 font-medium">Ayushman Bharat (PM-JAY)</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Status: <span className="text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full text-xs">Active</span>
                  </p>
                  <p className="text-sm text-slate-300 mt-2">Coverage limit: ₹5,00,000</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
