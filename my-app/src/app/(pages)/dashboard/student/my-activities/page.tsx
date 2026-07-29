"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiCheckCircle, FiClock, FiAward, FiStar, FiSearch, FiX,
  FiAlertCircle, FiCompass, FiArrowRight,
} from "react-icons/fi";
import MyActivityRow from "@/app/components/dashboard/MyActivityRow";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { key: "ongoing",   label: "Ongoing",   icon: FiClock,        color: "#D97706", bg: "#FFFBEB" },
  { key: "completed", label: "Completed", icon: FiCheckCircle,  color: "#059669", bg: "#ECFDF5" },
];

function RowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-10 bg-gray-100 rounded" />
          </div>
          <div className="h-4 w-3/5 bg-gray-200 rounded" />
          <div className="flex gap-3 pt-1">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
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
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const ongoing = myActivities.ongoing || [];
  const completed = myActivities.completed || [];
  const tabData = myActivities[activeTab] || [];
  const activeConf = TABS.find((t) => t.key === activeTab)!;

  const q = search.trim().toLowerCase();
  const filtered = tabData.filter((a) =>
    !q || a.name?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q),
  );

  const totalCreditsEarned = completed.reduce((s, a) => s + (a.credits_earned || 0), 0);

  const stats = [
    { label: "Ongoing",       value: ongoing.length,   icon: FiClock,        color: "#D97706", bg: "#FFFBEB" },
    { label: "Completed",     value: completed.length, icon: FiCheckCircle,  color: "#059669", bg: "#ECFDF5" },
    { label: "SAMAM Points",  value: totalCreditsEarned, icon: FiStar,        color: BRAND,     bg: "#FFF1F1" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">

      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 50%, #2563EB 100%)` }} />
        <div className="px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">My Activities</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your enrolled activities, review progress, and manage submissions.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden relative"
          >
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 50%, ${s.color} 0%, transparent 70%)` }}
            />
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">
              {loading ? <span className="text-gray-200">—</span> : s.value}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs + content ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const count = myActivities[tab.key]?.length || 0;
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                className={`flex items-center gap-2 flex-1 sm:flex-initial px-5 py-3.5 text-sm font-bold transition-colors border-b-2 ${
                  isActive ? "border-current" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
                style={isActive ? { color: tab.color, borderColor: tab.color } : {}}
              >
                <Icon size={14} />
                {tab.label}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={isActive
                    ? { backgroundColor: tab.bg, color: tab.color }
                    : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          {/* Search — only if there's content */}
          {tabData.length > 0 && (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${activeConf?.label}…`}
                className="w-full h-10 pl-9 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={13} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}
            </div>
          ) : loadError ? (
            <div className="text-center py-14">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle size={22} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-gray-800">Couldn&apos;t load your activities</p>
              <button onClick={load} className="text-xs font-bold mt-3 px-4 py-2 rounded-xl text-white" style={{ backgroundColor: BRAND }}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 px-6">
              {search ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <FiSearch size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">No match for &ldquo;{search}&rdquo;</p>
                  <button onClick={() => setSearch("")} className="text-xs font-bold mt-3 hover:underline" style={{ color: BRAND }}>
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: activeConf?.bg }}
                  >
                    <FiCompass size={24} style={{ color: activeConf?.color }} />
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    {activeTab === "ongoing" ? "No active enrollments" : "No completed activities yet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    {activeTab === "ongoing"
                      ? "Browse the catalogue and enroll in an activity to start earning SAMAM Points."
                      : "Activities appear here once your club lead marks your participation complete."}
                  </p>
                  <Link
                    href="/dashboard/student/activity-catalogue"
                    className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold px-5 py-2.5 rounded-xl text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Browse Catalogue <FiArrowRight size={12} />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((a) => (
                <MyActivityRow key={a.id} activity={a} tabKey={activeTab} />
              ))}
            </div>
          )}

          {/* Certificate nudge */}
          {!loading && activeTab === "completed" && completed.length > 0 && (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-start gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiAward size={17} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-bold text-emerald-800">Certificates</p>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Once your lead issues a certificate for a completed activity, it appears in your wallet with a shareable verified link.
                </p>
              </div>
              <Link
                href="/dashboard/student/certificates"
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0"
              >
                View Wallet <FiArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
