"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { CheckCircle2, WifiOff, UploadCloud, Loader2 } from "lucide-react";

const MODULES = [
  "1. Basic Household Details",
  "2. Individual Member Details",
  "3. Maternal Health",
  "4. Child Health",
  "5. Disease Tracking",
  "6. Healthcare Access",
  "7. Government Schemes",
  "8. Special Focus Groups"
];

export default function DataCollectionWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: formData, setValue: setFormData, isOffline, pendingSync } = useOfflineStorage("asha_forms_draft", {
    // Household properties
    locality: "",
    familySize: 1,
    socioEconomicStatus: "APL",
    drinkingWaterSource: "",
    toiletAvailability: false,
    cleanlinessPractices: "",
    wasteDisposalMethod: "",
    // Patient properties
    name: "",
    age: 0,
    gender: "Other",
    occupation: "",
    nutritionStatus: "Normal",
    // Maternal properties
    maternalStatus: "None",
    isHighRisk: false,
    // Child properties
    childVaccinesStatus: "Up to date",
    // Diseases
    chronicDiseases: "",
    infectiousDiseases: "",
    // Access
    nearestPhc: "",
    phcVisitsLastYear: 0,
    // Schemes
    schemesAvailed: "",
    // Focus Groups
    isElderly: false,
    isDisabled: false,
    _status: "draft",
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, MODULES.length - 1));
  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 0));
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Household
      const resHousehold = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locality: formData.locality || 'Unknown',
          familySize: formData.familySize,
          socioEconomicStatus: formData.socioEconomicStatus,
          drinkingWaterSource: formData.drinkingWaterSource,
          toiletAvailability: formData.toiletAvailability,
          cleanlinessPractices: formData.cleanlinessPractices,
          wasteDisposalMethod: formData.wasteDisposalMethod,
        }),
      });

      if (!resHousehold.ok) throw new Error("Failed to create household");
      const household = await resHousehold.json();

      // 2. Create Patient linked to Household
      const resPatient = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId: household._id,
          name: formData.name || 'Unknown Member',
          age: formData.age,
          gender: formData.gender,
          occupation: formData.occupation,
          nutritionStatus: formData.nutritionStatus,
          chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',') : [],
          infectiousDiseases: formData.infectiousDiseases ? formData.infectiousDiseases.split(',') : [],
          nearestPhc: formData.nearestPhc,
          phcVisitsLastYear: formData.phcVisitsLastYear,
          schemesAvailed: formData.schemesAvailed ? formData.schemesAvailed.split(',') : [],
          isElderly: formData.isElderly,
          isDisabled: formData.isDisabled,
        }),
      });

      if (!resPatient.ok) throw new Error("Failed to create patient");
      const patient = await resPatient.json();

      setSubmitted(true);
      // Clear offline storage explicitly if needed
      setFormData({ ...formData, _status: "completed" });
    } catch (error) {
      console.error(error);
      alert("Error saving data. Check network or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <CheckCircle2 className="w-24 h-24 text-teal-400 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Modules Submitted Successfully</h2>
        <p className="text-slate-400 max-w-md">
          {isOffline 
            ? "You are currently offline. Data has been saved securely to local storage and will automatically sync when connection restores." 
            : "Data has been successfully pushed to the central server and MongoDB Atlas."}
        </p>
        <GlowButton variant="blue" className="mt-8" onClick={() => { setSubmitted(false); setActiveStep(0); }}>Fill Another Household</GlowButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">Data Collection</h2>
          <p className="text-slate-400">Step {activeStep + 1} of {MODULES.length}</p>
        </div>
        
        {/* Connection Status Badge */}
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold border ${isOffline ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : pendingSync ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-teal-500/10 border-teal-500/30 text-teal-400"}`}>
          {isOffline ? <><WifiOff className="w-4 h-4"/> Offline Mode</> : pendingSync ? <><UploadCloud className="w-4 h-4 animate-pulse"/> Syncing...</> : <><CheckCircle2 className="w-4 h-4"/> Online & Synced</>}
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-hidden h-2 bg-slate-800 rounded-full">
        {MODULES.map((_, idx) => (
          <div key={idx} className={`flex-1 transition-colors duration-500 ${idx <= activeStep ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]' : 'bg-white/5'}`} />
        ))}
      </div>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold text-white mb-6">{MODULES[activeStep]}</h3>
        
        <div className="space-y-6 min-h-[300px]">
          {activeStep === 0 && (
            <>
              <GlassInput value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})} label="Locality / Village Area" placeholder="Enter Block or Locality..." />
              <GlassInput value={formData.familySize} onChange={e => setFormData({...formData, familySize: Number(e.target.value)})} label="Total Family Members" type="number" placeholder="E.g., 4" />
              <GlassInput value={formData.drinkingWaterSource} onChange={e => setFormData({...formData, drinkingWaterSource: e.target.value})} label="Drinking Water Source" placeholder="Well, Tap, Handpump..." />
              <div className="space-y-2 mb-2">
                 <label className="text-sm font-medium text-slate-300 block mb-1">Has Toilet Facility?</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.toiletAvailability ? "yes" : "no"} onChange={e => setFormData({...formData, toiletAvailability: e.target.value === "yes"})}>
                  <option value="yes" className="bg-slate-900">Yes</option>
                  <option value="no" className="bg-slate-900">No</option>
                 </select>
              </div>
            </>
          )}
          {activeStep === 1 && (
            <>
              <GlassInput value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} label="Primary Member Name" placeholder="Full name" />
              <GlassInput value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} label="Age" type="number" />
              <div className="space-y-2 mb-2">
                 <label className="text-sm font-medium text-slate-300 block mb-1">Gender</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                 </select>
              </div>
            </>
          )}
          {activeStep === 2 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300 block mb-2">Active Pregnancy in Household?</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.maternalStatus} onChange={e => setFormData({...formData, maternalStatus: e.target.value})}>
                <option value="None" className="bg-slate-900">None</option>
                <option value="Pregnant" className="bg-slate-900">Yes, Pregnant</option>
                <option value="Postpartum" className="bg-slate-900">Postpartum (Recently delivered)</option>
              </select>
              <div className="space-y-2 pt-2">
                 <label className="text-sm font-medium text-slate-300 block mb-1">Mark as High Risk Pregnancy?</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.isHighRisk ? "yes" : "no"} onChange={e => setFormData({...formData, isHighRisk: e.target.value === 'yes'})}>
                  <option value="no" className="bg-slate-900">No - Normal</option>
                  <option value="yes" className="bg-slate-900">Yes - High Risk Alert</option>
                 </select>
              </div>
            </div>
          )}
          {activeStep === 3 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300 block mb-2">Child Immunization Status</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.childVaccinesStatus} onChange={e => setFormData({...formData, childVaccinesStatus: e.target.value})}>
                <option value="Up to date" className="bg-slate-900">Up to date</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Missed" className="bg-slate-900">Missed Doses</option>
              </select>
            </div>
          )}
          {activeStep === 4 && (
            <>
              <GlassInput value={formData.chronicDiseases} onChange={e => setFormData({...formData, chronicDiseases: e.target.value})} label="Chronic diseases (Comma separated)" placeholder="Diabetes, Hypertension..." />
              <GlassInput value={formData.infectiousDiseases} onChange={e => setFormData({...formData, infectiousDiseases: e.target.value})} label="Infectious outbreaks (Comma separated)" placeholder="TB, Malaria, Dengue..." />
            </>
          )}
          {activeStep === 5 && (
            <>
              <GlassInput value={formData.nearestPhc} onChange={e => setFormData({...formData, nearestPhc: e.target.value})} label="Nearest PHC Location" placeholder="" />
              <GlassInput value={formData.phcVisitsLastYear} onChange={e => setFormData({...formData, phcVisitsLastYear: Number(e.target.value)})} label="PHC Visits in last 12 months" type="number" />
            </>
          )}
          {activeStep === 6 && (
            <GlassInput value={formData.schemesAvailed} onChange={e => setFormData({...formData, schemesAvailed: e.target.value})} label="Govt Schemes Enrolled (Comma separated)" placeholder="Ayushman Bharat, JSY..." />
          )}
          {activeStep === 7 && (
            <div className="space-y-6">
              <div className="space-y-2 mb-2">
                 <label className="text-sm font-medium text-slate-300 block mb-1">Is Member Elderly (65+)?</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.isElderly ? "yes" : "no"} onChange={e => setFormData({...formData, isElderly: e.target.value === 'yes'})}>
                  <option value="no" className="bg-slate-900">No</option>
                  <option value="yes" className="bg-slate-900">Yes</option>
                 </select>
              </div>
              <div className="space-y-2 mb-2">
                 <label className="text-sm font-medium text-slate-300 block mb-1">Is Member Disabled?</label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" value={formData.isDisabled ? "yes" : "no"} onChange={e => setFormData({...formData, isDisabled: e.target.value === 'yes'})}>
                  <option value="no" className="bg-slate-900">No</option>
                  <option value="yes" className="bg-slate-900">Yes</option>
                 </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
          <GlowButton variant="glass" onClick={handlePrev} disabled={activeStep === 0 || isSubmitting}>Back</GlowButton>
          {activeStep === MODULES.length - 1 ? (
            <GlowButton variant="teal" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete & Save to Database"}
            </GlowButton>
          ) : (
            <GlowButton variant="blue" onClick={handleNext} disabled={isSubmitting}>Next Section</GlowButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
