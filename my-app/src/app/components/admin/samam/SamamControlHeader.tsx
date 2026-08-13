"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiUsers, FiActivity, FiFileText, FiBell, FiSettings, FiCheckCircle } from "react-icons/fi";

const ALL_TABS = [
  { key: "overview",      label: "Overview",      icon: <FiBarChart2 size={15} /> },
  { key: "students",      label: "Students",      icon: <FiUsers size={15} />     },
  { key: "activities",    label: "Activities",    icon: <FiActivity size={15} />  },
  { key: "submissions",   label: "Submissions",   icon: <FiFileText size={15} />  },
  { key: "completed",     label: "Completed",     icon: <FiCheckCircle size={15} /> },
  { key: "notifications", label: "Notifications", icon: <FiBell size={15} />      },
  { key: "settings",      label: "Settings",      icon: <FiSettings size={15} />  },
];

/**
 * Shared header + in-page tab strip for the SAMAM Control section, used by
 * admin/lead's (soon faculty/council's) top-level SAMAM pages. Each section
 * is its own route now (was a client-side tab that reset to Overview on
 * refresh) — this just keeps the same visual shell, with real <Link>s
 * driving navigation instead of a setTab() call.
 */
export default function SamamControlHeader({
  basePath, tabs, title = "SAMAM Control", subtitle = "Student Activity Management · Admin Console",
}: { basePath: string; tabs: string[]; title?: string; subtitle?: string }) {
  const pathname = usePathname();
  const visibleTabs = ALL_TABS.filter(t => tabs.includes(t.key));

  return (
    <>
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-gray-900">{title}</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-4 overflow-x-auto">
        <nav className="flex items-center gap-0.5 px-3 py-1.5 min-w-max">
          {visibleTabs.map((t) => {
            const href = `${basePath}/${t.key}`;
            const isActive = pathname === href;
            return (
              <Link
                key={t.key}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
