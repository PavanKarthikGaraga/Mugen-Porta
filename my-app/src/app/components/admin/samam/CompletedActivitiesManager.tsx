"use client";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiDownload, FiRefreshCw, FiUsers, FiCalendar, FiMapPin } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND, DOMAIN_COLORS, DOMAIN_ICONS } from "./SharedUI";
import { generateActivityReportPdf } from "@/lib/activityReportPdf";


type ActivityRow = {
  code: string;
  title: string;
  domain: string;
  category: string;
  activity_date: string | null;
  venue: string;
  enrolledCount: number;
  completedCount: number;
  totalPointsAllotted: number;
  report_status: string | null;
  generated_at: string | null;
};

function formatDate(d: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CompletedActivitiesManager({ role = "admin" }: { role?: "admin" | "lead" | "faculty" | "council" }) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ code: string; title: string } | null>(null);
  const [detail, setDetail] = useState<{ activity: any; students: any[]; report: any } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const apiRole = role === "council" ? "admin" : role;
  const API = `/api/dashboard/${apiRole}/samam/completed-activities`;

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (res.ok) setActivities(data.activities || []);
      else toast.error(data.message || "Failed to load completed activities");
    } catch {
      toast.error("Failed to load completed activities");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (code: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}?activity=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok) setDetail(data);
      else toast.error(data.message || "Failed to load activity details");
    } catch {
      toast.error("Failed to load activity details");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const openActivity = (a: ActivityRow) => {
    setSelected({ code: a.code, title: a.title });
    fetchDetail(a.code);
  };

  const downloadReport = async () => {
    if (!detail?.report || !detail.activity) return;
    setDownloading(true);
    try {
      const r = detail.report;
      await generateActivityReportPdf({
        clubName: detail.activity.club_name || "",
        activityTitle: detail.activity.title || "",
        activityDate: formatDate(detail.activity.activity_date),
        facultyName: r.faculty_name || "",
        posterUrl: r.poster_url || "",
        permissionLetterUrl: r.permission_letter_url || "",
        eventParticulars: {
          activityName: detail.activity.title || "",
          organizingClub: detail.activity.club_name || "",
          academicYear: r.academic_year || "",
          facultyIncharge: [r.faculty_name, r.faculty_id].filter(Boolean).join(" - "),
          studentLead: [r.student_lead_name, r.student_lead_id].filter(Boolean).join(" - "),
          timeSlot: r.time_slot || "",
          venue: r.venue || "",
          studentsParticipated: r.students_participated ? String(r.students_participated) : "",
        },
        overview: r.overview || "",
        objectives: r.objectives || "",
        proceedings: r.proceedings || "",
        keyHighlights: r.key_highlights || "",
        learningOutcomes: r.learning_outcomes || "",
        conclusion: r.conclusion || "",
        gallery: r.gallery || [],
        attendanceSheets: r.attendance_sheets || [],
      });
      toast.success("Report downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate report PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setSelected(null); setDetail(null); }}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={14} /> Back to completed activities
        </button>

        {detailLoading ? (
          <div className="p-5 text-center text-gray-500 text-[13px]">Loading...</div>
        ) : detail ? (
          <>
            <div className="bg-white rounded-md border border-gray-200 p-5">
              <h3 className="text-[15px] font-semibold text-gray-900">{detail.activity.title}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-[12px] text-gray-500">
                <span className="flex items-center gap-1"><FiCalendar size={12} /> {formatDate(detail.activity.activity_date)}</span>
                <span className="flex items-center gap-1"><FiMapPin size={12} /> {detail.activity.venue || "—"}</span>
                <span className="flex items-center gap-1"><FiUsers size={12} /> {detail.students.length} enrolled · {detail.students.filter((s: any) => s.status === "completed").length} verified completed</span>
                <span className="font-medium text-gray-700">{detail.students.reduce((sum: number, s: any) => sum + Number(s.pointsAwarded || 0), 0)} points allotted</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                {detail.report ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <FiCheckCircle size={12} /> Report generated
                    </span>
                    {detail.report.generated_at && (
                      <span className="text-[11px] text-gray-400">on {formatDate(detail.report.generated_at)}</span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    <FiXCircle size={12} /> Report not generated yet
                  </span>
                )}
                {detail.report && (
                  <button
                    onClick={downloadReport}
                    disabled={downloading}
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                    style={{ backgroundColor: BRAND }}
                  >
                    {downloading ? <FiRefreshCw size={12} className="animate-spin" /> : <FiDownload size={12} />}
                    Download Report
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h4 className="text-[13px] font-semibold text-gray-900">Students Participated</h4>
              </div>
              {detail.students.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-[13px]">No enrollment records for this activity.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3 font-semibold text-gray-600">Student</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Branch</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Year</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Attendance</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Verification</th>
                        <th className="px-5 py-3 font-semibold text-gray-600 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.students.map((s: any) => (
                        <tr key={s.username} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900">{s.name}</p>
                            <p className="text-[11px] text-gray-500">{s.username}</p>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{s.branch}</td>
                          <td className="px-5 py-3 text-gray-600">{s.year}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                              Number(s.attendance_percentage) > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {Number(s.attendance_percentage) > 0 ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                              s.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {s.status === "completed" ? "Verified" : "Pending verification"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-gray-900">{Number(s.pointsAwarded || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  const grouped = activities.reduce((acc: Record<string, ActivityRow[]>, a) => {
    (acc[a.domain] = acc[a.domain] || []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-gray-500">Activities where attendance has been locked and verified, grouped by domain.</p>
        <button
          onClick={fetchActivities}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-5 text-center text-gray-500 text-[13px]">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="p-10 text-center text-gray-500 text-[13px] bg-white rounded-md border border-gray-200">
          No activities yet — an activity shows here once a lead locks attendance and an admin/faculty/council reviewer verifies it.
        </div>
      ) : (
        Object.entries(grouped).map(([domain, list]) => {
          const color = DOMAIN_COLORS[domain] || BRAND;
          return (
            <div key={domain} className="space-y-2">
              <div className="flex items-center gap-2">
                <span style={{ color }}>{DOMAIN_ICONS[domain]}</span>
                <h3 className="text-[13px] font-bold" style={{ color }}>{domain}</h3>
                <span className="text-[11px] text-gray-400">({list.length})</span>
              </div>
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <table className="w-full text-[13px] text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-gray-600">Activity</th>
                      <th className="px-5 py-3 font-semibold text-gray-600">Date</th>
                      <th className="px-5 py-3 font-semibold text-gray-600 text-right">Completed</th>
                      <th className="px-5 py-3 font-semibold text-gray-600 text-right">Points Allotted</th>
                      <th className="px-5 py-3 font-semibold text-gray-600">Report</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {list.map((a) => (
                      <tr key={a.code} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{a.title}</p>
                          <p className="text-[11px] text-gray-500">{a.code}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-[12px]">{formatDate(a.activity_date)}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{a.completedCount}/{a.enrolledCount}</td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900">{a.totalPointsAllotted}</td>
                        <td className="px-5 py-3">
                          {a.report_status ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FiCheckCircle size={11} /> Generated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                              <FiXCircle size={11} /> Not generated yet
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => openActivity(a)}
                            className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-white"
                            style={{ backgroundColor: BRAND }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
