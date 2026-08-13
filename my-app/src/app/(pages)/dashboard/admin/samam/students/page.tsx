"use client";
import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import StudentManager from "@/app/components/admin/samam/StudentManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed", "notifications", "settings"];

function AdminSamamStudentsInner() {
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<any[]>([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // fetchStudents takes an optional search override so a deep-link (e.g.
  // from the Overview leaderboard's "?username=" link) can fetch with that
  // username immediately, rather than waiting on the `search` state update
  // that triggered it to actually land first.
  const fetchStudents = useCallback(async (page = 1, searchOverride?: string) => {
    setStudentsLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: "20" });
      const effectiveSearch = searchOverride ?? search;
      if (effectiveSearch) q.set("search", effectiveSearch);
      if (filterLevel) q.set("level", filterLevel);
      if (filterYear) q.set("year", filterYear);
      const res = await fetch(`/api/dashboard/admin/samam/students?${q}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setStudentsTotal(data.total || 0);
        setStudentsPage(page);
        return data.students || [];
      }
    } finally {
      setStudentsLoading(false);
    }
    return [];
  }, [search, filterLevel, filterYear]);

  const fetchStudentDetail = useCallback(async (username: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/students/${username}`);
      if (res.ok) setStudentDetail(await res.json());
    } finally { setDetailLoading(false); }
  }, []);

  const openStudent = useCallback(async (s: any) => {
    setSelectedStudent(s);
    setStudentDetail(null);
    await fetchStudentDetail(s.username);
  }, [fetchStudentDetail]);

  // Deep-link support: /dashboard/admin/samam/students?username=X opens
  // that student's detail panel directly, replacing the old same-page
  // setTab("students") + openStudent(s) call from the Overview leaderboard.
  useEffect(() => {
    const username = searchParams.get("username");
    if (username) {
      setSearch(username);
      fetchStudents(1, username).then((list) => {
        const match = list.find((s: any) => s.username === username);
        if (match) openStudent(match);
      });
    } else {
      fetchStudents(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StudentManager
      students={students} studentsTotal={studentsTotal} studentsPage={studentsPage} studentsLoading={studentsLoading}
      search={search} setSearch={setSearch} filterLevel={filterLevel} setFilterLevel={setFilterLevel} filterYear={filterYear} setFilterYear={setFilterYear} fetchStudents={fetchStudents}
      selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} studentDetail={studentDetail} setStudentDetail={setStudentDetail} detailLoading={detailLoading} openStudent={openStudent}
    />
  );
}

export default function AdminSamamStudentsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/admin/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <Suspense fallback={null}>
          <AdminSamamStudentsInner />
        </Suspense>
      </div>
    </div>
  );
}
