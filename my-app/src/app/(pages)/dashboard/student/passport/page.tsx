"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiGithub, FiLinkedin, FiGlobe, FiDownload, FiExternalLink,
  FiUser, FiBookOpen, FiCode, FiBriefcase, FiAward,
  FiHeart, FiStar, FiCalendar, FiFileText, FiCheckCircle,
} from "react-icons/fi";
import { PASSPORT, BADGES }  from "@/app/Data/development-mock";
import { mockSDC, mockStats } from "@/app/Data/samam-mock";

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
import { useEffect } from "react";

export default function PassportPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/student/passport")
      .then(res => res.json())
      .then(json => {
         // Fallback to mock for academic data since it's not in the DB schema for passport
         json.academic = { ...PASSPORT.academic };
         if (json.profile?.cgpa) json.academic.cgpa = json.profile.cgpa;
         if (json.profile?.username) json.academic.rollNo = json.profile.username;
         json.timeline = json.timeline || [];
         setData(json);
         setLoading(false);
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

  if (loading) return <div className="p-10 text-center">Loading Passport...</div>;
  if (!data || !data.profile) return <div className="p-10 text-center text-red-500">Failed to load passport.</div>;

  const { profile, academic, projects, internships, research, leadership, community, achievements, timeline } = data;

  return (
    <>
      <EditorModal isOpen={isEditing} onClose={() => setIsEditing(false)} initialData={data} onSave={(newData) => setData(newData)} />

    <div className="max-w-5xl mx-auto">

      {/* ── Profile Hero ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {/* Cover band */}
        <div
          className="h-24 w-full relative"
          style={{
            background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, rgb(151,0,3) 0%, #7C3AED 50%, #2563EB 100%)`,
          }}
        >
          {/* Grid texture overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px)" }}
          />
        </div>

        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-10 mb-4 gap-4 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white overflow-hidden relative"
                style={{ backgroundColor: BRAND, backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {profile.avatar_url ? '' : (profile.name || profile.username)?.charAt(0).toUpperCase()}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-gray-700 bg-gray-100 shadow-sm hover:shadow-md transition-all border border-gray-200"
              >
                <FiUser size={13} /> Edit Profile
              </button>
              {/* Social links */}
              {[
                { Icon: FiGithub,   href: profile?.github_url,    label: "GitHub",    color: "#111827" },
                { Icon: FiLinkedin, href: profile?.linkedin_url,  label: "LinkedIn",  color: "#0077B5" },
                { Icon: FiGlobe,    href: profile?.portfolio_url, label: "Portfolio", color: "#059669" },
              ].map(({ Icon, href, label, color }) => (
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

          {/* Name + meta */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}</h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">{profile.tagline}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span>📍 {academic.campus}</span>
                <span>🎓 {academic.year}</span>
                <span>⭐ CGPA {academic.cgpa}</span>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-4">
              {[
                { label: "SAMAM Points", value: 0 },
                { label: "Activities",  value: 0 },
                { label: "Badges",      value: 0 },
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

      <div className="flex gap-5 items-start">
        {/* ── Sticky sidebar nav ── */}
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

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* About */}
          <Section id="about" title="About" icon={FiUser}>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.about}</p>
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
                  <p className="text-xs font-semibold text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section id="projects" title="Projects" icon={FiCode}>
            <div className="space-y-4">
              {projects.map((p) => (
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
                        {(p.tech_stack || []).map((t, i) => (
                          <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded text-white" style={{ backgroundColor: TECH_COLORS[i % TECH_COLORS.length] }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={p.github_url} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1 hover:bg-gray-50">
                        <FiGithub size={11} /> Code
                      </a>
                      {p.demo_url && (
                        <a href={p.demo_url} className="text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-1" style={{ borderColor: BRAND, color: BRAND }}>
                          <FiExternalLink size={11} /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Internships */}
          <Section id="internships" title="Internships" icon={FiBriefcase}>
            <div className="space-y-4">
              {internships.map((i) => (
                <div key={i.id} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                    style={{ backgroundColor: BRAND }}
                  >
                    {i.company[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{i.role}</p>
                        <p className="text-xs text-gray-600">{i.company} · {i.location}</p>
                        <p className="text-xs text-gray-400">{i.duration}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">{i.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(i.skills || []).map((s) => (
                        <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Research */}
          <Section id="research" title="Research" icon={FiFileText}>
            <div className="space-y-3">
              {research.map((r) => (
                <div key={r.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.journal}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Co-authors: {(r.co_authors || []).join(", ")} · {r.publication_year}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Leadership */}
          <Section id="leadership" title="Leadership" icon={FiStar}>
            <div className="space-y-3">
              {leadership.map((l) => (
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

          {/* Community Service */}
          <Section id="community" title="Community Service" icon={FiHeart}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {community.map((c) => (
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

          {/* Achievements */}
          <Section id="achievements" title="Achievements" icon={FiAward}>
            <div className="space-y-2">
              {achievements.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{a.title}</p>
                    <p className="text-[10px] text-gray-500">{a.organisation} · {a.achievement_year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeline */}
          <Section id="timeline" title="My Journey" icon={FiCalendar}>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {timeline.map((t) => (
                  <div key={t.year} className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 z-10"
                      style={{ backgroundColor: BRAND }}
                    >
                      {t.year.slice(2)}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-bold text-gray-700 mb-1.5">{t.year}</p>
                      <ul className="space-y-1">
                        {t.events.map((e, i) => (
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

        </div>
      </div>
    </div>
    </>
  );
}
