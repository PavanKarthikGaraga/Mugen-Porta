"use client";
import { useState, useEffect } from "react";
import { FiCheck, FiX, FiRefreshCw, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending_approval: { label: "Pending",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected:         { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function ActivityApprovalsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending_approval" | "rejected">("pending_approval");
  const [rejectModal, setRejectModal] = useState<{ id: number; title: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/dashboard/admin/activity-approvals")
      .then(r => r.json())
      .then(d => {
        if (d.success) setActivities(d.activities);
        else toast.error("Failed to load");
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: number, title: string) => {
    setProcessing(id);
    try {
      const res = await fetch("/api/dashboard/admin/activity-approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`"${title}" approved and now live`);
        setActivities(prev => prev.filter(a => a.id !== id));
      } else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      const res = await fetch("/api/dashboard/admin/activity-approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectModal.id, action: "reject", rejectionNote: rejectNote }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`"${rejectModal.title}" rejected`);
        load();
      } else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    setProcessing(null);
    setRejectModal(null);
    setRejectNote("");
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Permanently delete "${title}"?`)) return;
    setProcessing(id);
    try {
      const res = await fetch("/api/dashboard/admin/activity-approvals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Deleted");
        setActivities(prev => prev.filter(a => a.id !== id));
      } else toast.error(d.error || "Failed");
    } catch { toast.error("Failed"); }
    setProcessing(null);
  };

  const filtered = activities.filter(a => a.approval_status === tab);
  const pendingCount = activities.filter(a => a.approval_status === "pending_approval").length;
  const rejectedCount = activities.filter(a => a.approval_status === "rejected").length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve activities submitted by club leads.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "pending_approval", label: "Pending", count: pendingCount, Icon: FiClock, color: "#D97706" },
          { key: "rejected",         label: "Rejected", count: rejectedCount, Icon: FiAlertCircle, color: "#DC2626" },
        ] as const).map(({ key, label, count, Icon, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              tab === key ? "bg-white shadow-sm border-gray-200 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} style={{ color }} />
            {label}
            {count > 0 && (
              <span className="w-5 h-5 text-[10px] font-bold rounded-full text-white flex items-center justify-center" style={{ backgroundColor: color }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <FiCheckCircle size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">
            {tab === "pending_approval" ? "No pending activities — all clear!" : "No rejected activities."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(activity => (
            <div key={activity.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CFG[activity.approval_status]?.cls}`}>
                        {STATUS_CFG[activity.approval_status]?.label}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">{activity.code}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{activity.title}</h3>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                      <span>Domain: <strong>{activity.domain}</strong></span>
                      <span>Category: <strong>{activity.category}</strong></span>
                      <span>Points: <strong>{activity.sdc_credits}</strong></span>
                      {activity.difficulty && <span>Difficulty: <strong>{activity.difficulty}</strong></span>}
                    </div>

                    {/* Submitted by */}
                    <div className="mt-2 text-xs text-gray-400">
                      Submitted by{" "}
                      <span className="font-semibold text-gray-700">
                        {activity.lead_name || activity.submitted_by}
                      </span>
                      {activity.club_name && (
                        <> · <span className="font-semibold text-gray-700">{activity.club_name}</span></>
                      )}
                      <span className="ml-2">{new Date(activity.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Description */}
                    {activity.description && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                    )}

                    {/* Rejection note */}
                    {activity.rejection_note && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs text-red-600"><strong>Rejection note:</strong> {activity.rejection_note}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.approval_status === "pending_approval" && (
                      <>
                        <button
                          onClick={() => handleApprove(activity.id, activity.title)}
                          disabled={processing === activity.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          <FiCheck size={14} /> Approve
                        </button>
                        <button
                          onClick={() => { setRejectModal({ id: activity.id, title: activity.title }); setRejectNote(""); }}
                          disabled={processing === activity.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </>
                    )}
                    {activity.approval_status === "rejected" && (
                      <>
                        <button
                          onClick={() => handleApprove(activity.id, activity.title)}
                          disabled={processing === activity.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          <FiCheck size={14} /> Approve Anyway
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id, activity.title)}
                          disabled={processing === activity.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Reject Activity</h3>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting <strong>"{rejectModal.title}"</strong>. Optionally add a note for the lead.
            </p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={processing !== null}
                className="flex-1 py-2 rounded-xl text-white font-semibold text-sm transition-colors"
                style={{ backgroundColor: BRAND }}
              >
                {processing !== null ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
