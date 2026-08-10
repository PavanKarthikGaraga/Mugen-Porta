"use client";
import { useState, useEffect } from "react";
import { FiCheck, FiX, FiExternalLink, FiRefreshCw, FiArrowLeft, FiInbox, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "./SharedUI";

type ActivityRow = {
  code: string;
  title: string;
  domain: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

const STATUS_BADGE: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", icon: FiClock },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: FiCheckCircle },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200", icon: FiXCircle },
};

export default function SubmissionsManager({ role = "admin" }: { role?: "admin" | "lead" | "faculty" }) {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ code: string; title: string } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/${role}/samam/submissions`);
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities || []);
      } else {
        toast.error(data.message || "Failed to load submissions");
      }
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (code: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/${role}/samam/submissions?activity=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      } else {
        toast.error(data.message || "Failed to load submissions");
      }
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const openActivity = (a: ActivityRow) => {
    setSelected({ code: a.code, title: a.title });
    fetchDetail(a.code);
  };

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    let reason = "";
    if (status === "rejected") {
      const input = prompt("Reason for rejection (student will see this and can resubmit):");
      if (!input) return;
      reason = input;
    }

    setProcessing(id);
    try {
      const res = await fetch(`/api/dashboard/${role}/samam/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (selected) fetchDetail(selected.code);
        fetchActivities();
      } else {
        toast.error(data.message || "Failed to update submission");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessing(null);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelected(null); setSubmissions([]); }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={14} /> Back to activities
          </button>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900">{selected.title}</h3>

        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          {detailLoading ? (
            <div className="p-5 text-center text-gray-500 text-[13px]">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-[13px]">No submissions for this activity yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-gray-600">Student</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Task</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">File</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Submitted</th>
                    <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub: any) => {
                    const badge = STATUS_BADGE[sub.status] || STATUS_BADGE.pending;
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50/50 align-top">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{sub.name}</p>
                          <p className="text-[11px] text-gray-500">{sub.username} • {sub.branch} • Year {sub.year}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{sub.task_title}</td>
                        <td className="px-5 py-3">
                          <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline max-w-[160px] truncate">
                            <FiExternalLink size={10} /> {sub.file_name || "View file"}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-[12px]">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${badge.className}`}>
                            <BadgeIcon size={11} /> {badge.label}
                          </span>
                          {sub.status === 'rejected' && sub.reason && (
                            <p className="text-[11px] text-gray-400 mt-1 max-w-[180px]">{sub.reason}</p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {sub.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleReview(sub.id, "approved")}
                                disabled={processing === sub.id}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleReview(sub.id, "rejected")}
                                disabled={processing === sub.id}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={fetchActivities}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-gray-500 text-[13px]">Loading submissions...</div>
        ) : activities.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-[13px] flex flex-col items-center gap-2">
            <FiInbox size={22} className="text-gray-300" />
            No task submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-600">Activity</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Domain</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Pending</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Approved</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Rejected</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-right">Total</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <tr key={a.code} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <p className="text-[11px] text-gray-500">{a.code}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{a.domain}</td>
                    <td className="px-5 py-3">
                      {Number(a.pending) > 0 ? (
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {a.pending}
                        </span>
                      ) : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{a.approved}</td>
                    <td className="px-5 py-3 text-gray-600">{a.rejected}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{a.total}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openActivity(a)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: BRAND }}
                      >
                        View Submissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
