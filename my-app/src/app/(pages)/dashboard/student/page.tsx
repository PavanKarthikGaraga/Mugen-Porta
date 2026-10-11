"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiZap, FiStar, FiAward, FiBookOpen, FiChevronRight,
  FiBriefcase, FiActivity, FiCalendar, FiHome,
  FiCheckCircle, FiCompass, FiUser, FiUsers, FiTrendingUp,
  FiArrowUpRight, FiLayers
} from "react-icons/fi";
import ProgressCard    from "@/app/components/dashboard/ProgressCard";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";
import { BadgeIcon }   from "@/lib/badgeIcons";

const BRAND = "rgb(151,0,3)";

const LEVEL_CFG: Record<string, { color: string; bg: string; text: string; next: string; border: string }> = {
  Explorer:     { color: "#CD7F32", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60", next: "Foundation"   },
  Foundation:   { color: "#059669", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", next: "Practitioner" },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60", next: "Leader"       },
  Leader:       { color: "#D97706", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800/60", next: "Innovator"    },
  Innovator:    { color: "#7C3AED", bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800/60", next: "Fellow"    },
  Fellow:       { color: "#DB2777", bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-800 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800/60", next: "Honorary"      },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-pulse pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-44 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
        <div className="h-44 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
        <div className="h-72 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-52 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
        <div className="lg:col-span-2 h-52 bg-zinc-200/70 dark:bg-zinc-800/50 rounded-2xl" />
      </div>
    </div>
  );
}

export default function SAMAMDashboardPage() {
  const [userData,        setUserData       ] = useState<any>(null);
  const [profileData,     setProfileData    ] = useState<any>(null);
  const [sdcData,         setSdcData        ] = useState<any>(null);
  const [competenciesData,setCompetenciesData] = useState<any[]>([]);
  const [badgesData,      setBadgesData     ] = useState<any>({ earned: [], locked: [] });
  const [loading,         setLoading        ] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/student/overview");
        if (!res.ok) throw new Error("Overview fetch failed");
        const d = await res.json();
        setUserData({ username: d.profile.username, name: d.profile.name });
        setProfileData(d.profile);
        setSdcData(d.sdc);
        setCompetenciesData(d.competencies);
        setBadgesData(d.badges);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!profileData || !sdcData) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <FiActivity size={20} />
        </div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Unable to load student metrics</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Please refresh the page to retry.</p>
      </div>
    );
  }

  const firstName       = profileData.name?.split(" ")[0] || userData?.username;
  const levelStr        = profileData.samam?.level || "Explorer";
  const level           = LEVEL_CFG[levelStr] || LEVEL_CFG.Explorer;
  const sdcPct          = sdcData.target > 0 ? Math.min(100, Math.round((sdcData.total / sdcData.target) * 100)) : 0;
  const flatComps       = (Array.isArray(competenciesData) ? competenciesData : []).flatMap((cat: any) => cat.competencies || []);
  const scoredComps     = flatComps.filter((c: any) => !c.isOpportunity && c.score > 0);
  const unlockedCount   = scoredComps.length;
  const earnedBadges    = (badgesData?.earned) || [];
  const istHour         = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
  const greeting        = istHour >= 5 && istHour < 12
    ? "Good morning"
    : istHour >= 12 && istHour < 17
    ? "Good afternoon"
    : istHour >= 17 && istHour < 21
    ? "Good evening"
    : "Keep hustling";

  const stats = [
    { label: "SAMAM Points",   value: sdcData.total,         sub: `Target: ${sdcData.target}`, icon: FiStar,     color: "#970003", bg: "bg-red-50 dark:bg-red-950/40 text-[#970003] dark:text-red-400" },
    { label: "Badges Earned",  value: earnedBadges.length,   sub: "Verified credentials",     icon: FiAward,    color: "#D97706", bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
    { label: "Competencies",   value: unlockedCount,         sub: "Skills unlocked",          icon: FiZap,      color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
    { label: "Current Level",  value: levelStr,              sub: `Next: ${profileData.samam?.nextLevel || level.next}`, icon: FiActivity, color: level.color, bg: `${level.bg} ${level.text}` },
  ];

  const quickLinks = [
    { label: "Activity Catalogue", sub: "Browse & enroll", icon: FiCompass,     href: "/dashboard/student/activity-catalogue", color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
    { label: "My Activities",      sub: "Active & history",icon: FiBookOpen,    href: "/dashboard/student/my-activities",      color: "#970003", bg: "bg-red-50 dark:bg-red-950/40 text-[#970003] dark:text-red-400" },
    { label: "Excellence Passport",sub: "Digital portfolio",icon: FiUser,       href: "/dashboard/student/passport",           color: "#7C3AED", bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" },
    { label: "Badge Wallet",       sub: "Verifiable badges",icon: FiAward,      href: "/dashboard/student/badges",             color: "#D97706", bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
    { label: "Competencies Matrix",sub: "Skill evaluation",icon: FiZap,         href: "/dashboard/student/competencies",       color: "#0891B2", bg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400" },
    { label: "Certificates",       sub: "PDF credentials", icon: FiCheckCircle, href: "/dashboard/student/certificates",       color: "#059669", bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    { label: "Career Roadmap",     sub: "AI journey plan", icon: FiBriefcase,   href: "/dashboard/student/career-roadmap",     color: "#6366F1", bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" },
    { label: "My Club Details",    sub: "Assigned club",   icon: FiUsers,       href: "/dashboard/student/club",               color: "#475569", bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">

      {/* ── Bento Row 1: Student Identity Hero + SAMAM Points Accumulator ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Student Identity & Journey Progression */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs p-6 relative overflow-hidden backdrop-blur-md">
          {/* Subtle brand ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#970003]/6 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white flex items-center justify-center shadow-sm border border-zinc-200/50 dark:border-zinc-700">
              <span className="text-xl font-black select-none tracking-tight">
                {firstName?.[0]?.toUpperCase() || "U"}
              </span>
              {profileData.samam?.avatarUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profileData.samam.avatarUrl}
                  alt={profileData.name || "Profile"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>

            {/* Identity details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {greeting},
                  </p>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight truncate">
                    {profileData.name || userData?.username}
                  </h1>
                </div>

                {/* Level Tier Badge */}
                <div className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${level.bg} ${level.text} ${level.border}`}>
                  <FiActivity size={12} />
                  <span>{levelStr} Tier</span>
                </div>
              </div>

              {/* Department, Year & Club Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {profileData.branch && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                    <FiBookOpen size={11} className="text-zinc-400" />
                    {profileData.branch}
                  </span>
                )}
                {profileData.year && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                    <FiCalendar size={11} className="text-zinc-400" />
                    {profileData.year} Year
                  </span>
                )}
                {profileData.clubName && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
                    <FiHome size={11} className="text-zinc-400" />
                    {profileData.clubName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level Progression Stepper */}
          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                <FiTrendingUp size={12} className="text-[#970003] dark:text-red-400" />
                Progress towards <strong className="text-zinc-900 dark:text-zinc-100">{profileData.samam?.nextLevel || level.next}</strong>
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {profileData.samam?.levelProgress || 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#970003] to-[#C1121F]"
                style={{ width: `${profileData.samam?.levelProgress || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: SAMAM Points Gauge */}
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs p-6 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              SAMAM Points
            </span>
            <Link
              href="/dashboard/student/sdc"
              className="text-xs font-semibold text-[#970003] dark:text-red-400 hover:underline flex items-center gap-0.5"
            >
              Breakdown <FiChevronRight size={12} />
            </Link>
          </div>

          <div className="my-auto py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight">
                {sdcData.total}
              </span>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                / {sdcData.target} pts
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {sdcPct}% of institutional graduation quota completed
            </p>

            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all duration-700 bg-[#970003]"
                style={{ width: `${sdcPct}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>Points balance verified</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <FiCheckCircle size={11} /> Up to date
            </span>
          </div>
        </div>
      </div>

      {/* ── Metric Ribbon: 4 Key Quantifiables ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs p-4 flex items-start justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {s.label}
              </p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1 font-mono">
                {s.value}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                {s.sub}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bento Row 2: Competency Radar & Badge Showcase ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Competency Radar & Top Skills (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Competency Profile</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {unlockedCount} of {flatComps.filter((c: any) => !c.isOpportunity).length} skills unlocked
              </p>
            </div>
            <Link
              href="/dashboard/student/competencies"
              className="text-xs font-semibold text-[#970003] dark:text-red-400 hover:underline flex items-center gap-1"
            >
              Full Matrix <FiArrowUpRight size={13} />
            </Link>
          </div>

          <div className="p-6">
            {scoredComps.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <CompetencyRadar
                    data={[...scoredComps]
                      .sort((a: any, b: any) => b.score - a.score)
                      .slice(0, 8)
                      .map((c: any) => ({ name: c.name, score: c.score }))}
                    accentColor={BRAND}
                  />
                </div>
                <div className="w-full space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Top Verified Competencies
                  </p>
                  {[...scoredComps]
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 5)
                    .map((c: any) => (
                      <ProgressCard key={c.name} label={c.name} value={c.score} color={BRAND} />
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <FiZap size={22} />
                </div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No competencies unlocked yet</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                  Participate in activities from the catalogue to begin validating your skills.
                </p>
                <Link
                  href="/dashboard/student/activity-catalogue"
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#970003] to-[#800002] hover:opacity-95 shadow-xs"
                >
                  Browse Catalogue
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Badges (Span 1) */}
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Recent Badges</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{earnedBadges.length} credentials earned</p>
            </div>
            <Link
              href="/dashboard/student/badges"
              className="text-xs font-semibold text-[#970003] dark:text-red-400 hover:underline flex items-center gap-1"
            >
              Wallet <FiArrowUpRight size={13} />
            </Link>
          </div>

          <div className="p-5 my-auto">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {earnedBadges.slice(0, 6).map((badge: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs"
                      style={{ backgroundColor: badge.bg_color || "#FFF7ED" }}
                    >
                      <BadgeIcon
                        icon={badge.icon}
                        domain={badge.domain}
                        size={22}
                        style={{ color: badge.color || BRAND }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight line-clamp-2">
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <FiAward size={22} />
                </div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No badges earned yet</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                  Complete eligible activities to earn shareable verified credentials.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              Verified by KL University SAC
            </span>
          </div>
        </div>
      </div>

      {/* ── Bento Row 3: Domain Points Breakdown + Launchpad ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Points by Domain (Span 1) */}
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Domain Distribution</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Points across 5 SAC pillars</p>
            </div>
            <Link
              href="/dashboard/student/sdc"
              className="text-xs font-semibold text-[#970003] dark:text-red-400 hover:underline flex items-center gap-0.5"
            >
              Details <FiChevronRight size={12} />
            </Link>
          </div>

          <div className="p-5">
            {(sdcData.byDomain?.length ?? 0) > 0 ? (
              <div className="space-y-3.5">
                {(sdcData.byDomain || []).map((item: any) => (
                  <div key={item.domain}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.domain}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {item.credits} pts
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: sdcData.target > 0
                            ? `${Math.min(100, (item.credits / sdcData.target) * 100)}%`
                            : "0%",
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#970003] dark:text-red-400 flex items-center justify-center mb-2">
                  <FiLayers size={18} />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">No domain points yet</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Points will distribute across TEC, LCH, ESO, IIE, and HWB.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Launchpad (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden backdrop-blur-md">
          <div className="px-6 pt-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Quick Action Launchpad</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Essential student tools & shortcuts</p>
          </div>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-start p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-800/60 shadow-2xs hover:shadow-xs transition-all duration-200 group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${item.bg}`}>
                  <item.icon size={16} />
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-[#970003] dark:group-hover:text-red-400 transition-colors">
                  {item.label}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate w-full">
                  {item.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
