"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiCheckCircle, FiClock, FiAward, FiStar, FiSearch, FiX,
  FiAlertCircle, FiCompass, FiArrowRight, FiActivity,
} from "react-icons/fi";
import MyActivityRow from "@/app/components/dashboard/MyActivityRow";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { key: "ongoing", label: "Ongoing", icon: FiClock, color: "#D97706" },
  { key: "completed", label: "Completed", icon: FiCheckCircle, color: "#059669" },
];

function RowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/3 bg-gray-100 rounded" />
          <div className="flex gap-3 pt-1">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyActivitiesPage() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [myActivities, setMyActivities] = useState<Record<string, any[]>>({ ongoing: [], completed: [] });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/student/activities")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error("failed");
        setMyActivities({
          ongoing: data.data?.ongoing || [],
          completed: data.data?.completed || [],
        });
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to fetch my activities", err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const ongoing = myActivities.ongoing || [];
  const completed = myActivities.completed || [];
  const tabData = myActivities[activeTab] || [];
  const activeConf = TABS.find((t) => t.key === activeTab);

  const q = search.trim().toLowerCase();
  const filtered = tabData.filter((a) =>
    !q || a.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q)
  );

  const totalCreditsEarned = completed.reduce((s, a) => s + (a.credits_earned || 0), 0);
  const totalHours = completed.reduce((s, a) => s + (a.hours || 0), 0);

  const stats = [
    { label: "Ongoing", value: ongoing.length, icon: FiClock, color: "#D97706" },
    { label: "Completed", value: completed.length, icon: FiCheckCircle, color: "#059669" },
    { label: "SAMAM Points", value: totalCreditsEarned, icon: FiStar, color: BRAND },
    { label: "Learning Hours", value: totalHours ? `${totalHours}h` : "0h", icon: FiActivity, color: "#2563EB" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900">My Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your progress, review feedback, and manage your enrolled activities.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-1.5" style={{ color: s.color }}>
              <s.icon size={13} />
              <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">{s.label}</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs + list ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const count = myActivities[tab.key]?.length || 0;
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm transition-colors border-b-2 font-medium ${
                    isActive ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  style={isActive ? { color: tab.color, borderColor: tab.color } : {}}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "text-white" : "text-gray-500 bg-gray-100"}`}
                    style={isActive ? { backgroundColor: tab.color } : {}}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          {tabData.length > 0 && (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${activeConf?.label}…`}
                className="w-full h-10 pl-9 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          ) : loadError ? (
            <div className="text-center py-14">
              <FiAlertCircle size={28} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">Couldn&apos;t load your activities</p>
              <button onClick={load} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 px-6">
              {search ? (
                <>
                  <FiSearch size={28} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-700">No activities match &ldquo;{search}&rdquo;</p>
                  <button onClick={() => setSearch("")} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <FiCompass size={30} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-700">
                    {activeTab === "ongoing" ? "You're not enrolled in anything yet" : "No completed activities yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    {activeTab === "ongoing"
                      ? "Browse the catalogue and enroll in an activity to start earning SAMAM Points."
                      : "Activities move here once your club lead marks your participation as complete."}
                  </p>
                  <Link
                    href="/dashboard/student/activity-catalogue"
                    className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Browse Catalogue <FiArrowRight size={12} />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <MyActivityRow key={a.id} activity={a} tabKey={activeTab} />
              ))}
            </div>
          )}

          {/* Certificates pointer — only meaningful once something is completed */}
          {!loading && activeTab === "completed" && completed.length > 0 && (
            <div className="mt-2 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3 flex-wrap">
              <span className="text-emerald-700 mt-0.5"><FiAward size={20} /></span>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-emerald-800">Certificates</p>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Once your club lead or faculty mentor issues a certificate for a completed
                  activity, it appears in your certificates wallet, ready to download and share.
                </p>
              </div>
              <Link
                href="/dashboard/student/certificates"
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                View certificates <FiArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
