"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiBookOpen, FiGrid, FiList, FiZap, FiStar, FiAward,
  FiFileText, FiBriefcase, FiCpu, FiEdit3, FiCheckSquare,
  FiBarChart2, FiBell, FiUser, FiSettings, FiLogOut, FiMenu,
  FiX, FiLock, FiSearch, FiChevronDown, FiFolder, FiSend,
  FiClipboard, FiInfo, FiUsers, FiMap, FiMusic
} from "react-icons/fi";

const NOTIF_ICON: Record<string, any> = { activity: FiClipboard, badge: FiAward, sdc: FiStar, reminder: FiBell, system: FiInfo };
import { toast } from "sonner";
import ChangePassword from "@/app/components/ChangePassword";
import Breadcrumbs from "@/app/components/dashboard/Breadcrumbs";
import CommandPalette from "@/app/components/dashboard/CommandPalette";
import MusicPreferenceForm from "@/app/components/MusicPreferenceForm";

// ─── Navigation definition ────────────────────────────────────────────────────
const navigation = [
  { name: "Dashboard",                  href: "/dashboard/student",                  icon: FiHome },
  { name: "Learning Journey",           href: "/dashboard/student/learning-journey", icon: FiBookOpen },
  { name: "Activity Catalogue",         href: "/dashboard/student/activity-catalogue",icon: FiGrid },
  { name: "My Activities",              href: "/dashboard/student/my-activities",     icon: FiList },
  { name: "Competencies",               href: "/dashboard/student/competencies",      icon: FiZap },
  { name: "My Points", href: "/dashboard/student/sdc", icon: FiStar },
  { name: "Badge Wallet",               href: "/dashboard/student/badges",           icon: FiAward },
  { name: "Excellence Passport",        href: "/dashboard/student/passport",         icon: FiFileText },
  { name: "Career Dashboard",           href: "/dashboard/student/career",           icon: FiBriefcase },
  { name: "Career Roadmap",             href: "/dashboard/student/career-roadmap",   icon: FiMap },
  { name: "Reflection Journal",         href: "/dashboard/student/journal",          icon: FiEdit3 },
  { name: "Certificates",               href: "/dashboard/student/certificates",     icon: FiCheckSquare },
  { name: "Analytics",                  href: "/dashboard/student/analytics",        icon: FiBarChart2 },
  { name: "Notifications",              href: "/dashboard/student/notifications",    icon: FiBell },
  { name: "Profile",                    href: "/dashboard/student/profile",          icon: FiUser },
  { name: "Settings",                   href: "/dashboard/student/settings",         icon: FiSettings },
  { name: "My Club",                     href: "/dashboard/student/club",             icon: FiUsers },
  { name: "Music Preference",           href: "/dashboard/student/music-preference", icon: FiMusic, clubOnly: "LCH03" },
  // Legacy routes preserved
  { name: "Submissions",                href: "/dashboard/student/reports",          icon: FiFileText, hidden: true },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SAMAMStudentDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userData, setUserData]                 = useState({ username: "", name: "", samam_access: 1, clubId: "" });
  const [isLoading, setIsLoading]               = useState(true);
  const [showCareerPrompt, setShowCareerPrompt] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt]   = useState(false);
  const [selectedCareer, setSelectedCareer]     = useState("");
  const [savingCareer, setSavingCareer]         = useState(false);
  const [searchQuery, setSearchQuery]           = useState("");
  const [notifOpen, setNotifOpen]               = useState(false);
  const [userMenuOpen, setUserMenuOpen]         = useState(false);

  const notifRef    = useRef(null);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router   = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))    setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
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

  const visibleNav = navigation.filter((item) => {
    if (item.hidden) return false;
    if (item.clubOnly && userData.clubId !== item.clubOnly) return false;
    return true;
  });

  // ── Render ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (userData.samam_access !== 1) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
          <FiLock className="h-9 w-9" style={{ color: "rgb(151,0,3)" }} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          SAMAM Access Pending
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-1 text-sm">
          Your SAMAM dashboard hasn&apos;t been unlocked yet.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-center max-w-sm mb-8 text-xs">
          Contact your club lead or SAC admin to get access.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "rgb(151,0,3)" }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (showMusicPrompt) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50 px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <MusicPreferenceForm onSuccess={() => setShowMusicPrompt(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col" style={{ backgroundColor: "#1a1a1a" }}>
      <CommandPalette />
      
      {/* ═══ Career Prompt Modal ══════════════════════════════════════════════ */}
      {showCareerPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please select your career choice to continue. This helps us tailor opportunities for you.
            </p>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="w-full h-12 px-4 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none text-black"
            >
              <option value="">Select Career Choice</option>
              <option value="Placement">Placement</option>
              <option value="Higher Education">Higher Education</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="Research &amp; Development (R&amp;D)">Research &amp; Development (R&D)</option>
              <option value="Civil Services">Civil Services</option>
              <option value="Social Service / NGOs">Social Service / NGOs</option>
              <option value="Overseas Career">Overseas Career</option>
            </select>
            <button
              onClick={handleSaveCareer}
              disabled={savingCareer}
              className="w-full py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "rgb(151,0,3)" }}
            >
              {savingCareer ? "Saving…" : "Save Selection"}
            </button>
          </div>
        </div>
      )}


      {/* ═══ Top Navigation ═══════════════════════════════════════════════════ */}
      <nav
        className="text-white shadow-lg relative z-30 flex-shrink-0"
        style={{ backgroundColor: "rgb(151,0,3)" }}
      >
        <div className="px-3 sm:px-5">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Left — hamburger + brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-bold text-base hidden sm:block">SAMAM <span className="text-xs font-normal text-white/80">(Student Activity Management and Achievement Model)</span></span>
              </div>
            </div>

            {/* Center — removed search */}

            {/* Right — notifications + user */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                  className="relative p-2 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Notifications"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-xs">
                          No notifications yet.
                        </div>
                      ) : notifications.slice(0, 5).map((n) => {
                        const NIcon = NOTIF_ICON[n.type] || FiBell;
                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.read ? "bg-red-50/40" : ""}`}
                          >
                            <div className="w-7 h-7 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center text-gray-500 bg-gray-100"><NIcon size={13} /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(n.time || n.created_at).toLocaleString('en-US', {
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100">
                      <Link
                        href="/dashboard/student/notifications"
                        className="text-xs font-medium text-center block hover:underline"
                        style={{ color: "rgb(151,0,3)" }}
                        onClick={() => setNotifOpen(false)}
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-xs font-medium hidden sm:block max-w-[100px] truncate">
                    {userData.name || userData.username}
                  </span>
                  <FiChevronDown size={12} className={`hidden sm:block transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                      <p className="text-xs text-gray-500">ID: {userData.username}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/student/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser size={14} /> Profile
                      </Link>
                      <Link
                        href="/dashboard/student/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiSettings size={14} /> Settings
                      </Link>
                      <button
                        onClick={() => { setChangePasswordOpen(true); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <FiLock size={14} /> Change Password
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ═══ Sidebar ════════════════════════════════════════════════════════ */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-20 mt-14 lg:mt-0
            w-60 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar brand strip */}
            <div className="px-4 py-3 border-b border-gray-700/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Student Platform
              </p>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-1 scrollbar-thin">
              {visibleNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard/student' && pathname.startsWith(item.href + '/'));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b border-gray-800/40 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                    style={isActive ? { backgroundColor: "rgb(151,0,3)" } : {}}
                  >
                    <item.icon
                      size={16}
                      className={isActive ? "text-white" : "text-gray-500 group-hover:text-white"}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            <div className="px-4 py-3 border-t border-gray-700/50 space-y-1">
              <button
                onClick={() => { setChangePasswordOpen(true); setSidebarOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150"
              >
                <FiLock size={15} />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-150"
              >
                <FiLogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Main Content ════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 bg-gray-50 dark:bg-zinc-900 overflow-y-auto">
            {/* Breadcrumb bar */}
            <div className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 px-4 sm:px-6">
              <Breadcrumbs />
            </div>
            <div className="px-4 py-5 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-white py-2 px-4 text-center text-xs flex-shrink-0"
        style={{ backgroundColor: "rgb(151,0,3)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-1">
          <span>© 2026 KL University SAC Activities. All Rights Reserved.</span>
          <span>Designed and Developed by{" "}<a href="https://www.linkedin.com/in/singananischal/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors duration-200 font-medium underline-offset-2 hover:underline">Nischal Singana</a>{" "}| ZeroOne CodeClub</span>
        </div>
      </footer>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
