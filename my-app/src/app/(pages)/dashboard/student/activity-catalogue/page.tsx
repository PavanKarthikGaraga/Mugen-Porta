"use client";
import { useState, useMemo, useEffect } from "react";
import { FiFilter, FiGrid, FiList, FiX, FiSliders } from "react-icons/fi";
import { DOMAINS, LEVELS, ACTIVITY_PACKS, FACULTIES } from "@/app/Data/activities-mock";
import CatalogueCard from "@/app/components/dashboard/CatalogueCard";
import FilterPanel  from "@/app/components/dashboard/FilterPanel";
import SearchBar    from "@/app/components/dashboard/SearchBar";
import DashboardCard from "@/app/components/dashboard/DashboardCard";

const BRAND = "rgb(151,0,3)";
const PAGE_SIZE = 12;

const FILTERS = [
  { key: "difficulty", label: "Difficulty",        type: "chips",  options: ["Beginner","Intermediate","Advanced"] },
  { key: "level",      label: "Journey Level",     type: "select", options: LEVELS.map((l) => l.name) },
  { key: "sdg",        label: "SDG",               type: "select", options: Array.from({ length: 17 }, (_, i) => `SDG ${i + 1}`) },
  { key: "status",     label: "Status",            type: "chips",  options: ["Open","Full","Upcoming"] },
];

const EMPTY_FILTERS = {
  domain: "", difficulty: "", level: "", pack: "", faculty: "",
  maxCredits: 100, maxHours: 500, sdg: "", status: "", career: "",
};

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "TEC (Technical)",
  LCH: "LCH (Liberal Arts)",
  ESO: "ESO (Extension & Society Outreach)",
  IIE: "IIE (Innovation, Incubation and Entrepreneurship)",
  HWB: "HWB (Health and Wellbeing)",
};

export default function ActivityCataloguePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,       setSearch]       = useState("");
  const [activeFilters,setActiveFilters]= useState({ ...EMPTY_FILTERS });
  const [bookmarks,    setBookmarks]    = useState(new Set());
  const [view,         setView]         = useState("grid"); // grid | list
  const [page,         setPage]         = useState(1);
  const [filterOpen,   setFilterOpen]   = useState(false);

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map DB keys to match existing frontend expectations if needed
          const mapped = data.data.map((a: any) => ({
            ...a,
            name: a.title, // Map title to name for the frontend
            credits: a.sdc_credits, // Map sdc_credits to credits
            hours: a.sdc_credits * 10, // Approximate hours
            enrolledCount: a.enrolledCount || 0,
            maxEnrollment: a.max_seats || 0,
            isEnrolled: a.isEnrolled || false,
          }));
          setActivities(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch activities", err);
        setLoading(false);
      });
  }, []);

  // ── Toggle bookmark ──────────────────────────────────────────────────────
  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Filter + search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return activities.filter((a) => {
      if (q && !a.name?.toLowerCase().includes(q) &&
          !a.code?.toLowerCase().includes(q) &&
          !a.purpose?.toLowerCase().includes(q)) return false;
      if (activeFilters.domain     && a.domain !== activeFilters.domain) return false;
      if (activeFilters.difficulty && a.difficulty !== activeFilters.difficulty) return false;
      if (activeFilters.level      && a.level !== activeFilters.level.toLowerCase()) return false;
      if (activeFilters.pack       && a.category !== activeFilters.pack) return false;
      if (a.credits > activeFilters.maxCredits) return false;
      if (a.hours   > activeFilters.maxHours)   return false;
      if (activeFilters.sdg) {
        const sdgNum = parseInt(activeFilters.sdg.replace("SDG ", ""));
        if (!a.sdgs?.includes(sdgNum)) return false;
      }
      if (activeFilters.status) {
        const isFull = a.enrolledCount >= a.max_seats;
        if (activeFilters.status === "Full" && !isFull) return false;
        if (activeFilters.status === "Open" && isFull)  return false;
      }
      if (activeFilters.career && !a.career?.includes(activeFilters.career)) return false;
      return true;
    });
  }, [search, activeFilters, activities]);

  const groupedActivities = useMemo(() => {
    return filtered.reduce((acc: any, curr: any) => {
      const domain = curr.domain || "Other";
      const category = curr.category || curr.pack || "General";
      
      if (!acc[domain]) acc[domain] = {};
      if (!acc[domain][category]) acc[domain][category] = [];
      
      acc[domain][category].push(curr);
      return acc;
    }, {});
  }, [filtered]);

  const availableDomains = useMemo(() => Array.from(new Set(activities.map((a: any) => a.domain || "Other"))) as string[], [activities]);
  const availableCategories = useMemo(() => Array.from(new Set(
    activities
      .filter((a: any) => !activeFilters.domain || a.domain === activeFilters.domain)
      .map((a: any) => a.category || a.pack || "General")
  )) as string[], [activities, activeFilters.domain]);

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const activeFilterCount = Object.entries(activeFilters).filter(
    ([k, v]) => v !== EMPTY_FILTERS[k] && v !== ""
  ).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Catalogue</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {activities.length} activities across 5 domains. Discover, enroll, and grow.
              </p>
            </div>
            {/* Domain summary pills */}
            <div className="flex flex-wrap gap-2">
              {Object.values(DOMAINS).map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleFilterChange("domain", activeFilters.domain === d.id ? "" : d.id)}
                  className="text-xs font-medium px-3 py-1 rounded-full border transition-all"
                  style={
                    activeFilters.domain === d.id
                      ? { backgroundColor: d.color, color: "#fff", borderColor: d.color }
                      : { backgroundColor: d.bg, color: d.color, borderColor: `${d.color}30` }
                  }
                >
                  {d.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-start">

        {/* ── Filter Sidebar (desktop) ── */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <DashboardCard title="Filters" subtitle={activeFilterCount > 0 ? `${activeFilterCount} active` : "All activities"}>
            <FilterPanel
              filters={FILTERS}
              activeFilters={activeFilters}
              onChange={handleFilterChange}
              onClear={() => { setActiveFilters({ ...EMPTY_FILTERS }); setPage(1); }}
            />
          </DashboardCard>
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Search + controls container */}
          <div className="space-y-3">
            {/* Top row: Search, Filter toggle, View toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <SearchBar
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name, code, faculty…"
                className="flex-1 min-w-48"
              />
              
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiSliders size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full text-white" style={{ backgroundColor: BRAND }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* View toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-2 transition-colors ${view === "grid" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "grid" ? { backgroundColor: BRAND } : {}}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 transition-colors ${view === "list" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "list" ? { backgroundColor: BRAND } : {}}
              >
                <FiList size={14} />
              </button>
            </div>
            {/* Results count */}
            <span className="text-xs text-gray-500 hidden sm:block">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Bottom row: Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <select 
              value={activeFilters.domain} 
              onChange={(e) => {
                setActiveFilters((prev: any) => ({ ...prev, domain: e.target.value, pack: "" }));
              }}
              className="h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors shadow-sm bg-white min-w-48"
            >
              <option value="">All Domains</option>
              {availableDomains.map(d => <option key={d} value={d}>{DOMAIN_NAMES[d] || d}</option>)}
            </select>

            <select 
              value={activeFilters.pack} 
              onChange={(e) => handleFilterChange("pack", e.target.value)}
              className="h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors shadow-sm bg-white min-w-48"
              disabled={!activeFilters.domain && availableCategories.length > 20}
            >
              <option value="">All Categories</option>
              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile filter panel */}
          {filterOpen && (
            <div className="lg:hidden bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">Filters</p>
                <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={16} />
                </button>
              </div>
              <FilterPanel
                filters={FILTERS}
                activeFilters={activeFilters}
                onChange={handleFilterChange}
                onClear={() => { setActiveFilters({ ...EMPTY_FILTERS }); setPage(1); }}
              />
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(activeFilters).map(([key, val]) => {
                const def = EMPTY_FILTERS[key];
                if (val === def || val === "") return null;
                const filterDef = FILTERS.find((f) => f.key === key);
                const label = filterDef?.label || key;
                const display = (filterDef as any)?.type === "range" ? `≤${val}${(filterDef as any)?.unit || ""}` : val;
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    {label}: {display}
                    <button onClick={() => handleFilterChange(key, def)} className="hover:opacity-75">
                      <FiX size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Results grouped by category */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm font-medium text-gray-600">No activities match your filters</p>
              <button
                onClick={() => { setSearch(""); setActiveFilters({ ...EMPTY_FILTERS }); }}
                className="mt-3 text-xs font-medium hover:underline"
                style={{ color: BRAND }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedActivities).map(([domain, categoriesObj]: [string, any]) => (
                <div key={domain} className="space-y-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-gray-900">{DOMAIN_NAMES[domain] || domain}</h2>
                    <span className="text-[13px] font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      {Object.values(categoriesObj).flat().length} Activities
                    </span>
                    <div className="flex-1 border-b-2 border-gray-200"></div>
                  </div>
                  
                  <div className="space-y-12 pl-2">
                    {Object.entries(categoriesObj).map(([category, items]: [string, any]) => (
                      <div key={category}>
                        <div className="flex items-center gap-3 mb-6">
                          <h3 className="text-xl font-bold text-gray-700">{category}</h3>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{items.length} Activities</span>
                          <div className="flex-1 border-b border-gray-200"></div>
                        </div>
                        <div className={view === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                          : "space-y-3"
                        }>
                          {items.map((a: any) => (
                            <CatalogueCard
                              key={a.id}
                              activity={a}
                              isEnrolled={a.isEnrolled}
                              bookmarked={bookmarks.has(a.id)}
                              onBookmark={toggleBookmark}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
