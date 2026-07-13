"use client";
import { KPI, MiniBar, BRAND, BRAND_ACCENT, DOMAIN_COLORS, DOMAIN_ICONS } from "./SharedUI";
import { FiUsers, FiStar, FiAward, FiBarChart2 } from "react-icons/fi";

export default function AnalyticsView({ analytics, analyticsLoading, setTab, openStudent }: any) {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={<FiUsers size={18} />}    label="Active Students" value={analyticsLoading ? "—" : analytics?.sdcStats?.studentsWithCredits ?? 0}   color="#111827" />
        <KPI icon={<FiStar size={18} />}     label="Total Points Issued"      value={analyticsLoading ? "—" : analytics?.sdcStats?.totalCredits ?? 0}            color="#111827" />
        <KPI icon={<FiAward size={18} />}    label="Badges Distributed"           value={analyticsLoading ? "—" : analytics?.badgeStats?.totalIssued ?? 0}           color="#111827" />
        <KPI icon={<FiBarChart2 size={18} />}label="Unique Badges"   value={analyticsLoading ? "—" : analytics?.badgeStats?.uniqueBadges ?? 0}          color="#111827" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Breakdown */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-5">Student Journey Levels</h3>
          {analyticsLoading ? (
            <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : (analytics?.levelBreakdown ?? []).length > 0 ? (
            <div className="space-y-4">
              {analytics.levelBreakdown.map((l: any) => {
                const max = Math.max(...analytics.levelBreakdown.map((x: any) => Number(x.count)), 1);
                return (
                  <div key={l.level}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="font-medium text-gray-700">{l.level}</span>
                      <span className="font-semibold text-gray-900">{Number(l.count).toLocaleString()} students</span>
                    </div>
                    <MiniBar value={Number(l.count)} max={max} color="#4b5563" />
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[13px] text-gray-500 italic text-center py-6">No level data available</p>}
        </div>

        {/* Domain Points */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-5">Points by Domain</h3>
          {analyticsLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : (analytics?.domainSdcBreakdown ?? []).length > 0 ? (
            <div className="space-y-4">
              {analytics.domainSdcBreakdown.map((r: any) => {
                const max = Math.max(...analytics.domainSdcBreakdown.map((x: any) => Number(x.total_credits)), 1);
                return (
                  <div key={r.domain}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span style={{ color: DOMAIN_COLORS[r.domain] }}>{DOMAIN_ICONS[r.domain]}</span> {r.domain}
                      </span>
                      <span className="font-semibold text-gray-900">{Number(r.total_credits).toLocaleString()} pts
                        <span className="text-gray-400 font-normal ml-1">({r.transaction_count} activities)</span>
                      </span>
                    </div>
                    <MiniBar value={Number(r.total_credits)} max={max} color={DOMAIN_COLORS[r.domain] || BRAND} />
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[13px] text-gray-500 italic text-center py-6">No points data available</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-5">Top Performers</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : (analytics?.topSdcStudents ?? []).length > 0 ? (
            <div className="space-y-2">
              {analytics.topSdcStudents.map((s: any, i: number) => (
                <div key={s.username} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-colors"
                  onClick={() => { setTab("students"); openStudent(s); }}>
                  <div className="text-[12px] font-semibold text-gray-500 w-4 text-center">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.username} • {s.branch}</p>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">
                    {Number(s.total_credits).toLocaleString()} <span className="font-normal text-gray-500">pts</span>
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-[13px] text-gray-500 italic text-center py-6">No activity records found</p>}
        </div>

        {/* Recent badges */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-5">Recent Recognitions</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-sm animate-pulse" />)}</div>
          ) : (analytics?.recentBadges ?? []).length > 0 ? (
            <div className="space-y-2">
              {analytics.recentBadges.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{b.badge_name}</p>
                    <p className="text-[11px] text-gray-500">{b.name} • {b.username}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-gray-200 text-gray-600 bg-gray-50">
                    {b.rarity}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-[13px] text-gray-500 italic text-center py-6">No recent recognitions</p>}
        </div>
      </div>
    </div>
  );
}
