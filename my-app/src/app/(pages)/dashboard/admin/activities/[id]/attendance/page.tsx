"use client";
import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiSave, FiAlertCircle, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

export default function ActivityAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [presents, setPresents] = useState<Set<string>>(new Set());
  const [verifyMode, setVerifyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
      .then(d => setIsAdmin(d.user?.role === 'admin'))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/dashboard/admin/samam/activities/${id}/attendance`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.students);
          if (d.students.length > 0 && d.students.some((s: any) => s.attendance_marked)) {
            setAttendanceMarked(true);
            // Seed presents from the saved state so an admin editing after
            // the lock starts from what's actually recorded, not blank.
            setPresents(new Set(
              d.students.filter((s: any) => s.attendance_percentage === 100).map((s: any) => s.username)
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

  const togglePresent = (username: string) => {
    if (!canEdit) return;
    const newPresents = new Set(presents);
    if (newPresents.has(username)) newPresents.delete(username);
    else newPresents.add(username);
    setPresents(newPresents);
  };

  const handleSave = async () => {
    const confirmMsg = attendanceMarked
      ? "Save these changes to the locked attendance record?"
      : "Are you sure you want to save attendance? Once saved, only an admin can make further changes.";
    if (!confirm(confirmMsg)) return;
    
    setSaving(true);
    try {
      const absenteesArray = students.filter(s => !presents.has(s.username)).map(s => s.username);
      const res = await fetch(`/api/dashboard/admin/samam/activities/${id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ absentees: absenteesArray })
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

  const filteredStudents = useMemo(() => {
    let list = verifyMode ? students.filter(s => !presents.has(s.username)) : students;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.username.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (sortOrder === 'asc') return a.username.localeCompare(b.username);
      return b.username.localeCompare(a.username);
    });
  }, [students, presents, verifyMode, searchQuery, sortOrder]);

  const handleSelectAll = () => {
    if (!canEdit) return;
    const allFilteredPresent = filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username));
    const newPresents = new Set(presents);
    if (allFilteredPresent) {
      filteredStudents.forEach(s => newPresents.delete(s.username));
    } else {
      filteredStudents.forEach(s => newPresents.add(s.username));
    }
    setPresents(newPresents);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading enrolled students...</div>;

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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-700">
              {verifyMode ? "Verifying Absentees" : "All Enrolled Students"} ({filteredStudents.length})
            </h2>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm outline-none bg-transparent w-32 sm:w-48"
              />
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
            </button>
          </div>
          {canEdit && (
            <div className="flex gap-3">
              <button 
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm text-gray-600 bg-white border rounded hover:bg-gray-50 font-medium"
              >
                {filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username)) ? "Deselect All" : "Select All"}
              </button>
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
        ) : filteredStudents.length === 0 && verifyMode ? (
          <div className="p-12 text-center text-emerald-600 font-medium flex flex-col items-center gap-3">
            <FiCheck size={32} />
            <p>100% Attendance! No one is marked absent.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students match your search.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                <th className="p-4 font-semibold w-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer disabled:opacity-50"
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => presents.has(s.username))}
                      onChange={handleSelectAll}
                      disabled={!canEdit}
                      title="Select/Deselect All"
                    />
                    <span>Present</span>
                  </div>
                </th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Username (ID)</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s) => {
                const isPresent = presents.has(s.username);
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!isPresent ? 'bg-red-50/20' : ''}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-emerald-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={isPresent}
                        onChange={() => togglePresent(s.username)}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{s.name}</td>
                    <td className="p-4 text-gray-500">{s.username}</td>
                    <td className="p-4 text-right">
                      {!isPresent ? (
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
            <strong>Tip:</strong> By default, all students are marked as <em>Absent</em>. You need to check the boxes for students who are <strong>Present</strong>. Once you verify the absentees list and save, the attendance is permanently locked.
          </p>
        </div>
      )}
    </div>
  );
}
