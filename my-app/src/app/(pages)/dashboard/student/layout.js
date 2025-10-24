"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiHome, FiFolder, FiLogOut, FiMenu, FiX, FiUser, FiInfo,
    FiLock, FiFileText, FiSend
} from "react-icons/fi";
import ChangePassword from "@/app/components/ChangePassword";

export default function StudentDashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [userData, setUserData] = useState({ username: '', name: '' });
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Fetch user data from token
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        username: data.username || '',
                        name: data.name || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const navigation = [
        { name: 'Overview', href: '/dashboard/student', icon: FiHome },
        { name: 'Club Details', href: '/dashboard/student/club', icon: FiFolder },
        { name: 'Reports', href: '/dashboard/student/reports', icon: FiFileText },
        { name: 'Final Submission', href: '/dashboard/student/final-submission', icon: FiSend },
    ];

    const handleLogout = () => {
        // Add logout logic here
        router.push('/auth/login');
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
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                            </button>
                            <h1 className="text-xl font-bold ml-4 lg:ml-0">Student Dashboard</h1>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            <span className="hidden sm:block text-sm">
                                ID: {userData.username}
                            </span>
                            <span className="hidden sm:block text-sm font-medium">{userData.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            >
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Fixed */}
                <div
                    className={`
                        fixed lg:static inset-y-0 left-0 z-20 mt-16 lg:mt-0
                        w-64 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{ backgroundColor: '#1a1a1a' }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 px-0 py-1 overflow-y-auto">
                            <nav className="space-y-1">
                                {navigation.map((item) => {
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
                            </nav>
                        </div>

                        {/* Change Password Button at Bottom of Sidebar */}
                        <div className="px-4 py-4 border-t border-gray-700">
                            <button
                                onClick={() => setChangePasswordOpen(true)}
                                className="flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white group"
                            >
                                <FiLock className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                                Change Password
                            </button>
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
                    <span>© 2025 KL University SAC Activities. All Rights Reserved.</span>
                    <span className="mt-1 sm:mt-0">
                        Designed and Developed by Pavan Karthik Garaga | ZeroOne CodeClub
                    </span>
                </div>
            </footer>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <button
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                ></button>
            )}

            {/* Change Password Modal */}
            <ChangePassword
                isOpen={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </div>
    );
}
