"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { UserPlus, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";

export default function StaffManagementPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "asha_worker" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: "success"|"error", text: string} | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully created ${formData.role} account for ${formData.email}!` });
        setFormData({ name: "", email: "", password: "", role: "asha_worker" });
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error || "Failed to create user." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "An error occurred while creating the user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Staff Management</h2>
        <p className="text-slate-400 mt-2">Provision new healthcare workers and patient accounts into the system.</p>
      </div>

      <GlassCard className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-teal-400" />
          <h3 className="text-xl font-semibold">Register New User</h3>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-xl border ${message.type === 'success' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <GlassInput 
            label="Full Name" 
            placeholder="User's full name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <GlassInput 
            label="Email Address" 
            type="email" 
            placeholder="user@medicare.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <GlassInput 
            label="Temporary Password" 
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
          
          <div className="space-y-2 mb-2">
            <label className="text-sm font-medium text-slate-300 block mb-1">Access Role</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="asha_worker" className="bg-slate-900">ASHA Worker</option>
              <option value="patient" className="bg-slate-900">Patient</option>
              <option value="admin" className="bg-slate-900">Administrator</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300">
            💡 After creating a <strong>Patient</strong> account, ask your ASHA worker to link it to the patient&apos;s health record via the Patient Directory.
          </div>

          <GlowButton variant="teal" className="w-full mt-4 flex items-center justify-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Provision Account</>}
          </GlowButton>
        </form>
      </GlassCard>
    </div>
  );
}
