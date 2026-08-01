"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiGithub, FiLinkedin, FiGlobe, FiDownload, FiExternalLink,
  FiUser, FiBookOpen, FiCode, FiBriefcase, FiAward,
  FiHeart, FiStar, FiCalendar, FiFileText, FiCheckCircle,
  FiMapPin, FiTrendingUp, FiEye, FiEyeOff, FiShare2, FiCheck, FiLock,
  FiAlertTriangle, FiClock, FiXCircle,
} from "react-icons/fi";
import { BadgeIcon } from "@/lib/badgeIcons";
import { PASSPORT } from "@/app/Data/development-mock";

const BRAND = "rgb(151,0,3)";

const NAV_SECTIONS = [
  { id: "about",       label: "About",            icon: FiUser        },
  { id: "academic",    label: "Academic",          icon: FiBookOpen    },
  { id: "projects",    label: "Projects",          icon: FiCode        },
  { id: "internships", label: "Internships",       icon: FiBriefcase   },
  { id: "research",    label: "Research",          icon: FiFileText    },
  { id: "leadership",  label: "Leadership",        icon: FiStar        },
  { id: "community",   label: "Community",         icon: FiHeart       },
  { id: "achievements",label: "Achievements",      icon: FiAward       },
  { id: "timeline",    label: "Timeline",          icon: FiCalendar    },
];

const TECH_COLORS = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"];

function Section({ id, title, icon: Icon, children }) {
  return (
    <div id={id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={15} style={{ color: BRAND }} />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Ongoing:       "bg-blue-50 text-blue-700 border-blue-200",
    Completed:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Under Review":"bg-amber-50 text-amber-700 border-amber-200",
    Published:     "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[status] || "bg-gray-50 text-gray-500"}`}>
      {status}
    </span>
  );
}

import EditorModal from "./EditorModal";

export default function PassportPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/student/passport")
      .then(res => res.json())
      .then(json => {
         // Build academic section from real student data only (no mock fallbacks)
         const rawYear = json.profile?.student_year ?? json.profile?.year;
         let yearLabel = "";
         if (rawYear) {
             const y = parseInt(String(rawYear), 10);
             if (!isNaN(y)) {
                 const suffix = y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th';
                 yearLabel = `${y}${suffix} Year`;
             } else {
                 yearLabel = String(rawYear);
             }
         }
         json.academic = {
             institution: "KL University",
             campus: "Vijayawada",
             degree: json.profile?.branch ? `B.Tech ${json.profile.branch}` : (json.academic?.degree || ""),
             cgpa: json.profile?.cgpa || json.academic?.cgpa || null,
             year: yearLabel || json.academic?.year || "",
             rollNo: json.profile?.username || json.academic?.rollNo || "",
         };
         json.timeline = json.timeline || [];
         setData(json);
         setIsPublic(!!json.profile?.is_public);
         setLoading(false);
         // Fetch verification status
         fetch("/api/dashboard/student/passport/verification-status")
           .then(r => r.json())
           .then(vs => {
             if (vs.status && vs.status !== 'none') {
               setVerificationStatus(vs.status);
               if (vs.reviewerNotes) setVerificationNotes(vs.reviewerNotes);
             }
           })
           .catch(() => {});
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTogglePublic = async () => {
    if (verificationStatus === 'pending') {
      toast.info("Your passport is awaiting verification. Please wait for approval before making it public.");
      return;
    }
    if (!isPublic && verificationStatus !== 'approved') {
      setShowVerificationModal(true);
      return;
    }
    setToggling(true);
    try {
      const res = await fetch("/api/dashboard/student/passport/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      });
      if (res.ok) {
        setIsPublic(!isPublic);
        toast.success(!isPublic ? "Passport is now public — anyone with the link can view it" : "Passport is now private");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update visibility");
      }
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setToggling(false);
    }
  };

  const handleSubmitForVerification = async () => {
    setSubmittingVerification(true);
    try {
      const res = await fetch("/api/dashboard/student/passport/verification-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationStatus('pending');
        setIsPublic(false); // forced private server-side while pending
        setShowVerificationModal(false);
        toast.success("Passport submitted for verification! You will be notified once reviewed.");
      } else {
        toast.error(data.error || "Failed to submit for verification.");
      }
    } catch {
      toast.error("Failed to submit for verification.");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleEditorSave = async (newData: any) => {
    setData(newData);
    setIsPublic(!!newData.profile?.is_public);
    if (verificationStatus === 'approved') {
      // Reset verification — student edited after approval
      try {
        await fetch("/api/dashboard/student/passport/verification-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset" }),
        });
      } catch {}
      setVerificationStatus('none');
      setIsPublic(false);
      toast.info("Passport updated. You'll need to re-submit for verification before making it public again.");
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/passport/${data?.profile?.username}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <div className="p-10 text-center">Loading Passport...</div>;
  if (!data || !data.profile) return <div className="p-10 text-center text-red-500">Failed to load passport.</div>;

  const { profile, academic, projects, internships, research, leadership, community, achievements, timeline, stats, badges } = data;

  return (
    <>
      {/* Verification Warning Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle size={20} className="text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Submit Excellence Passport for Verification</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              If you want to make your Excellence Passport public, it requires <strong>admin&rsquo;s verification and approval</strong>. All data must be true and accurate.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-xs text-red-800 leading-relaxed">
              <strong>⚠️ Important Notice:</strong> If fake data, skills, or achievements are found in your Excellence Passport, we reserve all rights to <strong>permanently terminate your account</strong>. Please ensure all information is accurate and verifiable before submitting.
            </div>
            {verificationStatus === 'rejected' && verificationNotes && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-xs text-orange-800">
                <strong>Previous rejection reason:</strong> {verificationNotes}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForVerification}
                disabled={submittingVerification}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
              >
                {submittingVerification ? "Submitting…" : "Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorModal isOpen={isEditing} onClose={() => setIsEditing(false)} initialData={data} onSave={handleEditorSave} />

    <div className="max-w-5xl mx-auto">

      {/* ── Profile Hero ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div
          className="h-24 w-full relative"
          style={{
            background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, rgb(151,0,3) 0%, #7C3AED 50%, #2563EB 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px)" }}
          />
        </div>

        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-10 mb-4 gap-4 relative z-10">
            {/* Avatar — layered: initial behind, photo on top */}
            <div
              className="relative w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md overflow-hidden"
              style={{ backgroundColor: BRAND }}
            >
              <span className="select-none">
                {(profile.name || profile.username)?.charAt(0).toUpperCase()}
              </span>
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || "Avatar"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-gray-700 bg-gray-100 shadow-sm hover:shadow-md transition-all border border-gray-200"
              >
                <FiUser size={13} /> Edit Profile
              </button>

              {/* Verification-aware public/private toggle */}
              {verificationStatus === 'pending' ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 cursor-default">
                  <FiClock size={13} /> Pending Verification
                </span>
              ) : verificationStatus === 'approved' ? (
                <button
                  onClick={handleTogglePublic}
                  disabled={toggling}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all border ${
                    isPublic
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {isPublic ? <FiEye size={13} /> : <FiLock size={13} />}
                  {toggling ? "Saving..." : isPublic ? "Public ✓" : "Private"}
                </button>
              ) : (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all"
                >
                  {verificationStatus === 'rejected' ? <FiXCircle size={13} className="text-red-400" /> : <FiLock size={13} />}
                  {verificationStatus === 'rejected' ? "Re-submit for Verification" : "Make Public"}
                </button>
              )}

              {/* Copy share link (only when public) */}
              {isPublic && (
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:shadow-sm transition-all"
                >
                  {copied ? <FiCheck size={13} /> : <FiShare2 size={13} />}
                  {copied ? "Copied!" : "Share Link"}
                </button>
              )}

              {/* Social links */}
              {[
                { Icon: FiGithub,   href: profile?.github_url,    label: "GitHub",    color: "#111827" },
                { Icon: FiLinkedin, href: profile?.linkedin_url,  label: "LinkedIn",  color: "#0077B5" },
                { Icon: FiGlobe,    href: profile?.portfolio_url, label: "Portfolio", color: "#059669" },
              ].filter(l => l.href).map(({ Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                  style={{ color }}
                >
                  <Icon size={13} /> {label}
                </a>
              ))}

              <Link
                href="/dashboard/student/passport/resume"
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: BRAND }}
              >
                <FiDownload size={13} /> Export PDF
              </Link>
            </div>
          </div>

          {/* Name + meta + stats */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}</h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">{profile.tagline}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><FiMapPin size={11} /> {academic.campus}</span>
                <span className="flex items-center gap-1"><FiBookOpen size={11} /> {academic.year}</span>
                {academic.cgpa && <span className="flex items-center gap-1"><FiTrendingUp size={11} /> CGPA {academic.cgpa}</span>}
              </div>
              {isPublic && (
                <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                  <FiEye size={10} /> Publicly visible at{" "}
                  <button onClick={handleCopyLink} className="underline hover:no-underline">
                    {typeof window !== "undefined" ? window.location.host : ""}/passport/{profile.username}
                  </button>
                </p>
              )}
            </div>

            {/* Stats — now wired to real data */}
            <div className="flex gap-5">
              {[
                { label: "SAMAM Points", value: stats?.sdc_total ?? 0 },
                { label: "Activities",   value: stats?.activities_count ?? 0 },
                { label: "Badges",       value: stats?.badges_count ?? 0 },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile horizontal section nav */}
      <div className="lg:hidden mb-3 -mx-1">
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 px-1" style={{ minWidth: "max-content" }}>
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeSection === id ? "text-white shadow-sm" : "text-gray-600 bg-white border border-gray-200"
                }`}
                style={activeSection === id ? { backgroundColor: BRAND } : {}}
              >
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Sticky sidebar nav (desktop only) */}
        <div className="hidden lg:block w-44 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 sticky top-4">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === id ? "text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
                style={activeSection === id ? { backgroundColor: BRAND } : {}}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* About */}
          <Section id="about" title="About" icon={FiUser}>
            {profile.about ? (
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.about}</p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-4">No bio added yet. Edit your profile to add one.</p>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 mb-2">Core Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md border border-gray-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* SAMAM Badges — shown if any earned */}
          {badges && badges.length > 0 && (
            <Section id="badges" title="SAMAM Badges" icon={FiAward}>
              <div className="flex flex-wrap gap-3">
                {badges.map((b: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold"
                    style={{ backgroundColor: b.bg_color || '#f9fafb', borderColor: b.color || '#e5e7eb', color: b.color || '#374151' }}
                  >
                    <BadgeIcon icon={b.icon} domain={b.domain} size={18} style={{ color: b.color || BRAND }} />
                    <div>
                      <p className="font-bold">{b.name}</p>
                      <p className="text-[10px] font-normal opacity-70">{b.rarity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Academic Profile */}
          <Section id="academic" title="Academic Profile" icon={FiBookOpen}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Institution",   value: academic.institution  },
                { label: "Degree",        value: academic.degree        },
                { label: "CGPA",          value: academic.cgpa          },
                { label: "Year",          value: academic.year          },
                { label: "Roll No.",      value: academic.rollNo        },
                { label: "Campus",        value: academic.campus        },
              ].map((f) => (
                <div key={f.label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-400 mb-0.5">{f.label}</p>
                  <p className="text-xs font-semibold text-gray-800">{f.value || "—"}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Projects */}
          {projects && projects.length > 0 && (
            <Section id="projects" title="Projects" icon={FiCode}>
              <div className="space-y-4">
                {projects.map((p: any) => (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                          <StatusBadge status={p.status} />
                          <span className="text-[10px] text-gray-400">{p.project_year}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {(p.tech_stack || []).map((t: string, i: number) => (
                            <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded text-white" style={{ backgroundColor: TECH_COLORS[i % TECH_COLORS.length] }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1 hover:bg-gray-50">
                            <FiGithub size={11} /> Code
                          </a>
                        )}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-1" style={{ borderColor: BRAND, color: BRAND }}>
                            <FiExternalLink size={11} /> Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Internships */}
          {internships && internships.length > 0 && (
            <Section id="internships" title="Internships" icon={FiBriefcase}>
              <div className="space-y-4">
                {internships.map((i: any) => (
                  <div key={i.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0" style={{ backgroundColor: BRAND }}>
                      {i.company?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{i.role}</p>
                      <p className="text-xs text-gray-600">{i.company} · {i.location}</p>
                      <p className="text-xs text-gray-400">{i.duration}</p>
                      <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">{i.description}</p>
                      {i.skills && i.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {i.skills.map((s: string) => (
                            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Research */}
          {research && research.length > 0 && (
            <Section id="research" title="Research" icon={FiFileText}>
              <div className="space-y-3">
                {research.map((r: any) => (
                  <div key={r.id} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.journal}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.co_authors && r.co_authors.length > 0 && `Co-authors: ${r.co_authors.join(", ")} · `}{r.publication_year}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Leadership */}
          {leadership && leadership.length > 0 && (
            <Section id="leadership" title="Leadership" icon={FiStar}>
              <div className="space-y-3">
                {leadership.map((l: any) => (
                  <div key={l.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: BRAND }} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{l.role}</p>
                      <p className="text-xs text-gray-500">{l.organisation} · {l.period}</p>
                      <p className="text-xs text-gray-700 mt-0.5">{l.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Community Service */}
          {community && community.length > 0 && (
            <Section id="community" title="Community Service" icon={FiHeart}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {community.map((c: any) => (
                  <div key={c.id} className="p-3.5 border border-gray-100 rounded-xl">
                    <p className="text-xs font-semibold text-gray-900">{c.activity}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                      <span>⏱ {c.hours_spent}h</span>
                      <span className="flex items-center gap-1"><FiCheckCircle size={9} className="text-emerald-500" />{c.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <Section id="achievements" title="Achievements" icon={FiAward}>
              <div className="space-y-2">
                {achievements.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-xl">{a.icon || "🏆"}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{a.title}</p>
                      <p className="text-[10px] text-gray-500">{a.organisation} · {a.achievement_year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Timeline */}
          {timeline && timeline.length > 0 && (
            <Section id="timeline" title="My Journey" icon={FiCalendar}>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {timeline.map((t: any) => (
                    <div key={t.year} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 z-10" style={{ backgroundColor: BRAND }}>
                        {t.year?.slice(2)}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-xs font-bold text-gray-700 mb-1.5">{t.year}</p>
                        <ul className="space-y-1">
                          {t.events.map((e: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                              <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
    </>
  );
}
