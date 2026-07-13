import React from 'react';
import { FiX, FiCpu, FiPenTool, FiGlobe, FiZap, FiHeart } from "react-icons/fi";

export const BRAND = "#111827"; // Very dark gray/almost black for premium professional look
export const BRAND_ACCENT = "rgb(151,0,3)"; // Keep the KL red just for subtle accents

export const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#0284c7", LCH: "#7c3aed", ESO: "#ea580c", IIE: "#059669", HWB: "#e11d48",
};

export const DOMAIN_ICONS: Record<string, any> = {
  TEC: <FiCpu size={12} />, LCH: <FiPenTool size={12} />, ESO: <FiGlobe size={12} />,
  IIE: <FiZap size={12} />, HWB: <FiHeart size={12} />,
};

export const LEVEL_COLORS: Record<string, string> = {
  Explorer: "#CD7F32", Foundation: "#6B7280", Practitioner: "#0284c7", Leader: "#ea580c",
};

export function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden w-full mt-1.5">
      <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function KPI({ icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 flex flex-col gap-3 relative hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-gray-500 tracking-wide">{label}</p>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
