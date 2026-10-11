"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiChevronRight, FiHome } from "react-icons/fi";

const routeLabels = {
  dashboard: "Dashboard",
  student: "Student",
  "learning-journey": "Learning Journey",
  "activity-catalogue": "Activity Catalogue",
  "my-activities": "My Activities",
  competencies: "Competencies",
  sdc: "SAMAM Points",
  badges: "Badge Wallet",
  passport: "Student Excellence Passport",
  career: "Career Dashboard",
  "ai-mentor": "AI Mentor",
  journal: "Reflection Journal",
  certificates: "Certificates",
  analytics: "Analytics",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  club: "Club Details",
  reports: "Submissions",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Build crumbs: skip "dashboard/student" prefix, show remaining
  // Always include a "Dashboard" home crumb
  const crumbs = [{ label: "Dashboard", href: "/dashboard/student" }];

  // Walk segments after "dashboard/student"
  const startIdx = segments.indexOf("student") + 1;
  for (let i = startIdx; i < segments.length; i++) {
    const seg = segments[i];
    const href = "/" + segments.slice(0, i + 1).join("/");
    crumbs.push({ label: routeLabels[seg] || seg.replace(/-/g, " "), href });
  }

  // If we're exactly at /dashboard/student, only show "Dashboard"
  if (crumbs.length === 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 py-2.5 px-0.5">
      <FiHome size={12} className="text-zinc-400 dark:text-zinc-500" />
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <FiChevronRight size={11} className="text-zinc-300 dark:text-zinc-700" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[#970003] dark:hover:text-red-400 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
