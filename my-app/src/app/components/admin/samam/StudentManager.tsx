"use client";
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiStar, FiAward } from "react-icons/fi";
import { BRAND, LEVEL_COLORS, DOMAIN_COLORS, RARITY_COLORS } from "./SharedUI";

export default function StudentManager({
  students, studentsTotal, studentsPage, studentsLoading,
  search, setSearch, filterLevel, setFilterLevel, filterYear, setFilterYear, fetchStudents,
  selectedStudent, setSelectedStudent, studentDetail, setStudentDetail, detailLoading, openStudent,
  setTab, setPointsForm, setBadgeForm
}: any) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchStudents(1)}
            placeholder="Search by name or username…"
            className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
          <option value="">All Levels</option>
          {["Explorer","Foundation","Practitioner","Leader"].map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
          <option value="">All Years</option>
          {["1st","2nd","3rd","4th"].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => fetchStudents(1)}
          className="h-9 px-4 text-xs font-semibold rounded-lg text-white" style={{ backgroundColor: BRAND }}>
          Search
        </button>
        {(search || filterLevel || filterYear) && (
          <button onClick={() => { setSearch(""); setFilterLevel(""); setFilterYear(""); }}
            className="h-9 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-4">
        {/* Student table */}
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 ${selectedStudent ? "hidden lg:block" : ""}`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500">{studentsTotal.toLocaleString()} students found</p>
          </div>
          <div className="overflow-x-auto">
            {studentsLoading ? (
              <div className="p-4 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : students.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-12">No students found</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Student","Branch","Year","Level","Points","Badges","Last Activity"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s: any) => (
                    <tr key={s.username}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedStudent?.username === s.username ? "bg-red-50/50" : ""}`}
                      onClick={() => openStudent(s)}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="text-gray-400">{s.username}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.branch}</td>
                      <td className="px-4 py-3 text-gray-600">{s.year}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: `${LEVEL_COLORS[s.level] || "#6B7280"}18`, color: LEVEL_COLORS[s.level] || "#6B7280" }}>
                          {s.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{Number(s.total_points).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-gray-600">{s.badge_count}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {s.last_activity ? new Date(s.last_activity).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-4 py-3">
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <button disabled={studentsPage === 1} onClick={() => fetchStudents(studentsPage - 1)}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors">
                <FiChevronLeft size={13} /> Prev
              </button>
              <span className="text-xs text-gray-500 font-medium">Page {studentsPage} of {Math.ceil(studentsTotal / 20)}</span>
              <button disabled={studentsPage * 20 >= studentsTotal} onClick={() => fetchStudents(studentsPage + 1)}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors">
                Next <FiChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Student detail panel */}
        {selectedStudent && (
          <div className="w-full lg:w-[480px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 animate-in slide-in-from-right-4 duration-300">
            {/* Panel header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors"><FiChevronLeft size={16} /></button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: BRAND }}>
                {selectedStudent.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedStudent.name}</p>
                <p className="text-xs text-gray-500">{selectedStudent.username} · {selectedStudent.branch}</p>
              </div>
              <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-white rounded-full p-1 border border-gray-200"><FiX size={14} /></button>
            </div>

            {detailLoading ? (
              <div className="p-4 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : studentDetail ? (
              <div className="overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
                {/* Summary chips */}
                <div className="px-4 pt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Level", value: studentDetail.profile?.level || "Explorer", color: LEVEL_COLORS[studentDetail.profile?.level] || "#6B7280" },
                    { label: "Total Points", value: studentDetail.profile?.totalPoints?.toLocaleString() || 0, color: BRAND },
                    { label: "Badges", value: studentDetail.profile?.badgeCount || 0, color: "#7C3AED" },
                  ].map(chip => (
                    <div key={chip.label} className="rounded-xl p-3 text-center border border-gray-50" style={{ backgroundColor: `${chip.color}08` }}>
                      <p className="text-base font-bold" style={{ color: chip.color }}>{chip.value}</p>
                      <p className="text-[10px] font-medium text-gray-600 mt-0.5">{chip.label}</p>
                    </div>
                  ))}
                </div>

                {/* Domain breakdown */}
                {studentDetail.domainBreakdown && Object.keys(studentDetail.domainBreakdown).length > 0 && (
                  <div className="px-4 pt-5">
                    <p className="text-xs font-bold text-gray-800 mb-3">Points by Domain</p>
                    <div className="space-y-2">
                      {Object.entries(studentDetail.domainBreakdown).map(([d, pts]: any) => (
                        <div key={d} className="flex items-center gap-3 text-xs">
                          <span className="font-bold w-9 text-center px-1.5 py-0.5 rounded-md text-white text-[10px]"
                            style={{ backgroundColor: DOMAIN_COLORS[d] || "#6B7280" }}>{d}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100,(pts/studentDetail.profile.totalPoints)*100)}%`, backgroundColor: DOMAIN_COLORS[d] || BRAND }} />
                          </div>
                          <span className="font-bold text-gray-800 w-12 text-right">{pts} <span className="text-gray-400 font-normal">pts</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SDC History */}
                <div className="px-4 pt-5">
                  <p className="text-xs font-bold text-gray-800 mb-3">Recent Point History</p>
                  {studentDetail.sdcHistory?.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {studentDetail.sdcHistory.slice(0, 20).map((t: any) => (
                        <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors text-xs">
                          <span className="px-2 py-1 rounded text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: DOMAIN_COLORS[t.domain] || "#6B7280" }}>{t.domain}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate leading-snug">{t.activity_title || t.description}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">{t.granted_at ? new Date(t.granted_at).toLocaleDateString() : ""}</p>
                          </div>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">+{t.points}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-400 italic">No point history yet</p>}
                </div>

                {/* Badges */}
                <div className="px-4 pt-5">
                  <p className="text-xs font-bold text-gray-800 mb-3">Earned Badges ({studentDetail.badges?.length || 0})</p>
                  {studentDetail.badges?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {studentDetail.badges.map((b: any) => (
                        <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs shadow-sm hover:shadow-md transition-shadow cursor-default"
                          style={{ backgroundColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}08`, borderColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}20` }}>
                          <span className="text-sm">{b.icon || "🏅"}</span>
                          <span className="font-semibold text-gray-800">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-gray-400 italic">No badges yet</p>}
                </div>

                {/* Quick award buttons */}
                <div className="p-4 mt-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                  <button
                    onClick={() => { setTab("awards"); setPointsForm((p: any) => ({ ...p, username: selectedStudent.username })); }}
                    className="flex-1 text-xs font-bold py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: "#D97706" }}>
                    <FiStar size={14} /> Award Points
                  </button>
                  <button
                    onClick={() => { setTab("awards"); setBadgeForm((p: any) => ({ ...p, username: selectedStudent.username })); }}
                    className="flex-1 text-xs font-bold py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: "#7C3AED" }}>
                    <FiAward size={14} /> Award Badge
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
