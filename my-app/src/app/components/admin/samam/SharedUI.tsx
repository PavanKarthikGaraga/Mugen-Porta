import React from 'react';
import { FiX, FiCpu, FiPenTool, FiGlobe, FiZap, FiHeart } from "react-icons/fi";

export const BRAND = "rgb(151,0,3)";
export const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#2563EB", LCH: "#7C3AED", ESO: "#D97706", IIE: "#059669", HWB: "#E11D48",
};
export const DOMAIN_ICONS: Record<string, any> = {
  TEC: <FiCpu size={12} />, LCH: <FiPenTool size={12} />, ESO: <FiGlobe size={12} />,
  IIE: <FiZap size={12} />, HWB: <FiHeart size={12} />,
};
export const LEVEL_COLORS: Record<string, string> = {
  Explorer: "#CD7F32", Foundation: "#6B7280", Practitioner: "#2563EB", Leader: "#D97706",
};
export const RARITY_COLORS: Record<string, string> = {
  Common: "#9CA3AF", Rare: "#2563EB", Epic: "#7C3AED", Legendary: "#D97706",
};

export function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full mt-1">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function KPI({ icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 relative overflow-hidden transition-all hover:shadow-md hover:border-gray-200">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
