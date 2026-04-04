import React from "react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "teal" | "blue" | "purple" | "red" | "green" | "glass";
  children: React.ReactNode;
}

export function GlowButton({ variant = "teal", children, className = "", ...props }: GlowButtonProps) {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2";
  
  const variants = {
    teal: "bg-teal-500 hover:bg-teal-400 text-white shadow-[0_0_20px_-5px_rgba(20,184,166,0.6)]",
    blue: "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]",
    purple: "bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.6)]",
    red: "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_-5px_rgba(239,68,68,0.6)]",
    green: "bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)]",
    glass: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
