"use client";
import { useState, useEffect } from "react";
import { FiMusic, FiCheck, FiSave, FiRefreshCw } from "react-icons/fi";
import { GiGuitarHead, GiViolin, GiDrum, GiPianoKeys } from "react-icons/gi";
import { toast } from "sonner";

const INSTRUMENTS = [
    { value: "Keyboard",  label: "Keyboard",  icon: GiPianoKeys },
    { value: "Guitar",    label: "Guitar",    icon: GiGuitarHead },
    { value: "Violin",    label: "Violin",    icon: GiViolin },
    { value: "Drums",     label: "Drums",     icon: GiDrum },
    { value: "Veena",     label: "Veena",     icon: GiViolin },
];

export default function MusicPreferenceForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading]             = useState(true);
    const [saving, setSaving]               = useState(false);
    const [eligible, setEligible]           = useState<boolean | null>(null);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [saved, setSaved]                 = useState<any>(null);

    // Form state
    const [type, setType]                   = useState<"vocals" | "instruments" | "">("");
    const [instrument, setInstrument]       = useState("");
    const [otherText, setOtherText]         = useState("");
    const [editMode, setEditMode]           = useState(false);

    useEffect(() => {
        fetch("/api/dashboard/student/music-preference")
            .then((r) => r.json())
            .then((data) => {
                setEligible(data.eligible ?? false);
                if (data.submitted && data.preference) {
                    setAlreadySubmitted(true);
                    setSaved(data.preference);
                    setType(data.preference.type);
                    setInstrument(data.preference.instrument || "");
                    setOtherText(data.preference.otherInstrument || "");
                }
            })
            .catch(() => setEligible(false))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type) { toast.error("Please select Vocals or Instruments"); return; }
        if (type === "instruments") {
            if (!instrument) { toast.error("Please select an instrument"); return; }
            if (instrument === "other" && !otherText.trim()) {
                toast.error("Please specify your instrument"); return;
            }
        }

        setSaving(true);
        try {
            const res = await fetch("/api/dashboard/student/music-preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, instrument: type === "vocals" ? null : instrument, otherInstrument: otherText }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "Failed to save"); return; }
            toast.success(alreadySubmitted ? "Preference updated!" : "Preference saved!");
            setSaved(data.preference);
            setAlreadySubmitted(true);
            setEditMode(false);
            if (onSuccess) onSuccess();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!eligible) {
        return (
            <div className="max-w-xl mx-auto mt-16 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10">
                    <FiMusic className="mx-auto text-gray-300 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Applicable</h2>
                    <p className="text-gray-500 text-sm">
                        This section is only available for students enrolled in the
                        <strong> Music Club (LCH03)</strong> at Vaddeswaram campus.
                    </p>
                </div>
            </div>
        );
    }

    const showForm = !alreadySubmitted || editMode;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 w-full">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: "rgb(151,0,3)" }}>
                        <FiMusic className="text-white" size={22} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Music Club Preference</h1>
                </div>
                <p className="text-gray-500 text-sm ml-14">
                    Tell us your musical interest so we can plan sessions better.
                </p>
            </div>

            {alreadySubmitted && !editMode && saved && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                <FiCheck className="text-green-600" size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-green-800 text-sm">Preference Saved</p>
                                <p className="text-green-700 text-sm mt-0.5">
                                    {saved.type === "vocals"
                                        ? "🎤 Vocals"
                                        : `🎸 Instruments — ${saved.instrument === "other" ? saved.otherInstrument : saved.instrument}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 border border-green-300 rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <FiRefreshCw size={12} /> Update
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">
                            What is your musical interest?
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: "vocals",      label: "Vocals",      emoji: "🎤", desc: "Singing, harmonics, performance" },
                                { value: "instruments", label: "Instruments", emoji: "🎸", desc: "Playing any musical instrument" },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { setType(opt.value as any); setInstrument(""); setOtherText(""); }}
                                    className={`relative flex flex-col items-center text-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                                        type === opt.value
                                            ? "border-red-600 bg-red-50 shadow-md scale-[1.02]"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {type === opt.value && (
                                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                            <FiCheck className="text-white" size={11} />
                                        </span>
                                    )}
                                    <span className="text-3xl">{opt.emoji}</span>
                                    <span className={`font-semibold text-sm ${type === opt.value ? "text-red-700" : "text-gray-700"}`}>
                                        {opt.label}
                                    </span>
                                    <span className="text-xs text-gray-400">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {type === "instruments" && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">
                                Which instrument do you play?
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {INSTRUMENTS.map((inst) => {
                                    const Icon = inst.icon;
                                    const active = instrument === inst.value;
                                    return (
                                        <button
                                            key={inst.value}
                                            type="button"
                                            onClick={() => { setInstrument(inst.value); setOtherText(""); }}
                                            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                                                active
                                                    ? "border-red-600 bg-red-50 shadow-sm scale-[1.03]"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {active && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                                                    <FiCheck className="text-white" size={9} />
                                                </span>
                                            )}
                                            <Icon className={active ? "text-red-600" : "text-gray-500"} size={26} />
                                            <span className={`text-xs font-medium ${active ? "text-red-700" : "text-gray-600"}`}>
                                                {inst.label}
                                            </span>
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setInstrument("other")}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                                        instrument === "other"
                                            ? "border-red-600 bg-red-50 shadow-sm scale-[1.03]"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {instrument === "other" && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                                            <FiCheck className="text-white" size={9} />
                                        </span>
                                    )}
                                    <span className="text-2xl">🎵</span>
                                    <span className={`text-xs font-medium ${instrument === "other" ? "text-red-700" : "text-gray-600"}`}>
                                        Other
                                    </span>
                                </button>
                            </div>

                            {instrument === "other" && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Specify your instrument
                                    </label>
                                    <input
                                        type="text"
                                        value={otherText}
                                        onChange={(e) => setOtherText(e.target.value)}
                                        placeholder="e.g. Flute, Tabla, Saxophone…"
                                        maxLength={200}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {editMode && (
                            <button
                                type="button"
                                onClick={() => { setEditMode(false); setType(saved?.type || ""); setInstrument(saved?.instrument || ""); setOtherText(saved?.otherInstrument || ""); }}
                                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving || !type || (type === "instruments" && (!instrument || (instrument === "other" && !otherText.trim())))}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "rgb(151,0,3)" }}
                        >
                            {saving ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                            ) : (
                                <><FiSave size={15} /> {alreadySubmitted ? "Update Preference" : "Save Preference"}</>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
