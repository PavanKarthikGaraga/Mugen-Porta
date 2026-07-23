"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiXCircle, FiExternalLink, FiCopy, FiLinkedin, FiAward, FiCalendar, FiUser, FiBookOpen } from "react-icons/fi";

const DOMAIN_LONG: Record<string, string> = {
    TEC: "Technology", LCH: "Literary & Cultural Heritage",
    ESO: "Extension & Social Outreach", IIE: "Innovation & Incubation", HWB: "Health & Wellness",
};

const RARITY_CONFIG: Record<string, { label: string; textColor: string; borderColor: string; bgColor: string; glowColor: string }> = {
    Legendary: { label: "Legendary", textColor: "#D97706", borderColor: "#FDE68A", bgColor: "#FFFBEB", glowColor: "rgba(245,158,11,0.25)" },
    Epic:      { label: "Epic",      textColor: "#7C3AED", borderColor: "#DDD6FE", bgColor: "#F5F3FF", glowColor: "rgba(124,58,237,0.2)" },
    Rare:      { label: "Rare",      textColor: "#1D4ED8", borderColor: "#BFDBFE", bgColor: "#EFF6FF", glowColor: "rgba(37,99,235,0.2)" },
    Common:    { label: "Common",    textColor: "#059669", borderColor: "#A7F3D0", bgColor: "#ECFDF5", glowColor: "rgba(5,150,105,0.15)" },
};

function LinkedInShareButton({ badge, recipient, verificationId }: any) {
    const verifyUrl = `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;
    
    const postText = [
        `🎖️ I'm proud to share that I've earned the "${badge.name.replace(/&/g, 'and')}" digital badge from KL University's SAMAM Activity Management Program!`,
        ``,
        `📌 ${badge.description ? badge.description.replace(/&/g, 'and') : "Recognized for outstanding achievement in the SAMAM program."}`,
        ``,
        badge.competencies?.length > 0
            ? `🧠 Skills demonstrated: ${badge.competencies.join(" · ")}`
            : "",
        ``,
        `🏛️ Issued by: KL University | SAMAM Program`,
        `🔒 Verify this credential: ${verifyUrl}`,
        ``,
        `#SAMAM #KLUniversity #DigitalBadge #${DOMAIN_LONG[badge.domain]?.replace(/[^a-z]/gi, "") || badge.domain} #Achievement`
    ].filter(Boolean).join("\n");

    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;

    return (
        <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-[13px] text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: "#0A66C2" }}
        >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share on LinkedIn
        </a>
    );
}

function CopyLinkButton({ verificationId }: { verificationId: string }) {
    const [copied, setCopied] = useState(false);
    const url = `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;

    const copy = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={copy} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-[13px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200">
            <FiCopy size={14} />
            {copied ? "Copied!" : "Copy Link"}
        </button>
    );
}

function BadgeVisual({ badge }: { badge: any }) {
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    
    return (
        <div className="flex flex-col items-center">
            {/* Badge card */}
            <div
                className="relative w-52 h-52 rounded-full flex items-center justify-center transition-transform duration-500 hover:scale-105"
                style={{
                    background: `radial-gradient(circle at 30% 30%, ${rarity.bgColor}, ${badge.bgColor || rarity.bgColor})`,
                    border: `3px solid ${rarity.borderColor}`,
                    boxShadow: `0 0 60px ${rarity.glowColor}, 0 20px 40px rgba(0,0,0,0.12)`,
                }}
            >
                {/* Decorative ring */}
                <div
                    className="absolute inset-2 rounded-full opacity-30"
                    style={{ border: `2px dashed ${rarity.borderColor}` }}
                />
                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-6xl select-none" role="img">{badge.icon || "🏅"}</span>
                </div>
            </div>

            {/* Rarity pill */}
            <div
                className="mt-4 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                style={{ backgroundColor: rarity.bgColor, color: rarity.textColor, border: `1px solid ${rarity.borderColor}` }}
            >
                {rarity.label}
            </div>
        </div>
    );
}

export default function BadgeVerifyClient({ verificationId }: { verificationId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/badge/verify/${verificationId}`)
            .then(r => r.json())
            .then(d => {
                if (!d.valid) setError(d.message || "Invalid credential");
                else setData(d);
            })
            .catch(() => setError("Could not verify this credential. Please try again."))
            .finally(() => setLoading(false));
    }, [verificationId]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <p className="text-[13px] text-gray-500">Verifying credential...</p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-10 max-w-md w-full text-center">
                <FiXCircle className="mx-auto text-red-500 mb-4" size={44} />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Credential Not Found</h1>
                <p className="text-[13px] text-gray-500">{error || "This badge could not be verified."}</p>
                <p className="mt-4 text-[11px] text-gray-400 font-mono break-all">{verificationId}</p>
            </div>
        </div>
    );

    const { badge, recipient, issuer } = data;
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    const issuedDate = badge.issuedOn
        ? new Date(badge.issuedOn).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Top bar */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-900 tracking-wide">KL UNIVERSITY</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-[12px] text-gray-500">SAMAM Program</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-semibold">
                        <FiCheckCircle size={14} />
                        Verified Credential
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT: Badge visual */}
                    <div className="flex flex-col items-center gap-6">
                        <BadgeVisual badge={badge} />

                        {/* Share actions */}
                        <div className="flex flex-col gap-3 w-full">
                            <LinkedInShareButton badge={badge} recipient={recipient} verificationId={verificationId} />
                            <CopyLinkButton verificationId={verificationId} />
                        </div>
                    </div>

                    {/* RIGHT: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Header */}
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                {DOMAIN_LONG[badge.domain] || badge.domain}
                            </p>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{badge.name}</h1>
                            {badge.description && (
                                <p className="mt-3 text-[14px] text-gray-600 leading-relaxed">{badge.description}</p>
                            )}
                        </div>

                        {/* Recipient card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Awarded To</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl font-bold text-white">{recipient.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-[16px]">{recipient.name}</p>
                                    <p className="text-[12px] text-gray-500 mt-0.5">
                                        {recipient.branch} · {recipient.year} Year · {recipient.institution}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1 font-mono">{recipient.username}</p>
                                </div>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                                <FiCalendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Issued On</p>
                                    <p className="mt-1 text-[13px] font-semibold text-gray-900">{issuedDate}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                                <FiAward size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rarity</p>
                                    <p className="mt-1 text-[13px] font-bold" style={{ color: rarity.textColor }}>{badge.rarity}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                                <FiUser size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Issued By</p>
                                    <p className="mt-1 text-[13px] font-semibold text-gray-900">{issuer.name}</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                                <FiBookOpen size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recognition For</p>
                                    <p className="mt-1 text-[13px] font-semibold text-gray-900 line-clamp-2">
                                        {badge.earnedFrom || badge.requirement || "Outstanding achievement"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Competencies */}
                        {badge.competencies?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Skills & Competencies</p>
                                <div className="flex flex-wrap gap-2">
                                    {badge.competencies.map((c: string) => (
                                        <span key={c} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] font-medium">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verification footer */}
                        <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <FiCheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-[13px] font-bold text-emerald-800">Authenticity Verified</p>
                                    <p className="text-[12px] text-emerald-700 mt-1">
                                        This is an official SAMAM digital credential issued by KL University. 
                                        It has been cryptographically signed and is tamper-proof.
                                    </p>
                                    <p className="mt-2 text-[11px] font-mono text-emerald-600 break-all">ID: {verificationId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white mt-8">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} KL University · SAMAM Program</p>
                    <Link href="/" className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                        <FiExternalLink size={11} /> View Platform
                    </Link>
                </div>
            </div>
        </div>
    );
}
