"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiBookOpen, FiGrid, FiList, FiZap, FiStar, FiAward,
  FiFileText, FiBriefcase, FiEdit3, FiCheckSquare,
  FiBarChart2, FiBell, FiUser, FiSettings, FiLogOut, FiMenu,
  FiX, FiLock, FiSearch, FiChevronDown, FiInfo,
  FiClipboard, FiUsers, FiMap, FiMusic, FiExternalLink
} from "react-icons/fi";
import { Sparkles } from "lucide-react";
import SamamLogo from "@/components/SamamLogo";
import { toast } from "sonner";
import ChangePassword from "@/app/components/ChangePassword";
import Breadcrumbs from "@/app/components/dashboard/Breadcrumbs";
import CommandPalette from "@/app/components/dashboard/CommandPalette";
import MusicPreferenceForm from "@/app/components/MusicPreferenceForm";
import { linkifyText } from "@/lib/linkify";

const NOTIF_ICON: Record<string, any> = {
  activity: FiClipboard,
  badge: FiAward,
  sdc: FiStar,
  reminder: FiBell,
  system: FiInfo
};

// ─── Grouped Navigation definition (International Standards) ────────────────
interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeType?: "emerald" | "purple" | "blue" | "amber";
  clubOnly?: string;
  hidden?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard",          href: "/dashboard/student",                    icon: FiHome },
      { name: "Activity Catalogue", href: "/dashboard/student/activity-catalogue",  icon: FiGrid, badge: "Live", badgeType: "emerald" },
      { name: "My Activities",      href: "/dashboard/student/my-activities",       icon: FiList },
    ],
  },
  {
    title: "Learning & Growth",
    items: [
      { name: "Learning Journey",   href: "/dashboard/student/learning-journey",   icon: FiBookOpen },
      { name: "Competencies",       href: "/dashboard/student/competencies",        icon: FiZap },
      { name: "SAMAM Points",       href: "/dashboard/student/sdc",                 icon: FiStar },
      { name: "Reflection Journal", href: "/dashboard/student/journal",            icon: FiEdit3 },
    ],
  },
  {
    title: "Credentials",
    items: [
      { name: "Badge Wallet",       href: "/dashboard/student/badges",             icon: FiAward },
      { name: "Excellence Passport",href: "/dashboard/student/passport",           icon: FiFileText, badge: "Public", badgeType: "blue" },
      { name: "Certificates",       href: "/dashboard/student/certificates",       icon: FiCheckSquare },
    ],
  },
  {
    title: "Career Suite",
    items: [
      { name: "Career Dashboard",   href: "/dashboard/student/career",             icon: FiBriefcase, badge: "AI", badgeType: "purple" },
      { name: "Career Roadmap",     href: "/dashboard/student/career-roadmap",     icon: FiMap, badge: "AI", badgeType: "purple" },
    ],
  },
  {
    title: "Community & Affiliation",
    items: [
      { name: "My Club",            href: "/dashboard/student/club",               icon: FiUsers },
      { name: "Music Preference",   href: "/dashboard/student/music-preference",   icon: FiMusic, clubOnly: "LCH03" },
      { name: "Analytics",          href: "/dashboard/student/analytics",          icon: FiBarChart2 },
      { name: "Submissions",        href: "/dashboard/student/reports",            icon: FiFileText, hidden: true },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Notifications",      href: "/dashboard/student/notifications",      icon: FiBell },
      { name: "Profile",            href: "/dashboard/student/profile",            icon: FiUser },
      { name: "Settings",           href: "/dashboard/student/settings",           icon: FiSettings },
    ],
  },
];

export default function SAMAMStudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userData, setUserData]                 = useState({ username: "", name: "", samam_access: 1, clubId: "" });
  const [isLoading, setIsLoading]               = useState(true);
  const [showCareerPrompt, setShowCareerPrompt] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt]   = useState(false);
  const [selectedCareer, setSelectedCareer]     = useState("");
  const [savingCareer, setSavingCareer]         = useState(false);
  const [notifOpen, setNotifOpen]               = useState(false);
  const [userMenuOpen, setUserMenuOpen]         = useState(false);

  const notifRef    = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router   = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [isProxySession, setIsProxySession] = useState(false);
  const [proxyType, setProxyType] = useState<"admin" | "lead" | null>(null);
  const [proxyName, setProxyName] = useState<string>("");

  // ── Fetch user data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserData({
            username:     data.user?.username    || "",
            name:         data.user?.name        || "",
            samam_access: data.user?.samam_access ?? 1,
            clubId:       data.user?.clubId      || "",
          });

          if (data.user?.isProxy) {
            setIsProxySession(true);
            if (data.user?.proxyAdminUsername) {
              setProxyType("admin");
              setProxyName(data.user?.proxyAdminName || "Admin");
            } else if (data.user?.proxyLeadUsername) {
              setProxyType("lead");
              setProxyName(data.user?.proxyLeadName || "Lead");
            }
          }

          if (data.user?.username) {
            const profileRes = await fetch(`/api/dashboard/student/profile/${data.user.username}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              const cc = profileData.careerChoice;
              if (!cc || cc === "null" || cc === "undefined" || String(cc).trim() === "") {
                setShowCareerPrompt(true);
              }
            }

            if (data.user?.clubId === "LCH03") {
              const musicRes = await fetch(`/api/dashboard/student/music-preference`);
              if (musicRes.ok) {
                const musicData = await musicRes.json();
                if (musicData.eligible && !musicData.submitted) {
                  setShowMusicPrompt(true);
                }
              }
            }
          }
        }
        
        // Fetch notifications
        const notifRes = await fetch("/api/student/notifications");
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (Array.isArray(notifData)) setNotifications(notifData);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // ── Close dropdowns on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))    setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Save career choice ───────────────────────────────────────────────────
  const handleSaveCareer = async () => {
    if (!selectedCareer) { toast.error("Please select a career choice"); return; }
    setSavingCareer(true);
    try {
      const res = await fetch(`/api/dashboard/student/profile/${userData.username}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ careerChoice: selectedCareer }),
      });
      if (res.ok) { toast.success("Career choice saved!"); setShowCareerPrompt(false); }
      else          toast.error("Failed to save career choice");
    } catch { toast.error("An error occurred while saving."); }
    finally   { setSavingCareer(false); }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (isProxySession) {
      try {
        const response = await fetch('/api/auth/proxy-logout', { method: 'POST' });
        if (response.ok) {
          toast.success('Exited student dashboard successfully');
          if (proxyType === 'admin') router.push('/dashboard/admin');
          else if (proxyType === 'lead') router.push('/dashboard/lead');
          else window.location.reload();
          return;
        } else {
          const error = await response.json();
          toast.error(`Proxy logout failed: ${error.error}`);
        }
      } catch {
        toast.error('Proxy logout failed. Please try again.');
      }
    }

    try {
      document.cookie = "tck=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { /* continue */ }
    localStorage.clear();
    sessionStorage.clear();
    router.push("/auth/login");
  };

  const initials = userData.name
    ? userData.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  // ── Loading Skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-zinc-50 dark:bg-[#090A0E]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#970003] to-[#C1121F] flex items-center justify-center shadow-lg shadow-red-950/20 animate-pulse">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 animate-pulse">Initializing SAMAM Platform…</p>
        </div>
      </div>
    );
  }

  // ── Locked Access View ───────────────────────────────────────────────────
  if (userData.samam_access !== 1) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#090A0E] p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <FiLock className="h-7 w-7 text-[#970003] dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
            SAMAM Access Pending
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2 leading-relaxed">
            Your SAMAM activity dashboard hasn&apos;t been unlocked yet.
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-8">
            Please reach out to your Club Lead or SAC Administrator to unlock your credentials.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#970003] to-[#800002] hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── Music Preference Modal ───────────────────────────────────────────────
  if (showMusicPrompt) {
    return (
      <div className="h-dvh flex items-center justify-center bg-zinc-50 dark:bg-[#090A0E] px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
          <MusicPreferenceForm onSuccess={() => setShowMusicPrompt(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-zinc-50 dark:bg-[#090A0E] text-zinc-900 dark:text-zinc-100 font-sans antialiased overflow-hidden">
      <CommandPalette />
      
      {/* ═══ Career Prompt Modal (Modernized) ═════════════════════════════════ */}
      {showCareerPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-7 max-w-md w-full relative">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#970003] dark:text-red-400 flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Complete Your Profile</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Select your primary career aspiration. SAMAM uses this to personalize activity recommendations and roadmap milestones.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Primary Pathway
                </label>
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value)}
                  className="w-full h-11 px-3.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#970003]/20 focus:border-[#970003] transition-all cursor-pointer"
                >
                  <option value="">Choose your pathway…</option>
                  <option value="Placement">Corporate Placement (Core & Tech)</option>
                  <option value="Higher Education">Higher Education (MS, M.Tech, MBA)</option>
                  <option value="Entrepreneurship">Entrepreneurship & Startups</option>
                  <option value="Research & Development (R&D)">Research & Innovation (R&D)</option>
                  <option value="Civil Services">Civil Services & Public Governance</option>
                  <option value="Social Service / NGOs">Social Impact & Outreach</option>
                  <option value="Overseas Career">Global Employment & Overseas</option>
                </select>
              </div>
              <button
                onClick={handleSaveCareer}
                disabled={savingCareer}
                className="w-full h-11 text-white font-semibold text-xs rounded-xl bg-gradient-to-r from-[#970003] to-[#800002] hover:opacity-95 transition-opacity disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {savingCareer ? "Saving Preference…" : "Confirm Career Pathway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Glass Header Topbar ═════════════════════════════════════════════ */}
      <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0D0E12]/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 shadow-2xs">
        {/* Left Brand and Navigation Toggle */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          
          <Link href="/dashboard/student" className="flex items-center gap-2.5 min-w-0 group">
            <SamamLogo className="h-9 w-9 sm:h-10 sm:w-10 group-hover:scale-105 transition-transform" />
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-red-950 dark:text-white">SAMAM</span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-400 dark:text-zinc-500 pl-2 ml-2 border-l border-zinc-200 dark:border-zinc-800">
                KL SAC Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center — Command Palette Trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <FiSearch size={13} className="text-zinc-400" />
          <span className="text-xs">Quick search activities, badges…</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
            ⌘K
          </kbd>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Proxy Impersonation Banner */}
          {isProxySession && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden sm:inline font-medium">Student View</span>
              <button
                onClick={handleLogout}
                className="font-semibold underline ml-1 hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer"
              >
                Exit {proxyType === 'admin' ? '(Admin)' : '(Lead)'}
              </button>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
              className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <FiBell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#970003] dark:bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-[#970003] dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                      No notifications yet
                    </div>
                  ) : notifications.slice(0, 5).map((n) => {
                    const NIcon = NOTIF_ICON[n.type] || FiBell;
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!n.read ? "bg-red-50/30 dark:bg-red-950/20" : ""}`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <NIcon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">{linkifyText(n.message)}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            {new Date(n.time || n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                  <Link
                    href="/dashboard/student/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-[#970003] dark:text-red-400 hover:underline inline-flex items-center gap-1"
                  >
                    View all notifications <FiChevronDown size={11} className="-rotate-90" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-white font-bold text-xs flex items-center justify-center shadow-2xs border border-zinc-200/50 dark:border-zinc-700">
                {initials}
              </div>
              <span className="text-xs font-semibold hidden md:block text-zinc-700 dark:text-zinc-200 max-w-[100px] truncate">
                {userData.name || userData.username}
              </span>
              <FiChevronDown size={12} className={`text-zinc-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{userData.name}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">ID: {userData.username}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/dashboard/student/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    <FiUser size={13} className="text-zinc-400" /> My Profile
                  </Link>
                  <Link
                    href="/dashboard/student/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    <FiSettings size={13} className="text-zinc-400" /> Account Settings
                  </Link>
                  <button
                    onClick={() => { setChangePasswordOpen(true); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  >
                    <FiLock size={13} className="text-zinc-400" /> Change Password
                  </button>
                </div>
                <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <FiLogOut size={13} /> {isProxySession ? 'Exit Student Mode' : 'Sign Out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ Main Shell Body: Grouped Sidebar + Canvas ════════════════════════ */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20 mt-14 lg:mt-0
            w-64 bg-white/95 dark:bg-[#0D0E12]/95 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800/80
            transform transition-transform duration-200 ease-in-out flex flex-col flex-shrink-0
            ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
            {NAVIGATION_GROUPS.map((group) => {
              const visibleItems = group.items.filter((item) => {
                if (item.hidden) return false;
                if (item.clubOnly && userData.clubId !== item.clubOnly) return false;
                return true;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-0.5">
                  <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 select-none">
                    {group.title}
                  </div>
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard/student" && pathname.startsWith(item.href + "/"));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150
                          ${isActive
                            ? "bg-[#970003]/8 text-[#970003] dark:bg-[#970003]/20 dark:text-red-400 font-semibold shadow-2xs"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <item.icon
                            size={15}
                            className={isActive ? "text-[#970003] dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className={`
                            text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide
                            ${item.badgeType === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40" : ""}
                            ${item.badgeType === "purple" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40" : ""}
                            ${item.badgeType === "blue" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40" : ""}
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer with Status & University Info */}
          <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
              <span>KL University SAC</span>
            </div>
          </div>
        </aside>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-zinc-50/70 dark:bg-[#090A0E] focus:outline-none">
            {/* Breadcrumb strip */}
            <div className="px-4 sm:px-6 lg:px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xs">
              <Breadcrumbs />
            </div>
            
            {/* Page Content Viewport */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Change Password Dialog */}
      <ChangePassword
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
