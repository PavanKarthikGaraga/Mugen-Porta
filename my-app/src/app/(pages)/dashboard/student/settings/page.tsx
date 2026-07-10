"use client";

import { useTheme } from "next-themes";
import { FiMonitor, FiMoon, FiSun, FiBell, FiLock, FiGlobe } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your app preferences and privacy.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Theme Settings */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiMonitor className="text-gray-400" /> Appearance
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Customize the UI theme of the SAMAM application.</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
            {[
              { id: "light", icon: <FiSun size={14} />, label: "Light" },
              { id: "dark", icon: <FiMoon size={14} />, label: "Dark" },
              { id: "system", icon: <FiMonitor size={14} />, label: "System" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  theme === t.id ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiBell className="text-gray-400" /> Notifications
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Choose what alerts you want to receive.</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "New Activities", checked: true },
              { label: "Badge Earned", checked: true },
              { label: "AI Recommendations", checked: false },
            ].map((n) => (
              <label key={n.label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={n.checked} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="p-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiLock className="text-gray-400" /> Privacy
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Control who can see your Excellence Passport.</p>
          </div>
          <select className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none">
            <option>Public (Shareable Link)</option>
            <option>University Only</option>
            <option>Private</option>
          </select>
        </div>

      </div>
    </div>
  );
}
