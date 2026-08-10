"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiUser, FiRefreshCw, FiCheckCircle, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

const API = "/api/dashboard/admin/dev/cr-access";

type Result = {
    student: { username: string; name: string; branch: string; student_year: string; program: string };
    isDemo: boolean;
    generationCount: number;
    extraAllowed: number;
    allowed: number | null;
    remaining: number | null;
    lastGeneratedAt?: string | null;
};

export default function CRAccessPage() {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [granting, setGranting] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [notFound, setNotFound] = useState(false);

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
        const id = username.trim();
        if (!id) return;
        setLoading(true);
        setResult(null);
        setNotFound(false);
        try {
            const res = await fetch(`${API}?username=${encodeURIComponent(id)}`);
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 404) setNotFound(true);
                else toast.error(data.error || "Failed to look up student");
                return;
            }
            setResult(data);
        } catch {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const grantReanalyze = async () => {
        if (!result) return;
        setGranting(true);
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: result.student.username }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                toast.error(data.error || "Failed to grant access");
                return;
            }
            toast.success(data.message);
            setResult({
                ...result,
                generationCount: data.generationCount,
                extraAllowed: data.extraAllowed,
                allowed: data.allowed,
                remaining: data.remaining,
            });
        } catch {
            toast.error("Network error");
        } finally {
            setGranting(false);
        }
    };

    if (hasAccess === null) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <FiUser size={20} className="text-gray-700" />
                <h1 className="text-[17px] font-semibold text-gray-900">CR Access</h1>
            </div>
            <p className="text-[13px] text-gray-500 -mt-4">
                Students get one Career Roadmap generation. Look a student up by ID number to grant one more (re-analyze).
            </p>

            <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") search(); }}
                        placeholder="Student ID number (e.g. 2400012345)"
                        className="flex-1 h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                    />
                    <button
                        onClick={search}
                        disabled={loading || !username.trim()}
                        className="h-10 px-4 rounded-md text-[13px] font-medium text-white flex items-center gap-2 disabled:opacity-50"
                        style={{ background: "#111827" }}
                    >
                        {loading ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSearch size={14} />}
                        Search
                    </button>
                </div>

                {notFound && (
                    <div className="text-[12px] px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200">
                        No student found with that ID number.
                    </div>
                )}

                {result && (
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div>
                            <p className="text-[14px] font-medium text-gray-900">{result.student.name}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5">
                                {result.student.username} • {result.student.branch} • {result.student.student_year} • {result.student.program}
                            </p>
                        </div>

                        {result.isDemo ? (
                            <div className="text-[12px] px-3 py-2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex gap-2">
                                <FiInfo size={14} className="shrink-0 mt-0.5" />
                                This is the demo account — it already has unlimited generations, no need to grant access.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-center">
                                        <p className="text-lg font-semibold text-gray-900">{result.generationCount}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Used</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-center">
                                        <p className="text-lg font-semibold text-gray-900">{result.allowed}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Allowed</p>
                                    </div>
                                    <div className={`border rounded-md p-3 text-center ${(result.remaining ?? 0) > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                        <p className={`text-lg font-semibold ${(result.remaining ?? 0) > 0 ? "text-emerald-700" : "text-red-700"}`}>{result.remaining}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">Remaining</p>
                                    </div>
                                </div>

                                <button
                                    onClick={grantReanalyze}
                                    disabled={granting}
                                    className="w-full h-10 rounded-md text-[13px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{ background: "#111827" }}
                                >
                                    {granting ? <FiRefreshCw size={14} className="animate-spin" /> : <FiCheckCircle size={14} />}
                                    Grant Re-analyze (+1)
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
