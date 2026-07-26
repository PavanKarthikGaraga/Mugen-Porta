"use client";

import { useTheme } from "next-themes";
import { FiMonitor, FiMoon, FiSun, FiBell, FiGlobe } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    newActivities: true,
    badgeEarned: true,
    aiRecommendations: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("samam_notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  const handleNotificationChange = (key: keyof typeof notifications, checked: boolean) => {
    const next = { ...notifications, [key]: checked };
    setNotifications(next);
    localStorage.setItem("samam_notifications", JSON.stringify(next));
  };

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
              { id: "newActivities", label: "New Activities" },
              { id: "badgeEarned", label: "Badge Earned" },
              { id: "aiRecommendations", label: "AI Recommendations" },
            ].map((n) => (
              <label key={n.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[n.id as keyof typeof notifications]}
                  onChange={(e) => handleNotificationChange(n.id as keyof typeof notifications, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        

      </div>
    </div>
  );
}
