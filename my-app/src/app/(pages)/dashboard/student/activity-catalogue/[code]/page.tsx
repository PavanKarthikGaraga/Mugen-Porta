"use client";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowLeft, FiStar, FiUser, FiCheckCircle,
  FiBookOpen, FiFileText, FiMessageSquare, FiEdit3,
  FiCalendar, FiAward, FiTarget, FiGlobe, FiTrendingUp,
  FiDownload, FiExternalLink, FiZap, FiFlag, FiVideo, FiLink,
  FiAlertTriangle, FiBriefcase, FiHeart, FiClock, FiLock, FiInbox, FiMapPin, FiXCircle
} from "react-icons/fi";
import { toast } from "sonner";
import { DOMAINS, SDG_MAP } from "@/app/Data/activities-mock";
import { formatActivityDate, formatTimeRange } from "@/lib/formatSchedule";
import ProgressCard from "@/app/components/dashboard/ProgressCard";
import EnrollModal from "@/app/components/dashboard/EnrollModal";

const BRAND = "rgb(151,0,3)";

const TABS = [
  { id: "overview",    label: "Overview",    icon: FiBookOpen },
  { id: "resources",   label: "Resources",   icon: FiFileText },
  { id: "assignments", label: "Tasks", icon: FiTarget },
  { id: "attendance",  label: "Attendance",  icon: FiCheckCircle },
  { id: "discussion",  label: "Discussion",  icon: FiMessageSquare },
  { id: "reflection",  label: "Reflection",  icon: FiEdit3 },
  { id: "timeline",    label: "Timeline",    icon: FiCalendar },
  { id: "impact",      label: "Impact",      icon: FiTrendingUp },
];

const DIFFICULTY_COLOR = {
  Beginner:     { bg: "#ECFDF5", color: "#059669" },
  Intermediate: { bg: "#FFFBEB", color: "#D97706" },
  Advanced:     { bg: "#FEF2F2", color: "#DC2626" },
};

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function getTaskWindow(a: any): { start: Date | null; end: Date | null } {
  const start = a.startDate ? new Date(`${a.startDate}T${a.startTime || "00:00"}:00`) : null;
  const end = a.endDate ? new Date(`${a.endDate}T${a.endTime || "23:59"}:00`) : (a.dueDate ? new Date(`${a.dueDate}T23:59:00`) : null);
  return { start, end };
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function TaskTimer({ target, label, color }: { target: Date; label: string; color: string }) {
  const [ms, setMs] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setMs(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <FiClock size={12} />
      {label}: <span className="font-mono">{fmtCountdown(Math.max(0, ms))}</span>
    </div>
  );
}

export default function ActivityDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Discussion state
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Assignment submissions (real, persisted via R2 upload + DB record)
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchSubmissions = useCallback(() => {
    fetch(`/api/activities/${code}/submissions`)
      .then(r => r.json())
      .then(d => { if (d.success) setSubmissions(d.submissions || {}); })
      .catch(() => {});
  }, [code]);

  useEffect(() => {
    fetch(`/api/activities/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = {
            ...data.data,
            name: data.data.title,
            enrolledCount: data.data.enrolledCount || 0,
            maxEnrollment: data.data.max_seats,
            credits: data.data.sdc_credits,
          };
          setActivity(mapped);
          setReflectionText(mapped.reflection || "");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching activity:", err);
        setLoading(false);
      });

    fetch(`/api/activities/${code}/enroll`)
      .then(r => r.json())
      .then(d => {
        if (d.enrolled) {
          setEnrolled(true);
          setActivity((prev: any) => prev ? { ...prev, userAttendance: d.userAttendance, attendanceStatus: d.attendanceStatus } : prev);
          fetchSubmissions();
        }
      })
      .catch(() => {});
  }, [code, fetchSubmissions]);

  useEffect(() => {
    if (activeTab === "discussion" && code) {
      fetch(`/api/activities/${code}/discussion`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setDiscussions(d.messages);
        })
        .catch(err => console.error("Error fetching discussions:", err));
    }
  }, [activeTab, code]);

  const handlePostDiscussion = async () => {
    if (!newDiscussion.trim()) return;
    setPostingDiscussion(true);
    try {
      const res = await fetch(`/api/activities/${code}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newDiscussion })
      });
      const data = await res.json();
      if (data.success) {
        setNewDiscussion("");
        // Re-fetch discussions
        const updated = await fetch(`/api/activities/${code}/discussion`).then(r => r.json());
        if (updated.success) setDiscussions(updated.messages);
      }
    } catch (err) {
      console.error("Error posting discussion:", err);
    }
    setPostingDiscussion(false);
  };

  const handleEnroll = async () => {
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
    setEnrollModalOpen(false);
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


  const MAX_UPLOAD_MB = 8;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  const handleAssignmentSubmit = async (id: string) => {
    if (!selectedFile) {
      toast.error("Please choose a file to upload first.");
      return;
    }
    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      toast.error(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    setSubmittingAssignment(true);
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

      if (!uploadRes.ok) {
        if (uploadRes.status === 413) {
          toast.error(`File too large for the server. Please use a file under ${MAX_UPLOAD_MB} MB.`);
          return;
        }
        const uploadData = await uploadRes.json().catch(() => ({}));
        toast.error(uploadData.error || `Upload failed (${uploadRes.status})`);
        return;
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.url) {
        toast.error("Upload failed — no URL returned.");
        return;
      }
      setUploadingFile(false);

      const res = await fetch(`/api/activities/${code}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: String(id), fileUrl: uploadData.url, fileName: selectedFile.name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to record submission");
        return;
      }

      toast.success("Assignment submitted successfully!");
      setSubmissions((prev) => ({
        ...prev,
        [String(id)]: { fileUrl: uploadData.url, fileName: selectedFile.name, submittedAt: new Date().toISOString(), status: "pending", reason: null },
      }));
      setSelectedTask(null);
      setSelectedFile(null);
    } catch (err) {
      toast.error("Network error while submitting. Please try again.");
    } finally {
      setSubmittingAssignment(false);
      setUploadingFile(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading activity details...</div>;
  if (!activity) return notFound();

  const domain = DOMAINS[activity.domain] || DOMAINS.TEC;
  const diff   = DIFFICULTY_COLOR[activity.difficulty] || DIFFICULTY_COLOR.Beginner;
  const currentEnrolled = enrolledCount || activity.enrolledCount || 0;
  const maxSeats = activity.maxEnrollment || activity.max_seats || 0;
  const scheduleDate = formatActivityDate(activity.activity_date);
  const scheduleTime = formatTimeRange(activity.start_time, activity.end_time);
  const isFull = maxSeats > 0 && currentEnrolled >= maxSeats;
  const fillPct = maxSeats > 0 ? Math.round((currentEnrolled / maxSeats) * 100) : 0;
  const isRegistrationOpen = activity.registration_open !== 0;
  const isCompleted = activity.status === 'completed' || activity.approval_status === 'completed' || !!activity.is_attendance_locked;

  const handleSaveReflection = () => {
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link
        href="/dashboard/student/activity-catalogue"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft size={13} /> Back to Catalogue
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">{activity.name}</h1>
              <p className="text-sm text-gray-500">{activity.purpose}</p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {isCompleted ? (
                <button disabled className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-emerald-500 cursor-not-allowed">
                  Completed
                </button>
              ) : enrolled ? (
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
              ) : !isRegistrationOpen ? (
                <div className="relative">
                  <button disabled className="peer px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gray-400 cursor-not-allowed">
                    Enroll Now
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-sm">
                    Registrations not open yet
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ) : isFull ? (
                <button disabled className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg bg-gray-400 cursor-not-allowed">
                  Activity Full
                </button>
              ) : (
                <button
                  onClick={() => setEnrollModalOpen(true)}
                  disabled={enrollLoading}
                  className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  {enrollLoading ? "Enrolling..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>

          <EnrollModal
            isOpen={enrollModalOpen}
            onClose={() => setEnrollModalOpen(false)}
            onConfirm={handleEnroll}
            activityName={activity.name}
            loading={enrollLoading}
          />

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "SAMAM Points", value: activity.credits, icon: <FiStar size={14} style={{ color: BRAND }} /> },
              { label: "Enrolled",    value: `${currentEnrolled}/${maxSeats || "∞"}`, icon: <FiUser size={14} className="text-gray-400" /> },
              { label: "Badge",       value: activity.badge, icon: <FiAward size={14} className="text-amber-500" /> },
              // Schedule tiles only appear once the organiser has filled them in and registrations are open.
              ...(isRegistrationOpen && scheduleDate ? [{ label: "Date", value: scheduleDate, icon: <FiCalendar size={14} className="text-gray-400" /> }] : []),
              ...(isRegistrationOpen && scheduleTime ? [{ label: "Time", value: scheduleTime, icon: <FiClock size={14} className="text-gray-400" /> }] : []),
              ...(isRegistrationOpen && activity.venue ? [{ label: "Venue", value: activity.venue, icon: <FiMapPin size={14} className="text-gray-400" /> }] : []),
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                {s.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-bold text-gray-900 break-words">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <ProgressCard label="Seats filled" value={fillPct} color={domain.color} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.filter(tab => {
              if (tab.id === 'timeline' && (!activity.timeline || activity.timeline.length === 0)) return false;
              return enrolled || ["overview", "timeline", "impact"].includes(tab.id);
            }).map((tab) => (
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

        <div className="p-6">
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
              
              {activity.timeline && activity.timeline.length > 0 && (
                <Section title="Activity Syllabus & Topics">
                  <ul className="space-y-3">
                    {activity.timeline.map((t: any, i: number) => {
                      const topicText = typeof t === 'string' ? t : (t.topic || t.event || t.activity || t.title);
                      const timeText = typeof t === 'object' ? (t.time || t.date) : null;
                      if (!topicText) return null;
                      return (
                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="mt-0.5 w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-white border font-bold text-xs" style={{ borderColor: BRAND, color: BRAND }}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            {timeText && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{timeText}</p>}
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{topicText}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              )}
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
                <div className="flex flex-col gap-2">
                  {activity.sdgs.map((sdg) => (
                    <span key={sdg} className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 w-fit">
                      <FiGlobe size={14} className="text-emerald-500" />
                      SDG {sdg}: <span className="font-medium">{SDG_MAP[sdg] || "Sustainable Goal"}</span>
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

          {activeTab === "resources" && (
            <div className="space-y-3">
              {(!activity.resources || activity.resources.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <FiFileText size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No resources added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your club lead will add study materials, PDFs, and links here.</p>
                </div>
              ) : (
                activity.resources.map((r: any) => {
                  const IconComponent = r.type === "pdf" ? FiFileText : r.type === "video" ? FiVideo : FiLink;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.type === "pdf" ? "bg-red-50" : r.type === "video" ? "bg-blue-50" : "bg-gray-100"}`}>
                          <IconComponent size={18} className={r.type === "pdf" ? "text-red-500" : r.type === "video" ? "text-blue-500" : "text-gray-500"} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{r.type} resource</p>
                        </div>
                      </div>
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          {r.type === "pdf" ? <FiDownload size={12} /> : <FiExternalLink size={12} />}
                          {r.type === "pdf" ? "Download" : "Open"}
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TASKS */}
          {activeTab === "assignments" && (
            <div className="space-y-3">
              {(!activity.assignments || activity.assignments.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <FiInbox size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No tasks yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your club lead will assign tasks here. Check back soon.</p>
                </div>
              ) : (
                activity.assignments.map((a: any) => {
                  const submission = submissions[String(a.id)];
                  const isSubmitted = !!submission;
                  const submissionStatus = submission?.status || null; // 'pending' | 'approved' | 'rejected'
                  const { start, end } = getTaskWindow(a);
                  const now = new Date();
                  const notYetOpen = start && now < start;
                  const closed = end && now > end;
                  const isOpen = !notYetOpen && !closed;

                  return (
                    <div
                      key={a.id}
                      className={`p-4 border rounded-xl ${
                        submissionStatus === "rejected" ? "border-red-200 bg-red-50/30"
                        : isSubmitted ? "border-emerald-200 bg-emerald-50/30"
                        : notYetOpen ? "border-amber-200 bg-amber-50/20"
                        : closed ? "border-gray-200 bg-gray-50/50 opacity-70"
                        : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                          {a.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.description}</p>}

                          {/* Window info */}
                          <div className="flex flex-wrap gap-3 mt-2">
                            {start && (
                              <span className="text-[11px] text-gray-400">
                                Opens: {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                            {end && (
                              <span className="text-[11px] text-gray-400">
                                Deadline: {end.toLocaleDateString()} {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          {/* Timer */}
                          <div className="mt-1.5">
                            {notYetOpen && start && (
                              <TaskTimer target={start} label="Opens in" color="#D97706" />
                            )}
                            {isOpen && end && !isSubmitted && (
                              <TaskTimer target={end} label="Closes in" color={BRAND} />
                            )}
                            {closed && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                                <FiLock size={11} /> Submission closed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {a.grade && (
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              {a.grade}
                            </span>
                          )}
                          {isSubmitted ? (
                            <div className="flex flex-col items-end gap-1">
                              {submissionStatus === "approved" ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                                  <FiCheckCircle size={13} /> Approved
                                </span>
                              ) : submissionStatus === "rejected" ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-red-700">
                                  <FiXCircle size={13} /> Rejected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
                                  <FiClock size={13} /> Pending Review
                                </span>
                              )}
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline truncate max-w-[160px]"
                              >
                                {submission.fileName || "View file"}
                              </a>
                              {submissionStatus === "rejected" && submission.reason && (
                                <p className="text-[11px] text-red-600 max-w-[160px] text-right">{submission.reason}</p>
                              )}
                              {submissionStatus === "rejected" && isOpen && (
                                <button onClick={() => setSelectedTask(a)} className="text-[11px] text-gray-500 hover:text-gray-800 underline">
                                  Resubmit
                                </button>
                              )}
                            </div>
                          ) : isOpen ? (
                            <button
                              onClick={() => setSelectedTask(a)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                              style={{ backgroundColor: BRAND }}
                            >
                              Submit
                            </button>
                          ) : notYetOpen ? (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                              <FiClock size={11} /> Not open yet
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 font-medium flex items-center gap-1">
                              <FiLock size={11} /> Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              {activity.attendanceStatus === 'rejected' ? (
                <div className="p-8 bg-gray-50 rounded-xl text-center flex flex-col items-center gap-3">
                  <FiAlertTriangle size={28} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-bold text-gray-700">Attendance Rejected</p>
                    <p className="text-sm text-gray-500 mt-1">Faculty rejected the submitted attendance. Contact your lead.</p>
                  </div>
                </div>
              ) : activity.attendanceStatus === 'pending' ? (
                <div className="p-8 bg-gray-50 rounded-xl text-center flex flex-col items-center gap-3">
                  <FiClock size={28} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-bold text-gray-700">Pending Approval</p>
                    <p className="text-sm text-gray-500 mt-1">Attendance is being verified by faculty.</p>
                  </div>
                </div>
              ) : (activity.userAttendance === null || activity.userAttendance === undefined) ? (
                <div className="p-8 bg-gray-50 rounded-xl text-center flex flex-col items-center gap-3">
                  <FiCalendar size={28} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-bold text-gray-700">Attendance Not Yet Taken</p>
                    <p className="text-sm text-gray-500 mt-1">Your mentor hasn&apos;t recorded attendance for this session yet.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-5 bg-gray-50 rounded-xl text-center">
                    <p className="text-4xl font-bold" style={{ color: BRAND }}>{activity.userAttendance}%</p>
                    <p className="text-sm text-gray-500 mt-1">Attendance recorded</p>
                  </div>
                  <ProgressCard
                    label="Attendance progress"
                    value={activity.userAttendance}
                    color={activity.userAttendance >= 75 ? "#059669" : BRAND}
                    sublabel={
                      <span className="flex items-center gap-1">
                        {activity.userAttendance < 75
                          ? <><FiAlertTriangle size={11} /> Minimum 75% required for certificate</>
                          : <><FiCheckCircle size={11} /> Eligible for certificate</>}
                      </span>
                    }
                  />
                  <p className="text-xs text-gray-400 text-center">
                    Attendance is recorded by the mentor at each session.
                  </p>
                </>
              )}
            </div>
          )}

          {/* DISCUSSION */}
          {activeTab === "discussion" && (
            <div className="space-y-3">
              {discussions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-xl">
                  No discussions yet. Start the conversation!
                </div>
              ) : (
                discussions.map((msg, i) => (
                  <div key={msg.id || i} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
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
                ))
              )}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add to discussion…"
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostDiscussion()}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1"
                  style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                  disabled={postingDiscussion}
                />
                <button 
                  onClick={handlePostDiscussion}
                  disabled={postingDiscussion || !newDiscussion.trim()}
                  className="px-4 text-xs font-medium text-white rounded-lg disabled:opacity-50" 
                  style={{ backgroundColor: BRAND }}
                >
                  {postingDiscussion ? "Posting..." : "Post"}
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
                {activity.timeline.map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-white z-10"
                      style={{ borderColor: BRAND, color: BRAND }}
                    >
                      {i + 1}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-semibold text-gray-900">{typeof t === 'string' ? t : (t.event || t.topic)}</p>
                      {t.date && <p className="text-xs text-gray-400">{t.date}</p>}
                      {t.week && <p className="text-xs text-gray-400">Week {t.week}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMPACT */}
          {activeTab === "impact" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Career Impact",  icon: FiBriefcase, color: "#2563EB", bg: "#EFF6FF", text: `This activity directly builds ${activity.competencies[0]} and ${activity.competencies[1]}, both critical for ${activity.career[0]} career path. 87% of students who completed this reported improved interview performance.` },
                { title: "Life Impact",    icon: FiHeart,     color: "#059669", bg: "#ECFDF5", text: `Develops ${activity.ga[0] || "communication"} and personal resilience. Participants report improved confidence, time management, and ability to work in diverse teams.` },
                { title: "Societal Impact",icon: FiGlobe,     color: "#7C3AED", bg: "#F5F3FF", text: `Aligned with ${activity.sdgs.slice(0, 3).map(s => `SDG ${s}`).join(", ")}. Each participant contributes to ${activity.nationalMission} by developing skills that drive national growth.` },
              ].map((card) => (
                <div
                  key={card.title}
                  className="p-4 rounded-xl border"
                  style={{ backgroundColor: card.bg, borderColor: `${card.color}30` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: card.color }}><card.icon size={18} /></span>
                    <h4 className="text-sm font-bold" style={{ color: card.color }}>{card.title}</h4>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TASK SUBMISSION MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                {(() => {
                  const { end } = getTaskWindow(selectedTask);
                  return end ? (
                    <div className="mt-1"><TaskTimer target={end} label="Deadline" color={BRAND} /></div>
                  ) : selectedTask.dueDate ? (
                    <p className="text-sm text-gray-500 mt-1">Due: {selectedTask.dueDate}</p>
                  ) : null;
                })()}
              </div>
              <button
                onClick={() => { setSelectedTask(null); setSelectedFile(null); }}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="bg-white p-4 rounded-xl border mb-6 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedTask.description || "Please complete the task as described by your mentor and submit your work below. Ensure your submission is formatted correctly."}
                </p>
              </div>

              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Upload your work</label>
              <label className="flex items-center gap-2 w-full p-3 mb-4 border-2 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors text-sm text-gray-600">
                <FiFileText size={16} className="text-gray-400 flex-shrink-0" />
                <span className="truncate flex-1">
                  {selectedFile
                    ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                    : "Choose a file — PDF, Word, PPT, image… max 8 MB"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.pdf,.txt"
                  className="hidden"
                  disabled={submittingAssignment}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </label>

              <button
                onClick={() => handleAssignmentSubmit(selectedTask.id)}
                disabled={submittingAssignment || !selectedFile}
                className="w-full py-3 rounded-xl text-white font-bold transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND }}
              >
                {submittingAssignment ? (uploadingFile ? "Uploading file…" : "Submitting…") : "Submit Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// End of file
