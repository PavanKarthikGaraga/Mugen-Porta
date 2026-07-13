"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  FiArrowLeft, FiClock, FiUser, FiCheckCircle,
  FiBookOpen, FiFileText, FiTarget, FiCalendar, FiGlobe, 
  FiZap, FiEdit3, FiAward, FiMessageSquare, FiFlag, FiDownload, FiExternalLink, FiTrendingUp
} from "react-icons/fi";
import { DOMAINS } from "@/app/Data/activities-mock";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { id: "overview",    label: "Overview",    icon: FiBookOpen },
  { id: "resources",   label: "Resources",   icon: FiFileText },
  { id: "assignments", label: "Assignments", icon: FiTarget },
  { id: "attendance",  label: "Attendance",  icon: FiCheckCircle },
  { id: "timeline",    label: "Timeline",    icon: FiCalendar },
];

const DIFFICULTY_COLOR = {
  Beginner:     { bg: "#ECFDF5", color: "#059669" },
  Intermediate: { bg: "#FFFBEB", color: "#D97706" },
  Advanced:     { bg: "#FEF2F2", color: "#DC2626" },
};

export default function AdminActivityDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/dashboard/admin/samam/activities/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setActivity(null);
        else setActivity(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!activity) return notFound();

  const domain = DOMAINS[activity.domain] || DOMAINS.TEC;
  const diff   = DIFFICULTY_COLOR[activity.difficulty] || DIFFICULTY_COLOR.Beginner;
  const fillPct = Math.round(((activity.participant_count || 0) / (activity.max_seats || 1)) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">

      {/* ── Back link ── */}
      <Link
        href="/dashboard/admin/samam"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft size={13} /> Back to Dashboard
      </Link>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-1.5" style={{ backgroundColor: domain.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: domain.color }}
            >
              {activity.domain[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: domain.bg, color: domain.color }}>
                  {domain.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: diff.bg, color: diff.color }}>
                  {activity.difficulty}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {activity.code}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">{activity.title}</h1>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>

            <div className="flex-shrink-0 flex gap-2">
              <Link
                href={`/dashboard/admin/samam/activities/${id}/edit`}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiEdit3 /> Edit Activity
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SAMAM Points</p>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs"><FiAward/></span>
                {activity.sdc_credits || activity.points}
              </p>
            </div>
            {activity.hours > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <FiClock className="text-gray-400"/> {activity.hours}h
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Enrolled</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <FiUser className="text-gray-400"/> {activity.participant_count || 0} / {activity.max_seats || '∞'}
                </p>
                {activity.max_seats && (
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(fillPct,100)}%`, backgroundColor: BRAND }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-2 flex overflow-x-auto hide-scrollbar">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active ? "text-gray-900 border-gray-900" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100/50"
                }`}
              >
                <Icon size={14} className={active ? "text-gray-900" : "text-gray-400"} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "overview" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              {activity.purpose && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><FiFlag className="text-gray-400"/> Purpose</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{activity.purpose}</p>
                </div>
              )}

              {activity.learning_outcomes?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><FiTarget className="text-gray-400"/> Learning Outcomes</h3>
                  <ul className="space-y-2">
                    {activity.learning_outcomes.map((lo, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 mt-0.5 flex-shrink-0">{i+1}</span>
                        <span className="pt-0.5">{lo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Course Resources</h3>
              {activity.resources?.length > 0 ? (
                <div className="space-y-3">
                  {activity.resources.map((res, i) => (
                    <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600">
                        {res.type === 'video' ? <FiClock /> : res.type === 'github' ? <FiExternalLink /> : <FiFileText />}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{res.title}</p>
                        <p className="text-xs text-gray-500 uppercase">{res.type} • {res.size || 'Link'}</p>
                      </div>
                      <FiDownload className="text-gray-300 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resources available.</p>
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-6">Activity Timeline</h3>
              {activity.timeline?.length > 0 ? (
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {activity.timeline.map((item, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300" style={i===0 ? { borderColor: BRAND } : {}} />
                      <div className="mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No timeline available.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Faculty Details</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                {activity.faculty_name ? activity.faculty_name[0] : 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{activity.faculty_name || "Unknown Faculty"}</p>
                <p className="text-xs text-gray-500">Course Instructor</p>
              </div>
            </div>
          </div>

          {activity.competencies?.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {activity.competencies.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">{c}</span>
                ))}
              </div>
            </div>
          )}

          {activity.sdgs?.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Related SDGs</h3>
              <div className="space-y-2">
                {activity.sdgs.map((sdg, i) => (
                  <div key={i} className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block mr-2 mb-2">{sdg}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
