"use client";
import { useState, useEffect } from "react";
import { FiDownload, FiRefreshCw, FiClipboard, FiSettings, FiCheckCircle, FiClock, FiAward, FiArchive, FiStar } from "react-icons/fi";
// Removed mock data import
import MyActivityRow from "@/app/components/dashboard/MyActivityRow";
import SearchBar    from "@/app/components/dashboard/SearchBar";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { key: "ongoing",        label: "Ongoing",          icon: FiSettings,  color: "#D97706" },
  { key: "completed",      label: "Completed",        icon: FiCheckCircle,color: "#059669" },
];

export default function MyActivitiesPage() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [myActivities, setMyActivities] = useState<Record<string, any[]>>({
    registered: [],
    ongoing: [],
    completed: [],
    pending_review: [],
    certificates: [],
    archived: [],
  });

  useEffect(() => {
    fetch('/api/student/activities')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyActivities(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch my activities", err);
        setLoading(false);
      });
  }, []);

  const tabData   = myActivities[activeTab] || [];
  const activeConf = TABS.find((t) => t.key === activeTab);

  const filtered = tabData.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalCreditsEarned = (myActivities.completed || []).reduce((s, a) => s + (a.credits_earned || 0), 0);

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
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <FiCheckCircle size={12} /> {myActivities.completed.length} Completed
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <FiSettings size={12} /> {myActivities.ongoing.length} Ongoing
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1">
                <FiStar size={12} /> {totalCreditsEarned} SAMAM Earned
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
              const count = myActivities[tab.key]?.length || 0;
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 font-medium ${
                    isActive
                      ? "border-current text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  style={isActive ? { color: tab.color, borderColor: tab.color } : {}}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${
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
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={`Search in ${activeConf?.label}…`}
              className="flex-1 min-w-48"
            />
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center text-4xl mb-3 text-gray-300">
                {activeConf?.icon ? <activeConf.icon /> : <FiClipboard />}
              </div>
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
          {activeTab === "completed" && filtered.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Your certificates are ready!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {filtered.length} certificate{filtered.length > 1 ? "s" : ""} available. Click &quot;Download All&quot; or individual certificates from each activity.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
