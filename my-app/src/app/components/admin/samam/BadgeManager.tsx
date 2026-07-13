"use client";
import { useState } from "react";
import { FiAward, FiStar, FiClock, FiExternalLink, FiCopy, FiCheck } from "react-icons/fi";
import { BRAND } from "./SharedUI";
import { Field } from "./SharedUI";

function VerificationToast({ shareUrl, verificationId, badgeName, recipientName, onDismiss }: any) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = shareUrl.startsWith("http") ? shareUrl : `${origin}${shareUrl}`;

    const linkedinText = `🎖️ "${badgeName}" digital badge has been awarded via KL University SAMAM!\n\n🔒 Verify credential: ${fullUrl}`;
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-200 rounded-xl shadow-2xl w-80 p-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-emerald-600" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900">Badge Issued Successfully</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{badgeName} → {recipientName}</p>
                </div>
                <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 text-[18px] leading-none flex-shrink-0">×</button>
            </div>
            <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Verification Link</p>
                <div className="flex gap-2">
                    <input
                        readOnly
                        value={fullUrl}
                        className="flex-1 text-[11px] font-mono border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50 text-gray-700 min-w-0 truncate"
                    />
                    <button onClick={copy} className="px-2.5 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex-shrink-0" title="Copy">
                        {copied ? <FiCheck size={13} className="text-emerald-600" /> : <FiCopy size={13} className="text-gray-500" />}
                    </button>
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                        className="px-2.5 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex-shrink-0" title="Open">
                        <FiExternalLink size={13} className="text-gray-500" />
                    </a>
                </div>
                <a href={liUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#0A66C2" }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Share on LinkedIn
                </a>
            </div>
        </div>
    );
}

export default function BadgeManager({
    badgeCatalog, pointsForm, setPointsForm, badgeForm, setBadgeForm,
    awardPoints, awardHistory, awardLoading
}: any) {
    const [issuanceResult, setIssuanceResult] = useState<any>(null);
    const [localBadgeForm, setLocalBadgeForm] = useState({ username: "", badge_id: "", reason: "" });
    const [issuing, setIssuing] = useState(false);

    // Use parent's form if passed
    const form = badgeForm || localBadgeForm;
    const setForm = setBadgeForm || setLocalBadgeForm;

    const awardBadge = async () => {
        setIssuing(true);
        try {
            const res = await fetch("/api/dashboard/admin/samam/award-badge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                const selectedBadge = badgeCatalog.find((b: any) => String(b.id) === String(form.badge_id));
                setIssuanceResult({
                    shareUrl: data.shareUrl,
                    verificationId: data.verificationId,
                    badgeName: selectedBadge?.name || "Badge",
                    recipientName: form.username,
                });
                setForm({ username: "", badge_id: "", reason: "" });
            } else {
                alert(data.message || "Failed to issue badge");
            }
        } catch {
            alert("Network error. Please try again.");
        }
        setIssuing(false);
    };

    return (
        <>
            {issuanceResult && (
                <VerificationToast
                    {...issuanceResult}
                    onDismiss={() => setIssuanceResult(null)}
                />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Point Allocation */}
                    <div className="bg-white rounded-md border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <FiStar className="text-gray-400" size={15} />
                            <h3 className="text-[14px] font-semibold text-gray-900">Point Allocation</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Student ID">
                                    <input value={pointsForm.username} onChange={e => setPointsForm({ ...pointsForm, username: e.target.value })}
                                        placeholder="e.g. 230003299" className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 shadow-sm" />
                                </Field>
                                <Field label="Points Value">
                                    <input type="number" value={pointsForm.points} onChange={e => setPointsForm({ ...pointsForm, points: e.target.value })}
                                        placeholder="e.g. 5" className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 shadow-sm" />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Domain Category">
                                    <select value={pointsForm.domain} onChange={e => setPointsForm({ ...pointsForm, domain: e.target.value })}
                                        className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 shadow-sm">
                                        <option value="TEC">Technology (TEC)</option>
                                        <option value="LCH">Literary & Cultural (LCH)</option>
                                        <option value="ESO">Extension (ESO)</option>
                                        <option value="IIE">Innovation (IIE)</option>
                                        <option value="HWB">Health & Wellness (HWB)</option>
                                    </select>
                                </Field>
                                <Field label="Allocation Type">
                                    <select value={pointsForm.category} onChange={e => setPointsForm({ ...pointsForm, category: e.target.value })}
                                        className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 shadow-sm">
                                        <option value="admin_award">Administrative Discretion</option>
                                        <option value="competition">Competition Result</option>
                                        <option value="contribution">Special Contribution</option>
                                    </select>
                                </Field>
                            </div>
                            <Field label="Justification">
                                <textarea value={pointsForm.reason} onChange={e => setPointsForm({ ...pointsForm, reason: e.target.value })}
                                    placeholder="Required context for this allocation..." rows={2}
                                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 shadow-sm resize-none" />
                            </Field>
                            <button onClick={awardPoints} disabled={awardLoading || !pointsForm.username || !pointsForm.points}
                                className="w-full h-9 text-[13px] font-medium rounded-md text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
                                style={{ backgroundColor: BRAND }}>
                                Allocate Points
                            </button>
                        </div>
                    </div>

                    {/* Badge Recognition */}
                    <div className="bg-white rounded-md border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <FiAward className="text-gray-400" size={15} />
                            <h3 className="text-[14px] font-semibold text-gray-900">Issue Digital Badge</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Student ID">
                                    <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                        placeholder="e.g. 230003299" className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 shadow-sm" />
                                </Field>
                                <Field label="Badge">
                                    <select value={form.badge_id} onChange={e => setForm({ ...form, badge_id: e.target.value })}
                                        className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 shadow-sm">
                                        <option value="">Select badge...</option>
                                        {badgeCatalog.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.icon} {b.name} ({b.rarity})</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {/* Badge preview */}
                            {form.badge_id && (() => {
                                const selected = badgeCatalog.find((b: any) => String(b.id) === String(form.badge_id));
                                if (!selected) return null;
                                const rarityColors: Record<string, string> = { Legendary: "#D97706", Epic: "#7C3AED", Rare: "#1D4ED8", Common: "#059669" };
                                return (
                                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50/50 flex items-start gap-3">
                                        <span className="text-3xl">{selected.icon || "🏅"}</span>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-900">{selected.name}</p>
                                            <p className="text-[11px] font-medium" style={{ color: rarityColors[selected.rarity] || "#6B7280" }}>{selected.rarity} · {selected.domain}</p>
                                            {selected.description && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{selected.description}</p>}
                                        </div>
                                    </div>
                                );
                            })()}

                            <Field label="Notes (Optional)">
                                <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Reason for issuing this badge..." className="w-full h-9 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 shadow-sm" />
                            </Field>
                            <button onClick={awardBadge} disabled={issuing || !form.username || !form.badge_id}
                                className="w-full h-9 text-[13px] font-medium rounded-md border border-gray-300 text-gray-700 bg-white flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm">
                                {issuing ? "Issuing..." : "Issue Digital Badge & Generate Verification Link"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Log */}
                <div className="bg-white rounded-md border border-gray-200 flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <FiClock className="text-gray-400" size={15} />
                        <h3 className="text-[14px] font-semibold text-gray-900">Session Audit Log</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {awardHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[200px]">
                                <p className="text-[13px] text-gray-400">No actions taken this session.</p>
                            </div>
                        ) : (
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 text-[12px]">Time</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 text-[12px]">Student</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 text-[12px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {awardHistory.map((h: any, i: number) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 text-gray-500 text-[12px] whitespace-nowrap">{h.time}</td>
                                            <td className="px-5 py-3 font-medium text-gray-900">{h.username}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900 text-[12px]">
                                                    {h.type === "points" ? `+${h.points} ${h.domain} Points` : "Badge Issued"}
                                                </p>
                                                {h.reason && <p className="text-[11px] text-gray-500 mt-0.5 max-w-[180px] truncate">{h.reason}</p>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
