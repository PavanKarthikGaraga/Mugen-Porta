"use client";
import { KPI, MiniBar, BRAND, LEVEL_COLORS, DOMAIN_COLORS, DOMAIN_ICONS, RARITY_COLORS } from "./SharedUI";
import { FiUsers, FiStar, FiAward, FiBarChart2 } from "react-icons/fi";

export default function AnalyticsView({ analytics, analyticsLoading, setTab, openStudent }: any) {
  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={<FiUsers size={16} />}    label="Students Earning Points" value={analyticsLoading ? "—" : analytics?.sdcStats?.studentsWithCredits ?? 0}   color="#2563EB" />
        <KPI icon={<FiStar size={16} />}     label="Total SAMAM Points"      value={analyticsLoading ? "—" : analytics?.sdcStats?.totalCredits ?? 0}            color="#D97706" />
        <KPI icon={<FiAward size={16} />}    label="Badges Issued"           value={analyticsLoading ? "—" : analytics?.badgeStats?.totalIssued ?? 0}           color="#7C3AED" />
        <KPI icon={<FiBarChart2 size={16} />}label="Unique Badges Awarded"   value={analyticsLoading ? "—" : analytics?.badgeStats?.uniqueBadges ?? 0}          color="#059669" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Level Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Student Level Breakdown</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (analytics?.levelBreakdown ?? []).length > 0 ? (
            <div className="space-y-3">
              {analytics.levelBreakdown.map((l: any) => {
                const max = Math.max(...analytics.levelBreakdown.map((x: any) => Number(x.count)), 1);
                return (
                  <div key={l.level}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold" style={{ color: LEVEL_COLORS[l.level] || "#6B7280" }}>{l.level}</span>
                      <span className="font-bold text-gray-900">{Number(l.count).toLocaleString()} students</span>
                    </div>
                    <MiniBar value={Number(l.count)} max={max} color={LEVEL_COLORS[l.level] || "#6B7280"} />
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-gray-400 italic text-center py-6">No level data yet</p>}
        </div>

        {/* Domain Points */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 mb-4">SAMAM Points by Domain</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (analytics?.domainSdcBreakdown ?? []).length > 0 ? (
            <div className="space-y-3">
              {analytics.domainSdcBreakdown.map((r: any) => {
                const max = Math.max(...analytics.domainSdcBreakdown.map((x: any) => Number(x.total_credits)), 1);
                return (
                  <div key={r.domain}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <span style={{ color: DOMAIN_COLORS[r.domain] }}>{DOMAIN_ICONS[r.domain]}</span> {r.domain}
                      </span>
                      <span className="font-bold text-gray-900">{Number(r.total_credits).toLocaleString()} pts
                        <span className="text-gray-400 font-normal ml-1">({r.transaction_count} activities)</span>
                      </span>
                    </div>
                    <MiniBar value={Number(r.total_credits)} max={max} color={DOMAIN_COLORS[r.domain] || BRAND} />
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-gray-400 italic text-center py-6">No points data yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 mb-4">SAMAM Points Leaderboard</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (analytics?.topSdcStudents ?? []).length > 0 ? (
            <div className="space-y-1.5">
              {analytics.topSdcStudents.map((s: any, i: number) => (
                <div key={s.username} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => { setTab("students"); openStudent(s); }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: ["#D97706","#9CA3AF","#CD7F32","#6B7280","#6B7280"][i] || BRAND }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.username} · {s.branch}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: BRAND }}>
                    {Number(s.total_credits).toLocaleString()} <span className="text-xs font-normal text-gray-400">pts</span>
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400 italic text-center py-6">No activity yet</p>}
        </div>

        {/* Recent badges */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Badges Issued</h3>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (analytics?.recentBadges ?? []).length > 0 ? (
            <div className="space-y-2">
              {analytics.recentBadges.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}18`, color: RARITY_COLORS[b.rarity] || "#9CA3AF" }}>
                    <FiAward size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{b.badge_name}</p>
                    <p className="text-[10px] text-gray-400">{b.name} · {b.username}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${RARITY_COLORS[b.rarity]}18`, color: RARITY_COLORS[b.rarity] }}>
                    {b.rarity}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400 italic text-center py-6">No badges issued recently</p>}
        </div>
      </div>
    </div>
  );
}
