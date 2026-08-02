"use client";
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiSave, FiCheckSquare, FiSquare, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  TEC: { label: "Technical",            color: "#2563eb" },
  LCH: { label: "Liberal Arts, Culture and Heritage",  color: "#7c3aed" },
  ESO: { label: "Social Outreach",      color: "#16a34a" },
  HWB: { label: "Health & Wellbeing",   color: "#ea580c" },
  IIE: { label: "Innovation",           color: "#d97706" },
};

export default function ActivityMapperPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [mappingsData, setMappingsData] = useState<any[]>([]);

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [mapped, setMapped] = useState<Set<string>>(new Set());
  const [originalMapped, setOriginalMapped] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard/admin/activity-mapper")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setClubs(d.clubs);
          setActivities(d.activities);
          setMappingsData(d.mappings);
        } else {
          toast.error("Failed to load data");
        }
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load"); setLoading(false); });
  }, []);

  // Derived: unique SAC domains (order: TEC, LCH, ESO, HWB, IIE then others)
  const domains = useMemo(() => {
    const ORDER = ["TEC", "LCH", "ESO", "HWB", "IIE"];
    const found = [...new Set(clubs.map((c: any) => c.domain))];
    return [
      ...ORDER.filter(d => found.includes(d)),
      ...found.filter(d => !ORDER.includes(d)).sort(),
    ];
  }, [clubs]);

  const clubsInDomain = useMemo(
    () => clubs.filter((c: any) => c.domain === selectedDomain),
    [clubs, selectedDomain]
  );

  const handleSelectDomain = (domain: string) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard and switch domain?")) return;
    setSelectedDomain(domain);
    setSelectedClub(null);
    setMapped(new Set());
    setOriginalMapped(new Set());
    setSearch("");
    setCollapsed(new Set());
  };

  const handleSelectClub = (club: any) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard and switch club?")) return;
    setSelectedClub(club);
    setSearch("");
    setCollapsed(new Set());
    const codes = new Set<string>(
      mappingsData.filter((m: any) => String(m.club_id) === String(club.id)).map((m: any) => m.activity_code)
    );
    setMapped(codes);
    setOriginalMapped(new Set(codes));
  };

  const toggleActivity = (code: string) => {
    setMapped(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleGroup = (codes: string[]) => {
    const allOn = codes.every(c => mapped.has(c));
    setMapped(prev => {
      const next = new Set(prev);
      if (allOn) codes.forEach(c => next.delete(c));
      else codes.forEach(c => next.add(c));
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedClub) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/admin/activity-mapper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: selectedClub.id, activityCodes: Array.from(mapped) }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Saved ${d.mapped ?? mapped.size} mappings for ${selectedClub.name}`);
        setOriginalMapped(new Set(mapped));
        // Update local mappings cache
        setMappingsData(prev => [
          ...prev.filter((m: any) => String(m.club_id) !== String(selectedClub.id)),
          ...Array.from(mapped).map(code => ({ club_id: selectedClub.id, activity_code: code })),
        ]);
      } else {
        // Show error code so we can diagnose production failures
        toast.error(`${d.error || "Save failed"}${d.code ? ` [${d.code}]` : ""}`);
      }
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  };

  // Activities grouped: domain → category
  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = activities.filter(a =>
      !q || a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || (a.category || "").toLowerCase().includes(q)
    );
    const byDomain: Record<string, Record<string, any[]>> = {};
    for (const a of filtered) {
      const dom = a.domain || "Other";
      const cat = a.category || "General";
      if (!byDomain[dom]) byDomain[dom] = {};
      if (!byDomain[dom][cat]) byDomain[dom][cat] = [];
      byDomain[dom][cat].push(a);
    }
    return byDomain;
  }, [activities, search]);

  const hasUnsavedChanges = useMemo(() => {
    if (mapped.size !== originalMapped.size) return true;
    for (const c of mapped) if (!originalMapped.has(c)) return true;
    return false;
  }, [mapped, originalMapped]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-red-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activity Mapper</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a domain → club → assign activities students of that club can see.
          </p>
        </div>
        {selectedClub && (
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-semibold transition-all disabled:opacity-50 shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            <FiSave size={14} />
            {saving ? "Saving…" : `Save${hasUnsavedChanges ? " *" : ""}`}
          </button>
        )}
      </div>

      {/* Step 1: Domain tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Step 1 — Select Domain</p>
        <div className="flex flex-wrap gap-2">
          {domains.map(domain => {
            const meta = DOMAIN_META[domain] || { label: domain, color: "#6b7280" };
            const active = selectedDomain === domain;
            const clubCount = clubs.filter((c: any) => c.domain === domain).length;
            return (
              <button
                key={domain}
                onClick={() => handleSelectDomain(domain)}
                className="flex flex-col items-start px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                style={active
                  ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                  : { borderColor: "#e5e7eb", color: "#374151" }
                }
              >
                <span>{domain}</span>
                <span className="text-[11px] font-normal mt-0.5" style={{ color: active ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
                  {meta.label} · {clubCount} clubs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDomain && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Step 2: Club list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Step 2 — Select Club</p>
              <p className="text-xs text-gray-500 mt-0.5">{clubsInDomain.length} clubs in {selectedDomain}</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[65vh] overflow-y-auto">
              {clubsInDomain.map(club => {
                const isSelected = selectedClub?.id === club.id;
                const mappedCount = mappingsData.filter((m: any) => String(m.club_id) === String(club.id)).length;
                const meta = DOMAIN_META[club.domain] || { color: "#6b7280", label: club.domain };
                return (
                  <button
                    key={club.id}
                    onClick={() => handleSelectClub(club)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected ? "text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={isSelected ? { backgroundColor: meta.color } : {}}
                  >
                    <p className="text-sm font-semibold leading-snug">{club.name}</p>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                      {mappedCount > 0 ? `${mappedCount} activities mapped` : "No mappings yet"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Activities */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedClub ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <p className="text-gray-400 text-sm">← Select a club to manage its activity mappings</p>
              </div>
            ) : (
              <>
                {/* Club info bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Club</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedClub.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Mapped</p>
                    <p className="font-bold text-sm" style={{ color: BRAND }}>{mapped.size} / {activities.length}</p>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => setMapped(new Set(activities.map((a: any) => a.code)))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setMapped(new Set())}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="Search activities by title, code or category…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                  />
                </div>

                {/* Activities: domain → category */}
                <div className="space-y-4">
                  {Object.entries(grouped).map(([domain, categories]) => {
                    const domainMeta = DOMAIN_META[domain] || { label: domain, color: "#6b7280" };
                    const allDomainCodes = Object.values(categories).flat().map((a: any) => a.code);
                    const domainKey = `domain:${domain}`;
                    const isDomainCollapsed = collapsed.has(domainKey);

                    return (
                      <div key={domain} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Domain header */}
                        <button
                          className="w-full flex items-center gap-3 px-4 py-3 text-left"
                          style={{ backgroundColor: domainMeta.color + "10", borderBottom: `2px solid ${domainMeta.color}30` }}
                          onClick={() => {
                            setCollapsed(prev => {
                              const n = new Set(prev);
                              n.has(domainKey) ? n.delete(domainKey) : n.add(domainKey);
                              return n;
                            });
                          }}
                        >
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: domainMeta.color }}
                          >
                            {domain}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">{domainMeta.label}</span>
                          <span className="text-[11px] text-gray-400 ml-1">
                            {allDomainCodes.filter(c => mapped.has(c)).length}/{allDomainCodes.length}
                          </span>
                          <div className="flex-1" />
                          <button
                            className="text-xs font-semibold px-2 py-0.5 rounded border mr-2"
                            style={{ borderColor: domainMeta.color + "60", color: domainMeta.color }}
                            onClick={e => { e.stopPropagation(); toggleGroup(allDomainCodes); }}
                          >
                            {allDomainCodes.every(c => mapped.has(c)) ? "Deselect All" : "Select All"}
                          </button>
                          {isDomainCollapsed ? <FiChevronRight size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                        </button>

                        {!isDomainCollapsed && (
                          <div className="divide-y divide-gray-50">
                            {Object.entries(categories).map(([category, items]) => {
                              const catCodes = (items as any[]).map((a: any) => a.code);
                              const allCatOn = catCodes.every(c => mapped.has(c));
                              const someCatOn = catCodes.some(c => mapped.has(c));
                              const catKey = `${domain}:${category}`;
                              const isCatCollapsed = collapsed.has(catKey);

                              return (
                                <div key={category}>
                                  {/* Category sub-header */}
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                                    <button onClick={() => toggleGroup(catCodes)} className="flex-shrink-0">
                                      {allCatOn
                                        ? <FiCheckSquare size={14} style={{ color: BRAND }} />
                                        : someCatOn
                                        ? <FiCheckSquare size={14} className="text-gray-400" />
                                        : <FiSquare size={14} className="text-gray-300" />
                                      }
                                    </button>
                                    <span className="flex-1 text-xs font-bold text-gray-600">{category}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                                      {catCodes.filter(c => mapped.has(c)).length}/{catCodes.length}
                                    </span>
                                    <button
                                      onClick={() => setCollapsed(prev => {
                                        const n = new Set(prev);
                                        n.has(catKey) ? n.delete(catKey) : n.add(catKey);
                                        return n;
                                      })}
                                      className="text-gray-400 ml-1"
                                    >
                                      {isCatCollapsed ? <FiChevronRight size={13} /> : <FiChevronDown size={13} />}
                                    </button>
                                  </div>

                                  {/* Activity rows */}
                                  {!isCatCollapsed && (items as any[]).map((activity: any) => (
                                    <label
                                      key={activity.code}
                                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={mapped.has(activity.code)}
                                        onChange={() => toggleActivity(activity.code)}
                                        className="rounded border-gray-300 accent-red-700 w-4 h-4 flex-shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-[11px] text-gray-400">{activity.code} · {activity.sdc_credits} pts</p>
                                      </div>
                                      {activity.approval_status === 'pending_approval' && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                                          Pending
                                        </span>
                                      )}
                                      {activity.difficulty && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                                          {activity.difficulty}
                                        </span>
                                      )}
                                    </label>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Object.keys(grouped).length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
                      No activities match your search.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!selectedDomain && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <p className="text-gray-400 text-sm">↑ Select a domain above to get started</p>
        </div>
      )}
    </div>
  );
}
