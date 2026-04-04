"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlowButton } from "@/components/ui/GlowButton";
import {
  Activity, Heart, Thermometer, Droplet, ArrowLeft, Loader2,
  Wind, FlaskConical, Scale, AlertTriangle, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from "recharts";

// ── Alert thresholds (clinical standards) ──────────────────────────────────
function getAlerts(v: any): { label: string; color: string }[] {
  const alerts: { label: string; color: string }[] = [];
  if (v.spo2 !== undefined) {
    if (v.spo2 < 90) alerts.push({ label: `SpO2 CRITICAL: ${v.spo2}%`, color: "red" });
    else if (v.spo2 < 95) alerts.push({ label: `SpO2 LOW: ${v.spo2}%`, color: "orange" });
  }
  if (v.heartRate !== undefined) {
    if (v.heartRate < 40 || v.heartRate > 150)
      alerts.push({ label: `Heart Rate CRITICAL: ${v.heartRate} bpm`, color: "red" });
    else if (v.heartRate < 55 || v.heartRate > 100)
      alerts.push({ label: `Heart Rate ABNORMAL: ${v.heartRate} bpm`, color: "orange" });
  }
  if (v.bloodPressureSys !== undefined) {
    if (v.bloodPressureSys > 180) alerts.push({ label: `BP HYPERTENSIVE CRISIS: ${v.bloodPressureSys}/${v.bloodPressureDia}`, color: "red" });
    else if (v.bloodPressureSys > 140) alerts.push({ label: `BP HIGH: ${v.bloodPressureSys}/${v.bloodPressureDia}`, color: "orange" });
  }
  if (v.cholesterol !== undefined && v.cholesterol > 240)
    alerts.push({ label: `Cholesterol HIGH: ${v.cholesterol} mg/dL`, color: "orange" });
  if (v.sugarLevel !== undefined && v.sugarLevel > 126)
    alerts.push({ label: `Blood Sugar HIGH: ${v.sugarLevel} mg/dL (Diabetic range)`, color: "orange" });
  if (v.bmi !== undefined) {
    if (v.bmi > 30) alerts.push({ label: `BMI OBESE: ${v.bmi.toFixed(1)}`, color: "orange" });
    else if (v.bmi < 18.5) alerts.push({ label: `BMI UNDERWEIGHT: ${v.bmi.toFixed(1)}`, color: "orange" });
  }
  return alerts;
}

const alertColorMap: Record<string, string> = {
  red: "bg-red-500/10 border-red-500/30 text-red-300",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-300",
};

export default function PatientVitalsPage() {
  const { id } = useParams();
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    heartRate: "",
    bloodPressureSys: "",
    bloodPressureDia: "",
    temperature: "",
    spo2: "",
    respiratoryRate: "",
    cholesterol: "",
    sugarLevel: "",
    weight: "",
    height: "",
    bmi: "",
    notes: "",
  });

  // Auto-compute BMI when weight + height change
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    if (w > 0 && h > 0) {
      const bmiVal = (w / ((h / 100) * (h / 100))).toFixed(1);
      setFormData((prev) => ({ ...prev, bmi: bmiVal }));
    }
  }, [formData.weight, formData.height]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/${id}/vitals`);
      if (res.ok) setVitals(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVitals();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      const payload: Record<string, any> = {};
      const numFields = [
        "heartRate", "bloodPressureSys", "bloodPressureDia",
        "temperature", "spo2", "respiratoryRate",
        "cholesterol", "sugarLevel", "weight", "height", "bmi",
      ];
      numFields.forEach((f) => {
        const v = Number((formData as any)[f]);
        if ((formData as any)[f] !== "" && !isNaN(v)) payload[f] = v;
      });
      if (formData.notes) payload.notes = formData.notes;

      const res = await fetch(`/api/patients/${id}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setFormData({
          heartRate: "", bloodPressureSys: "", bloodPressureDia: "",
          temperature: "", spo2: "", respiratoryRate: "",
          cholesterol: "", sugarLevel: "", weight: "", height: "", bmi: "", notes: "",
        });
        await fetchVitals();
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save vitals. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = [...vitals].reverse().map((v) => ({
    time: new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    spo2: v.spo2 ?? null,
    hr: v.heartRate ?? null,
    temp: v.temperature ?? null,
    cholesterol: v.cholesterol ?? null,
    sugar: v.sugarLevel ?? null,
  }));

  if (loading) {
    return (
      <div className="p-12 text-center text-teal-400 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Compute alerts from the latest vital reading
  const latestAlerts = vitals.length > 0 ? getAlerts(vitals[0]) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/asha/patients">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="text-slate-300 w-6 h-6" />
          </button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
            Vitals Tracker
          </h2>
          <p className="text-slate-400 mt-1">
            Record and monitor full patient vitals — SpO2, Heart Rate, Cholesterol, Blood Sugar, BMI & more.
          </p>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {latestAlerts.length > 0 && (
        <div className="space-y-2">
          {latestAlerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border ${alertColorMap[alert.color]}`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{alert.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Vitals Entry Form */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" /> Record New Entry
          </h3>

          {saved && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Vitals saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Core Vitals */}
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest pb-1 border-b border-white/10">Core Vitals</p>
            <GlassInput
              label="SpO2 (%)" type="number" placeholder="98" min="50" max="100"
              value={formData.spo2} onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
            />
            <GlassInput
              label="Heart Rate (BPM)" type="number" placeholder="72" min="20" max="300"
              value={formData.heartRate} onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <GlassInput
                label="BP Sys (mmHg)" type="number" placeholder="120"
                value={formData.bloodPressureSys} onChange={(e) => setFormData({ ...formData, bloodPressureSys: e.target.value })}
              />
              <GlassInput
                label="BP Dia (mmHg)" type="number" placeholder="80"
                value={formData.bloodPressureDia} onChange={(e) => setFormData({ ...formData, bloodPressureDia: e.target.value })}
              />
            </div>
            <GlassInput
              label="Temperature (°F)" type="number" step="0.1" placeholder="98.6"
              value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            />

            {/* Extended Vitals */}
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest pb-1 border-b border-white/10 pt-2">Extended Vitals</p>
            <GlassInput
              label="Cholesterol (mg/dL)" type="number" placeholder="180"
              value={formData.cholesterol} onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
            />
            <GlassInput
              label="Blood Sugar / Glucose (mg/dL)" type="number" placeholder="95"
              value={formData.sugarLevel} onChange={(e) => setFormData({ ...formData, sugarLevel: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <GlassInput
                label="Weight (kg)" type="number" step="0.1" placeholder="65"
                value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
              <GlassInput
                label="Height (cm)" type="number" placeholder="165"
                value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
            <GlassInput
              label="BMI (auto-computed)" type="number" step="0.1" placeholder="Auto"
              value={formData.bmi} onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
            />

            <GlowButton variant="teal" className="w-full mt-4" disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Vitals"}
            </GlowButton>
          </form>
        </GlassCard>

        {/* Analytics Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* SPO2 + Heart Rate Trend */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">SpO2 & Heart Rate Trend</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="spo2" name="SpO2 %" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Cholesterol + Sugar Trend */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cholesterol & Blood Sugar Trend</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#ffffff50" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="cholesterol" name="Cholesterol (mg/dL)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="sugar" name="Blood Sugar (mg/dL)" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Recent Logs */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Readings</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {vitals.length === 0 ? (
                <p className="text-slate-400 text-sm">No records found. Add the first entry.</p>
              ) : (
                vitals.map((v) => {
                  const rowAlerts = getAlerts(v);
                  return (
                    <div
                      key={v._id}
                      className={`p-3 rounded-xl flex flex-col gap-2 border text-sm transition-colors ${
                        rowAlerts.some((a) => a.color === "red")
                          ? "bg-red-500/10 border-red-500/20"
                          : rowAlerts.length > 0
                          ? "bg-orange-500/5 border-orange-500/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex flex-wrap gap-3">
                        {v.spo2 !== undefined && (
                          <span className="flex items-center gap-1 text-teal-300">
                            <Wind className="w-3.5 h-3.5" /> SpO2: {v.spo2}%
                          </span>
                        )}
                        {v.heartRate !== undefined && (
                          <span className="flex items-center gap-1 text-rose-300">
                            <Heart className="w-3.5 h-3.5" /> HR: {v.heartRate}
                          </span>
                        )}
                        {(v.bloodPressureSys || v.bloodPressureDia) && (
                          <span className="flex items-center gap-1 text-blue-300">
                            <Droplet className="w-3.5 h-3.5" /> BP: {v.bloodPressureSys || "-"}/{v.bloodPressureDia || "-"}
                          </span>
                        )}
                        {v.temperature !== undefined && (
                          <span className="flex items-center gap-1 text-orange-300">
                            <Thermometer className="w-3.5 h-3.5" /> {v.temperature}°F
                          </span>
                        )}
                        {v.cholesterol !== undefined && (
                          <span className="flex items-center gap-1 text-yellow-300">
                            <FlaskConical className="w-3.5 h-3.5" /> Chol: {v.cholesterol}
                          </span>
                        )}
                        {v.sugarLevel !== undefined && (
                          <span className="flex items-center gap-1 text-violet-300">
                            <FlaskConical className="w-3.5 h-3.5" /> Sugar: {v.sugarLevel}
                          </span>
                        )}
                        {v.bmi !== undefined && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Scale className="w-3.5 h-3.5" /> BMI: {v.bmi}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">
                          {new Date(v.createdAt).toLocaleString("en-IN")}
                        </span>
                        {rowAlerts.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-orange-400">
                            <AlertTriangle className="w-3 h-3" /> {rowAlerts.length} alert{rowAlerts.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
