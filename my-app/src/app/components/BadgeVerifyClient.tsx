"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiXCircle, FiExternalLink, FiCopy, FiAward, FiCalendar, FiUser, FiBookOpen, FiShield, FiHash } from "react-icons/fi";

const DOMAIN_LONG: Record<string, string> = {
    TEC: "Technology", LCH: "Literary & Cultural Heritage",
    ESO: "Extension & Social Outreach", IIE: "Innovation & Incubation", HWB: "Health & Wellness",
};

const ISSUER_NAME = "KL SAC (Student Activity Center)";

const RARITY_CONFIG: Record<string, { label: string; textColor: string; borderColor: string; bgColor: string; glowColor: string; gradient: string }> = {
    Legendary: { label: "Legendary", textColor: "#D97706", borderColor: "#FDE68A", bgColor: "#FFFBEB", glowColor: "rgba(245,158,11,0.3)", gradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" },
    Epic:      { label: "Epic",      textColor: "#7C3AED", borderColor: "#DDD6FE", bgColor: "#F5F3FF", glowColor: "rgba(124,58,237,0.25)", gradient: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)" },
    Rare:      { label: "Rare",      textColor: "#1D4ED8", borderColor: "#BFDBFE", bgColor: "#EFF6FF", glowColor: "rgba(37,99,235,0.25)", gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" },
    Common:    { label: "Common",    textColor: "#059669", borderColor: "#A7F3D0", bgColor: "#ECFDF5", glowColor: "rgba(5,150,105,0.2)", gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" },
};

function BadgeVisual({ badge }: { badge: any }) {
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Outer glow ring - shield-style credential medallion, Credly-esque */}
            <div
                className="relative w-52 h-52 md:w-60 md:h-60 rounded-full flex items-center justify-center"
                style={{
                    background: rarity.gradient,
                    border: `4px solid ${rarity.borderColor}`,
                    boxShadow: `0 0 90px ${rarity.glowColor}, 0 0 32px ${rarity.glowColor}, 0 24px 60px rgba(0,0,0,0.18)`,
                }}
            >
                <div className="absolute inset-3 rounded-full opacity-40" style={{ border: `2px dashed ${rarity.borderColor}` }} />
                <div className="absolute inset-6 rounded-full opacity-25" style={{ border: `1px solid ${rarity.textColor}` }} />
                <span className="text-7xl select-none relative z-10" role="img">{badge.icon || "🏅"}</span>
            </div>

            <div
                className="px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1.5"
                style={{ backgroundColor: rarity.bgColor, color: rarity.textColor, border: `1.5px solid ${rarity.borderColor}` }}
            >
                <FiAward size={11} />
                {rarity.label} Credential
            </div>
        </div>
    );
}

function CopyLinkButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard unavailable */ }
    };
    return (
        <button onClick={copy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm">
            <FiCopy size={14} />
            {copied ? "✓ Link Copied!" : "Copy Verification Link"}
        </button>
    );
}

export default function BadgeVerifyClient({ verificationId, initialData = null }: { verificationId: string; initialData?: any }) {
    const [data, setData] = useState<any>(initialData?.valid ? initialData : null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(initialData && !initialData.valid ? (initialData.message || "Invalid or expired credential") : null);

    useEffect(() => {
        // If the server already resolved this credential (the common case),
        // skip the client-side fetch entirely - this is what used to make
        // the page feel slow (a full extra network round trip after the
        // page had already loaded).
        if (initialData) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch(`/api/badge/verify/${verificationId}`)
            .then(r => r.json())
            .then(d => {
                if (cancelled) return;
                if (!d.valid) setError(d.message || "Invalid or expired credential");
                else setData(d);
            })
            .catch(() => {
                if (!cancelled) setError("Could not verify this credential. Please check your connection and try again.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verificationId]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <FiShield className="text-gray-400" size={18} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-[15px] font-semibold text-gray-800">Verifying Credential</p>
                <p className="text-[12px] text-gray-400 mt-1">Checking authenticity of <span className="font-mono">{verificationId}</span></p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #fef2f2 0%, #fff1f1 100%)" }}>
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiXCircle className="text-red-500" size={32} />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Credential Not Found</h1>
                <p className="text-[13px] text-gray-500 leading-relaxed">{error || "This badge could not be verified. It may have been revoked or the ID is invalid."}</p>
                <p className="mt-4 text-[10px] text-gray-400 font-mono break-all bg-gray-50 rounded-lg p-2">{verificationId}</p>
                <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <FiExternalLink size={13} /> Go to SAMAM Platform
                </Link>
            </div>
        </div>
    );

    const { badge, recipient, issuer } = data;
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    const issuedDate = badge.issuedOn
        ? new Date(badge.issuedOn).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—";
    const verifyUrl = badge.shareUrl || `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;
    const verifyUrlDisplay = verifyUrl.replace(/^https?:\/\//, "");

    return (
        <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-white font-extrabold text-sm">S</span>
                        </div>
                        <div>
                            <span className="text-[13px] font-bold text-gray-900">{ISSUER_NAME}</span>
                            <span className="text-gray-300 mx-2">·</span>
                            <span className="text-[12px] text-gray-500">SAMAM Program</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                        <FiCheckCircle size={13} className="text-emerald-600" />
                        <span className="text-[12px] font-semibold text-emerald-700">Authenticity Verified</span>
                    </div>
                </div>
            </div>

            {/* ── Hero banner ─────────────────────────────────────────────────── */}
            <div style={{ background: rarity.gradient, borderBottom: `3px solid ${rarity.borderColor}` }}>
                <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-10">
                    <BadgeVisual badge={badge} />
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: rarity.textColor }}>
                            {DOMAIN_LONG[badge.domain] || badge.domain}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{badge.name}</h1>
                        <p className="mt-2 text-[14px] text-gray-600">
                            Issued to <span className="font-semibold text-gray-900">{recipient.name}</span> by <span className="font-semibold text-gray-900">{issuer.name}</span>
                        </p>
                        {badge.description && (
                            <p className="mt-3 text-[14px] text-gray-600 leading-relaxed max-w-xl">{badge.description}</p>
                        )}
                        <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                            <CopyLinkButton url={verifyUrl} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Recipient card */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Awarded To</p>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-lg">
                            {recipient.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-900 text-[18px]">{recipient.name}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">{recipient.branch} · Year {recipient.year} · {recipient.institution}</p>
                        </div>
                    </div>
                </div>

                {/* Metadata cards */}
                {[
                    { icon: <FiCalendar size={15} className="text-gray-400" />, label: "Issued On", value: issuedDate },
                    { icon: <FiAward size={15} style={{ color: rarity.textColor }} />, label: "Rarity", value: rarity.label, valueStyle: { color: rarity.textColor, fontWeight: 700 } },
                    { icon: <FiUser size={15} className="text-gray-400" />, label: "Issued By", value: issuer.name },
                    { icon: <FiBookOpen size={15} className="text-gray-400" />, label: "Recognition For", value: badge.earnedFrom || badge.requirement || "Outstanding achievement" },
                ].map(({ icon, label, value, valueStyle }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-3">
                        <div className="mt-0.5">{icon}</div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="mt-1.5 text-[13px] font-semibold text-gray-900 leading-snug" style={valueStyle}>{value}</p>
                        </div>
                    </div>
                ))}

                {/* Competencies */}
                {badge.competencies?.length > 0 && (
                    <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Skills & Competencies Demonstrated</p>
                        <div className="flex flex-wrap gap-2">
                            {badge.competencies.map((c: string) => (
                                <span key={c} className="px-3 py-1.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: rarity.bgColor, color: rarity.textColor, border: `1px solid ${rarity.borderColor}` }}>
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Verification block */}
                <div className="md:col-span-3 border-2 rounded-2xl p-6" style={{ borderColor: rarity.borderColor, backgroundColor: rarity.bgColor }}>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rarity.textColor }}>
                            <FiShield className="text-white" size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[14px] font-bold text-gray-900">Tamper-Proof Digital Credential</p>
                            <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                                This is an official SAMAM digital credential issued by {ISSUER_NAME}. Its authenticity can always be re-confirmed at this canonical URL.
                            </p>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <p className="text-[11px] font-mono font-semibold flex items-center gap-1.5" style={{ color: rarity.textColor }}>
                                    <FiHash size={11} /> {verificationId}
                                </p>
                                <a
                                    href={verifyUrl}
                                    className="text-[11px] font-mono text-gray-500 hover:underline flex items-center gap-1"
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <FiExternalLink size={11} />
                                    {verifyUrlDisplay}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white mt-4">
                <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} {ISSUER_NAME} · SAMAM Activity Management Program</p>
                    <Link href="/" className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
                        <FiExternalLink size={11} /> Visit SAMAM Platform
                    </Link>
                </div>
            </div>
        </div>
    );
}
