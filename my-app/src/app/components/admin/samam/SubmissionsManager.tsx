"use client";
import { useState, useEffect } from "react";
import { FiCheck, FiX, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "./SharedUI";

export default function SubmissionsManager() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("S"); // S = Submitted, A = Approved, R = Rejected
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/submissions?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleReview = async (id: string, status: "A" | "R", reason?: string) => {
    if (status === "R" && !reason) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProcessing(id);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/submissions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchSubmissions(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update submission");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
        >
          <option value="S">Pending Review</option>
          <option value="A">Approved</option>
          <option value="R">Rejected</option>
        </select>
        <button 
          onClick={fetchSubmissions}
          className="h-9 px-4 text-[13px] font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-gray-500 text-[13px]">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-[13px]">No submissions found in this category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-600">Student</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Task #</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Links</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Date</th>
                  {filter === "S" && <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-[11px] text-gray-500">{sub.username} • {sub.branch} • Year {sub.year}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-600">{sub.num}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        {sub.report && (
                          <a href={sub.report} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                            <FiExternalLink size={10} /> Report Link
                          </a>
                        )}
                        {sub.linkedin && (
                          <a href={sub.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                            <FiExternalLink size={10} /> LinkedIn
                          </a>
                        )}
                        {sub.youtube && (
                          <a href={sub.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                            <FiExternalLink size={10} /> YouTube
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-[12px]">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    {filter === "S" && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const reason = prompt("Optional reason for approval (leave blank for none):");
                              handleReview(sub.id, "A", reason || "");
                            }}
                            disabled={processing === sub.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Please provide a reason for rejection:");
                              if (reason) handleReview(sub.id, "R", reason);
                            }}
                            disabled={processing === sub.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </td>
                    )}
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
