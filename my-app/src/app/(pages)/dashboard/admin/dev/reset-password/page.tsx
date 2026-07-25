"use client"
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiKey, FiUser, FiMail, FiShield, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

const ROLE_BADGE: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    lead: "bg-blue-100 text-blue-800",
    faculty: "bg-purple-100 text-purple-800",
    student: "bg-emerald-100 text-emerald-800",
};

const RESET_PASSWORD = "sac@123";
const API_BASE = "/api/dashboard/admin/dev/reset-password";

export default function AdminResetPasswordPage() {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = checking

    const [username, setUsername] = useState("");
    const [searching, setSearching] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [resetting, setResetting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [lastReset, setLastReset] = useState<string | null>(null);

    // Client-side gate matching the other /dashboard/admin/dev/* pages —
    // the API route enforces this too (verifyDevAccess), this just avoids
    // flashing the page content at a non-dev admin before redirecting.
    const checkAccess = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) { setHasAccess(false); router.push('/dashboard/admin'); return; }
            const data = await res.json();
            const envUsers = process.env.NEXT_PUBLIC_DEV_USERNAME ? process.env.NEXT_PUBLIC_DEV_USERNAME.split(',') : [];
            const defaultUsers = ['2300032048', '2400030188', '240030188'];
            const devUsernames = [...new Set([...envUsers, ...defaultUsers])].map((u) => u.trim());
            const devOk = devUsernames.includes(data.user.username);
            setHasAccess(devOk);
            if (!devOk) router.push('/dashboard/admin');
        } catch {
            setHasAccess(false);
            router.push('/dashboard/admin');
        }
    }, [router]);

    useEffect(() => { checkAccess(); }, [checkAccess]);

    const search = async () => {
        const trimmed = username.trim();
        if (!trimmed) {
            toast.error("Enter a username to search");
            return;
        }
        setSearching(true);
        setNotFound(false);
        setUser(null);
        setLastReset(null);
        try {
            const res = await fetch(`${API_BASE}?username=${encodeURIComponent(trimmed)}`);
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Search failed");
                return;
            }
            if (!data.user) {
                setNotFound(true);
            } else {
                setUser(data.user);
            }
        } catch (e) {
            toast.error("Network error while searching");
        } finally {
            setSearching(false);
        }
    };

    const doReset = async () => {
        if (!user) return;
        setResetting(true);
        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user.username }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                toast.error(data.error || "Failed to reset password");
                return;
            }
            toast.success(`Password reset to "${RESET_PASSWORD}" for ${user.name}`);
            setLastReset(user.username);
            setShowConfirm(false);
        } catch (e) {
            toast.error("Network error while resetting password");
        } finally {
            setResetting(false);
        }
    };

    if (hasAccess === null) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        );
    }
    if (!hasAccess) return null; // redirecting

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white uppercase tracking-wide">Dev Only</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Look up any administrator, lead, faculty member, or student by username and reset their
                    password to the default (<span className="font-mono font-semibold text-gray-700">{RESET_PASSWORD}</span>).
                </p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="e.g. 2400030188"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !searching && search()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <button
                        onClick={search}
                        disabled={searching}
                        className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {searching ? "Searching…" : "Search"}
                    </button>
                </div>
            </div>

            {notFound && (
                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
                    <FiUser className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No user found with username &ldquo;{username.trim()}&rdquo;.</p>
                </div>
            )}

            {user && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {user.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-700"}`}>
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                <FiShield size={12} /> {user.username}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                                <FiMail size={12} /> {user.email}
                            </p>
                        </div>
                    </div>

                    {lastReset === user.username && (
                        <div className="mx-6 mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <FiCheckCircle size={14} /> Password reset to &ldquo;{RESET_PASSWORD}&rdquo;.
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            <FiKey size={14} /> Reset Password to &ldquo;{RESET_PASSWORD}&rdquo;
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm modal */}
            {showConfirm && user && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Password Reset</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                This will immediately set <strong>{user.name}</strong>&apos;s ({user.username}, {user.role})
                                password to <span className="font-mono font-semibold text-gray-800">{RESET_PASSWORD}</span>.
                                They will need to log in with this password and should change it afterwards.
                            </p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={resetting}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={doReset}
                                    disabled={resetting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
                                >
                                    {resetting ? "Resetting…" : "Confirm Reset"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
