"use client";
import { useState, useEffect } from "react";
import { FiUser, FiMail, FiCalendar, FiGrid } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

const DOMAIN_LABELS: Record<string, string> = {
    TEC: "Technology (TEC)",
    LCH: "Liberal Arts (LCH)",
    IIE: "Innovation & Entrepreneurship (IIE)",
    HWB: "Health & Wellbeing (HWB)",
    ESO: "Environment & Social (ESO)",
};

function Skeleton() {
    return (
        <div className="space-y-5 max-w-2xl mx-auto animate-pulse">
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
    );
}

export default function CouncilProfilePage() {
    const [profile, setProfile] = useState({ username: '', email: '', created_at: '', assignedDomain: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/council/profile')
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.user) setProfile(d.user); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton />;

    const domainLabel = DOMAIN_LABELS[profile.assignedDomain] || profile.assignedDomain;

    return (
        <div className="space-y-5 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1" style={{ backgroundColor: BRAND }} />
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: BRAND }}>
                            {profile.username?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: BRAND }}>Council</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiUser size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Username</p>
                                <p className="text-sm font-semibold text-gray-900">{profile.username || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiMail size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{profile.email || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiGrid size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Assigned Domain</p>
                                <p className="text-sm font-semibold text-gray-900">{domainLabel || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FiCalendar size={16} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Account Created</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
