"use client";
import { useState, useEffect, useCallback } from "react";
import { FiAward, FiBarChart2, FiUsers, FiActivity, FiStar, FiSettings, FiBriefcase, FiTarget, FiFileText, FiBell } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "@/app/components/admin/samam/SharedUI";
import AnalyticsView from "@/app/components/admin/samam/AnalyticsView";
import StudentManager from "@/app/components/admin/samam/StudentManager";
import ActivityManager from "@/app/components/admin/samam/ActivityManager";
import BadgeManager from "@/app/components/admin/samam/BadgeManager";
import SubmissionsManager from "@/app/components/admin/samam/SubmissionsManager";
import NotificationsManager from "@/app/components/admin/samam/NotificationsManager";
import SettingsManager from "@/app/components/admin/samam/SettingsManager";

const TABS: { key: string, label: string, icon: React.ReactNode, disabled?: boolean }[] = [
  { key: "analytics", label: "Overview", icon: <FiBarChart2 size={15} /> },
  { key: "students",  label: "Students",  icon: <FiUsers size={15} />     },
  { key: "activities",label: "Activities",icon: <FiActivity size={15} />  },
  { key: "awards",    label: "Recognitions", icon: <FiAward size={15} />      },
  { key: "submissions",label: "Submissions",icon: <FiFileText size={15} /> },
  { key: "notifications",label: "Notifications",icon: <FiBell size={15} /> },
  { key: "settings",label: "Settings",icon: <FiSettings size={15} /> },
];

export default function SamamAdminPage() {
  const [tab, setTab] = useState("analytics");

  /* ── Analytics ── */
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  /* ── Students ── */
  const [students, setStudents] = useState<any[]>([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterYear, setFilterYear]   = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Activities ── */
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [actSearchStr, setActSearchStr] = useState("");

  /* ── Awards ── */
  const [badgeCatalog, setBadgeCatalog] = useState<any[]>([]);
  const [pointsForm, setPointsForm] = useState({ username: "", points: "", domain: "TEC", reason: "", category: "admin_award" });
  const [badgeForm, setBadgeForm] = useState({ username: "", badge_id: "", reason: "" });
  const [awardHistory, setAwardHistory] = useState<any[]>([]);
  const [awardLoading, setAwardLoading] = useState(false);

  /* ── Fetch analytics ── */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam-stats");
      if (res.ok) setAnalytics(await res.json());
    } finally { setAnalyticsLoading(false); }
  }, []);

  /* ── Fetch students ── */
  const fetchStudents = useCallback(async (page = 1) => {
    setStudentsLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: "20" });
      if (search)      q.set("search", search);
      if (filterLevel) q.set("level",  filterLevel);
      if (filterYear)  q.set("year",   filterYear);
      const res = await fetch(`/api/dashboard/admin/samam/students?${q}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setStudentsTotal(data.total || 0);
        setStudentsPage(page);
      }
    } finally { setStudentsLoading(false); }
  }, [search, filterLevel, filterYear]);

  /* ── Fetch student detail ── */
  const fetchStudentDetail = useCallback(async (username: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/students/${username}`);
      if (res.ok) setStudentDetail(await res.json());
    } finally { setDetailLoading(false); }
  }, []);

  /* ── Fetch activities ── */
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/activities");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally { setActivitiesLoading(false); }
  }, []);

  /* ── Fetch badge catalog ── */
  const fetchBadgeCatalog = useCallback(async () => {
    const res = await fetch("/api/dashboard/admin/samam/award-badge");
    if (res.ok) setBadgeCatalog((await res.json()).badges || []);
  }, []);

  /* ── Initial loads ── */
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  useEffect(() => { if (tab === "students") fetchStudents(1); }, [tab, fetchStudents]);
  useEffect(() => { if (tab === "activities") fetchActivities(); }, [tab, fetchActivities]);
  useEffect(() => { if (tab === "awards") fetchBadgeCatalog(); }, [tab, fetchBadgeCatalog]);

  /* ── Handlers ── */
  const openStudent = async (s: any) => {
    setSelectedStudent(s);
    setStudentDetail(null);
    await fetchStudentDetail(s.username);
  };

  const deleteActivity = async (id: number) => {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/dashboard/admin/samam/activities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchActivities(); }
    else toast.error(data.message || "Failed");
  };

  const awardPoints = async () => {
    setAwardLoading(true);
    const res = await fetch("/api/dashboard/admin/samam/award-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pointsForm, points: Number(pointsForm.points) }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setPointsForm({ username: "", points: "", domain: "TEC", reason: "", category: "admin_award" });
      setAwardHistory(prev => [{ type: "points", ...pointsForm, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } else toast.error(data.message || "Failed");
    setAwardLoading(false);
  };

  const awardBadge = async () => {
    setAwardLoading(true);
    const res = await fetch("/api/dashboard/admin/samam/award-badge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badgeForm),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setBadgeForm({ username: "", badge_id: "", reason: "" });
      setAwardHistory(prev => [{ type: "badge", ...badgeForm, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } else toast.error(data.message || "Failed");
    setAwardLoading(false);
  };

  const filteredActivities = activities.filter(a =>
    !actSearchStr || a.title?.toLowerCase().includes(actSearchStr.toLowerCase()) || a.code?.toLowerCase().includes(actSearchStr.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-gray-900">SAMAM Control</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Student Activity Management · Admin Console</p>
      </div>

      {/* HORIZONTAL TAB BAR */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-4 overflow-x-auto">
        <nav className="flex items-center gap-0.5 px-3 py-1.5 min-w-max">
          {TABS.map(t => (
            <button
              key={t.key}
              disabled={t.disabled}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "bg-gray-900 text-white"
                  : t.disabled
                    ? "opacity-40 cursor-not-allowed text-gray-400"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={tab === t.key ? "text-white" : "text-gray-400"}>
                {t.icon}
              </span>
              {t.label}
              {t.disabled && (
                <span className="text-[9px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-sm text-gray-500 font-bold tracking-wider ml-0.5">
                  SOON
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        {tab === "analytics" && (
          <AnalyticsView
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            setTab={setTab}
            openStudent={openStudent}
          />
        )}

        {tab === "students" && (
          <StudentManager
            students={students} studentsTotal={studentsTotal} studentsPage={studentsPage} studentsLoading={studentsLoading}
            search={search} setSearch={setSearch} filterLevel={filterLevel} setFilterLevel={setFilterLevel} filterYear={filterYear} setFilterYear={setFilterYear} fetchStudents={fetchStudents}
            selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} studentDetail={studentDetail} setStudentDetail={setStudentDetail} detailLoading={detailLoading} openStudent={openStudent}
            setTab={setTab} setPointsForm={setPointsForm} setBadgeForm={setBadgeForm}
          />
        )}

        {tab === "activities" && (
          <ActivityManager
            actSearchStr={actSearchStr} setActSearchStr={setActSearchStr} fetchActivities={fetchActivities}
            activitiesLoading={activitiesLoading} filteredActivities={filteredActivities} deleteActivity={deleteActivity}
          />
        )}

        {tab === "awards" && (
          <BadgeManager
            badgeCatalog={badgeCatalog} pointsForm={pointsForm} setPointsForm={setPointsForm} badgeForm={badgeForm} setBadgeForm={setBadgeForm}
            awardPoints={awardPoints} awardBadge={awardBadge} awardHistory={awardHistory} awardLoading={awardLoading}
          />
        )}

        {tab === "submissions" && <SubmissionsManager />}
        {tab === "notifications" && <NotificationsManager />}
        {tab === "settings" && <SettingsManager />}
      </div>

    </div>
  );
}
