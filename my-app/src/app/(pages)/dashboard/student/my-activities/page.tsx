"use client";
import { useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { MY_ACTIVITIES } from "@/app/Data/activities-mock";
import MyActivityRow from "@/app/components/dashboard/MyActivityRow";
import SearchBar    from "@/app/components/dashboard/SearchBar";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { key: "registered",     label: "Registered",       emoji: "📋", color: "#2563EB" },
  { key: "ongoing",        label: "Ongoing",           emoji: "⚙️", color: "#D97706" },
  { key: "completed",      label: "Completed",         emoji: "✅", color: "#059669" },
  { key: "pending_review", label: "Pending Review",    emoji: "🕐", color: "#7C3AED" },
  { key: "certificates",   label: "Certificates Ready",emoji: "🎓", color: "#059669" },
  { key: "archived",       label: "Archived",          emoji: "📦", color: "#6B7280" },
];

export default function MyActivitiesPage() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [search,    setSearch]    = useState("");

  const tabData   = MY_ACTIVITIES[activeTab] || [];
  const activeConf = TABS.find((t) => t.key === activeTab);

  const filtered = tabData.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalCreditsEarned = MY_ACTIVITIES.completed.reduce((s, a) => s + a.credits_earned, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Activities</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Track progress, view feedback, manage assignments, and download certificates.
              </p>
            </div>
            {/* Summary pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✅ {MY_ACTIVITIES.completed.length} Completed
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                ⚙️ {MY_ACTIVITIES.ongoing.length} Ongoing
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ backgroundColor: "rgba(151,0,3,0.08)", color: BRAND, borderColor: "rgba(151,0,3,0.2)" }}>
                ⭐ {totalCreditsEarned} SDC earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const count = MY_ACTIVITIES[tab.key]?.length || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                    isActive ? "border-current" : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                  style={isActive ? { color: tab.color, borderColor: tab.color } : {}}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "text-white" : "text-gray-500 bg-gray-100"
                    }`}
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
          {/* Search + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={`Search in ${activeConf?.label}…`}
              className="flex-1 min-w-48"
            />
            {activeTab === "certificates" && (
              <button
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: BRAND }}
              >
                <FiDownload size={13} />
                Download All
              </button>
            )}
            {activeTab === "pending_review" && (
              <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <FiRefreshCw size={13} />
                Refresh Status
              </button>
            )}
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">{activeConf?.emoji || "📋"}</p>
              <p className="text-sm font-medium text-gray-600">
                {search ? "No activities match your search" : `No ${activeConf?.label} activities yet`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search
                  ? "Try clearing your search"
                  : activeTab === "registered"
                  ? "Browse the Activity Catalogue to register for activities"
                  : "Activities will appear here once you enroll and participate"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <MyActivityRow key={a.id} activity={a} tabKey={activeTab} />
              ))}
            </div>
          )}

          {/* Certificate tab — download CTA */}
          {activeTab === "certificates" && filtered.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Your certificates are ready!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {filtered.length} certificate{filtered.length > 1 ? "s" : ""} available. Click "Download All" or individual certificates from each activity.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
