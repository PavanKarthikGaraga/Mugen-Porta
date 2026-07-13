"use client";
import { useEffect, useState } from "react";
import { FiMail, FiPhone, FiGithub, FiLinkedin, FiGlobe, FiMapPin } from "react-icons/fi";

export default function ResumePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/student/passport")
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
                setTimeout(() => window.print(), 1000);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Resume...</div>;
    if (!data || !data.profile) return <div className="p-10 text-center text-red-500">Failed to load resume data</div>;

    const { profile, projects, internships, leadership, achievements } = data;
    // For a traditional ATS resume, we usually format Name, Contact, Summary, Experience, Projects, Education, Skills
    
    return (
        <div className="max-w-[800px] mx-auto bg-white min-h-screen text-black" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            {/* Standard ATS margins and spacing */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0.5in; }
                    body { background: white; margin: 0; padding: 0; }
                    /* Hide everything else if this is wrapped in a layout */
                    nav, footer, aside { display: none !important; }
                    main { padding: 0 !important; }
                }
            `}</style>
            
            <div className="p-8 pb-12 print:p-0">
                {/* Header Section */}
                <header className="border-b border-gray-400 pb-4 mb-4 text-center">
                    <h1 className="text-3xl font-bold text-black uppercase tracking-wider mb-2">{profile.name || profile.username}</h1>
                    <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-800">
                        {profile.portfolio_url && <span className="flex items-center gap-1"><FiGlobe /> {profile.portfolio_url}</span>}
                        {profile.github_url && <span className="flex items-center gap-1"><FiGithub /> {profile.github_url}</span>}
                        {profile.linkedin_url && <span className="flex items-center gap-1"><FiLinkedin /> {profile.linkedin_url}</span>}
                    </div>
                </header>

                {/* Summary Section */}
                {profile.about && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Professional Summary</h2>
                        <p className="text-sm text-gray-800 leading-relaxed text-justify">{profile.about}</p>
                    </section>
                )}

                {/* Education Section */}
                <section className="mb-6">
                    <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Education</h2>
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="text-sm font-bold text-black">KL University</h3>
                            <p className="text-sm text-gray-800">Bachelor of Technology</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-800">Expected {profile.graduation_year || "2026"}</p>
                            {profile.cgpa && <p className="text-sm text-gray-800">CGPA: {profile.cgpa}</p>}
                        </div>
                    </div>
                </section>

                {/* Skills Section */}
                {profile.skills && profile.skills.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Technical Skills</h2>
                        <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-bold">Key Skills: </span>
                            {profile.skills.join(", ")}
                        </p>
                    </section>
                )}

                {/* Experience (Internships) Section */}
                {internships && internships.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Experience</h2>
                        <div className="space-y-4">
                            {internships.map((exp: any) => (
                                <div key={exp.id}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-sm font-bold text-black">{exp.role}</h3>
                                            <p className="text-sm italic text-gray-800">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-800">{exp.duration}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed list-inside list-disc">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {projects && projects.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Projects</h2>
                        <div className="space-y-4">
                            {projects.map((proj: any) => (
                                <div key={proj.id}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-black">
                                            {proj.name}
                                            {proj.tech_stack && proj.tech_stack.length > 0 && (
                                                <span className="font-normal italic text-gray-700 ml-2">| {proj.tech_stack.join(", ")}</span>
                                            )}
                                        </h3>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-800">{proj.project_year}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {proj.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Leadership & Activities */}
                {(leadership && leadership.length > 0 || achievements && achievements.length > 0) && (
                    <section className="mb-6">
                        <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 pb-1 text-black">Leadership & Achievements</h2>
                        <ul className="list-disc list-outside ml-4 space-y-1">
                            {leadership?.map((l: any) => (
                                <li key={`l-${l.id}`} className="text-sm text-gray-800">
                                    <span className="font-bold">{l.role}</span>, {l.organisation} ({l.period}) - {l.impact}
                                </li>
                            ))}
                            {achievements?.map((a: any) => (
                                <li key={`a-${a.id}`} className="text-sm text-gray-800">
                                    <span className="font-bold">{a.title}</span>, {a.organisation} ({a.achievement_year})
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}
