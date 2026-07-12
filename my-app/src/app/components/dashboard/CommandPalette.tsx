"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { 
  FiSearch, FiHome, FiBookOpen, FiGrid, FiList, FiZap, 
  FiStar, FiAward, FiFileText, FiBriefcase, FiCpu, 
  FiEdit3, FiCheckSquare, FiBarChart2, FiBell, FiUser, FiSettings 
} from "react-icons/fi";

const COMMANDS = [
  { name: "Dashboard",                  href: "/dashboard/student",                  icon: <FiHome /> },
  { name: "Learning Journey",           href: "/dashboard/student/learning-journey", icon: <FiBookOpen /> },
  { name: "Activity Catalogue",         href: "/dashboard/student/activity-catalogue",icon: <FiGrid /> },
  { name: "My Activities",              href: "/dashboard/student/my-activities",     icon: <FiList /> },
  { name: "Competencies",               href: "/dashboard/student/competencies",      icon: <FiZap /> },
  { name: "SAMAM Points",                href: "/dashboard/student/sdc",              icon: <FiStar /> },
  { name: "Badge Wallet",               href: "/dashboard/student/badges",           icon: <FiAward /> },
  { name: "Excellence Passport",        href: "/dashboard/student/passport",         icon: <FiFileText /> },
  { name: "Career Dashboard",           href: "/dashboard/student/career",           icon: <FiBriefcase /> },
  { name: "AI Mentor",                  href: "/dashboard/student/ai-mentor",        icon: <FiCpu /> },
  { name: "Reflection Journal",         href: "/dashboard/student/journal",          icon: <FiEdit3 /> },
  { name: "Certificates",               href: "/dashboard/student/certificates",     icon: <FiCheckSquare /> },
  { name: "Analytics",                  href: "/dashboard/student/analytics",        icon: <FiBarChart2 /> },
  { name: "Notifications",              href: "/dashboard/student/notifications",    icon: <FiBell /> },
  { name: "Profile",                    href: "/dashboard/student/profile",          icon: <FiUser /> },
  { name: "Settings",                   href: "/dashboard/student/settings",         icon: <FiSettings /> },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Command 
          className="flex flex-col w-full h-full"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="flex items-center px-4 border-b border-gray-100 dark:border-zinc-800">
            <FiSearch className="text-gray-400 dark:text-zinc-500 mr-2" size={18} />
            <Command.Input 
              autoFocus 
              placeholder="Search for pages, activities, or badges... (⌘K)" 
              className="flex-1 h-14 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-sm"
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="p-4 text-center text-sm text-gray-500">No results found.</Command.Empty>

            <Command.Group heading="Pages" className="text-xs font-semibold text-gray-500 dark:text-zinc-400 px-2 py-1">
              {COMMANDS.map((cmd) => (
                <Command.Item
                  key={cmd.name}
                  onSelect={() => {
                    router.push(cmd.href);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 aria-selected:bg-gray-100 dark:aria-selected:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <span className="text-gray-400 dark:text-zinc-500">{cmd.icon}</span>
                  {cmd.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
