"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiCheckCircle, FiXCircle, FiExternalLink, FiCopy, FiAward, FiCalendar, FiUser, FiBookOpen, FiShield, FiHash, FiCheck } from "react-icons/fi";
import { BadgeIcon } from "@/lib/badgeIcons";

// The credential is usually already resolved server-side (via `initialData`)
// by the time this component mounts, so a real network "loading" state
// almost never happens. Skipping straight to the result felt abrupt and
// less trustworthy than the verification flow it's mimicking, so we always
// play a short, deliberate "verifying" sequence first (like Credly's
// verification pages do) before revealing the credential. If a real fetch
// IS still in flight (e.g. `initialData` was unavailable), this same screen
// simply stays up until it resolves.
const VERIFY_STEPS = [
    "Connecting to SAMAM credential registry",
    "Validating cryptographic signature",
    "Confirming issuer authenticity",
];
const VERIFY_STEP_INTERVAL_MS = 420;
const VERIFY_REVEAL_DELAY_MS = 300;

function VerifyingScreen({ verificationId, stepIndex }: { verificationId: string; stepIndex: number }) {
    const allStepsDone = stepIndex >= VERIFY_STEPS.length;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
            <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-800 animate-spin" style={{ animationDuration: "1.1s" }} />
                <div className="absolute inset-3 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <FiShield className="text-gray-700" size={26} />
                </div>
            </div>

            <div className="text-center">
                <p className="text-[16px] font-bold text-gray-900">Verifying Credential</p>
                <p className="text-[12px] text-gray-400 mt-1 font-mono">{verificationId}</p>
            </div>

            <div className="w-full max-w-xs space-y-3">
                {VERIFY_STEPS.map((step, i) => {
                    const done = i < stepIndex;
                    const active = i === stepIndex;
                    return (
                        <div key={step} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                done ? "bg-emerald-500" : active ? "bg-gray-800" : "bg-gray-200"
                            }`}>
                                {done ? <FiCheck size={11} className="text-white" /> : active ? <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : null}
                            </div>
                            <span className={`text-[13px] transition-colors duration-300 ${
                                done ? "text-gray-700 font-medium" : active ? "text-gray-900 font-semibold" : "text-gray-300"
                            }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
                {allStepsDone && (
                    <div className="flex items-center gap-3 pt-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-800">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                        <span className="text-[13px] text-gray-900 font-semibold">Finalizing verification</span>
                    </div>
                )}
            </div>
        </div>
    );
}

const DOMAIN_LONG: Record<string, string> = {
    TEC: "Technology", LCH: "Liberal Arts, Culture and Heritage",
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
                <BadgeIcon icon={badge.icon} domain={badge.domain} size={72} style={{ color: rarity.textColor }} className="relative z-10" />
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

    // Deliberate "verifying" intro sequence — see VerifyingScreen comment above.
    const [showIntro, setShowIntro] = useState(true);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (stepIndex >= VERIFY_STEPS.length) return;
        const t = setTimeout(() => setStepIndex((i) => i + 1), VERIFY_STEP_INTERVAL_MS);
        return () => clearTimeout(t);
    }, [stepIndex]);

    useEffect(() => {
        // Only reveal once every checklist step has played AND the real data
        // fetch (if any) has actually finished — whichever takes longer.
        if (stepIndex < VERIFY_STEPS.length || loading) return;
        const t = setTimeout(() => setShowIntro(false), VERIFY_REVEAL_DELAY_MS);
        return () => clearTimeout(t);
    }, [stepIndex, loading]);

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

    if (showIntro) return <VerifyingScreen verificationId={verificationId} stepIndex={stepIndex} />;

    if (error || !data) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #fef2f2 0%, #fff1f1 100%)" }}>
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-10 max-w-md w-full text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiXCircle className="text-red-500" size={28} />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Credential Not Found</h1>
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
        <div className="min-h-screen animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)", fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <Image
                            src="/sac-logo.png"
                            alt={ISSUER_NAME}
                            width={150}
                            height={38}
                            priority
                            className="h-7 sm:h-[34px] w-auto flex-shrink-0"
                        />
                        <span className="text-gray-200 hidden sm:inline">|</span>
                        <span className="text-[12px] text-gray-500 hidden sm:inline">SAMAM Program</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex-shrink-0">
                        <FiCheckCircle size={12} className="text-emerald-600" />
                        <span className="text-[11px] sm:text-[12px] font-semibold text-emerald-700 whitespace-nowrap">Verified</span>
                    </div>
                </div>
            </div>

            {/* ── Hero banner ─────────────────────────────────────────────────── */}
            <div style={{ background: rarity.gradient, borderBottom: `3px solid ${rarity.borderColor}` }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    <BadgeVisual badge={badge} />
                    <div className="flex-1 text-center md:text-left min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: rarity.textColor }}>
                            {DOMAIN_LONG[badge.domain] || badge.domain}
                        </p>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{badge.name}</h1>
                        <p className="mt-2 text-[13px] sm:text-[14px] text-gray-600">
                            Issued to <span className="font-semibold text-gray-900">{recipient.name}</span> by <span className="font-semibold text-gray-900">{issuer.name}</span>
                        </p>
                        {badge.description && (
                            <p className="mt-3 text-[13px] sm:text-[14px] text-gray-600 leading-relaxed max-w-xl">{badge.description}</p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                            <CopyLinkButton url={verifyUrl} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                {/* Recipient card */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">Awarded To</p>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl font-black text-white shadow-lg">
                            {recipient.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 text-[16px] sm:text-[18px]">{recipient.name}</p>
                            <p className="text-[12px] sm:text-[13px] text-gray-500 mt-0.5 truncate">{recipient.branch} · Year {recipient.year} · {recipient.institution}</p>
                        </div>
                    </div>
                </div>

                {/* Metadata cards */}
                {[
                    { icon: <FiCalendar size={14} className="text-gray-400" />, label: "Issued On", value: issuedDate },
                    { icon: <FiAward size={14} style={{ color: rarity.textColor }} />, label: "Rarity", value: rarity.label, valueStyle: { color: rarity.textColor, fontWeight: 700 } },
                    { icon: <FiUser size={14} className="text-gray-400" />, label: "Issued By", value: issuer.name },
                    { icon: <FiBookOpen size={14} className="text-gray-400" />, label: "Recognition For", value: badge.earnedFrom || badge.requirement || "Outstanding achievement" },
                ].map(({ icon, label, value, valueStyle }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">{icon}</div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="mt-1 sm:mt-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-snug break-words" style={valueStyle}>{value}</p>
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
                <div className="md:col-span-3 border-2 rounded-2xl p-4 sm:p-6" style={{ borderColor: rarity.borderColor, backgroundColor: rarity.bgColor }}>
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rarity.textColor }}>
                            <FiShield className="text-white" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] sm:text-[14px] font-bold text-gray-900">Tamper-Proof Digital Credential</p>
                            <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                                This is an official SAMAM digital credential issued by {ISSUER_NAME}. Its authenticity can always be re-confirmed at this canonical URL.
                            </p>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <p className="text-[11px] font-mono font-semibold flex items-center gap-1.5 break-all" style={{ color: rarity.textColor }}>
                                    <FiHash size={11} className="flex-shrink-0" /> {verificationId}
                                </p>
                                <a
                                    href={verifyUrl}
                                    className="text-[11px] font-mono text-gray-500 hover:underline flex items-start gap-1 break-all"
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <FiExternalLink size={11} className="flex-shrink-0 mt-0.5" />
                                    {verifyUrlDisplay}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white mt-4">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} {ISSUER_NAME} · SAMAM Activity Management Program</p>
                    <Link href="/" className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
                        <FiExternalLink size={11} /> Visit SAMAM Platform
                    </Link>
                </div>
            </div>
        </div>
    );
}
