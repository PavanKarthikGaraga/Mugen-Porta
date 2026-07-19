"use client";

import { useState, useEffect } from "react";
import { FiUnlock, FiAlertCircle } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';
import { useRouter } from "next/navigation";

export default function AIBansPage() {
    const [bans, setBans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchBans = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dashboard/admin/dev/ai-bans");
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch banned users");
            const data = await res.json();
            setBans(data.bannedUsers || []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBans();
    }, []);

    const handleUnlock = async (username: string) => {
        if (!confirm(`Are you sure you want to unlock ${username}?`)) return;
        
        try {
            const res = await fetch("/api/dashboard/admin/dev/ai-bans/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });

            if (!res.ok) throw new Error("Failed to unlock user");
            
            // Refresh list
            fetchBans();
        } catch (error) {
            handleApiError(error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiAlertCircle className="text-red-500" /> Banned AI Mentor Users
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                        Manage users who have been banned due to spamming the AI Mentor.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 font-medium border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Banned Until</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-zinc-400">
                                        Loading banned users...
                                    </td>
                                </tr>
                            ) : bans.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-zinc-400">
                                        No users are currently banned.
                                    </td>
                                </tr>
                            ) : (
                                bans.map((user) => (
                                    <tr key={user.username} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4 text-red-500">
                                            Continuous Spamming (Violation Level {user.violation_level})
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                                            {new Date(user.banned_until).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUnlock(user.username)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                                            >
                                                <FiUnlock /> Unlock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
