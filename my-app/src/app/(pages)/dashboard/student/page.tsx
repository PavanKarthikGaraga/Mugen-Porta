"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiZap, FiStar, FiAward, FiBookOpen, FiChevronRight,
  FiBriefcase, FiActivity, FiCalendar, FiHome,
  FiCheckCircle, FiCompass, FiUser, FiUsers,
} from "react-icons/fi";
import ProgressCard    from "@/app/components/dashboard/ProgressCard";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";
import { BadgeIcon }   from "@/lib/badgeIcons";

const BRAND = "rgb(151,0,3)";

const LEVEL_CFG: Record<string, { color: string; bg: string; text: string; next: string }> = {
  Explorer:     { color: "#CD7F32", bg: "#FFF7ED", text: "#9A3412", next: "Foundation"   },
  Foundation:   { color: "#6B7280", bg: "#F9FAFB", text: "#374151", next: "Practitioner" },
  Practitioner: { color: "#D97706", bg: "#FFFBEB", text: "#92400E", next: "Leader"       },
  Leader:       { color: "#6366F1", bg: "#EEF2FF", text: "#3730A3", next: "Champion"     },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-pulse pb-8">
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-gray-100 rounded-2xl" />
        <div className="h-72 bg-gray-100 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="lg:col-span-2 h-48 bg-gray-100 rounded-2xl" />
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
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Not auth");
        const authData = await res.json();
        setUserData(authData.user);
        const username = authData.user.username;

        const [pRes, sRes, cRes, bRes] = await Promise.all([
          fetch(`/api/dashboard/student/samam/profile/${username}`),
          fetch(`/api/dashboard/student/samam/sdc/${username}`),
          fetch(`/api/dashboard/student/samam/competencies/${username}`),
          fetch(`/api/dashboard/student/samam/badges/${username}`),
        ]);
        if (pRes.ok) setProfileData(await pRes.json());
        if (sRes.ok) setSdcData(await sRes.json());
        if (cRes.ok) setCompetenciesData(await cRes.json());
        if (bRes.ok) setBadgesData(await bRes.json());
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
      <div className="flex justify-center items-center h-64">
        <p className="text-sm text-gray-400">Could not load dashboard. Please refresh.</p>
      </div>
    );
  }

  const firstName       = profileData.name?.split(" ")[0] || userData?.username;
  const levelStr        = profileData.samam?.level || "Explorer";
  const level           = LEVEL_CFG[levelStr] || LEVEL_CFG.Explorer;
  const sdcPct          = sdcData.target > 0 ? Math.round((sdcData.total / sdcData.target) * 100) : 0;
  const flatComps       = competenciesData.flatMap((cat: any) => cat.competencies || []);
  const unlockedCount   = flatComps.filter((c: any) => c.score > 0).length;
  const earnedBadges    = badgesData.earned || [];
  const istHour         = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
  const greeting        = istHour >= 5 && istHour < 12
    ? "Good morning"
    : istHour >= 12 && istHour < 17
    ? "Good afternoon"
    : istHour >= 17 && istHour < 21
    ? "Good evening"
    : "Keep hustling!";

  const stats = [
    { label: "SAMAM Points",   value: sdcData.total,    icon: FiStar,     color: BRAND,     bg: "#FFF1F1" },
    { label: "Badges Earned",  value: earnedBadges.length, icon: FiAward, color: "#D97706", bg: "#FFFBEB" },
    { label: "Competencies",   value: unlockedCount,    icon: FiZap,      color: "#2563EB", bg: "#EFF6FF" },
    { label: "Current Level",  value: levelStr,         icon: FiActivity, color: level.color, bg: level.bg },
  ];

  const quickLinks = [
    { label: "My Activities",    icon: FiBookOpen,    href: "/dashboard/student/my-activities",      color: BRAND,     bg: "#FFF1F1" },
    { label: "Browse Catalogue", icon: FiCompass,     href: "/dashboard/student/activity-catalogue", color: "#2563EB", bg: "#EFF6FF" },
    { label: "Certificates",     icon: FiCheckCircle, href: "/dashboard/student/certificates",       color: "#059669", bg: "#ECFDF5" },
    { label: "Passport",         icon: FiUser,        href: "/dashboard/student/passport",           color: "#7C3AED", bg: "#F5F3FF" },
    { label: "My Points",        icon: FiStar,        href: "/dashboard/student/sdc",                color: "#D97706", bg: "#FFFBEB" },
    { label: "Competencies",     icon: FiZap,         href: "/dashboard/student/competencies",       color: "#0891B2", bg: "#ECFEFF" },
    { label: "Badges",           icon: FiAward,       href: "/dashboard/student/badges",             color: "#9333EA", bg: "#FAF5FF" },
    { label: "Career",           icon: FiBriefcase,   href: "/dashboard/student/career",             color: "#6B7280", bg: "#F9FAFB" },
    { label: "My Club",          icon: FiUsers,       href: "/dashboard/student/club",               color: "#0891B2", bg: "#ECFEFF" },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 50%, #2563EB 100%)` }} />
        <div className="p-5 flex items-start gap-5 flex-wrap">

          {/* Avatar — square, photo on top of initial fallback */}
          <div className="relative w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden border-2 border-white shadow-md flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #7C3AED 100%)` }}
          >
            <span className="text-white text-2xl font-black select-none">
              {firstName?.[0]?.toUpperCase() || "U"}
            </span>
            {profileData.samam?.avatarUrl && (
              <img
                src={profileData.samam.avatarUrl}
                alt={profileData.name || "Profile photo"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-0.5">{greeting}</p>
                <h2 className="text-xl font-black text-gray-900">{profileData.name || userData?.username}</h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {profileData.branch && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiBookOpen size={11} /> {profileData.branch}
                    </span>
                  )}
                  {profileData.year && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar size={11} /> {profileData.year} Year
                    </span>
                  )}
                  {profileData.clubName && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiHome size={11} /> {profileData.clubName}
                    </span>
                  )}
                </div>
              </div>

              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: level.bg, color: level.color }}
              >
                <FiActivity size={12} /> {levelStr} Level
              </span>
            </div>

            {/* Level progress bar */}
            <div className="mt-4 max-w-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">
                  Progress to {profileData.samam?.nextLevel || level.next}
                </span>
                <span className="text-xs font-bold text-gray-600">
                  {profileData.samam?.levelProgress || 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${profileData.samam?.levelProgress || 0}%`, backgroundColor: level.color }}
                />
              </div>
            </div>
          </div>

          {/* SAMAM score pill */}
          <div className="flex-shrink-0 text-right self-center pl-4 border-l border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SAMAM Points</p>
            <p className="text-3xl font-black leading-none mt-1" style={{ color: BRAND }}>{sdcData.total}</p>
            <p className="text-xs text-gray-400 mt-0.5">of {sdcData.target}</p>
            <div className="mt-1.5 h-1.5 w-20 ml-auto bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${sdcPct}%`, backgroundColor: BRAND }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 50%, ${s.color} 0%, transparent 70%)` }}
            />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Competency + Badges row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Competency Radar — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Competency Profile</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {unlockedCount} of {flatComps.length} unlocked
              </p>
            </div>
            <Link
              href="/dashboard/student/competencies"
              className="text-xs font-bold flex items-center gap-1 hover:underline"
              style={{ color: BRAND }}
            >
              View all <FiChevronRight size={11} />
            </Link>
          </div>
          <div className="p-5">
            {flatComps.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <CompetencyRadar
                    data={flatComps.map((c: any) => ({ name: c.name, score: c.score }))}
                    accentColor={BRAND}
                  />
                </div>
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Top Competencies</p>
                  {flatComps
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 5)
                    .map((c: any) => (
                      <ProgressCard key={c.name} label={c.name} value={c.score} color={BRAND} />
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <FiZap size={24} className="text-blue-400" />
                </div>
                <p className="text-sm font-bold text-gray-700">No competencies unlocked yet</p>
                <p className="text-xs text-gray-400 mt-1">Complete activities to build your profile.</p>
                <Link
                  href="/dashboard/student/activity-catalogue"
                  className="mt-4 text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Browse Activities
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Badges</h3>
              <p className="text-xs text-gray-400 mt-0.5">{earnedBadges.length} earned</p>
            </div>
            <Link
              href="/dashboard/student/badges"
              className="text-xs font-bold flex items-center gap-1 hover:underline"
              style={{ color: BRAND }}
            >
              View all <FiChevronRight size={11} />
            </Link>
          </div>
          <div className="p-5">
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {earnedBadges.slice(0, 6).map((badge: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: badge.bg_color || "#FFF7ED" }}
                    >
                      <BadgeIcon
                        icon={badge.icon}
                        domain={badge.domain}
                        size={20}
                        style={{ color: badge.color || BRAND }}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-gray-700 text-center leading-tight line-clamp-2">
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
                  <FiAward size={24} className="text-amber-400" />
                </div>
                <p className="text-sm font-bold text-gray-700">No badges yet</p>
                <p className="text-xs text-gray-400 mt-1 text-center">Complete activities to earn badges.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Points breakdown + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Points by domain */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Points Breakdown</h3>
              <p className="text-xs text-gray-400 mt-0.5">{sdcPct}% of target reached</p>
            </div>
            <Link
              href="/dashboard/student/sdc"
              className="text-xs font-bold flex items-center gap-1 hover:underline"
              style={{ color: BRAND }}
            >
              Details <FiChevronRight size={11} />
            </Link>
          </div>
          <div className="p-5">
            {sdcData.byDomain.length > 0 ? (
              <div className="space-y-3.5">
                {sdcData.byDomain.map((item: any) => (
                  <div key={item.domain}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{item.domain}</span>
                      <span className="text-xs font-bold" style={{ color: item.color }}>
                        {item.credits} pts
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
              <div className="flex flex-col items-center justify-center py-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#FFF1F1" }}
                >
                  <FiStar size={20} style={{ color: BRAND }} />
                </div>
                <p className="text-sm font-bold text-gray-700">No points yet</p>
                <p className="text-xs text-gray-400 mt-1">Complete an activity to earn points.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Jump to what you need</p>
          </div>
          <div className="p-5 grid grid-cols-4 sm:grid-cols-4 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  <item.icon size={17} />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
