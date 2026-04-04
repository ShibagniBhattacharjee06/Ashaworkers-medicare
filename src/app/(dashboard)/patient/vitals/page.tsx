"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, BarChart, Bar
} from "recharts";
import {
  Wind, Heart, Thermometer, FlaskConical, Scale,
  Activity, AlertTriangle, Loader2
} from "lucide-react";

function getAlertColor(field: string, value: number): string {
  if (field === "spo2" && value < 90) return "text-red-300";
  if (field === "spo2" && value < 95) return "text-orange-300";
  if (field === "heartRate" && (value < 40 || value > 150)) return "text-red-300";
  if (field === "cholesterol" && value > 240) return "text-orange-300";
  if (field === "sugarLevel" && value > 126) return "text-orange-300";
  if (field === "bmi" && (value > 30 || value < 18.5)) return "text-orange-300";
  return "text-teal-300";
}

export default function PatientVitalsPage() {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const load = async () => {
      try {
        const pRes = await fetch("/api/patients", { signal: controller.signal });
        if (!pRes.ok) {
          setError("Could not load patient records.");
          setLoading(false);
          return;
        }
        const patients = await pRes.json();
        if (!patients || patients.length === 0) {
          setLoading(false);
          return;
        }
        const pid = patients[0]._id;
        const vRes = await fetch(`/api/patients/${pid}/vitals`, { signal: controller.signal });
        if (vRes.ok) setVitals(await vRes.json());
      } catch (e: any) {
        if (e.name !== "AbortError") setError("Failed to load vitals. Please refresh.");
        console.error("Vitals load error:", e);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };
    load();
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  const chartData = [...vitals].reverse().map((v) => ({
    time: new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    spo2: v.spo2 ?? null,
    hr: v.heartRate ?? null,
    cholesterol: v.cholesterol ?? null,
    sugar: v.sugarLevel ?? null,
    bmi: v.bmi ?? null,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-purple-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm text-slate-400">Loading your health data&hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center text-red-400 border border-red-500/20">
        <Activity className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
          My Vitals History
        </h2>
        <p className="text-slate-400 mt-2">Track your heart rate, SpO2, cholesterol, blood sugar, and BMI over time.</p>
      </div>

      {vitals.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
          <p>No vitals recorded yet. Ask your ASHA worker to record your readings.</p>
        </div>
      ) : (
        <>
          {/* Latest snapshot */}
          {vitals[0] && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Wind, field: "spo2", label: "SpO2", unit: "%", color: "text-cyan-400" },
                { icon: Heart, field: "heartRate", label: "Heart Rate", unit: "bpm", color: "text-rose-400" },
                { icon: FlaskConical, field: "cholesterol", label: "Cholesterol", unit: "mg/dL", color: "text-yellow-400" },
                { icon: FlaskConical, field: "sugarLevel", label: "Blood Sugar", unit: "mg/dL", color: "text-violet-400" },
                { icon: Scale, field: "bmi", label: "BMI", unit: "", color: "text-teal-400" },
                { icon: Thermometer, field: "temperature", label: "Temp", unit: "°F", color: "text-orange-400" },
              ].map(({ icon: Icon, field, label, unit, color }) => {
                const val = vitals[0][field];
                const alertColor = val !== undefined ? getAlertColor(field, val) : "";
                return (
                  <GlassCard key={field} className="p-5 flex flex-col items-center text-center">
                    <Icon className={`w-6 h-6 mb-2 ${color}`} />
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-xl font-bold mt-1 ${alertColor}`}>
                      {val !== undefined ? val : "--"}
                      {unit && <span className="text-xs text-slate-500 ml-1">{unit}</span>}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* SpO2 + HR Trend */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4">SpO2 & Heart Rate History</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="spo2" name="SpO2 %" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Cholesterol + Sugar trend */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4">Cholesterol & Blood Sugar Trend</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="cholesterol" name="Cholesterol (mg/dL)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sugar" name="Blood Sugar (mg/dL)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Full log table */}
          <GlassCard className="p-6">
            <h3 className="font-semibold text-white mb-4">Complete Reading Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-center py-2 px-2">SpO2</th>
                    <th className="text-center py-2 px-2">HR</th>
                    <th className="text-center py-2 px-2">BP</th>
                    <th className="text-center py-2 px-2">Temp</th>
                    <th className="text-center py-2 px-2">Chol</th>
                    <th className="text-center py-2 px-2">Sugar</th>
                    <th className="text-center py-2 px-2">BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v) => (
                    <tr key={v._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-4 text-slate-400 text-xs">
                        {new Date(v.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={v.spo2 !== undefined ? getAlertColor("spo2", v.spo2) : "text-slate-600"}>
                          {v.spo2 ?? "—"}%
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={v.heartRate !== undefined ? getAlertColor("heartRate", v.heartRate) : "text-slate-600"}>
                          {v.heartRate ?? "—"}
                        </span>
                      </td>
                      <td className="text-center py-2 px-2 text-blue-300">
                        {v.bloodPressureSys ? `${v.bloodPressureSys}/${v.bloodPressureDia}` : "—"}
                      </td>
                      <td className="text-center py-2 px-2 text-orange-300">{v.temperature ?? "—"}</td>
                      <td className="text-center py-2 px-2">
                        <span className={v.cholesterol !== undefined ? getAlertColor("cholesterol", v.cholesterol) : "text-slate-600"}>
                          {v.cholesterol ?? "—"}
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={v.sugarLevel !== undefined ? getAlertColor("sugarLevel", v.sugarLevel) : "text-slate-600"}>
                          {v.sugarLevel ?? "—"}
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={v.bmi !== undefined ? getAlertColor("bmi", v.bmi) : "text-slate-600"}>
                          {v.bmi ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
