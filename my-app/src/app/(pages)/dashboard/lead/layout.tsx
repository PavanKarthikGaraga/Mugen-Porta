"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiHome, FiUser, FiUsers, FiLogOut, FiMenu, FiX, FiChevronDown, FiChevronUp, FiFileText, FiUserCheck, FiActivity,
    FiDatabase, FiAward, FiKey, FiCheckSquare, FiBarChart2, FiMusic, FiClipboard
} from "react-icons/fi";
import { toast } from "sonner";
import ChangePassword from "@/app/components/ChangePassword";

export default function LeadDashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [samamDropdownOpen, setSamamDropdownOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [userData, setUserData] = useState({ username: '', name: '', clubName: '', clubId: '' });
    const [isProxySession, setIsProxySession] = useState(false);
    const [proxyStudentInfo, setProxyStudentInfo] = useState(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Fetch user data from token
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    const user = data.user;
                    setUserData({
                        username: user?.username || '',
                        name: user?.name || '',
                        clubName: user?.clubName || '',
                        clubId: user?.clubId || ''
                    });

                    // Check if this is a proxy session
                    setIsProxySession(user?.isProxy || false);
                    if (user?.isProxy && user?.proxyLeadUsername) {
                        setProxyStudentInfo({
                            username: user?.proxyLeadUsername,
                            name: user?.proxyLeadName
                        });
                    } else {
                        setProxyStudentInfo(null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const navigation = [
        { name: 'Overview',            href: '/dashboard/lead',                  icon: FiHome     },
        { name: 'Profile',             href: '/dashboard/lead/profile',          icon: FiUser     },
        { name: 'Students',            href: '/dashboard/lead/students',         icon: FiUsers    },
        { name: 'Attendance Records',  href: '/dashboard/lead/attendance',       icon: FiCheckSquare },
        { name: 'Passport Approvals',  href: '/dashboard/lead/passport-approvals', icon: FiAward    },
    ];

    if (userData.clubId === 'LCH03') {
        navigation.push({ name: 'Music Roster', href: '/dashboard/lead/music-roster', icon: FiMusic });
    }

    // SAMAM used to be one link to a page with 3 client-side tabs, plus a
    // separate flat "Submissions" link that duplicated one of those tabs —
    // refreshing on any tab but Overview reset back to it, since the tab was
    // just useState, not a route. Each is its own page now, grouped together.
    const samamNavigation = [
        { name: 'Overview',         href: '/dashboard/lead/samam/overview',          icon: FiBarChart2 },
        { name: 'Activities',       href: '/dashboard/lead/samam/activities',        icon: FiActivity  },
        { name: 'Submissions',      href: '/dashboard/lead/samam/submissions',       icon: FiFileText  },
        { name: 'Activity Reports', href: '/dashboard/lead/samam/activity-reports',  icon: FiClipboard },
    ];

    const handleLogout = async () => {
        if (isProxySession) {
            // If in proxy session, logout from proxy first
            try {
                const response = await fetch('/api/auth/proxy-logout', {
                    method: 'POST',
                });
                if (response.ok) {
                    toast.success('Exited student dashboard successfully');
                    // Refresh the page to return to lead session
                    window.location.reload();
                    return;
                } else {
                    const error = await response.json();
                    toast.error(`Proxy logout failed: ${error.error}`);
                }
            } catch (error) {
                toast.error('Proxy logout failed. Please try again.');
            }
        }

        // Regular logout - clear token and redirect to login
        try {
            // Clear cookie and call logout API
            document.cookie = 'tck=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            // Continue with logout even if API fails
        }

        // Clear local storage and redirect
        localStorage.clear();
        sessionStorage.clear();
        router.push('/auth/login');
    };

    const handleProxyLogin = async () => {
        try {
            const response = await fetch('/api/auth/lead-proxy-login', {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Successfully accessed student dashboard');
                // Redirect to student dashboard
                router.push('/dashboard/student');
            } else {
                const error = await response.json();
                toast.error(`Failed to access student dashboard: ${error.error}`);
            }
        } catch (error) {
            toast.error('Failed to access student dashboard. Please try again.');
        }
    };

    return (
        <div className="h-screen flex flex-col" style={{ backgroundColor: '#1a1a1a' }}>
            {/* Top Navbar - Fixed */}
            <nav className="text-white shadow-lg relative z-30 flex-shrink-0" style={{ backgroundColor: 'rgb(151, 0, 3)' }}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14">
                        {/* Left side */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-md transition-colors"
                                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
                            >
                                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                            </button>
                            <h1 className="text-xl font-bold ml-4 lg:ml-0">
                                Lead Dashboard
                                {isProxySession && (
                                    <span className="ml-2 text-sm font-normal text-orange-300">
                                        (Student Mode)
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setChangePasswordOpen(true)}
                                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                title="Change Password"
                            >
                                <FiKey size={15} />
                            </button>
                            {!isProxySession && (
                                <button
                                    onClick={handleProxyLogin}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <FiUserCheck size={16} />
                                    <span>Student Dashboard</span>
                                </button>
                            )}
                            <div className="hidden sm:block text-right">
                                <span className="block text-sm">
                                    ID: {userData.username}
                                </span>

                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            >
                                <FiLogOut size={16} />
                                <span>{isProxySession ? 'Exit Student Mode' : 'Logout'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Fixed */}
                <div
                    className={`
                        fixed lg:static inset-y-0 left-0 z-20 mt-14 lg:mt-0
                        w-64 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{ backgroundColor: '#1a1a1a' }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 px-0 py-1 overflow-y-auto">
                            <nav className="space-y-1">
                                {navigation.slice(0, 3).map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 m-0 py-3 text-sm font-medium transition-all duration-200 group border-b border-gray-600 ${
                                                isActive
                                                    ? 'bg-red-700 text-white shadow-lg'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${
                                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                            }`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {/* SAMAM group — 3 separate pages, not tabs */}
                                {(() => {
                                    const inSamam = pathname.startsWith('/dashboard/lead/samam/');
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
                                                    <FiActivity className={`mr-3 h-5 w-5 ${inSamam ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                                    SAMAM
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
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-3 m-0 py-3 text-sm font-medium transition-all duration-200 group border-b border-gray-600 ${
                                                isActive
                                                    ? 'bg-red-700 text-white shadow-lg'
                                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${
                                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                            }`} />
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

                {/* Main Content - Scrollable */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 bg-white overflow-y-auto">
                        <div className="px-4 py-6 sm:px-6 lg:px-8 text-black">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Footer - Fixed */}
            <footer className="text-white py-2 px-4 text-center text-sm flex-shrink-0" style={{ backgroundColor: 'rgb(151, 0, 3)' }}>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <span>© 2026 KL University SAC Activities. All Rights Reserved.</span>
                    <span className="mt-1 sm:mt-0">
                        Designed and Developed by{" "}
                        <a href="https://www.linkedin.com/in/singananischal/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors duration-200 font-medium underline-offset-2 hover:underline">Nischal Singana</a>
                        {" "}| ZeroOne CodeClub
                    </span>
                </div>
            </footer>

            {sidebarOpen && (
                <button
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                ></button>
            )}

            <ChangePassword isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        </div>
    );
}
