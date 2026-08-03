"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { FiUsers, FiCheck, FiStar } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

const ALL_DOMAINS = [
  { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
  { id: "LCH", name: "Liberal Arts, Culture and Heritage", description: "Arts, Literature and Cultural preservation" },
  { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
  { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
  { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" },
];

const KLH_CLUB_IDS = ["KLH01", "KLH02", "KLH03", "KLH04", "KLH05", "KLH06", "KLH07", "KLH08", "KLH09"];

const SVR_PATHWAYS = [
  { group: "Community Engagement & Service Learning", options: ["Community needs assessment", "Volunteerism", "Civic engagement", "Service-learning projects"] },
  { group: "Rural Development", options: ["Village adoption", "Rural infrastructure", "Sustainable village planning", "Rural innovation"] },
  { group: "Swachh Bharat, Water, Sanitation & Waste Management", options: ["Solid waste management", "Plastic-free villages", "Water conservation", "Sanitation campaigns"] },
  { group: "Health, Nutrition & Community Well-being", options: ["Health awareness", "Nutrition", "Preventive healthcare", "Public health campaigns"] },
  { group: "Education, Literacy & Digital Inclusion", options: ["Digital literacy", "School transformation", "Adult literacy", "STEM education", "Educational outreach"] },
  { group: "Women Empowerment, Child Development & Social Inclusion", options: ["Gender equality", "Child rights", "Self-help groups", "Financial inclusion", "Inclusive community development"] },
  { group: "Environment, Climate Action & Biodiversity", options: ["Tree plantation", "Biodiversity conservation", "Climate resilience", "Sustainable lifestyles"] },
  { group: "Livelihoods, Skill Development & Rural Entrepreneurship", options: ["Skill training", "Local enterprises", "Agriculture-based livelihoods", "Rural employment"] },
  { group: "Disaster Preparedness, Humanitarian Response & Community Resilience", options: ["Disaster management", "First response", "Relief coordination", "Climate disaster preparedness"] },
  { group: "Global Citizenship, SDGs & Social Innovation Fellowship", options: ["SDG implementation", "Social innovation", "Public policy for communities", "Global citizenship", "Community leadership fellowship"] },
];

interface ClubRow {
  id: string; name: string; domain: string; isFull: boolean;
  memberCount: number; memberLimit: number;
}

interface Recommendation { clubName: string; domain: string; reason: string; }

function findClubByName(clubs: ClubRow[], name: string): ClubRow | undefined {
  const norm = name.trim().toLowerCase();
  return clubs.find(c => c.name.trim().toLowerCase() === norm)
    || clubs.find(c => c.name.trim().toLowerCase().includes(norm) || norm.includes(c.name.trim().toLowerCase()));
}

export default function ClubSelectionPanel({
  campus, recommendations, onDone,
}: { campus: string | null; recommendations?: Recommendation[]; onDone: () => void }) {
  const isKLHCampus = !!campus && ["KLH - Bachupally", "KLH - Aziz Nagar", "KLH - GBS"].includes(campus);
  const isVaddeswaramCampus = campus === "KLU - Vaddeswaram";

  const [clubType, setClubType] = useState<"" | "SAC" | "DEPARTMENT">("");
  const [domain, setDomain] = useState("");
  const [clubId, setClubId] = useState("");
  const [pathway, setPathway] = useState("");
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/register-data")
      .then(r => r.json())
      .then(d => setClubs(d.clubs || []))
      .catch(() => toast.error("Failed to load clubs"))
      .finally(() => setLoading(false));
  }, []);

  const clubsToShow = useMemo(() => {
    if (isKLHCampus) return clubs.filter(c => KLH_CLUB_IDS.includes(c.id));
    if (isVaddeswaramCampus && clubType === "DEPARTMENT") {
      return clubs.filter(c => c.domain === "DEPT. CLUBS" || c.id.startsWith("DEP"));
    }
    if (!domain) return [];
    return clubs.filter(c =>
      c.domain === domain && !KLH_CLUB_IDS.includes(c.id) && !c.id.startsWith("KLH") &&
      c.domain !== "DEPT. CLUBS" && !c.id.startsWith("DEP")
    );
  }, [clubs, domain, clubType, isKLHCampus, isVaddeswaramCampus]);

  const selectedClub = clubs.find(c => c.id === clubId);
  const needsPathway = clubId === "ESO01";
  const canConfirm = isKLHCampus
    ? !!clubId
    : isVaddeswaramCampus
    ? !!clubType && !!clubId && (clubType === "DEPARTMENT" || !!domain)
    : !!domain && !!clubId;
  const readyToConfirm = canConfirm && (!needsPathway || !!pathway);

  const pickRecommended = (rec: Recommendation) => {
    const match = findClubByName(clubs, rec.clubName);
    if (!match) { toast.error(`Couldn't find "${rec.clubName}" — pick from the list below`); return; }
    if (match.isFull) { toast.error(`${match.name} is full — pick a different club`); return; }
    setClubType(KLH_CLUB_IDS.includes(match.id) || match.domain === "DEPT. CLUBS" ? clubType : "SAC");
    setDomain(match.domain);
    setClubId(match.id);
    setPathway("");
  };

  const handleConfirm = async () => {
    if (!readyToConfirm || !selectedClub) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/student/select-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, domain: selectedClub.domain, pathway: pathway || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Club confirmed — welcome aboard!");
        onDone();
      } else {
        toast.error(data.error || "Failed to save your club selection");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: BRAND }}>
      <div className="px-6 py-4 text-white flex items-center gap-3" style={{ backgroundColor: BRAND }}>
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <FiUsers size={16} />
        </div>
        <div>
          <h2 className="text-sm font-extrabold">One Last Step — Choose Your Club</h2>
          <p className="text-xs text-white/85 mt-0.5">
            Your roadmap is ready. Pick the SAC club that fits your goals to unlock your full dashboard.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5 bg-white dark:bg-zinc-950">
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading clubs…</div>
        ) : (
          <>
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FiStar size={11} /> Recommended for you
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendations.map(rec => {
                    const match = findClubByName(clubs, rec.clubName);
                    const active = match && clubId === match.id;
                    return (
                      <button
                        key={rec.clubName}
                        onClick={() => pickRecommended(rec)}
                        disabled={!!match?.isFull}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          active ? "shadow-sm" : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                        } ${match?.isFull ? "opacity-40 cursor-not-allowed" : ""}`}
                        style={active ? { backgroundColor: BRAND, borderColor: "transparent" } : {}}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold ${active ? "text-white" : "text-gray-900 dark:text-white"}`}>{rec.clubName}</p>
                          {active && <FiCheck size={13} className="text-white flex-shrink-0" />}
                        </div>
                        <p className={`text-[11px] mt-1 leading-snug ${active ? "text-red-100" : "text-gray-500 dark:text-gray-400"}`}>{rec.reason}</p>
                        {match?.isFull && <p className="text-[10px] mt-1 text-red-500 font-semibold">Full — pick another club</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isVaddeswaramCampus && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Club Type</label>
                <div className="flex gap-2">
                  {(["SAC", "DEPARTMENT"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setClubType(t); setDomain(""); setClubId(""); setPathway(""); }}
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                        clubType === t ? "text-white" : "border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
                      }`}
                      style={clubType === t ? { backgroundColor: BRAND, borderColor: "transparent" } : {}}
                    >
                      {t === "SAC" ? "SAC Clubs" : "Department Clubs"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 ${isKLHCampus || (isVaddeswaramCampus && clubType === "DEPARTMENT") ? "" : "sm:grid-cols-2"} gap-4`}>
              {!isKLHCampus && (!isVaddeswaramCampus || clubType === "SAC") && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Domain</label>
                  <select
                    value={domain}
                    onChange={e => { setDomain(e.target.value); setClubId(""); setPathway(""); }}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-gray-400"
                  >
                    <option value="">Choose a domain…</option>
                    {ALL_DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {(isKLHCampus || domain || (isVaddeswaramCampus && clubType === "DEPARTMENT")) && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Club</label>
                  <select
                    value={clubId}
                    onChange={e => { setClubId(e.target.value); setPathway(""); }}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:border-gray-400"
                  >
                    <option value="">Choose a club…</option>
                    {clubsToShow.map(c => (
                      <option key={c.id} value={c.id} disabled={c.isFull}>
                        {c.name} ({c.memberCount}/{c.memberLimit}){c.isFull ? " — FULL" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {needsPathway && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SVR Pathway</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {SVR_PATHWAYS.map(g => (
                    <button
                      key={g.group}
                      onClick={() => setPathway(g.group)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        pathway === g.group
                          ? "border-transparent text-white"
                          : "border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
                      }`}
                      style={pathway === g.group ? { backgroundColor: BRAND } : {}}
                    >
                      {g.group}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedClub && (
              <div className={`p-3.5 rounded-xl border ${readyToConfirm ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900" : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900"}`}>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Selected: <span className="font-bold text-gray-900 dark:text-white">{selectedClub.name}</span>
                  {pathway && <> · {pathway}</>}
                </p>
                {!readyToConfirm && needsPathway && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">Select a pathway to continue</p>
                )}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!readyToConfirm || submitting}
              className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              {submitting ? "Confirming…" : "Confirm & Join Club"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
