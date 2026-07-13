"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiZap, FiStar, FiAward, FiClock, FiTrendingUp, FiUsers,
  FiBookOpen, FiChevronRight, FiCpu, FiBriefcase, FiEdit3,
} from "react-icons/fi";
import StatCard       from "@/app/components/dashboard/StatCard";
import DashboardCard  from "@/app/components/dashboard/DashboardCard";
import ProgressCard   from "@/app/components/dashboard/ProgressCard";
import ActivityCard   from "@/app/components/dashboard/ActivityCard";
import NotificationCard from "@/app/components/dashboard/NotificationCard";
import BadgeCard      from "@/app/components/dashboard/BadgeCard";
import WeeklyChart    from "@/app/components/dashboard/WeeklyChart";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";
import AIRecommendation from "@/app/components/dashboard/AIRecommendation";
// Removed mock data imports

const BRAND = "rgb(151,0,3)";

// ── Level configuration ────────────────────────────────────────────────────────
const levelConfig: Record<string, any> = {
  Explorer:     { color: "#CD7F32", bg: "bg-orange-50",  text: "text-orange-700" },
  Foundation:   { color: "#6B7280", bg: "bg-gray-100",   text: "text-gray-700"   },
  Practitioner: { color: "#D97706", bg: "bg-amber-50",   text: "text-amber-700"  },
  Leader:       { color: "#6366F1", bg: "bg-indigo-50",  text: "text-indigo-700" },
};

export default function SAMAMDashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [sdcData, setSdcData] = useState<any>(null);
  const [competenciesData, setCompetenciesData] = useState<any[]>([]);
  const [badgesData, setBadgesData] = useState<any>({ earned: [], locked: [] });
  const [loading,  setLoading ] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Not auth");
        const authData = await res.json();
        setUserData(authData.user);

        const username = authData.user.username;
        
        const [profileRes, sdcRes, compRes, badgesRes] = await Promise.all([
          fetch(`/api/dashboard/student/samam/profile/${username}`),
          fetch(`/api/dashboard/student/samam/sdc/${username}`),
          fetch(`/api/dashboard/student/samam/competencies/${username}`),
          fetch(`/api/dashboard/student/samam/badges/${username}`)
        ]);

        if (profileRes.ok) setProfileData(await profileRes.json());
        if (sdcRes.ok) setSdcData(await sdcRes.json());
        if (compRes.ok) setCompetenciesData(await compRes.json());
        if (badgesRes.ok) setBadgesData(await badgesRes.json());

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading || !profileData || !sdcData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  const firstName     = profileData.name?.split(" ")[0] || userData?.username;
  const levelStr      = profileData.samam?.level || "Explorer";
  const level         = levelConfig[levelStr] || levelConfig.Explorer;
  const sdcPct        = sdcData.target > 0 ? Math.round((sdcData.total / sdcData.target) * 100) : 0;
  const hourThisWeek  = "0.0";

  // Flatten competencies for the radar chart
  const flatCompetencies = competenciesData.flatMap((cat: any) => cat.competencies);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ═══ Hero / Profile Row ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Student profile card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1" style={{ backgroundColor: BRAND }} />
          <div className="p-5 flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              {firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Welcome back, {firstName}!</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{profileData.branch} · {profileData.year}</p>
                </div>
                <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${level.bg} ${level.text}`}>
                  {levelStr} Level
                </span>
              </div>

              {/* Level progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress to {profileData.samam?.nextLevel || 'Next Level'}</span>
                  <span className="text-xs font-semibold text-gray-700">{profileData.samam?.levelProgress || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${profileData.samam?.levelProgress || 0}%`, backgroundColor: level.color }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-xs text-gray-500">
                  🏫 <span className="font-medium">{profileData.clubName || 'No Club'}</span>
                </span>
                <span className="text-xs text-gray-500">
                  🎯 <span className="font-medium">{profileData.samam?.careerChoice || 'Undecided'}</span>
                </span>
                <span className="text-xs text-gray-500">
                  🎓 Class of <span className="font-medium">{profileData.samam?.graduationYear || 'TBD'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SDC meter card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1" style={{ backgroundColor: BRAND }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">SAMAM Points</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">
                  {sdcData.total}
                  <span className="text-base font-medium text-gray-400"> / {sdcData.target}</span>
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full border-4 flex items-center justify-center text-sm font-bold"
                style={{ borderColor: BRAND, color: BRAND }}
              >
                {sdcPct}%
              </div>
            </div>
            {/* Breakdown bars */}
            <div className="space-y-2">
              {sdcData.byDomain.map((item: any) => (
                <div key={item.domain} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{item.domain}</span>
                    <span className="font-semibold text-gray-800 ml-2">{item.credits}</span>
                  </div>
                </div>
              ))}
              {sdcData.byDomain.length === 0 && (
                <p className="text-xs text-gray-400 italic">No points earned yet.</p>
              )}
            </div>
            <Link
              href="/dashboard/student/sdc"
              className="flex items-center gap-1 text-xs font-medium mt-4 hover:underline"
              style={{ color: BRAND }}
            >
              View full breakdown <FiChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Stats Row ═════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          icon={<FiBookOpen size={16} />}
          label="Activities Completed"
          value={0}
          trend=""
          trendUp={true}
          accent={BRAND}
        />
        <StatCard
          icon={<FiZap size={16} />}
          label="Competencies"
          value={flatCompetencies.filter(c => c.score > 0).length || 0}
          trend=""
          trendUp={true}
          accent="#2563EB"
        />
        <StatCard
          icon={<FiAward size={16} />}
          label="Badges Earned"
          value={badgesData.earned.length}
          trend=""
          trendUp={true}
          accent="#D97706"
        />
        <StatCard
          icon={<FiTrendingUp size={16} />}
          label="GA Score"
          value="0%"
          trend=""
          trendUp={true}
          accent="#059669"
        />
        <StatCard
          icon={<FiBriefcase size={16} />}
          label="Career Readiness"
          value="0%"
          accent="#7C3AED"
        />
        <StatCard
          icon={<FiClock size={16} />}
          label="Learning Hours"
          value={`${hourThisWeek}h`}
          trend=""
          trendUp={true}
          accent="#0891B2"
        />
      </div>

      {/* ═══ Middle Row ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weekly Learning Hours chart */}
        <DashboardCard
          title="Weekly Learning Hours"
          subtitle={`${hourThisWeek}h total this week`}
          action={
            <Link href="/dashboard/student/analytics" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
              View all →
            </Link>
          }
        >
          <WeeklyChart data={[]} accentColor={BRAND} />
        </DashboardCard>

        {/* Competency Radar */}
        <DashboardCard
          title="Competency Profile"
          subtitle="Across 6 dimensions"
          action={
            <Link href="/dashboard/student/competencies" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
              View all →
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-3">
            {flatCompetencies.length > 0 ? (
              <>
                <CompetencyRadar data={flatCompetencies.map(c => ({ name: c.name, score: c.score }))} accentColor={BRAND} />
                <div className="w-full space-y-1.5">
                  {flatCompetencies.sort((a,b) => b.score - a.score).slice(0, 3).map((c) => (
                    <ProgressCard key={c.name} label={c.name} value={c.score} color={BRAND} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic my-8">No competency data yet.</p>
            )}
          </div>
        </DashboardCard>

        {/* Upcoming Activities */}
        <DashboardCard
          title="Upcoming Activities"
          subtitle="0 scheduled"
          action={
            <Link href="/dashboard/student/activity-catalogue" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
              Browse all →
            </Link>
          }
        >
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500 italic text-sm">
            No upcoming activities.
          </div>
        </DashboardCard>
      </div>

      {/* ═══ AI Recommendations ════════════════════════════════════════════════ */}
      <DashboardCard
        title="AI Recommendations"
        subtitle="Personalized for you"
        action={
          <Link href="/dashboard/student/ai-mentor" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
            Talk to AI Mentor →
          </Link>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 italic">No recommendations available yet.</p>
        </div>
      </DashboardCard>

      {/* ═══ Bottom Row ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Graduate Attribute Scores */}
        <DashboardCard
          title="Graduate Attribute Scores"
          subtitle="Your academic passport indicators"
          action={
            <Link href="/dashboard/student/passport" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
              View Passport →
            </Link>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-500 italic">No score data available.</p>
          </div>
        </DashboardCard>

        {/* Recent Badges */}
        <DashboardCard
          title="Recent Badges"
          subtitle="0 badges earned total"
          action={
            <Link href="/dashboard/student/badges" className="text-xs font-medium hover:underline" style={{ color: BRAND }}>
              View wallet →
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <p className="text-xs text-gray-500 italic col-span-2">No badges earned yet.</p>
          </div>
        </DashboardCard>

        {/* Notifications feed */}
        <DashboardCard title="Recent Notifications">
          <div className="space-y-3">
            <p className="text-sm text-gray-500 italic">No new notifications.</p>
          </div>
        </DashboardCard>
      </div>

      {/* ═══ Quick Actions Row ═════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Log Activity",     icon: <FiBookOpen size={18} />, href: "/dashboard/student/my-activities",     color: "#2563EB" },
          { label: "Write Reflection", icon: <FiEdit3    size={18} />, href: "/dashboard/student/journal",          color: "#059669" },
          { label: "AI Mentor",        icon: <FiCpu      size={18} />, href: "/dashboard/student/ai-mentor",        color: "#7C3AED" },
          { label: "Career Dashboard", icon: <FiBriefcase size={18}/>, href: "/dashboard/student/career",           color: "#D97706" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center gap-2 text-center group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
