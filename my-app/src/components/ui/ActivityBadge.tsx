import React from "react";
import { 
  Brain, Code, ShieldCheck, Database, Cloud, 
  Cpu, Bot, Rocket, Dna, Factory, Zap, 
  HeartPulse, Leaf, Coins, Building, GraduationCap, 
  Scale, Lightbulb, Map, Globe, Network, LucideIcon 
} from "lucide-react";

export interface ActivityBadgeProps {
  level: "explorer" | "foundation" | "practitioner" | "leader" | "fellow";
  pack: string;
  badgeName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const LEVEL_COLORS = {
  explorer: {
    from: "from-amber-600",
    to: "to-orange-400",
    border: "border-orange-500/50",
    text: "text-amber-100",
    shadow: "shadow-orange-500/30",
    bg: "bg-amber-950/40",
    ring: "ring-orange-500/20",
    star: "text-amber-400",
    label: "Explorer"
  },
  foundation: {
    from: "from-slate-500",
    to: "to-slate-300",
    border: "border-slate-400/50",
    text: "text-slate-100",
    shadow: "shadow-slate-400/30",
    bg: "bg-slate-900/40",
    ring: "ring-slate-400/20",
    star: "text-slate-300",
    label: "Foundation"
  },
  practitioner: {
    from: "from-yellow-600",
    to: "to-yellow-400",
    border: "border-yellow-500/50",
    text: "text-yellow-100",
    shadow: "shadow-yellow-500/40",
    bg: "bg-yellow-950/40",
    ring: "ring-yellow-500/30",
    star: "text-yellow-400",
    label: "Practitioner"
  },
  leader: {
    from: "from-blue-600",
    to: "to-cyan-400",
    border: "border-cyan-500/50",
    text: "text-cyan-100",
    shadow: "shadow-cyan-500/40",
    bg: "bg-blue-950/40",
    ring: "ring-cyan-500/30",
    star: "text-cyan-400",
    label: "Leader"
  },
  fellow: {
    from: "from-purple-600",
    to: "to-fuchsia-400",
    border: "border-fuchsia-500/50",
    text: "text-fuchsia-100",
    shadow: "shadow-fuchsia-500/50",
    bg: "bg-purple-950/40",
    ring: "ring-fuchsia-500/40",
    star: "text-fuchsia-400",
    label: "Fellow"
  }
};

const SIZES = {
  sm: "w-24 h-24",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64"
};

const ICON_SIZES = {
  sm: 20,
  md: 28,
  lg: 48,
  xl: 64
};

const TEXT_SIZES = {
  sm: "text-[0.55rem]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base"
};

const getIconForPack = (packName: string): LucideIcon => {
  const name = packName.toLowerCase();
  if (name.includes("artificial intelligence")) return Brain;
  if (name.includes("software engineering")) return Code;
  if (name.includes("cybersecurity")) return ShieldCheck;
  if (name.includes("data science")) return Database;
  if (name.includes("cloud computing")) return Cloud;
  if (name.includes("internet of things")) return Network;
  if (name.includes("robotics")) return Bot;
  if (name.includes("drone") || name.includes("geospatial")) return Map;
  if (name.includes("blockchain") || name.includes("web3")) return Globe;
  if (name.includes("quantum")) return Cpu;
  if (name.includes("space technology")) return Rocket;
  if (name.includes("biotechnology")) return Dna;
  if (name.includes("manufacturing")) return Factory;
  if (name.includes("renewable energy")) return Zap;
  if (name.includes("health")) return HeartPulse;
  if (name.includes("agritech") || name.includes("farming")) return Leaf;
  if (name.includes("fintech") || name.includes("banking")) return Coins;
  if (name.includes("smart cities")) return Building;
  if (name.includes("edtech") || name.includes("education")) return GraduationCap;
  if (name.includes("policy")) return Scale;
  return Lightbulb;
};

export const ActivityBadge = ({ level, pack, badgeName, size = "lg", className = "" }: ActivityBadgeProps) => {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.explorer;
  const shapeSize = SIZES[size];
  const Icon = getIconForPack(pack);
  
  return (
    <div className={`relative group inline-flex flex-col items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-br ${colors.from} ${colors.to} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
      
      {/* Badge Container (Hexagon-like using CSS clip-path or rounded corners with rotation) */}
      <div 
        className={`${shapeSize} relative z-10 flex items-center justify-center`}
        style={{ perspective: "1000px" }}
      >
        <div className={`
          absolute inset-0 
          bg-gradient-to-br ${colors.from} ${colors.to}
          shadow-lg ${colors.shadow}
          transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-3
        `}
        style={{
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)"
        }}>
          {/* Inner Badge Area */}
          <div className="absolute inset-[3px] bg-[#0f172a]"
               style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }}>
            
            {/* Inner Gradient & Texture */}
            <div className={`absolute inset-0 ${colors.bg} backdrop-blur-sm`} />
            
            {/* Subtle inner lines */}
            <div className={`absolute inset-[6%] border border-dashed ${colors.border} opacity-50`} 
                 style={{ clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)" }} />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
              
              {/* Level Indicator (Stars) */}
              <div className="flex gap-0.5 mb-1 opacity-80">
                {Array.from({ length: level === 'explorer' ? 1 : level === 'foundation' ? 2 : level === 'practitioner' ? 3 : level === 'leader' ? 4 : 5 }).map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${colors.star}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Icon */}
              <div className={`p-2 rounded-full bg-[#0f172a]/50 mb-2 border ${colors.border} shadow-inner`}>
                <Icon size={ICON_SIZES[size]} className={`text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
              </div>

              {/* Badge Text */}
              {size !== "sm" && (
                <div className="px-2 w-full">
                  <h4 className={`font-bold uppercase tracking-wider text-white ${TEXT_SIZES[size]} leading-tight drop-shadow-md line-clamp-2`}>
                    {badgeName}
                  </h4>
                  <p className={`text-[0.6rem] font-medium uppercase tracking-widest mt-1 opacity-80 ${colors.text}`}>
                    {colors.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
