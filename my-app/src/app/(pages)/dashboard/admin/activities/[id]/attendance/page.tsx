"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiSave, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

export default function ActivityAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [absentees, setAbsentees] = useState<Set<string>>(new Set());
  const [verifyMode, setVerifyMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Once attendance is locked, only an admin may still edit it (faculty
  // cannot) -- the API enforces this too; this just determines whether to
  // show the controls at all once locked.
  const canEdit = !attendanceMarked || isAdmin;

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setIsAdmin(d.role === 'admin'))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/dashboard/admin/samam/activities/${id}/attendance`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.students);
          if (d.students.length > 0 && d.students[0].attendance_marked) {
            setAttendanceMarked(true);
            // Seed absentees from the saved state so an admin editing after
            // the lock starts from what's actually recorded, not blank.
            setAbsentees(new Set(
              d.students.filter((s: any) => s.attendance_percentage === 0).map((s: any) => s.username)
            ));
          }
        } else {
          toast.error("Failed to load students");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Error connecting to server");
        setLoading(false);
      });
  }, [id]);

  const toggleAbsent = (username: string) => {
    if (!canEdit) return;
    const newAbsentees = new Set(absentees);
    if (newAbsentees.has(username)) newAbsentees.delete(username);
    else newAbsentees.add(username);
    setAbsentees(newAbsentees);
  };

  const handleSave = async () => {
    const confirmMsg = attendanceMarked
      ? "Save these changes to the locked attendance record?"
      : "Are you sure you want to save attendance? Once saved, only an admin can make further changes.";
    if (!confirm(confirmMsg)) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/activities/${id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absentees: Array.from(absentees) })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Attendance saved successfully");
        setAttendanceMarked(true);
        setVerifyMode(false);
      } else {
        toast.error(data.error || "Failed to save attendance");
      }
    } catch (err) {
      toast.error("Error saving attendance");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading enrolled students...</div>;

  const displayedStudents = verifyMode ? students.filter(s => absentees.has(s.username)) : students;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/samam/activities" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance: {id}</h1>
            <p className="text-sm text-gray-500 mt-1">Check the box if the student is ABSENT.</p>
          </div>
        </div>
        {attendanceMarked && (
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-bold flex items-center gap-2">
            <FiCheck /> Attendance Locked{isAdmin ? " (admin can still edit)" : ""}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-700">
            {verifyMode ? "Verifying Absentees" : "All Enrolled Students"} ({displayedStudents.length})
          </h2>
          {canEdit && (
            <div className="flex gap-3">
              {verifyMode ? (
                <>
                  <button onClick={() => setVerifyMode(false)} className="px-4 py-2 text-sm text-gray-600 bg-white border rounded hover:bg-gray-50">
                    Back to All
                  </button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-red-700 rounded hover:bg-red-800 flex items-center gap-2">
                    {saving ? "Saving..." : <><FiSave /> Save Final Attendance</>}
                  </button>
                </>
              ) : (
                <button onClick={() => setVerifyMode(true)} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2">
                  Verify Absentees <FiArrowLeft className="rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students are currently enrolled in this activity.</div>
        ) : displayedStudents.length === 0 && verifyMode ? (
          <div className="p-12 text-center text-emerald-600 font-medium flex flex-col items-center gap-3">
            <FiCheck size={32} />
            <p>100% Attendance! No one is marked absent.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                <th className="p-4 font-semibold w-16 text-center">Absent</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Username (ID)</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedStudents.map((s) => {
                const isAbsent = absentees.has(s.username);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${isAbsent ? 'bg-red-50/30' : ''}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-red-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={isAbsent}
                        onChange={() => toggleAbsent(s.username)}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                    <td className="p-4 text-gray-500">{s.username}</td>
                    <td className="p-4 text-right">
                      {isAbsent ? (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Absent</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Present</span>
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
      
      {!attendanceMarked && (
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 items-start">
          <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
          <p>
            <strong>Tip:</strong> By default, all students are marked as <em>Present</em>. You only need to check the boxes for students who are <em>Absent</em>. Once you verify the absentees list and save, the attendance is permanently locked.
          </p>
        </div>
      )}
    </div>
  );
}
