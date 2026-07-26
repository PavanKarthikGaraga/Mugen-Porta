"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FiGrid, FiList, FiX, FiSliders, FiSearch, FiChevronDown,
  FiAlertCircle, FiLayers, FiArrowUp, FiBookmark,
} from "react-icons/fi";
import { toast } from "sonner";
import { DOMAINS, LEVELS } from "@/app/Data/activities-mock";
import CatalogueCard from "@/app/components/dashboard/CatalogueCard";

const BRAND = "rgb(151,0,3)";
const PAGE_SIZE = 24;

const EMPTY_FILTERS: Record<string, string> = {
  domain: "", difficulty: "", level: "", pack: "", sdg: "", status: "",
};

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "Technology & Emerging Tech",
  LCH: "Literary, Cultural & Heritage",
  ESO: "Extension & Social Outreach",
  IIE: "Innovation & Entrepreneurship",
  HWB: "Health & Well-being",
};

const SORTS = [
  { key: "default", label: "Recommended" },
  { key: "name", label: "Name (A–Z)" },
  { key: "credits", label: "Most SAMAM Points" },
  { key: "seats", label: "Most seats left" },
];

function Skeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1.5 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
        <div className="h-2 w-full bg-gray-100 rounded-full mt-4" />
      </div>
    </div>
  );
}

export default function ActivityCataloguePage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({ ...EMPTY_FILTERS });
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [savedOnly, setSavedOnly] = useState(false);
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("default");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error("failed");
        const mapped = data.data.map((a: any) => {
          const l = a.level?.toLowerCase() || "";
          const calcHours = l === "explorer" ? 25 : l === "foundation" ? 30
            : l === "practitioner" ? 35 : l === "leader" ? 40 : 50;
          return {
            ...a,
            name: a.title,
            credits: a.sdc_credits,
            hours: calcHours,
            enrolledCount: a.enrolledCount || 0,
            maxEnrollment: a.max_seats || 0,
            isEnrolled: a.isEnrolled || false,
          };
        });
        setActivities(mapped);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to fetch activities", err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Saved activities persist per student, so they survive a refresh.
  useEffect(() => {
    fetch("/api/student/bookmarks")
      .then((r) => r.json())
      .then((d) => { if (d?.success) setBookmarks(new Set(d.codes || [])); })
      .catch(() => { /* saving still works; the list just starts empty */ });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Optimistic: the icon responds immediately, and reverts if the write fails,
  // so the UI never claims something was saved when it wasn't.
  const toggleBookmark = async (code: string) => {
    if (!code) return;
    const wasSaved = bookmarks.has(code);

    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(code); else next.add(code);
      return next;
    });

    try {
      const res = wasSaved
        ? await fetch(`/api/student/bookmarks?code=${encodeURIComponent(code)}`, { method: "DELETE" })
        : await fetch("/api/student/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activityCode: code }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "failed");
    } catch (e) {
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(code); else next.delete(code);
        return next;
      });
      toast.error(wasSaved ? "Could not remove this activity" : "Could not save this activity");
    }
  };

  const setFilter = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setVisible(PAGE_SIZE);
  };

  const clearAll = () => {
    setActiveFilters({ ...EMPTY_FILTERS });
    setSearch("");
    setSavedOnly(false);
    setVisible(PAGE_SIZE);
  };

  // ── Filter, then sort ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const out = activities.filter((a) => {
      if (savedOnly && !bookmarks.has(a.code)) return false;
      if (q && !a.name?.toLowerCase().includes(q)
            && !a.code?.toLowerCase().includes(q)
            && !a.purpose?.toLowerCase().includes(q)) return false;
      if (activeFilters.domain && a.domain !== activeFilters.domain) return false;
      if (activeFilters.difficulty && a.difficulty !== activeFilters.difficulty) return false;
      if (activeFilters.level && a.level !== activeFilters.level.toLowerCase()) return false;
      if (activeFilters.pack && a.category !== activeFilters.pack) return false;
      if (activeFilters.sdg) {
        const n = parseInt(activeFilters.sdg.replace("SDG ", ""), 10);
        if (!a.sdgs?.includes(n)) return false;
      }
      if (activeFilters.status) {
        const isFull = a.maxEnrollment > 0 && a.enrolledCount >= a.maxEnrollment;
        if (activeFilters.status === "Full" && !isFull) return false;
        if (activeFilters.status === "Open" && isFull) return false;
      }
      return true;
    });

    const sorted = [...out];
    if (sort === "name") sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "credits") sorted.sort((a, b) => (b.credits || 0) - (a.credits || 0));
    else if (sort === "seats") {
      const left = (x: any) => (x.maxEnrollment || 0) - (x.enrolledCount || 0);
      sorted.sort((a, b) => left(b) - left(a));
    }
    return sorted;
  }, [search, activeFilters, activities, sort, savedOnly, bookmarks]);

  // Pagination is applied before grouping, so "Load more" reveals results
  // progressively instead of rendering all 240+ cards on first paint.
  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);

  const grouped = useMemo(() => {
    return shown.reduce((acc: any, curr: any) => {
      const d = curr.domain || "Other";
      if (!acc[d]) acc[d] = [];
      acc[d].push(curr);
      return acc;
    }, {});
  }, [shown]);

  const availableDomains = useMemo(
    () => Array.from(new Set(activities.map((a: any) => a.domain || "Other"))) as string[],
    [activities]
  );
  const availableCategories = useMemo(() => Array.from(new Set(
    activities
      .filter((a: any) => !activeFilters.domain || a.domain === activeFilters.domain)
      .map((a: any) => a.category || "General")
  )).sort() as string[], [activities, activeFilters.domain]);

  const activeChips = Object.entries(activeFilters).filter(([, v]) => v !== "");
  const enrolledCount = activities.filter((a) => a.isEnrolled).length;

  return (
    <div className="max-w-7xl mx-auto pb-16">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Catalogue</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Discover activities across every SAMAM domain, and enroll in what fits your goals.
              </p>
            </div>
            <div className="flex gap-5">
              {[
                { label: "Activities", value: loading ? "—" : activities.length },
                { label: "Domains", value: loading ? "—" : availableDomains.length },
                { label: "Enrolled", value: loading ? "—" : enrolledCount },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className="text-lg font-bold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar (sticky) ── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-3">
          {/* Row 1 — search + controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
                placeholder="Search by name, code or description…"
                className="w-full h-10 pl-9 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 pl-3 pr-8 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 appearance-none cursor-pointer"
              >
                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
            </div>

            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1.5 h-10 px-3 text-[13px] font-medium rounded-lg border transition-colors ${
                filterOpen || activeChips.length > 0
                  ? "text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              style={filterOpen || activeChips.length > 0 ? { backgroundColor: BRAND } : {}}
            >
              <FiSliders size={14} /> Filters
              {activeChips.length > 0 && (
                <span className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-white" style={{ color: BRAND }}>
                  {activeChips.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setSavedOnly((s) => !s); setVisible(PAGE_SIZE); }}
              title={savedOnly ? "Show all activities" : "Show only saved activities"}
              className={`flex items-center gap-1.5 h-10 px-3 text-[13px] font-medium rounded-lg border transition-colors ${
                savedOnly ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              style={savedOnly ? { backgroundColor: BRAND } : {}}
            >
              <FiBookmark size={14} className={savedOnly ? "fill-current" : ""} />
              <span className="hidden sm:inline">Saved</span>
              {bookmarks.size > 0 && (
                <span
                  className={`w-4 h-4 text-[10px] flex items-center justify-center rounded-full ${savedOnly ? "bg-white" : "text-white"}`}
                  style={savedOnly ? { color: BRAND } : { backgroundColor: BRAND }}
                >
                  {bookmarks.size}
                </span>
              )}
            </button>

            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden h-10">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`px-2.5 h-full transition-colors ${view === "grid" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "grid" ? { backgroundColor: BRAND } : {}}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                className={`px-2.5 h-full transition-colors ${view === "list" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "list" ? { backgroundColor: BRAND } : {}}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>

          {/* Row 2 — domain pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter("domain", "")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                !activeFilters.domain ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={!activeFilters.domain ? { backgroundColor: BRAND } : {}}
            >
              All
            </button>
            {availableDomains.map((id) => {
              const d = (DOMAINS as any)[id];
              const isActive = activeFilters.domain === id;
              const color = d?.color || BRAND;
              return (
                <button
                  key={id}
                  onClick={() => setFilter("domain", isActive ? "" : id)}
                  title={DOMAIN_NAMES[id] || id}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                  style={isActive
                    ? { backgroundColor: color, color: "#fff", borderColor: color }
                    : { backgroundColor: d?.bg || "#F9FAFB", color, borderColor: `${color}30` }}
                >
                  {id}
                  <span className="hidden sm:inline"> · {DOMAIN_NAMES[id]?.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Expandable filter panel */}
          {filterOpen && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Category</label>
                <select
                  value={activeFilters.pack}
                  onChange={(e) => setFilter("pack", e.target.value)}
                  className="w-full h-9 px-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="">All categories</option>
                  {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Difficulty</label>
                <select
                  value={activeFilters.difficulty}
                  onChange={(e) => setFilter("difficulty", e.target.value)}
                  className="w-full h-9 px-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="">Any</option>
                  {["Beginner", "Intermediate", "Advanced"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Journey level</label>
                <select
                  value={activeFilters.level}
                  onChange={(e) => setFilter("level", e.target.value)}
                  className="w-full h-9 px-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="">Any</option>
                  {LEVELS.map((l: any) => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Availability</label>
                <select
                  value={activeFilters.status}
                  onChange={(e) => setFilter("status", e.target.value)}
                  className="w-full h-9 px-2.5 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="Open">Seats open</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>
          )}

          {/* Active chips + count */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {activeChips.map(([key, val]) => (
                <span key={key} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BRAND }}>
                  {val}
                  <button onClick={() => setFilter(key, "")} className="hover:opacity-75" aria-label={`Remove ${key} filter`}>
                    <FiX size={10} />
                  </button>
                </span>
              ))}
              {savedOnly && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BRAND }}>
                  Saved only
                  <button onClick={() => setSavedOnly(false)} className="hover:opacity-75" aria-label="Show all activities">
                    <FiX size={10} />
                  </button>
                </span>
              )}
              {(activeChips.length > 0 || search || savedOnly) && (
                <button onClick={clearAll} className="text-[11px] font-medium text-gray-500 hover:text-gray-800 px-1.5">
                  Clear all
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
              {!loading && filtered.length > shown.length && (
                <span className="text-gray-400"> · showing {shown.length}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
            <FiAlertCircle size={30} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">Couldn&apos;t load the catalogue</p>
            <button onClick={load} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-20 px-6">
            {savedOnly && bookmarks.size === 0 ? (
              <>
                <FiBookmark size={30} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">You haven&apos;t saved any activities yet</p>
                <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Tap the bookmark icon on any activity to save it here for later. Saved activities stay on your account.
                </p>
                <button
                  onClick={() => setSavedOnly(false)}
                  className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Browse all activities
                </button>
              </>
            ) : (
              <>
                <FiSearch size={30} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">No activities match your filters</p>
                <p className="text-xs text-gray-500 mt-1.5">Try removing a filter or searching for something broader.</p>
                <button
                  onClick={clearAll}
                  className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([domain, items]: [string, any]) => {
              const d = (DOMAINS as any)[domain];
              const color = d?.color || BRAND;
              return (
                <section key={domain}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <h2 className="text-base font-bold text-gray-900">{DOMAIN_NAMES[domain] || domain}</h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: d?.bg || "#F3F4F6", color }}>
                      {items.length}
                    </span>
                    <div className="flex-1 border-b border-gray-100" />
                  </div>
                  <div className={view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "space-y-3"}>
                    {items.map((a: any) => (
                      <CatalogueCard
                        key={a.id}
                        activity={a}
                        isEnrolled={a.isEnrolled}
                        bookmarked={bookmarks.has(a.code)}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {filtered.length > shown.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <FiLayers size={14} />
                  Load {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
                  <span className="text-gray-400 font-normal">({shown.length} of {filtered.length})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 w-10 h-10 rounded-full text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowUp size={16} />
        </button>
      )}
    </div>
  );
}
