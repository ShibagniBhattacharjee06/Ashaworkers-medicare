import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "teal" | "blue" | "purple" | "red" | "pink" | "orange" | "green";
  hoverEffect?: boolean;
}

export function GlassCard({ children, className = "", glowColor, hoverEffect = true }: GlassCardProps) {
  const glowMap = {
    teal: "hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] hover:border-teal-500/30",
    blue: "hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)] hover:border-blue-500/30",
    purple: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)] hover:border-purple-500/30",
    red: "hover:shadow-[0_0_20px_-5px_rgba(248,113,113,0.3)] hover:border-red-500/30",
    pink: "hover:shadow-[0_0_20px_-5px_rgba(244,114,182,0.3)] hover:border-pink-500/30",
    orange: "hover:shadow-[0_0_20px_-5px_rgba(251,146,60,0.3)] hover:border-orange-500/30",
    green: "hover:shadow-[0_0_20px_-5px_rgba(74,222,128,0.3)] hover:border-green-500/30",
  };

  const activeGlow = hoverEffect && glowColor ? glowMap[glowColor] : hoverEffect ? "hover:bg-white/10" : "";

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl transition-all duration-300 ${activeGlow} ${className}`}>
      {children}
    </div>
  );
}
