"use client";
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiStar, FiAward } from "react-icons/fi";
import { BRAND, LEVEL_COLORS, DOMAIN_COLORS } from "./SharedUI";

export default function StudentManager({
  students, studentsTotal, studentsPage, studentsLoading,
  search, setSearch, filterLevel, setFilterLevel, filterYear, setFilterYear, fetchStudents,
  selectedStudent, setSelectedStudent, studentDetail, setStudentDetail, detailLoading, openStudent,
  setTab, setPointsForm, setBadgeForm
}: any) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchStudents(1)}
            placeholder="Search by name or ID..."
            className="w-full h-9 pl-9 pr-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors shadow-sm"
          />
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="h-9 px-3 text-[13px] border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:border-gray-400 shadow-sm">
          <option value="">All Levels</option>
          {["Explorer","Foundation","Practitioner","Leader"].map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="h-9 px-3 text-[13px] border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:border-gray-400 shadow-sm">
          <option value="">All Years</option>
          {["1st","2nd","3rd","4th"].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => fetchStudents(1)}
          className="h-9 px-4 text-[13px] font-medium rounded-md text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: BRAND }}>
          Search
        </button>
        {(search || filterLevel || filterYear) && (
          <button onClick={() => { setSearch(""); setFilterLevel(""); setFilterYear(""); }}
            className="h-9 px-4 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-5">
        {/* Student table */}
        <div className={`bg-white rounded-md border border-gray-200 flex-1 flex flex-col ${selectedStudent ? "hidden lg:flex" : ""}`}>
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[13px] font-medium text-gray-500">{studentsTotal.toLocaleString()} students found</p>
          </div>
          <div className="overflow-x-auto flex-1">
            {studentsLoading ? (
              <div className="p-5 space-y-4">{[...Array(8)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded-sm animate-pulse" />)}</div>
            ) : students.length === 0 ? (
              <p className="text-center text-[13px] text-gray-400 py-16">No students found</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="border-b border-gray-100 bg-gray-50/50">
                  <tr>
                    {["Student","Branch","Year","Level","Points","Recognitions","Last Active"].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s: any) => (
                    <tr key={s.username}
                      className={`cursor-pointer transition-colors ${selectedStudent?.username === s.username ? "bg-gray-50" : "hover:bg-gray-50/80"}`}
                      onClick={() => openStudent(s)}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{s.username}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{s.branch}</td>
                      <td className="px-5 py-3 text-gray-600">{s.year}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium border"
                          style={{ backgroundColor: `${LEVEL_COLORS[s.level] || "#6B7280"}10`, color: LEVEL_COLORS[s.level] || "#6B7280", borderColor: `${LEVEL_COLORS[s.level] || "#6B7280"}30` }}>
                          {s.level}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{Number(s.total_points).toLocaleString()}</td>
                      <td className="px-5 py-3 text-gray-600">{s.badge_count}</td>
                      <td className="px-5 py-3 text-gray-500 text-[12px]">
                        {s.last_activity ? new Date(s.last_activity).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-5 py-3">
                        <FiChevronRight size={14} className="text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {studentsTotal > 20 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <button disabled={studentsPage === 1} onClick={() => fetchStudents(studentsPage - 1)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors">
                <FiChevronLeft size={14} /> Previous
              </button>
              <span className="text-[12px] text-gray-500 font-medium">Page {studentsPage} of {Math.ceil(studentsTotal / 20)}</span>
              <button disabled={studentsPage * 20 >= studentsTotal} onClick={() => fetchStudents(studentsPage + 1)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors">
                Next <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Student detail panel */}
        {selectedStudent && (
          <div className="w-full lg:w-[420px] bg-white rounded-md border border-gray-200 shadow-lg lg:shadow-none overflow-hidden flex-shrink-0 animate-in slide-in-from-right-4 duration-200">
            {/* Panel header */}
            <div className="p-5 border-b border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center font-semibold text-[15px] text-white flex-shrink-0" style={{ backgroundColor: BRAND }}>
                {selectedStudent.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[14px] font-semibold text-gray-900 truncate leading-tight">{selectedStudent.name}</p>
                <p className="text-[12px] text-gray-500 mt-1">{selectedStudent.username} • {selectedStudent.branch}</p>
              </div>
              <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                className="text-gray-400 hover:text-gray-900 transition-colors mt-1"><FiX size={16} /></button>
            </div>

            {detailLoading ? (
              <div className="p-5 space-y-4">{[...Array(6)].map((_,i) => <div key={i} className="h-6 bg-gray-100 rounded-sm animate-pulse" />)}</div>
            ) : studentDetail ? (
              <div className="overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
                
                {/* Summary chips */}
                <div className="px-5 pt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Level", value: studentDetail.profile?.level || "Explorer" },
                    { label: "Total Points", value: studentDetail.profile?.totalPoints?.toLocaleString() || 0 },
                    { label: "Recognitions", value: studentDetail.profile?.badgeCount || 0 },
                  ].map(chip => (
                    <div key={chip.label} className="border border-gray-200 rounded-md p-3">
                      <p className="text-[14px] font-semibold text-gray-900">{chip.value}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1">{chip.label}</p>
                    </div>
                  ))}
                </div>

                {/* Domain breakdown */}
                {studentDetail.domainBreakdown && Object.keys(studentDetail.domainBreakdown).length > 0 && (
                  <div className="px-5 pt-6">
                    <p className="text-[12px] font-semibold text-gray-900 mb-3 uppercase tracking-wider">Points Distribution</p>
                    <div className="space-y-3">
                      {Object.entries(studentDetail.domainBreakdown).map(([d, pts]: any) => (
                        <div key={d} className="flex items-center gap-3 text-[12px]">
                          <span className="font-medium w-8 text-gray-600">{d}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                            <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${Math.min(100,(pts/studentDetail.profile.totalPoints)*100)}%`, backgroundColor: DOMAIN_COLORS[d] || "#4b5563" }} />
                          </div>
                          <span className="font-medium text-gray-900 w-12 text-right">{pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SDC History */}
                <div className="px-5 pt-6">
                  <p className="text-[12px] font-semibold text-gray-900 mb-3 uppercase tracking-wider">Recent Activity</p>
                  {studentDetail.sdcHistory?.length > 0 ? (
                    <div className="space-y-3">
                      {studentDetail.sdcHistory.slice(0, 5).map((t: any) => (
                        <div key={t.id} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: DOMAIN_COLORS[t.domain] || "#4b5563" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-gray-900 leading-tight">{t.activity_title || t.description}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{t.granted_at ? new Date(t.granted_at).toLocaleDateString() : ""}</p>
                          </div>
                          <span className="text-[12px] font-semibold text-gray-900">+{t.points}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[12px] text-gray-500 italic">No activity recorded</p>}
                </div>

                {/* Badges */}
                <div className="px-5 pt-6 pb-6 border-b border-gray-100">
                  <p className="text-[12px] font-semibold text-gray-900 mb-3 uppercase tracking-wider">Recognitions</p>
                  {studentDetail.badges?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {studentDetail.badges.map((b: any) => (
                        <div key={b.id} className="flex items-center gap-2 px-2.5 py-1 rounded border border-gray-200 text-[11px] font-medium text-gray-700">
                          {b.name}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[12px] text-gray-500 italic">No recognitions yet</p>}
                </div>

                {/* Quick award buttons */}
                <div className="p-5 flex gap-3">
                  <button
                    onClick={() => { setTab("awards"); setPointsForm((p: any) => ({ ...p, username: selectedStudent.username })); }}
                    className="flex-1 text-[12px] font-medium py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                    Allocate Points
                  </button>
                  <button
                    onClick={() => { setTab("awards"); setBadgeForm((p: any) => ({ ...p, username: selectedStudent.username })); }}
                    className="flex-1 text-[12px] font-medium py-2 rounded-md text-white transition-colors hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: BRAND }}>
                    Grant Recognition
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
