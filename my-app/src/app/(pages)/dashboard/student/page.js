"use client";
import { useState, useEffect } from "react";

export default function StudentOverviewPage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dots, setDots] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data.user);
                }
            } catch (e) {
                console.error("Failed to fetch user:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Animated ellipsis
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
            {/* Outer glow card */}
            <div
                className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #2d0a0a 50%, #1a1a1a 100%)",
                    border: "1px solid rgba(151,0,3,0.4)",
                    boxShadow: "0 0 60px rgba(151,0,3,0.2), 0 25px 50px rgba(0,0,0,0.5)",
                }}
            >
                {/* Top accent bar */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgb(151,0,3), transparent)",
                    }}
                />

                <div className="p-10 flex flex-col items-center text-center">
                    {/* Animated gear / construction icon */}
                    <div className="relative mb-8">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center"
                            style={{
                                background: "rgba(151,0,3,0.15)",
                                border: "2px solid rgba(151,0,3,0.4)",
                            }}
                        >
                            <svg
                                className="w-12 h-12"
                                style={{
                                    color: "rgb(151,0,3)",
                                    animation: "spin 6s linear infinite",
                                }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>
                        {/* Ping ring */}
                        <span
                            className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-30"
                            style={{
                                border: "2px solid rgb(151,0,3)",
                                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                            }}
                        />
                    </div>

                    {/* Greeting */}
                    {userData?.name && (
                        <p
                            className="text-sm font-semibold uppercase tracking-widest mb-2"
                            style={{ color: "rgba(151,0,3,0.9)" }}
                        >
                            Hey, {userData.name.split(" ")[0]} 👋
                        </p>
                    )}

                    {/* Main heading */}
                    <h1
                        className="text-4xl font-extrabold mb-4 leading-tight"
                        style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #cccccc 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Dashboard Under
                        <br />
                        Development
                    </h1>

                    {/* Animated status line */}
                    <div
                        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
                        style={{
                            background: "rgba(151,0,3,0.12)",
                            border: "1px solid rgba(151,0,3,0.3)",
                        }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: "rgb(151,0,3)",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                        <span className="text-sm font-medium" style={{ color: "rgb(200,200,200)" }}>
                            Building something great{dots}
                        </span>
                    </div>

                    {/* Message */}
                    <p
                        className="text-base leading-relaxed mb-8 max-w-md"
                        style={{ color: "rgba(180,180,180,0.85)" }}
                    >
                        Your student dashboard is currently being set up for the new academic year.
                        It will go live soon with all your club details, submissions, and activity
                        reports. Stay tuned!
                    </p>

                    {/* Divider */}
                    <div
                        className="w-full h-px mb-8"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(151,0,3,0.5), transparent)",
                        }}
                    />

                    {/* Info chips */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {[
                            "📋 Club Details",
                            "📝 Submissions",
                            "📊 Reports",
                            "🏆 Activity Logs",
                        ].map((item) => (
                            <span
                                key={item}
                                className="text-xs font-medium px-3 py-1.5 rounded-full"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "rgba(200,200,200,0.8)",
                                }}
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Footer note */}
                    <p className="text-xs" style={{ color: "rgba(120,120,120,0.8)" }}>
                        For any queries, reach out to the{" "}
                        <span style={{ color: "rgb(151,0,3)" }}>SAC Activities Team</span>
                    </p>
                </div>

                {/* Bottom accent bar */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgb(151,0,3), transparent)",
                    }}
                />
            </div>

            {/* Keyframe styles injected inline */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
