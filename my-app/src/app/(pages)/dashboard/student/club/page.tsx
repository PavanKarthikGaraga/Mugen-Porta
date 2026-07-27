"use client";
import { useState, useEffect } from "react";
import { FiUsers, FiGlobe, FiUser, FiPhone, FiMail, FiHash, FiInfo } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

const DOMAIN_COLORS: Record<string, { color: string; bg: string }> = {
    TEC: { color: "#2563EB", bg: "#EFF6FF" },
    LCH: { color: "#7C3AED", bg: "#F5F3FF" },
    ESO: { color: "#059669", bg: "#ECFDF5" },
    IIE: { color: "#D97706", bg: "#FFFBEB" },
    HWB: { color: "#DC2626", bg: "#FEF2F2" },
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FFF1F1" }}>
                <Icon size={14} style={{ color: BRAND }} />
            </span>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">{value}</p>
            </div>
        </div>
    );
}

export default function ClubInfoPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/student/club")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
                <div className="h-36 bg-gray-100 rounded-2xl" />
                <div className="h-32 bg-gray-100 rounded-2xl" />
                <div className="h-48 bg-gray-100 rounded-2xl" />
            </div>
        );
    }

    if (!data?.success || !data?.club) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF1F1" }}>
                        <FiUsers size={24} style={{ color: BRAND }} />
                    </span>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">No Club Assigned</h2>
                    <p className="text-sm text-gray-400">You haven&apos;t been assigned to a club yet. Please contact the admin.</p>
                </div>
            </div>
        );
    }

    const { club, lead } = data;
    const domainStyle = DOMAIN_COLORS[club.domain] || { color: BRAND, bg: "#FFF1F1" };

    return (
        <div className="max-w-2xl mx-auto space-y-4">

            {/* Club header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 100%)` }} />
                <div className="p-6 flex items-start gap-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #7C3AED 100%)` }}
                    >
                        <FiUsers size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                                style={{ backgroundColor: domainStyle.bg, color: domainStyle.color }}
                            >
                                {club.domain}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-full">{club.id}</span>
                        </div>
                        <h1 className="text-xl font-black text-gray-900 leading-snug">{club.name}</h1>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                            <FiGlobe size={12} /> {club.domainName}
                        </p>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiInfo size={12} /> About
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    {club.description && club.description !== club.name
                        ? club.description
                        : `${club.name} is a student club under the ${club.domainName} domain, focused on fostering skills and building community.`}
                </p>
            </div>

            {/* Club lead card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FiUser size={12} /> Club Lead
                </h2>

                {lead ? (
                    <>
                        <div className="flex items-center gap-3 mb-1 pb-4 border-b border-gray-50">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #7C3AED 100%)` }}
                            >
                                {lead.name?.[0]?.toUpperCase() || "L"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{lead.name}</p>
                                <p className="text-xs text-gray-400">Club Lead · {club.name}</p>
                            </div>
                        </div>
                        <InfoRow icon={FiHash}  label="Student ID"    value={lead.idNumber} />
                        <InfoRow icon={FiPhone} label="Phone Number"  value={lead.phone} />
                        <InfoRow icon={FiMail}  label="Email Address" value={lead.email} />
                    </>
                ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <FiUser size={18} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Lead Not Assigned</p>
                            <p className="text-xs text-gray-400 mt-0.5">No club lead has been assigned to this club yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
