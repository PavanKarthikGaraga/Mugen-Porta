"use client";
import { useState, useEffect, useCallback } from "react";
import { FiBarChart2, FiActivity, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "@/app/components/admin/samam/SharedUI";
import AnalyticsView from "@/app/components/admin/samam/AnalyticsView";
import ActivityManager from "@/app/components/admin/samam/ActivityManager";
import SubmissionsManager from "@/app/components/admin/samam/SubmissionsManager";

const TABS: { key: string, label: string, icon: React.ReactNode }[] = [
  { key: "analytics", label: "Overview", icon: <FiBarChart2 size={15} /> },
  { key: "activities",label: "Activities",icon: <FiActivity size={15} />  },
  { key: "submissions",label: "Submissions",icon: <FiFileText size={15} /> },
];

export default function LeadSamamPage() {
  const [tab, setTab] = useState("analytics");

  /* ── Analytics ── */
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  /* ── Activities ── */
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [actSearchStr, setActSearchStr] = useState("");

  /* ── Fetch analytics ── */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/lead/samam-stats");
      if (res.ok) setAnalytics(await res.json());
    } finally { setAnalyticsLoading(false); }
  }, []);

  /* ── Fetch activities ── */
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/dashboard/lead/samam/activities");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally { setActivitiesLoading(false); }
  }, []);

  const deleteActivity = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/dashboard/lead/samam/activities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchActivities(); }
    else toast.error(data.message || "Failed");
  };

  /* ── Initial Fetch ── */
  useEffect(() => { fetchAnalytics(); fetchActivities(); }, [fetchAnalytics, fetchActivities]);

  const filteredActivities = activities.filter(a => {
    if (actSearchStr) {
      const q = actSearchStr.toLowerCase();
      return (a.title?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SAMAM Dashboard</h1>
          <p className="text-[13.5px] text-gray-500 mt-1">Manage activities, submissions, and track student achievements.</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-all whitespace-nowrap
              ${tab === t.key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
            style={tab === t.key ? { backgroundColor: BRAND } : {}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "analytics" && (
          <AnalyticsView 
            analytics={analytics} 
            analyticsLoading={analyticsLoading} 
            setTab={setTab} 
          />
        )}
        {tab === "activities" && (
          <ActivityManager 
            actSearchStr={actSearchStr} 
            setActSearchStr={setActSearchStr}
            fetchActivities={fetchActivities}
            activitiesLoading={activitiesLoading}
            filteredActivities={filteredActivities}
            deleteActivity={deleteActivity}
            role="lead"
          />
        )}
        {tab === "submissions" && (
          <SubmissionsManager role="lead" />
        )}
      </div>
    </div>
  );
}
