"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  FiArrowLeft, FiAward, FiCheckCircle, FiAlertCircle, FiExternalLink, FiSearch,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

export default function LeadCertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [activity, setActivity] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [issuing, setIssuing] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/lead/samam/activities/${id}/certificates`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Could not load this activity");
        return;
      }
      setActivity(data.activity);
      setStudents(data.students || []);
      setSelected(new Set());
      setError(null);
    } catch (e) {
      setError("Network error while loading");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Only students who have completed and don't already hold a certificate.
  const issuable = students.filter((s) => s.eligible && !s.certificate);

  const toggle = (username: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === issuable.length ? new Set() : new Set(issuable.map((s) => s.username))
    );
  };

  const issue = async () => {
    if (selected.size === 0) return;
    setIssuing(true);
    try {
      const res = await fetch(`/api/dashboard/lead/samam/activities/${id}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || data.error || "Could not issue certificates");
        return;
      }
      toast.success(data.message);
      await load();
    } catch (e) {
      toast.error("Network error while issuing");
    } finally {
      setIssuing(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.name?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <FiAlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">{error}</p>
        <Link href="/dashboard/lead/samam" className="text-xs font-semibold mt-3 inline-block hover:underline" style={{ color: BRAND }}>
          Back to activities
        </Link>
      </div>
    );
  }

  const issuedCount = students.filter((s) => s.certificate).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/dashboard/lead/samam" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
        <FiArrowLeft size={13} /> Back to activities
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <p className="text-[10px] font-mono text-gray-400">{activity?.code}</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Issue Certificates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activity?.title}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: "Enrolled", value: students.length },
              { label: "Completed", value: students.filter((s) => s.eligible).length },
              { label: "Certificates issued", value: issuedCount },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3.5 rounded-xl border border-amber-200 bg-amber-50">
        <FiAlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Only students whose enrollment is marked <strong>completed</strong> can receive a certificate.
          Issuing is permanent and immediately visible to the student — a certificate cannot be
          un-issued from this screen.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students"
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
        <button
          onClick={toggleAll}
          disabled={issuable.length === 0}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          {selected.size === issuable.length && issuable.length > 0 ? "Clear all" : `Select all eligible (${issuable.length})`}
        </button>
        <button
          onClick={issue}
          disabled={selected.size === 0 || issuing}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND }}
        >
          <FiAward size={13} />
          {issuing ? "Issuing…" : `Issue ${selected.size || ""} certificate${selected.size === 1 ? "" : "s"}`}
        </button>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <FiSearch size={26} className="mx-auto mb-2" />
            <p className="text-sm text-gray-600">No students match your search</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((s) => {
              const hasCert = !!s.certificate;
              const canIssue = s.eligible && !hasCert;
              return (
                <div key={s.username} className="flex items-center gap-3 px-5 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(s.username)}
                    onChange={() => toggle(s.username)}
                    disabled={!canIssue}
                    className="w-4 h-4 rounded border-gray-300 disabled:opacity-30 flex-shrink-0"
                    style={{ accentColor: BRAND }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.username} · {s.attendance}% attendance</p>
                  </div>

                  {hasCert ? (
                    <a
                      href={`/certificates/verify/${s.certificate.verificationId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0 hover:bg-emerald-100"
                    >
                      <FiCheckCircle size={10} /> Issued <FiExternalLink size={9} />
                    </a>
                  ) : s.eligible ? (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                      Eligible
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0" title="Enrollment is not marked completed">
                      {s.enrollmentStatus || "not completed"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
