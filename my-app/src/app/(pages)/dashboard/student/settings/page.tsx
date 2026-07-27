"use client";

import { useTheme } from "next-themes";
import { FiMonitor, FiMoon, FiSun, FiBell, FiUser, FiInfo, FiShield } from "react-icons/fi";
import { useEffect, useState } from "react";

const BRAND = "rgb(151,0,3)";

function SettingRow({
  title, description, children,
}: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 last:border-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="px-5 sm:px-6 py-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
      <Icon size={13} className="text-gray-400" />
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-red-700" : "bg-gray-200 dark:bg-zinc-700"}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [notifications, setNotifications] = useState({
    newActivities: true,
    badgeEarned: true,
    aiRecommendations: false,
    activityReminders: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("samam_notifications");
    if (saved) {
      try { setNotifications({ ...notifications, ...JSON.parse(saved) }); } catch {}
    }

    // Fetch basic profile info for the Account section
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.user) return;
        const u = d.user;
        fetch(`/api/dashboard/student/profile/${u.username}`)
          .then(r => r.ok ? r.json() : null)
          .then(p => setProfile({ ...u, ...p }))
          .catch(() => setProfile(u));
      })
      .catch(() => {});

    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNotif = (key: string, val: boolean) => {
    const next = { ...notifications, [key]: val };
    setNotifications(next);
    localStorage.setItem("samam_notifications", JSON.stringify(next));
  };

  if (!mounted) return null;

  const themeOptions = [
    { id: "light",  icon: FiSun,     label: "Light"  },
    { id: "dark",   icon: FiMoon,    label: "Dark"   },
    { id: "system", icon: FiMonitor, label: "System" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your app preferences.</p>
      </div>

      {/* ── Appearance ── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <SectionHeader icon={FiMonitor} title="Appearance" />
        <SettingRow
          title="Theme"
          description="Choose between light, dark, or follow your device's system setting."
        >
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl gap-0.5">
            {themeOptions.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </SettingRow>
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <SectionHeader icon={FiBell} title="Notifications" />
        {[
          { key: "newActivities",    label: "New Activities",      desc: "Get notified when a new activity is added to the catalogue." },
          { key: "badgeEarned",      label: "Badge Earned",        desc: "Get notified when you earn a new badge." },
          { key: "activityReminders",label: "Activity Reminders",  desc: "Receive reminders for upcoming activity deadlines." },
          { key: "aiRecommendations",label: "AI Recommendations",  desc: "Receive personalised activity recommendations from AI." },
          { key: "weeklyDigest",     label: "Weekly Digest",       desc: "A weekly summary of your progress and new opportunities." },
        ].map((n) => (
          <SettingRow key={n.key} title={n.label} description={n.desc}>
            <Toggle
              checked={notifications[n.key as keyof typeof notifications]}
              onChange={(v) => saveNotif(n.key, v)}
            />
          </SettingRow>
        ))}
      </div>

      {/* ── Account ── */}
      {profile && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <SectionHeader icon={FiUser} title="Account" />
          <div className="p-5 sm:p-6 space-y-3">
            {[
              { label: "Full Name",   value: profile.name },
              { label: "Student ID",  value: profile.username },
              { label: "Branch",      value: profile.branch },
              { label: "Year",        value: profile.year ? `${profile.year} Year` : undefined },
              { label: "Email",       value: profile.email },
            ].filter(r => r.value).map((r) => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">{r.label}</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 sm:px-6 pb-5">
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <FiShield size={11} /> To update personal details, contact the administration.
            </p>
          </div>
        </div>
      )}

      {/* ── About ── */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <SectionHeader icon={FiInfo} title="About" />
        <div className="p-5 sm:p-6 space-y-2">
          {[
            { label: "Platform",  value: "SAMAM – Student Activity Management and Achievement Model" },
            { label: "Version",   value: "1.0.0" },
            { label: "Institute", value: "KL University – Student Activity Centre (SAC)" },
          ].map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 dark:border-zinc-800 last:border-0">
              <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 flex-shrink-0">{r.label}</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
