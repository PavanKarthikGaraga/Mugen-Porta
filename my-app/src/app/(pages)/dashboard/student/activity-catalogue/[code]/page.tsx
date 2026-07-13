"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowLeft, FiStar, FiClock, FiUser, FiCheckCircle,
  FiBookOpen, FiFileText, FiMessageSquare, FiEdit3,
  FiCalendar, FiAward, FiTarget, FiGlobe, FiTrendingUp,
  FiDownload, FiExternalLink, FiZap, FiFlag,
} from "react-icons/fi";
import { ACTIVITIES, DOMAINS, LEVELS } from "@/app/Data/activities-mock";
import ProgressCard from "@/app/components/dashboard/ProgressCard";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { id: "overview",    label: "Overview",    icon: FiBookOpen },
  { id: "resources",   label: "Resources",   icon: FiFileText },
  { id: "assignments", label: "Assignments", icon: FiTarget },
  { id: "attendance",  label: "Attendance",  icon: FiCheckCircle },
  { id: "discussion",  label: "Discussion",  icon: FiMessageSquare },
  { id: "reflection",  label: "Reflection",  icon: FiEdit3 },
  { id: "timeline",    label: "Timeline",    icon: FiCalendar },
  { id: "mentor",      label: "Mentor",      icon: FiUser },
  { id: "impact",      label: "Impact",      icon: FiTrendingUp },
];

const DIFFICULTY_COLOR = {
  Beginner:     { bg: "#ECFDF5", color: "#059669" },
  Intermediate: { bg: "#FFFBEB", color: "#D97706" },
  Advanced:     { bg: "#FEF2F2", color: "#DC2626" },
};

export default function ActivityDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [ackChecked, setAckChecked] = useState(false);

  useEffect(() => {
    fetch(`/api/activities/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = {
            ...data.data,
            name: data.data.title,
            maxEnrollment: data.data.max_seats,
            credits: data.data.sdc_credits,
            hours: data.data.sdc_credits * 10
          };
          setActivity(mapped);
          setEnrolledCount(data.data.enrolled_count || 0);
          setReflectionText(mapped.reflection || "");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching activity:", err);
        setLoading(false);
      });

    // Check enrollment status
    fetch(`/api/activities/${code}/enroll`)
      .then(r => r.json())
      .then(d => { if (d.enrolled) setEnrolled(true); })
      .catch(() => {});
  }, [code]);

  const handleEnroll = async () => {
    if (!ackChecked) return;
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/activities/${code}/enroll`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEnrolled(true);
        setEnrolledCount(c => c + 1);
        alert(data.message);
      } else {
        alert(data.message || "Enrollment failed");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setEnrollLoading(false);
  };

  const handleUnenroll = async () => {
    if (!confirm("Are you sure you want to unenroll from this activity?")) return;
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/activities/${code}/enroll`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setEnrolled(false);
        setEnrolledCount(c => Math.max(0, c - 1));
      } else alert(data.message || "Failed");
    } catch {
      alert("Network error.");
    }
    setEnrollLoading(false);
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading activity details...</div>;
  if (!activity) return notFound();

  const domain = DOMAINS[activity.domain] || DOMAINS.TEC;
  const diff   = DIFFICULTY_COLOR[activity.difficulty] || DIFFICULTY_COLOR.Beginner;
  const currentEnrolled = enrolledCount || activity.enrolledCount || 0;
  const maxSeats = activity.maxEnrollment || activity.max_seats || 0;
  const isFull = maxSeats > 0 && currentEnrolled >= maxSeats;
  const fillPct = maxSeats > 0 ? Math.round((currentEnrolled / maxSeats) * 100) : 0;

  const handleSaveReflection = () => {
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ── Back link ── */}
      <Link
        href="/dashboard/student/activity-catalogue"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft size={13} /> Back to Catalogue
      </Link>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: domain.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            {/* Domain icon */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: domain.color }}
            >
              {activity.domain[0]}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges */}
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
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">{activity.name}</h1>
              <p className="text-sm text-gray-500">{activity.purpose}</p>
            </div>

            {/* Enroll CTA */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {enrolled ? (
                <>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                    <FiCheckCircle size={15} /> Enrolled
                  </span>
                  <button
                    onClick={handleUnenroll}
                    disabled={enrollLoading}
                    className="text-xs text-gray-500 underline hover:text-red-600 transition-colors"
                  >
                    {enrollLoading ? "Please wait..." : "Unenroll"}
                  </button>
                </>
              ) : isFull ? (
                <button disabled className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gray-400 cursor-not-allowed">
                  Activity Full
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-start gap-2 text-[10px] text-gray-500 max-w-[200px] text-right cursor-pointer group">
                    <span className="flex-1">I acknowledge the terms and commitments required.</span>
                    <input 
                      type="checkbox" 
                      className="mt-0.5 rounded border-gray-300 text-[rgb(151,0,3)] focus:ring-[rgb(151,0,3)] cursor-pointer"
                      checked={ackChecked}
                      onChange={(e) => setAckChecked(e.target.checked)}
                    />
                  </label>
                  <button
                    onClick={handleEnroll}
                    disabled={enrollLoading || !ackChecked}
                    className={`px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                      ackChecked ? "hover:opacity-90 cursor-pointer" : "opacity-50 cursor-not-allowed"
                    }`}
                    style={{ backgroundColor: BRAND }}
                  >
                    {enrollLoading ? "Enrolling..." : "Enroll Now"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "SAMAM Points", value: activity.credits, icon: <FiStar size={14} style={{ color: BRAND }} /> },
              { label: "Duration",    value: `${activity.hours}h`, icon: <FiClock size={14} className="text-blue-500" /> },
              { label: "Enrolled",    value: `${currentEnrolled}/${maxSeats || "∞"}`, icon: <FiUser size={14} className="text-gray-400" /> },
              { label: "Badge",       value: activity.badge, icon: <FiAward size={14} className="text-amber-500" /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                {s.icon}
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enrollment progress */}
          <div className="mt-4">
            <ProgressCard label="Seats filled" value={fillPct} color={domain.color} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-current font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
                style={activeTab === tab.id ? { color: BRAND, borderColor: BRAND } : {}}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <Section title="Purpose">
                <p className="text-sm text-gray-700 leading-relaxed">{activity.purpose}</p>
              </Section>
              <Section title="Learning Outcomes">
                <ul className="space-y-2">
                  {activity.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold" style={{ backgroundColor: BRAND }}>
                        {i + 1}
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </Section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Section title="Competencies Developed">
                  <div className="flex flex-wrap gap-2">
                    {activity.competencies.map((c) => (
                      <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {c}
                      </span>
                    ))}
                  </div>
                </Section>
                <Section title="Graduate Attributes">
                  <div className="flex flex-wrap gap-2">
                    {activity.ga.map((g) => (
                      <span key={g} className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        {g}
                      </span>
                    ))}
                  </div>
                </Section>
              </div>
              <Section title="Sustainable Development Goals">
                <div className="flex flex-wrap gap-2">
                  {activity.sdgs.map((sdg) => (
                    <span key={sdg} className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🌍 SDG {sdg}
                    </span>
                  ))}
                </div>
              </Section>
              <Section title="National Mission Alignment">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-fit">
                  <FiFlag size={11} /> {activity.nationalMission}
                </span>
              </Section>
            </div>
          )}

          {/* RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-3">
              {activity.resources.map((r) => {
                const iconMap = { pdf: "📄", video: "🎬", link: "🔗" };
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{iconMap[r.type] || "📎"}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{r.type} resource</p>
                      </div>
                    </div>
                    <a
                      href={r.url}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      {r.type === "pdf" ? <FiDownload size={12} /> : <FiExternalLink size={12} />}
                      {r.type === "pdf" ? "Download" : "Open"}
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <div className="space-y-3">
              {activity.assignments.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 border rounded-xl ${a.submitted ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Due: {a.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.grade && (
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {a.grade}
                        </span>
                      )}
                      {a.submitted ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <FiCheckCircle size={13} /> Submitted
                        </span>
                      ) : (
                        <button
                          className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                          style={{ backgroundColor: BRAND }}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-xl text-center">
                <p className="text-4xl font-bold" style={{ color: BRAND }}>{activity.userAttendance}%</p>
                <p className="text-sm text-gray-500 mt-1">Attendance recorded</p>
              </div>
              <ProgressCard
                label="Attendance progress"
                value={activity.userAttendance}
                color={activity.userAttendance >= 75 ? "#059669" : BRAND}
                sublabel={activity.userAttendance < 75 ? "⚠️ Minimum 75% required for certificate" : "✅ Eligible for certificate"}
              />
              <p className="text-xs text-gray-400 text-center">
                Attendance is recorded by the mentor at each session.
              </p>
            </div>
          )}

          {/* DISCUSSION */}
          {activeTab === "discussion" && (
            <div className="space-y-3">
              {[
                { user:"Ananya K.", time:"2 days ago", message:"Has anyone tried the additional resource links? The 3rd one is really helpful for understanding the concepts." },
                { user:"Rahul M.",  time:"1 day ago",  message:"Yes! I found the handbook especially useful. Also, does anyone know if the final submission needs to be in a specific format?" },
                { user:"Priya S.", time:"5 hours ago", message:"Mentor mentioned it should be a PDF with max 5 pages. Check the announcement section." },
              ].map((msg, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>
                    {msg.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-gray-900">{msg.user}</p>
                      <p className="text-[10px] text-gray-400">{msg.time}</p>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add to discussion…"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1"
                  style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                />
                <button className="px-4 text-xs font-medium text-white rounded-lg" style={{ backgroundColor: BRAND }}>
                  Post
                </button>
              </div>
            </div>
          )}

          {/* REFLECTION */}
          {activeTab === "reflection" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                <p className="text-xs font-semibold text-amber-800 mb-1">Reflection Prompt</p>
                <p className="text-sm text-amber-900 font-medium">
                  &ldquo;What was the most significant thing you learned from this activity, and how will you apply it in your life?&rdquo;
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Your Reflection</label>
                <textarea
                  rows={8}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Share your thoughts, learnings, and how this activity impacted you…"
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 resize-none leading-relaxed"
                  style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{reflectionText.length} characters</span>
                  <button
                    onClick={handleSaveReflection}
                    className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: BRAND }}
                  >
                    {reflectionSaved ? <><FiCheckCircle size={12} /> Saved!</> : <><FiEdit3 size={12} /> Save Reflection</>}
                  </button>
                </div>
              </div>
              {activity.facultyFeedback && (
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Mentor Feedback</p>
                  <p className="text-sm text-blue-900 leading-relaxed">{activity.facultyFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {activity.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-white z-10"
                      style={{ borderColor: BRAND, color: BRAND }}
                    >
                      {i + 1}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-gray-900">{t.event}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENTOR */}
          {activeTab === "mentor" && (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiUser size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Mentor Not Assigned Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                A mentor will be assigned soon. Please check back later when the administration updates the event details.
              </p>
            </div>
          )}

          {/* IMPACT */}
          {activeTab === "impact" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Career Impact",  icon: "💼", color: "#2563EB", bg: "#EFF6FF", text: `This activity directly builds ${activity.competencies[0]} and ${activity.competencies[1]}, both critical for ${activity.career[0]} career path. 87% of students who completed this reported improved interview performance.` },
                { title: "Life Impact",    icon: "🌱", color: "#059669", bg: "#ECFDF5", text: `Develops ${activity.ga[0] || "communication"} and personal resilience. Participants report improved confidence, time management, and ability to work in diverse teams.` },
                { title: "Societal Impact",icon: "🌍", color: "#7C3AED", bg: "#F5F3FF", text: `Aligned with ${activity.sdgs.slice(0, 3).map(s => `SDG ${s}`).join(", ")}. Each participant contributes to ${activity.nationalMission} by developing skills that drive national growth.` },
              ].map((card) => (
                <div
                  key={card.title}
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: card.bg, borderColor: `${card.color}30` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{card.icon}</span>
                    <h4 className="text-sm font-bold" style={{ color: card.color }}>{card.title}</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Local helper ──────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}
