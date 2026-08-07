"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiMap, FiToggleLeft, FiToggleRight, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

const API = "/api/dashboard/admin/dev/career-roadmap";

export default function CareerRoadmapAccessPage() {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);

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

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(API);
            if (!res.ok) return;
            const data = await res.json();
            setEnabled(data.enabled);
        } catch {
            toast.error("Failed to load feature status");
        }
    }, []);

    useEffect(() => { checkAccess(); }, [checkAccess]);
    useEffect(() => { if (hasAccess) fetchStatus(); }, [hasAccess, fetchStatus]);

    const toggle = async () => {
        if (enabled === null) return;
        setSaving(true);
        try {
            const next = !enabled;
            const res = await fetch(API, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: next }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                toast.error("Failed to update feature status");
                return;
            }
            setEnabled(next);
            toast.success(`Career Roadmap ${next ? "enabled" : "disabled"} for all students`);
        } catch {
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    if (hasAccess === null || enabled === null) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <FiMap size={20} className="text-gray-700" />
                <h1 className="text-[17px] font-semibold text-gray-900">Career Roadmap Access</h1>
            </div>

            {/* Toggle card */}
            <div className="bg-white border border-gray-200 rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-medium text-gray-900">Career Roadmap Feature</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Controls student access to the Career Roadmap page</p>
                    </div>
                    <button
                        onClick={toggle}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50"
                        style={enabled
                            ? { background: "#111827", color: "#fff" }
                            : { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }
                        }
                    >
                        {enabled
                            ? <><FiToggleRight size={16} /> Enabled</>
                            : <><FiToggleLeft size={16} /> Disabled</>
                        }
                    </button>
                </div>

                <div className={`text-[12px] px-3 py-2 rounded-md font-medium ${enabled
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                    {enabled
                        ? "Students can access the Career Roadmap page normally."
                        : "Students see: \"This page is currently under development, please check back later!\""
                    }
                </div>
            </div>

            {/* Demo account note */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 text-[13px] text-amber-800">
                <FiInfo size={15} className="shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Demo account bypass</p>
                    <p className="mt-0.5 text-amber-700">Account <code className="font-mono bg-amber-100 px-1 rounded">2400000000</code> always has full access to Career Roadmap regardless of this toggle. It also sees all activities across all domains in Activity Catalogue.</p>
                </div>
            </div>
        </div>
    );
}
