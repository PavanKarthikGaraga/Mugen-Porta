"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FiGithub, FiLinkedin, FiGlobe, FiExternalLink,
  FiUser, FiBookOpen, FiCode, FiBriefcase, FiAward,
  FiHeart, FiStar, FiCalendar, FiFileText, FiCheckCircle,
  FiMapPin, FiTrendingUp, FiShield, FiLock,
} from "react-icons/fi";
import { BadgeIcon } from "@/lib/badgeIcons";

const BRAND = "rgb(151,0,3)";
const TECH_COLORS = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"];

function Section({ id, title, icon: Icon, children }: any) {
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
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

function RarityColor(rarity: string) {
  return { Common: "#6B7280", Rare: "#2563EB", Epic: "#7C3AED", Legendary: "#D97706" }[rarity] || "#6B7280";
}

export default function PublicPassportPage() {
  const params = useParams();
  const username = params?.username as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/passport/${username}`)
      .then(res => res.json().then(json => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error || "Could not load passport");
          return;
        }
        // Construct academic data from profile
        const p = json.profile;
        const yRaw = p?.student_year;
        const yNum = parseInt(yRaw, 10);
        const suffix = yNum === 1 ? 'st' : yNum === 2 ? 'nd' : yNum === 3 ? 'rd' : 'th';
        json.academic = {
          institution: "KL University",
          campus: "Vijayawada",
          degree: p?.branch ? `B.Tech ${p.branch}` : "B.Tech",
          cgpa: p?.cgpa,
          rollNo: p?.username,
          year: !isNaN(yNum) ? `${yNum}${suffix} Year` : (yRaw ? String(yRaw) : "—"),
        };
        json.timeline = json.timeline || [];
        setData(json);
      })
      .catch(() => setError("Failed to load passport"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: BRAND, borderTopColor: "transparent" }} />
          <p className="text-sm text-gray-500">Loading portfolio…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock size={24} className="text-gray-400" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Passport Unavailable</h1>
          <p className="text-sm text-gray-500">{error === "This passport is private" ? "This student has not made their portfolio public yet." : error}</p>
          <Link href="/" className="inline-block mt-6 text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: BRAND }}>
            Go to SAMAM
          </Link>
        </div>
      </div>
    );
  }

  const { profile, academic, projects, internships, research, leadership, community, achievements, timeline, stats, badges } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiShield size={13} style={{ color: BRAND }} />
            <span className="font-semibold" style={{ color: BRAND }}>SAMAM</span>
            <span>·</span>
            <span>KL University Student Portfolio</span>
          </div>
          <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
            Visit SAMAM
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Hero ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div
            className="h-28 w-full relative"
            style={{
              background: profile.banner_url
                ? `url(${profile.banner_url}) center/cover`
                : `linear-gradient(135deg, rgb(151,0,3) 0%, #7C3AED 50%, #2563EB 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px)" }}
            />
          </div>

          <div className="px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-10 mb-4 gap-4 relative z-10">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md overflow-hidden"
                style={{
                  backgroundColor: BRAND,
                  backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {profile.avatar_url ? "" : (profile.name || profile.username)?.charAt(0).toUpperCase()}
              </div>

              {/* Social links */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { Icon: FiGithub,   href: profile.github_url,    label: "GitHub",    color: "#111827" },
                  { Icon: FiLinkedin, href: profile.linkedin_url,  label: "LinkedIn",  color: "#0077B5" },
                  { Icon: FiGlobe,    href: profile.portfolio_url, label: "Portfolio", color: "#059669" },
                ].filter(l => l.href).map(({ Icon, href, label, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 hover:shadow-sm transition-all bg-white"
                    style={{ color }}>
                    <Icon size={13} /> {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name || profile.username}</h1>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{profile.tagline}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiMapPin size={11} /> {academic.campus}</span>
                  <span className="flex items-center gap-1"><FiBookOpen size={11} /> {academic.year}</span>
                  {academic.cgpa && <span className="flex items-center gap-1"><FiTrendingUp size={11} /> CGPA {academic.cgpa}</span>}
                </div>
              </div>

              {/* Live stats */}
              <div className="flex gap-6">
                {[
                  { label: "SAMAM Points", value: stats?.sdc_total ?? 0 },
                  { label: "Activities",   value: stats?.activities_count ?? 0 },
                  { label: "Badges",       value: stats?.badges_count ?? 0 },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="space-y-4">

          {/* About */}
          {profile.about && (
            <Section id="about" title="About" icon={FiUser}>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{profile.about}</p>
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-2">Core Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md border border-gray-200">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* SAMAM Badges */}
          {badges && badges.length > 0 && (
            <Section id="badges" title="SAMAM Badges" icon={FiAward}>
              <div className="flex flex-wrap gap-3">
                {badges.map((b: any, i: number) => (
                  <div key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold"
                    style={{ backgroundColor: b.bg_color || "#f9fafb", borderColor: b.color || "#e5e7eb", color: b.color || "#374151" }}>
                    <BadgeIcon icon={b.icon} domain={b.domain} size={18} style={{ color: b.color || BRAND }} />
                    <div>
                      <p className="font-bold">{b.name}</p>
                      <p className="text-[10px] font-normal opacity-70" style={{ color: RarityColor(b.rarity) }}>{b.rarity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Academic */}
          <Section id="academic" title="Academic Profile" icon={FiBookOpen}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Institution", value: academic.institution },
                { label: "Degree",      value: academic.degree },
                { label: "CGPA",        value: academic.cgpa },
                { label: "Year",        value: academic.year },
                { label: "Roll No.",    value: academic.rollNo },
                { label: "Campus",      value: academic.campus },
              ].map(f => (
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

          {/* Community */}
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

        {/* Footer */}
        <div className="mt-8 py-6 border-t border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiShield size={14} style={{ color: BRAND }} />
            <span className="text-xs font-bold" style={{ color: BRAND }}>SAMAM</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">KL University Student Activity Programme</span>
          </div>
          <p className="text-[11px] text-gray-400">This portfolio is verified and published by the student.</p>
        </div>
      </div>
    </div>
  );
}
