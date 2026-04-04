"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlowButton } from "@/components/ui/GlowButton";
import { Save, Bell, Shield, Database } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Platform Settings</h2>
        <p className="text-slate-400 mt-2">Manage global configurations for the Healthcare Application.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation / Categories (Mock) */}
        <div className="col-span-1 space-y-2">
          <button className="w-full text-left p-4 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center gap-3">
            <Database className="w-5 h-5"/> Global Configurations
          </button>
          <button className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-3">
            <Shield className="w-5 h-5"/> Security & Access
          </button>
          <button className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-3">
            <Bell className="w-5 h-5"/> Notifications
          </button>
        </div>

        {/* Form panel */}
        <div className="col-span-1 md:col-span-2">
          <GlassCard className="p-8 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Global Application Config</h3>
            <form onSubmit={handleSave} className="space-y-6">
              
              <GlassInput 
                label="Application Name" 
                defaultValue="MEDICARE ALL IN ONE"
              />

              <GlassInput 
                label="Support Email Contact" 
                defaultValue="support@medicare.local"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Default Sync Interval (Offline Data)</label>
                <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white">
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="0">Manual Only</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <input type="checkbox" id="maint" className="w-5 h-5 rounded text-teal-500 bg-slate-900 border-white/20" />
                <label htmlFor="maint" className="text-sm text-slate-300">Enable Maintenance Mode (locks out non-admin users)</label>
              </div>

              <div className="pt-4 mt-8 flex justify-end">
                <GlowButton variant="teal" disabled={saving}>
                  {saving ? "Saving..." : <span className="flex items-center gap-2"><Save className="w-4 h-4"/> Save Configurations</span>}
                </GlowButton>
              </div>
            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
