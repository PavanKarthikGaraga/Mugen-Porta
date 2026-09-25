"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX, FiLock, FiBarChart2 } from "react-icons/fi";
import { toast } from "sonner";
import ChangePassword from "@/app/components/ChangePassword";

export default function AnalyticsDashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [userData, setUserData] = useState({ username: '', name: '' });
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        username: data.user.username,
                        name: data.user.name
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const navigation = [
        { name: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart2 }
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                toast.success('Logged out successfully');
                window.location.href = '/auth/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-20 w-64 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 lg:static lg:inset-auto flex flex-col transition duration-200 ease-in-out`} style={{ backgroundColor: 'rgb(24, 24, 27)' }}>
                {/* Logo & Mobile Menu Toggle */}
                <div className="flex items-center justify-between h-16 px-4" style={{ backgroundColor: 'rgb(24, 24, 27)' }}>
                    <div className="flex items-center w-full justify-center lg:justify-start">
                        <Link href="/dashboard/analytics" className="text-white text-xl font-bold flex flex-col lg:flex-row items-center justify-center lg:justify-start">
                            <span className="hidden lg:inline text-white lg:mr-2">Mugen</span>
                            <span className="inline lg:hidden text-white font-bold">Mugen</span>
                            <span className="text-sm font-medium" style={{ color: 'rgb(151, 0, 3)' }}>Analytics</span>
                        </Link>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
                        <FiX className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar">
                    <div className="space-y-6">
                        {/* User Profile Summary */}
                        <div className="px-4 py-4 rounded-xl bg-gray-800 border border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {userData.name || 'Loading...'}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate flex items-center mt-0.5">
                                        {userData.username}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-3 w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-800 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                <FiLogOut className="mr-1.5 h-3.5 w-3.5" />
                                Logout
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1">
                            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Menu
                            </div>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 group border-b border-gray-700 rounded-md ${
                                            isActive
                                                ? 'bg-red-800 text-white shadow-md'
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
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-700 mt-auto">
                    <button
                        onClick={() => setChangePasswordOpen(true)}
                        className="flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white group"
                    >
                        <FiLock className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                        Change Password
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none">
                        <FiMenu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-gray-900">Analytics Dashboard</span>
                    <div className="w-6"></div> {/* Placeholder for alignment */}
                </div>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Password Modal */}
            <ChangePassword 
                isOpen={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </div>
    );
}
