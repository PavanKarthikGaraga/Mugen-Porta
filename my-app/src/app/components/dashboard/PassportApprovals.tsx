"use client";
import { useState, useEffect } from "react";
import {
  FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter,
  FiFileText, FiRefreshCw, FiExternalLink, FiX, FiUser,
  FiCode, FiBriefcase, FiStar, FiHeart, FiAward,
  FiBook, FiUsers, FiTag, FiGlobe,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  color: "#D97706", bg: "#FFFBEB", icon: <FiClock       size={12} /> },
  approved: { label: "Approved", color: "#059669", bg: "#F0FDF4", icon: <FiCheckCircle size={12} /> },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2", icon: <FiXCircle     size={12} /> },
};

interface PassportRequest {
  id: number;
  username: string;
  student_name: string;
  branch: string;
  year: string;
  clubId: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_notes: string | null;
}

interface PassportData {
  profile: any;
  projects: any[];
  internships: any[];
  research: any[];
  leadership: any[];
  community: any[];
  achievements: any[];
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

function DataCount({ label, items }: { label: string; items: any[] }) {
  if (!items || items.length === 0) return null;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
      {items.length} {label}
    </span>
  );
}

export default function PassportApprovals({ role }: { role: "admin" | "faculty" | "lead" }) {
  const [requests, setRequests] = useState<PassportRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail modal
  const [selectedReq, setSelectedReq] = useState<PassportRequest | null>(null);
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [loadingPassport, setLoadingPassport] = useState(false);
  const [notes, setNotes]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/passport-approvals");
      if (res.ok) {
        const d = await res.json();
        setRequests(d.requests ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const openDetail = async (req: PassportRequest) => {
    setSelectedReq(req);
    setNotes(req.reviewer_notes ?? "");
    setPassportData(null);
    setLoadingPassport(true);
    try {
      const res = await fetch(`/api/passport-approvals/${req.id}/passport-data`);
      if (res.ok) {
        const d = await res.json();
        setPassportData(d);
      }
    } catch {}
    setLoadingPassport(false);
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedReq) return;
    if (status === "rejected" && !notes.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/passport-approvals/${selectedReq.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes.trim() || null }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Passport ${status}`);
        setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status, reviewer_notes: notes.trim() || null } : r));
        setSelectedReq(prev => prev ? { ...prev, status } : null);
      } else {
        toast.error(data.error || "Failed to process review");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name?.toLowerCase().includes(q) || r.username.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const roleLabel = { admin: "Admin", faculty: "Faculty", lead: "Club Lead" }[role];

  if (loading && requests.length === 0) return <Skeleton />;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Passport Approvals</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {roleLabel} view · Review and approve student Excellence Passport verification requests
            </p>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",  value: counts.pending,  color: "#D97706" },
          { label: "Approved", value: counts.approved, color: "#059669" },
          { label: "Rejected", value: counts.rejected, color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-xs flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FiFilter size={12} className="text-gray-400" />
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
                statusFilter === f ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={statusFilter === f ? { backgroundColor: f === "all" ? BRAND : STATUS_META[f]?.color } : {}}
            >
              {f === "all" ? `All (${counts.all})` : `${STATUS_META[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FiFileText size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No passport verification requests</p>
          <p className="text-xs text-gray-400 mt-1">Requests appear when students submit their Excellence Passport for verification</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">No requests match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const meta = STATUS_META[req.status];
            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => openDetail(req)}
              >
                <div className="h-0.5" style={{ backgroundColor: meta?.color ?? "#9CA3AF" }} />
                <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: BRAND }}
                    >
                      {(req.student_name || req.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{req.student_name || req.username}</span>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{req.username}</span>
                        {meta && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: meta.bg, color: meta.color }}
                          >
                            {meta.icon} {meta.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                        {req.branch && <span>{req.branch}</span>}
                        {req.year && <><span className="text-gray-200">•</span><span>Year {req.year}</span></>}
                        <span className="text-gray-200">•</span>
                        <span>Submitted {new Date(req.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {req.reviewed_at && (
                          <><span className="text-gray-200">•</span>
                          <span>Reviewed {new Date(req.reviewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium flex-shrink-0">
                    <FiExternalLink size={13} /> View &amp; Review
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {selectedReq.student_name || selectedReq.username}&rsquo;s Excellence Passport
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedReq.username} · Submitted {new Date(selectedReq.submitted_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-2">
                {STATUS_META[selectedReq.status] && (
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: STATUS_META[selectedReq.status].bg, color: STATUS_META[selectedReq.status].color }}
                  >
                    {STATUS_META[selectedReq.status].icon} {STATUS_META[selectedReq.status].label}
                  </span>
                )}
                <button onClick={() => setSelectedReq(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Passport preview */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {loadingPassport ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: BRAND }} />
                </div>
              ) : passportData ? (
                <>
                  {/* Profile */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUser size={13} style={{ color: BRAND }} />
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Profile</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                      <span><strong>Name:</strong> {passportData.profile?.name}</span>
                      <span><strong>Branch:</strong> {passportData.profile?.branch}</span>
                      <span><strong>Email:</strong> {passportData.profile?.email}</span>
                      <span><strong>Domain:</strong> {passportData.profile?.selectedDomain}</span>
                      {passportData.profile?.headline && <span className="col-span-2"><strong>Headline:</strong> {passportData.profile.headline}</span>}
                      {passportData.profile?.location && <span><strong>Location:</strong> {passportData.profile.location}</span>}
                      {passportData.profile?.github_url && <span><strong>GitHub:</strong> <span className="text-blue-600 break-all">{passportData.profile.github_url}</span></span>}
                      {passportData.profile?.linkedin_url && <span><strong>LinkedIn:</strong> <span className="text-blue-600 break-all">{passportData.profile.linkedin_url}</span></span>}
                    </div>
                    {passportData.profile?.bio && (
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{passportData.profile.bio}</p>
                    )}
                  </div>

                  {/* Skills */}
                  {(() => {
                    let skills: string[] = [];
                    try {
                      const raw = passportData.profile?.skills;
                      skills = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []);
                    } catch {}
                    return skills.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FiTag size={12} style={{ color: BRAND }} />
                          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Skills ({skills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s: string, i: number) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 font-medium">
                              {typeof s === 'object' ? (s as any).name ?? JSON.stringify(s) : s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Counts summary */}
                  <div className="flex flex-wrap gap-2">
                    <DataCount label="Projects" items={passportData.projects} />
                    <DataCount label="Internships" items={passportData.internships} />
                    <DataCount label="Research" items={passportData.research} />
                    <DataCount label="Leadership" items={passportData.leadership} />
                    <DataCount label="Community" items={passportData.community} />
                    <DataCount label="Achievements" items={passportData.achievements} />
                  </div>

                  {/* Projects */}
                  {passportData.projects.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiCode size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Projects ({passportData.projects.length})</span>
                      </div>
                      {passportData.projects.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.title || p.name}</p>
                          {p.tech_stack && <p className="text-[10px] text-blue-600 mt-0.5">{p.tech_stack}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                          {p.github_url && <p className="text-[10px] text-blue-500 mt-0.5 break-all">{p.github_url}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Internships */}
                  {passportData.internships.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiBriefcase size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Internships ({passportData.internships.length})</span>
                      </div>
                      {passportData.internships.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.company || p.organization}</p>
                          {p.role && <p className="text-[10px] text-gray-500">{p.role}{p.duration ? ` · ${p.duration}` : ''}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Research */}
                  {passportData.research.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiBook size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Research ({passportData.research.length})</span>
                      </div>
                      {passportData.research.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.title}</p>
                          {p.publication && <p className="text-[10px] text-gray-500">{p.publication}{p.year ? ` · ${p.year}` : ''}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leadership */}
                  {passportData.leadership.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiUsers size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Leadership ({passportData.leadership.length})</span>
                      </div>
                      {passportData.leadership.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.title || p.role}</p>
                          {p.organization && <p className="text-[10px] text-gray-500">{p.organization}{p.duration ? ` · ${p.duration}` : ''}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Community */}
                  {passportData.community.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiGlobe size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Community Service ({passportData.community.length})</span>
                      </div>
                      {passportData.community.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.activity || p.title}</p>
                          {p.organization && <p className="text-[10px] text-gray-500">{p.organization}{p.duration ? ` · ${p.duration}` : ''}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Achievements */}
                  {passportData.achievements.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FiAward size={12} style={{ color: BRAND }} />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Achievements ({passportData.achievements.length})</span>
                      </div>
                      {passportData.achievements.map((p: any, i: number) => (
                        <div key={i} className="text-xs text-gray-700 border-l-2 border-gray-200 pl-3 mb-2">
                          <p className="font-semibold">{p.title || p.name}</p>
                          {p.issuer && <p className="text-[10px] text-gray-500">{p.issuer}{p.year ? ` · ${p.year}` : ''}</p>}
                          {p.description && <p className="text-gray-500 text-[10px] mt-0.5">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Unable to load passport data</p>
              )}
            </div>

            {/* Review section */}
            <div className="border-t border-gray-100 p-5 space-y-3">
              {selectedReq.reviewer_notes && selectedReq.status !== 'pending' && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                  <strong>Previous notes:</strong> {selectedReq.reviewer_notes}
                </div>
              )}
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add review notes (required for rejection)…"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 resize-none text-gray-700 placeholder:text-gray-400"
                style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
              />
              {selectedReq.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview("rejected")}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <FiXCircle size={14} /> {submitting ? "Processing…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleReview("approved")}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <FiCheckCircle size={14} /> {submitting ? "Processing…" : "Approve"}
                  </button>
                </div>
              ) : (
                <div
                  className="text-center text-xs font-medium py-2 rounded-lg"
                  style={{ backgroundColor: STATUS_META[selectedReq.status]?.bg, color: STATUS_META[selectedReq.status]?.color }}
                >
                  This request has been <strong>{selectedReq.status}</strong>. No further action needed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
