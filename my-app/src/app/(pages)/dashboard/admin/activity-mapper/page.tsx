"use client";
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiSave, FiX, FiPlus, FiTag, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_META: Record<string, { label: string; color: string; emoji: string }> = {
  TEC:           { label: "Technical",                          color: "#2563eb", emoji: "⚙️" },
  LCH:           { label: "Liberal Arts, Culture & Heritage",   color: "#7c3aed", emoji: "🎭" },
  ESO:           { label: "Social Outreach",                    color: "#16a34a", emoji: "🌱" },
  HWB:           { label: "Health & Wellbeing",                 color: "#ea580c", emoji: "🏃" },
  IIE:           { label: "Innovation & Entrepreneurship",      color: "#d97706", emoji: "💡" },
  "DEPT. CLUBS": { label: "Departmental Clubs",                 color: "#0891b2", emoji: "🏛️" },
  "MHS. CLUBS":  { label: "MHS Clubs",                         color: "#be185d", emoji: "🎓" },
};

export default function ActivityMapperPage() {
  const [clubs, setClubs]                     = useState<any[]>([]);
  const [allCategories, setAllCategories]     = useState<any[]>([]);    // {domain, category, activity_count}
  const [categoryMappings, setCategoryMappings] = useState<any[]>([]);  // {club_id, category}

  const [selectedDomain, setSelectedDomain]   = useState<string | null>(null);
  const [selectedClub,   setSelectedClub]     = useState<any>(null);

  // The set of categories currently mapped to the selected club (editable state)
  const [mappedCats,     setMappedCats]       = useState<Set<string>>(new Set());
  const [originalCats,   setOriginalCats]     = useState<Set<string>>(new Set());

  const [loading, setSaving_] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [search,  setSearch]  = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/dashboard/admin/activity-mapper")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setClubs(d.clubs);
          setAllCategories(d.categories);
          setCategoryMappings(d.categoryMappings);
        } else {
          toast.error("Failed to load data");
        }
        setSaving_(false);
      })
      .catch(() => { toast.error("Failed to load"); setSaving_(false); });
  }, []);

  // ── Derived: domains with clubs ───────────────────────────────────────────
  const allDomains = useMemo(() => {
    const ORDER = ["TEC", "LCH", "ESO", "HWB", "IIE", "DEPT. CLUBS", "MHS. CLUBS"];
    const found = [...new Set(clubs.map((c: any) => c.domain))];
    return [...ORDER.filter(d => found.includes(d)), ...found.filter(d => !ORDER.includes(d)).sort()];
  }, [clubs]);

  const clubsInDomain = useMemo(
    () => clubs.filter((c: any) => c.domain === selectedDomain),
    [clubs, selectedDomain]
  );

  // ── Derived: categories grouped by domain (for the right panel) ───────────
  const groupedCategories = useMemo(() => {
    const q = catSearch.toLowerCase();
    const filtered = allCategories.filter(c =>
      (!q || c.category.toLowerCase().includes(q)) &&
      (domainFilter === "all" || c.domain === domainFilter)
    );
    const byDomain: Record<string, any[]> = {};
    for (const cat of filtered) {
      if (!byDomain[cat.domain]) byDomain[cat.domain] = [];
      byDomain[cat.domain].push(cat);
    }
    return byDomain;
  }, [allCategories, catSearch, domainFilter]);

  // Category domains for filter tabs
  const catDomains = useMemo(() => {
    const ORDER = ["TEC", "LCH", "ESO", "HWB", "IIE", "DEPT. CLUBS", "MHS. CLUBS"];
    const found = [...new Set(allCategories.map((c: any) => c.domain))];
    return ["all", ...ORDER.filter(d => found.includes(d)), ...found.filter(d => !ORDER.includes(d)).sort()];
  }, [allCategories]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    if (mappedCats.size !== originalCats.size) return true;
    for (const c of mappedCats) if (!originalCats.has(c)) return true;
    return false;
  }, [mappedCats, originalCats]);

  const mappedCountForClub = (clubId: string | number) =>
    categoryMappings.filter((m: any) => String(m.club_id) === String(clubId)).length;

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleSelectDomain = (domain: string) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard and switch?")) return;
    setSelectedDomain(domain);
    setSelectedClub(null);
    setMappedCats(new Set());
    setOriginalCats(new Set());
    setSearch("");
  };

  const handleSelectClub = (club: any) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard and switch club?")) return;
    setSelectedClub(club);
    const cats = new Set<string>(
      categoryMappings.filter((m: any) => String(m.club_id) === String(club.id)).map((m: any) => m.category)
    );
    setMappedCats(cats);
    setOriginalCats(new Set(cats));
    setCatSearch("");
  };

  const toggleCat = (cat: string) => {
    setMappedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const removeCat = (cat: string) => {
    setMappedCats(prev => { const n = new Set(prev); n.delete(cat); return n; });
  };

  const handleSave = async () => {
    if (!selectedClub) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/admin/activity-mapper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: selectedClub.id, categories: Array.from(mappedCats) }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Saved ${d.mapped} category mappings for ${selectedClub.name}`);
        setOriginalCats(new Set(mappedCats));
        // Update local cache
        setCategoryMappings(prev => [
          ...prev.filter((m: any) => String(m.club_id) !== String(selectedClub.id)),
          ...Array.from(mappedCats).map(cat => ({ club_id: selectedClub.id, category: cat })),
        ]);
      } else {
        toast.error(`${d.error || "Save failed"}${d.code ? ` [${d.code}]` : ""}`);
      }
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-red-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activity Category Mapper</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Map <strong>subcategories</strong> to clubs. All current &amp; future activities in a mapped category are automatically visible to that club&apos;s leads and members.
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
            {saving ? "Saving…" : `Save Mappings${hasUnsavedChanges ? " *" : ""}`}
          </button>
        )}
      </div>

      {/* ── Step 1: Domain tabs ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Step 1 — Select Domain</p>
        <div className="flex flex-wrap gap-2">
          {allDomains.map(domain => {
            const meta = DOMAIN_META[domain] || { label: domain, color: "#6b7280", emoji: "🏷️" };
            const active = selectedDomain === domain;
            const count = clubs.filter((c: any) => c.domain === domain).length;
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
                <span>{meta.emoji} {domain}</span>
                <span className="text-[11px] font-normal mt-0.5" style={{ color: active ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
                  {meta.label} · {count} clubs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDomain && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* ── Step 2: Club list ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Step 2 — Select Club</p>
              <p className="text-xs text-gray-500 mt-0.5">{clubsInDomain.length} clubs in {selectedDomain}</p>
            </div>
            {/* Club search */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                <input
                  type="text"
                  placeholder="Search clubs…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
              {clubsInDomain
                .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                .map(club => {
                  const isSelected = selectedClub?.id === club.id;
                  const meta = DOMAIN_META[club.domain] || { color: "#6b7280", label: club.domain, emoji: "" };
                  const catCount = mappedCountForClub(club.id);
                  return (
                    <button
                      key={club.id}
                      onClick={() => handleSelectClub(club)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        isSelected ? "text-white" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      style={isSelected ? { backgroundColor: meta.color } : {}}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold leading-snug truncate">{club.name}</p>
                        {catCount > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                          }`}>
                            {catCount} cats
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        {catCount > 0 ? `${catCount} categories mapped` : "No mappings yet"}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* ── Step 3: Category mapping panel ── */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedClub ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <p className="text-gray-400 text-sm">← Select a club to manage its category mappings</p>
              </div>
            ) : (
              <>
                {/* Club info + mapped categories chips */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Mapping for</p>
                      <p className="font-bold text-gray-900 text-base">{selectedClub.name}</p>
                      <p className="text-xs text-gray-400">{selectedClub.domain} · ID {selectedClub.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Mapped Categories</p>
                        <p className="font-bold text-2xl" style={{ color: BRAND }}>{mappedCats.size}</p>
                      </div>
                    </div>
                  </div>

                  {/* Currently mapped categories — chips */}
                  {mappedCats.size > 0 ? (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiCheckCircle size={11} className="text-green-500" />
                        Currently Mapped — click × to remove
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(mappedCats).sort().map(cat => {
                          const catInfo = allCategories.find((c: any) => c.category === cat);
                          const meta = DOMAIN_META[catInfo?.domain] || { color: "#6b7280", emoji: "" };
                          const isNew = !originalCats.has(cat);
                          return (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                              style={{
                                backgroundColor: meta.color + "15",
                                borderColor: meta.color + "40",
                                color: meta.color,
                              }}
                            >
                              <FiTag size={10} />
                              {cat}
                              {catInfo && <span className="opacity-60">({catInfo.activity_count})</span>}
                              {isNew && <span className="bg-amber-100 text-amber-700 px-1 rounded text-[9px] font-bold">NEW</span>}
                              <button
                                onClick={() => removeCat(cat)}
                                className="ml-0.5 hover:opacity-60 transition-opacity"
                              >
                                <FiX size={11} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <FiAlertCircle size={14} />
                      No categories mapped yet — select from the list below to add.
                    </div>
                  )}
                </div>

                {/* Category picker */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Step 3 — Map Subcategories</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Toggle categories. All activities in a mapped category (now &amp; future) will be auto-visible to this club.
                      </p>
                    </div>
                  </div>

                  {/* Search + domain filter */}
                  <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                      <input
                        type="text"
                        placeholder="Search categories…"
                        value={catSearch}
                        onChange={e => setCatSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {catDomains.map(d => {
                        const meta = d === "all" ? { color: "#6b7280", emoji: "🔍" } : (DOMAIN_META[d] || { color: "#6b7280", emoji: "🏷️" });
                        const active = domainFilter === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setDomainFilter(d)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                            style={active
                              ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                              : { borderColor: "#e5e7eb", color: "#374151" }
                            }
                          >
                            {d === "all" ? "All Domains" : d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Domain → Category list */}
                  <div className="divide-y divide-gray-100 max-h-[55vh] overflow-y-auto">
                    {Object.entries(groupedCategories).map(([domain, cats]) => {
                      const meta = DOMAIN_META[domain] || { label: domain, color: "#6b7280", emoji: "🏷️" };
                      const domKey = `d:${domain}`;
                      const isCollapsed = collapsed.has(domKey);
                      const allOn = (cats as any[]).every(c => mappedCats.has(c.category));
                      const someOn = (cats as any[]).some(c => mappedCats.has(c.category));

                      const toggleDomain = () => {
                        const catNames = (cats as any[]).map(c => c.category);
                        setMappedCats(prev => {
                          const next = new Set(prev);
                          if (allOn) catNames.forEach(c => next.delete(c));
                          else catNames.forEach(c => next.add(c));
                          return next;
                        });
                      };

                      return (
                        <div key={domain}>
                          {/* Domain header row */}
                          <div
                            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none"
                            style={{ backgroundColor: meta.color + "0f", borderLeft: `3px solid ${meta.color}` }}
                          >
                            {/* Domain-level select all */}
                            <button
                              onClick={toggleDomain}
                              className="flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-all"
                              style={allOn
                                ? { backgroundColor: meta.color, borderColor: meta.color }
                                : someOn
                                ? { backgroundColor: meta.color + "40", borderColor: meta.color }
                                : { borderColor: "#d1d5db" }
                              }
                            >
                              {(allOn || someOn) && <span className="text-white text-[8px] font-bold">{allOn ? "✓" : "–"}</span>}
                            </button>

                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: meta.color }}
                            >
                              {domain}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 flex-1">{meta.label}</span>
                            <span className="text-[10px] text-gray-400">
                              {(cats as any[]).filter(c => mappedCats.has(c.category)).length}/{(cats as any[]).length}
                            </span>
                            <button
                              onClick={() => setCollapsed(prev => {
                                const n = new Set(prev); n.has(domKey) ? n.delete(domKey) : n.add(domKey); return n;
                              })}
                              className="text-gray-400"
                            >
                              {isCollapsed ? <FiChevronRight size={13} /> : <FiChevronDown size={13} />}
                            </button>
                          </div>

                          {/* Category rows */}
                          {!isCollapsed && (cats as any[]).map(catObj => {
                            const isMapped = mappedCats.has(catObj.category);
                            const isOriginal = originalCats.has(catObj.category);
                            const isNew = isMapped && !isOriginal;
                            const isRemoved = !isMapped && isOriginal;

                            return (
                              <button
                                key={catObj.category}
                                onClick={() => toggleCat(catObj.category)}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 ${
                                  isMapped ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                                }`}
                              >
                                {/* Checkbox indicator */}
                                <div
                                  className="flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-all"
                                  style={isMapped
                                    ? { backgroundColor: meta.color, borderColor: meta.color }
                                    : { borderColor: "#d1d5db" }
                                  }
                                >
                                  {isMapped && <span className="text-white text-[8px] font-bold">✓</span>}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${isMapped ? "text-gray-900" : "text-gray-600"}`}>
                                    {catObj.category}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {catObj.activity_count} {catObj.activity_count === 1 ? "activity" : "activities"} in this category
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isNew && (
                                    <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                      <FiPlus size={8} />NEW
                                    </span>
                                  )}
                                  {isRemoved && (
                                    <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                      <FiX size={8} />REMOVE
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isMapped ? "bg-blue-200 text-blue-700" : "bg-gray-100 text-gray-500"
                                  }`}>
                                    {catObj.activity_count}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                    {Object.keys(groupedCategories).length === 0 && (
                      <div className="p-10 text-center text-gray-400 text-sm">
                        No categories match your search.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!selectedDomain && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <p className="text-gray-400 text-sm">↑ Select a domain above to get started</p>
          <p className="text-gray-300 text-xs mt-1">
            You can map subcategories to any club — SAC, Dept. Clubs, or MHS Clubs
          </p>
        </div>
      )}
    </div>
  );
}
