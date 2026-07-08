"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function StudentOverviewPage() {
    const [userData, setUserData] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCareerPrompt, setShowCareerPrompt] = useState(false);
    const [selectedCareer, setSelectedCareer] = useState("");
    const [savingCareer, setSavingCareer] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data.user);

                    // Fetch full profile to check careerChoice
                    const profileRes = await fetch(`/api/dashboard/student/profile/${data.user.username}`);
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        setStudentProfile(profileData);
                        if (!profileData.careerChoice) {
                            setShowCareerPrompt(true);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveCareer = async () => {
        if (!selectedCareer) {
            toast.error("Please select a career choice");
            return;
        }
        setSavingCareer(true);
        try {
            const res = await fetch(`/api/dashboard/student/profile/${userData.username}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ careerChoice: selectedCareer })
            });
            if (res.ok) {
                toast.success("Career choice saved successfully!");
                setShowCareerPrompt(false);
            } else {
                toast.error("Failed to save career choice");
            }
        } catch (error) {
            console.error("Error saving career choice:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setSavingCareer(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700" />
            </div>
        );
    }

    const firstName = userData?.name?.split(" ")[0] || "Student";

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50 relative">
            {/* Career Choice Prompt Modal */}
            {showCareerPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
                        <p className="text-gray-600 mb-6">
                            Please select your career choice to continue. This information helps us tailor opportunities for you.
                        </p>
                        <select
                            value={selectedCareer}
                            onChange={(e) => setSelectedCareer(e.target.value)}
                            className="w-full h-12 px-4 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-red-700 outline-none"
                        >
                            <option value="">Select Career Choice</option>
                            <option value="Placement">Placement</option>
                            <option value="Higher Education">Higher Education</option>
                            <option value="Entrepreneurship">Entrepreneurship</option>
                            <option value="Research & Development (R&D)">Research & Development (R&D)</option>
                            <option value="Civil Services">Civil Services</option>
                            <option value="Social Service / NGOs">Social Service / NGOs</option>
                            <option value="Overseas Career">Overseas Career</option>
                        </select>
                        <button
                            onClick={handleSaveCareer}
                            disabled={savingCareer}
                            className="w-full py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
                        >
                            {savingCareer ? "Saving..." : "Save Selection"}
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg">

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

                    {/* Red top bar */}
                    <div className="h-1.5 w-full" style={{ background: "rgb(151,0,3)" }} />

                    <div className="px-10 py-12 text-center">

                        {/* Icon */}
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ backgroundColor: "rgba(151,0,3,0.08)", border: "1.5px solid rgba(151,0,3,0.2)" }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-9 h-9"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="rgb(151,0,3)"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                                />
                            </svg>
                        </div>

                        {/* Greeting */}
                        <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "rgb(151,0,3)" }}>
                            Welcome, {firstName}
                        </p>

                        {/* Heading */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">
                            Dashboard Under Development
                        </h1>

                        {/* Subtitle */}
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                            We&apos;re setting up your student portal for the new academic year.
                            It will go live shortly with everything you need.
                        </p>

                        {/* Divider */}
                        <div className="border-t border-gray-100 mb-8" />

                        {/* Coming soon features */}
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Coming soon</p>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: "📋", label: "Club Details" },
                                { icon: "📝", label: "Submissions" },
                                { icon: "📊", label: "Activity Reports" },
                                { icon: "🏆", label: "Activity Logs" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer note */}
                        <p className="text-xs text-gray-400">
                            For queries, contact the{" "}
                            <span className="font-semibold" style={{ color: "rgb(151,0,3)" }}>
                                SAC Activities Team
                            </span>
                        </p>
                    </div>

                    {/* Red bottom bar */}
                    <div className="h-1.5 w-full" style={{ background: "rgb(151,0,3)" }} />
                </div>

                {/* Below card */}
                <p className="text-center text-xs text-gray-400 mt-5">
                    Designed &amp; Developed by Pavan Karthik Garaga &nbsp;|&nbsp; ZeroOne CodeClub
                </p>
            </div>
        </div>
    );
}
