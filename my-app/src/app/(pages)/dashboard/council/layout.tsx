"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiHome, FiUser, FiUsers, FiLogOut, FiMenu, FiX,
    FiActivity, FiCheckSquare, FiAward, FiKey, FiUnlock, FiStar,
    FiBarChart2, FiFileText, FiBell, FiSettings, FiChevronDown, FiChevronUp
} from "react-icons/fi";
import ChangePassword from "@/app/components/ChangePassword";

const DOMAIN_LABELS: Record<string, string> = {
    TEC: "Technology",
    LCH: "Liberal Arts",
    IIE: "Innovation & Entrepreneurship",
    HWB: "Health & Wellbeing",
    ESO: "Environment & Social",
};

export default function CouncilDashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [samamDropdownOpen, setSamamDropdownOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [userData, setUserData] = useState<{ username: string; assignedDomains: string[] }>({ username: '', assignedDomains: [] });
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.user) {
                    const domains: string[] = Array.isArray(d.user.assignedDomains) && d.user.assignedDomains.length > 0
                        ? d.user.assignedDomains
                        : (d.user.assignedDomain ? [d.user.assignedDomain] : []);
                    setUserData({ username: d.user.username, assignedDomains: domains });
                }
            })
            .catch(() => {});
    }, []);

    const navigation = [
        { name: 'Overview',           href: '/dashboard/council',                  icon: FiHome        },
        { name: 'Students',           href: '/dashboard/council/students',          icon: FiUsers       },
        { name: 'SAMAM Dashboard',    href: '/dashboard/council/samam',             icon: FiAward       },
        { name: 'SAMAM Access',       href: '/dashboard/council/samam-access',      icon: FiUnlock      },
        { name: 'Activity Awards',    href: '/dashboard/council/activity-awards',   icon: FiStar        },
        { name: 'Attendance Records', href: '/dashboard/council/attendance',        icon: FiCheckSquare },
        { name: 'Passport Approvals', href: '/dashboard/council/passport-approvals',icon: FiAward       },
        { name: 'Profile',            href: '/dashboard/council/profile',           icon: FiUser        },
    ];

    const samamNavigation = [
        { name: 'Overview',      href: '/dashboard/council/samam/overview',      icon: FiBarChart2 },
        { name: 'Students',      href: '/dashboard/council/samam/students',      icon: FiUsers     },
        { name: 'Activities',    href: '/dashboard/council/samam/activities',    icon: FiActivity  },
        { name: 'Submissions',   href: '/dashboard/council/samam/submissions',   icon: FiFileText  },
        { name: 'Completed',     href: '/dashboard/council/samam/completed',     icon: FiCheckSquare },
        { name: 'Notifications', href: '/dashboard/council/samam/notifications', icon: FiBell      },
        { name: 'Settings',      href: '/dashboard/council/samam/settings',      icon: FiSettings  },
    ];

    const handleLogout = async () => {
        try {
            document.cookie = 'tck=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        localStorage.clear();
        sessionStorage.clear();
        router.push('/auth/login');
    };

    const domainLabels = userData.assignedDomains.map(d => DOMAIN_LABELS[d] || d);

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: '#1a1a1a' }}>
            <nav className="text-white shadow-lg relative z-30 flex-shrink-0" style={{ backgroundColor: 'rgb(151, 0, 3)' }}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md transition-colors"
                            >
                                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                            </button>
                            <h1 className="text-xl font-bold ml-4 lg:ml-0">Council Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:block text-right">
                                <span className="block text-sm">ID: {userData.username}</span>
                                {domainLabels.length > 0 && (
                                    <span className="block text-xs text-red-200">{domainLabels.join(' · ')}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setChangePasswordOpen(true)}
                                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                title="Change Password"
                            >
                                <FiKey size={15} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                <div
                    className={`fixed lg:static inset-y-0 left-0 z-20 mt-14 lg:mt-0 w-64 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                    style={{ backgroundColor: '#1a1a1a' }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 px-0 py-1 overflow-y-auto">
                            <nav className="space-y-1">
                                {navigation.slice(0, 2).map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard/council' && pathname.startsWith(item.href + '/'));
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 m-0 py-3 text-sm font-medium transition-all duration-200 group border-b border-gray-600 ${
                                                isActive ? 'bg-red-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {(() => {
                                    const inSamam = samamNavigation.some((item) => pathname === item.href);
                                    const isOpen = samamDropdownOpen || inSamam;
                                    return (
                                        <div className="border-b border-gray-600">
                                            <button
                                                onClick={() => setSamamDropdownOpen(!samamDropdownOpen)}
                                                className={`flex items-center justify-between w-full px-3 py-3 text-sm font-medium transition-all duration-200 group ${
                                                    inSamam ? 'text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <FiAward className={`mr-3 h-5 w-5 ${inSamam ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                                    SAMAM Control
                                                </div>
                                                {isOpen ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                                            </button>
                                            {isOpen && (
                                                <div className="pb-2 ml-6 space-y-1">
                                                    {samamNavigation.map((item) => {
                                                        const isActive = pathname === item.href;
                                                        return (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                                                                    isActive ? 'bg-red-700 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                                }`}
                                                                onClick={() => setSidebarOpen(false)}
                                                            >
                                                                <item.icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                                                {item.name}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {navigation.slice(3).map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard/council' && pathname.startsWith(item.href + '/'));
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 m-0 py-3 text-sm font-medium transition-all duration-200 group border-b border-gray-600 ${
                                                isActive ? 'bg-red-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={() => { setChangePasswordOpen(true); setSidebarOpen(false); }}
                                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group border-b border-gray-600"
                                >
                                    <FiKey className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                                    Change Password
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 bg-white overflow-y-auto">
                        <div className="px-4 py-6 sm:px-6 lg:px-8 text-black">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            <footer className="text-white py-2 px-4 text-center text-sm flex-shrink-0" style={{ backgroundColor: 'rgb(151, 0, 3)' }}>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span>© 2026 KL University SAC Activities. All Rights Reserved.</span>
                    <span className="mt-1 sm:mt-0">
                        Designed and Developed by{" "}
                        <a href="https://www.linkedin.com/in/singananischal/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white font-medium">Nischal Singana</a>
                        {" "}| ZeroOne CodeClub
                    </span>
                </div>
            </footer>

            {sidebarOpen && (
                <button className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />
            )}

            <ChangePassword isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        </div>
    );
}
