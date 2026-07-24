"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiXCircle, FiExternalLink, FiCopy, FiAward, FiCalendar, FiUser, FiBookOpen, FiDownload, FiShare2, FiShield } from "react-icons/fi";

const DOMAIN_LONG: Record<string, string> = {
    TEC: "Technology", LCH: "Literary & Cultural Heritage",
    ESO: "Extension & Social Outreach", IIE: "Innovation & Incubation", HWB: "Health & Wellness",
};

const RARITY_CONFIG: Record<string, { label: string; textColor: string; borderColor: string; bgColor: string; glowColor: string; gradient: string }> = {
    Legendary: { label: "Legendary", textColor: "#D97706", borderColor: "#FDE68A", bgColor: "#FFFBEB", glowColor: "rgba(245,158,11,0.3)", gradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" },
    Epic:      { label: "Epic",      textColor: "#7C3AED", borderColor: "#DDD6FE", bgColor: "#F5F3FF", glowColor: "rgba(124,58,237,0.25)", gradient: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)" },
    Rare:      { label: "Rare",      textColor: "#1D4ED8", borderColor: "#BFDBFE", bgColor: "#EFF6FF", glowColor: "rgba(37,99,235,0.25)", gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" },
    Common:    { label: "Common",    textColor: "#059669", borderColor: "#A7F3D0", bgColor: "#ECFDF5", glowColor: "rgba(5,150,105,0.2)", gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" },
};

// Escape special XML characters so SVG is always valid
function xmlEscape(str: string): string {
    return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function BadgeVisual({ badge }: { badge: any }) {
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Outer glow ring */}
            <div
                className="relative w-56 h-56 rounded-full flex items-center justify-center"
                style={{
                    background: rarity.gradient,
                    border: `4px solid ${rarity.borderColor}`,
                    boxShadow: `0 0 80px ${rarity.glowColor}, 0 0 30px ${rarity.glowColor}, 0 20px 60px rgba(0,0,0,0.15)`,
                }}
            >
                {/* Dashed inner ring */}
                <div className="absolute inset-3 rounded-full opacity-40" style={{ border: `2px dashed ${rarity.borderColor}` }} />
                {/* Inner ring */}
                <div className="absolute inset-6 rounded-full opacity-20" style={{ border: `1px solid ${rarity.textColor}` }} />
                {/* Badge icon */}
                <span className="text-7xl select-none relative z-10" role="img">{badge.icon || "🏅"}</span>
            </div>

            {/* Rarity badge */}
            <div
                className="px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase flex items-center gap-1.5"
                style={{ backgroundColor: rarity.bgColor, color: rarity.textColor, border: `1.5px solid ${rarity.borderColor}` }}
            >
                <FiAward size={11} />
                {rarity.label} Badge
            </div>
        </div>
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
        <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm">
            <FiCopy size={14} />
            {copied ? "✓ Copied!" : "Copy Verify Link"}
        </button>
    );
}

function DownloadBadgeButton({ badge, verificationId }: { badge: any; verificationId: string }) {
    const rarity = RARITY_CONFIG[badge.rarity] || RARITY_CONFIG.Common;
    const verifyUrl = `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;

    const download = () => {
        // All text content MUST be XML-escaped so the SVG parses correctly
        const safeName = xmlEscape(badge.name);
        const safeDomain = xmlEscape(DOMAIN_LONG[badge.domain] || badge.domain || "");
        const safeRarity = xmlEscape(rarity.label);
        const safeVerifyUrl = xmlEscape(verifyUrl);
        const safeId = xmlEscape(verificationId);
        const safeIcon = badge.icon || "🏅";

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${rarity.bgColor}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="${rarity.glowColor}"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="960" fill="url(#bgGrad)" rx="28"/>

  <!-- Border frame -->
  <rect x="16" y="16" width="768" height="928" fill="none" stroke="${rarity.borderColor}" stroke-width="2.5" rx="20"/>
  <rect x="26" y="26" width="748" height="908" fill="none" stroke="${rarity.borderColor}" stroke-width="1" rx="16" opacity="0.5"/>

  <!-- Header strip -->
  <rect x="0" y="0" width="800" height="70" fill="${rarity.textColor}" rx="28"/>
  <rect x="0" y="42" width="800" height="28" fill="${rarity.textColor}"/>
  <text x="400" y="41" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="white" letter-spacing="4">KL UNIVERSITY — SAMAM PROGRAM</text>

  <!-- Badge circle -->
  <circle cx="400" cy="270" r="150" fill="${rarity.bgColor}" stroke="${rarity.borderColor}" stroke-width="5" filter="url(#shadow)"/>
  <circle cx="400" cy="270" r="130" fill="${rarity.bgColor}" stroke="${rarity.borderColor}" stroke-width="1.5" opacity="0.6"/>
  
  <!-- Badge icon -->
  <text x="400" y="295" text-anchor="middle" dominant-baseline="middle" font-size="130">${safeIcon}</text>

  <!-- Rarity label -->
  <rect x="290" y="444" width="220" height="34" rx="17" fill="${rarity.textColor}"/>
  <text x="400" y="461" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="white" letter-spacing="3">${safeRarity.toUpperCase()} BADGE</text>

  <!-- Badge name -->
  <text x="400" y="530" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#111827">${safeName}</text>

  <!-- Domain -->
  <text x="400" y="578" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="20" fill="#6B7280">${safeDomain}</text>

  <!-- Divider -->
  <line x1="100" y1="618" x2="700" y2="618" stroke="${rarity.borderColor}" stroke-width="1.5"/>

  <!-- Issued label -->
  <text x="400" y="652" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="13" fill="#9CA3AF" letter-spacing="2">VERIFIED DIGITAL CREDENTIAL</text>

  <!-- Verification ID -->
  <rect x="150" y="672" width="500" height="40" rx="8" fill="${rarity.bgColor}"/>
  <text x="400" y="693" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="15" fill="${rarity.textColor}" font-weight="bold">${safeId}</text>

  <!-- Verify URL -->
  <text x="400" y="736" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="13" fill="#9CA3AF">${safeVerifyUrl}</text>

  <!-- Shield icon area -->
  <rect x="340" y="760" width="120" height="50" rx="10" fill="${rarity.bgColor}" stroke="${rarity.borderColor}" stroke-width="1"/>
  <text x="400" y="790" text-anchor="middle" dominant-baseline="middle" font-size="26">🔒</text>

  <!-- Footer -->
  <rect x="0" y="900" width="800" height="60" fill="#F9FAFB" rx="0"/>
  <rect x="0" y="900" width="800" height="4" fill="${rarity.borderColor}"/>
  <text x="400" y="935" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="13" fill="#9CA3AF">© ${new Date().getFullYear()} KL University · SAMAM Activity Management Program</text>
</svg>`;

        const a = document.createElement("a");
        a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        a.download = `${(badge.name || "Badge").replace(/[^a-zA-Z0-9]/g, "_")}_SAMAM_Badge.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <button onClick={download} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-sm">
            <FiDownload size={14} />
            Download Badge
        </button>
    );
}

function LinkedInShareButton({ badge, verificationId }: any) {
    const verifyUrl = `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;
    const postText = [
        `🎖️ I'm proud to share that I've earned the "${badge.name.replace(/&/g, "and")}" digital badge from KL University's SAMAM Activity Management Program!`,
        ``,
        `📌 ${badge.description ? badge.description.replace(/&/g, "and") : "Recognized for outstanding achievement in the SAMAM program."}`,
        ``,
        badge.competencies?.length > 0 ? `🧠 Skills: ${badge.competencies.join(" · ")}` : "",
        ``,
        `🏛️ Issued by: KL University | SAMAM Program`,
        `🔒 Verify: ${verifyUrl}`,
        ``,
        `#SAMAM #KLUniversity #DigitalBadge #Achievement`,
    ].filter(Boolean).join("\n");

    return (
        <a
            href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] text-white transition-all duration-200 hover:opacity-90 shadow-sm"
            style={{ backgroundColor: "#0A66C2" }}
        >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Share on LinkedIn
        </a>
    );
}

export default function BadgeVerifyClient({ verificationId }: { verificationId: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/badge/verify/${verificationId}`)
            .then(r => r.json())
            .then(d => {
                if (!d.valid) setError(d.message || "Invalid or expired credential");
                else setData(d);
            })
            .catch(() => setError("Could not verify this credential. Please check your connection and try again."))
            .finally(() => setLoading(false));
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
                            <span className="text-[13px] font-bold text-gray-900">KL University</span>
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
                <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-8">
                    <BadgeVisual badge={badge} />
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: rarity.textColor }}>
                            {DOMAIN_LONG[badge.domain] || badge.domain}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{badge.name}</h1>
                        {badge.description && (
                            <p className="mt-3 text-[14px] text-gray-600 leading-relaxed max-w-xl">{badge.description}</p>
                        )}
                        <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                            <DownloadBadgeButton badge={badge} verificationId={verificationId} />
                            <CopyLinkButton verificationId={verificationId} />
                            <LinkedInShareButton badge={badge} verificationId={verificationId} />
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
                            <p className="text-[11px] text-gray-400 mt-1 font-mono">{recipient.username}</p>
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
                            <p className="text-[14px] font-bold text-gray-900">Authenticity Verified</p>
                            <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                                This is an official SAMAM digital credential issued by KL University. It is cryptographically signed and tamper-proof.
                            </p>
                            <div className="mt-3 flex flex-col gap-1.5">
                                <p className="text-[11px] font-mono font-semibold" style={{ color: rarity.textColor }}>
                                    ID: {verificationId}
                                </p>
                                <a
                                    href={`https://sacactivities.kluniversity.in/badges/verify/${verificationId}`}
                                    className="text-[11px] font-mono text-gray-500 hover:underline flex items-center gap-1"
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <FiExternalLink size={11} />
                                    {`sacactivities.kluniversity.in/badges/verify/${verificationId}`}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white mt-4">
                <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} KL University · SAMAM Activity Management Program</p>
                    <Link href="/" className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
                        <FiExternalLink size={11} /> Visit SAMAM Platform
                    </Link>
                </div>
            </div>
        </div>
    );
}
