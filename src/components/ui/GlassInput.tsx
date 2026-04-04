import React from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

export function GlassInput({ icon, label, className = "", ...props }: GlassInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 text-slate-400">{icon}</div>}
        <input
          className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-white/30 transition-colors ${icon ? "pl-12" : ""}`}
          {...props}
        />
      </div>
    </div>
  );
}
