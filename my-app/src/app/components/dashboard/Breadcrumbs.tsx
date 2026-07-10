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
  sdc: "Student Development Credits",
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
  "final-submission": "Final Submission",
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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 py-2 px-1">
      <FiHome size={11} className="text-gray-400" />
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <FiChevronRight size={11} className="text-gray-300" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-gray-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-red-700 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
