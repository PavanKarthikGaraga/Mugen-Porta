"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FiGrid, FiList, FiX, FiSearch, FiChevronDown,
  FiAlertCircle, FiArrowUp, FiBookmark, FiFilter,
  FiCpu, FiBookOpen, FiHeart, FiZap, FiActivity,
  FiStar,
} from "react-icons/fi";
import { toast } from "sonner";
import { DOMAINS } from "@/app/Data/activities-mock";
import CatalogueCard from "@/app/components/dashboard/CatalogueCard";

const BRAND = "rgb(151,0,3)";
const PAGE_SIZE = 24;

const EMPTY_FILTERS: Record<string, string> = {
  domain: "", difficulty: "", pack: "", sdg: "", status: "",
};

const DOMAIN_META: Record<string, { name: string; short: string; Icon: React.ElementType }> = {
  TEC: { name: "Technology & Emerging Tech",    short: "Technology",   Icon: FiCpu      },
  LCH: { name: "Liberal Arts, Culture and Heritage", short: "Cultural",     Icon: FiBookOpen },
  ESO: { name: "Extension & Social Outreach",   short: "Social",       Icon: FiHeart    },
  IIE: { name: "Innovation & Entrepreneurship", short: "Innovation",   Icon: FiZap      },
  HWB: { name: "Health & Well-being",           short: "Health",       Icon: FiActivity },
};

const SORTS = [
  { key: "default",  label: "Recommended" },
  { key: "name",     label: "Name A–Z" },
  { key: "credits",  label: "Most Points" },
  { key: "seats",    label: "Seats left" },
];

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="px-4 pt-4 pb-2 flex items-start justify-between">
        <div className="w-11 h-11 rounded-2xl bg-gray-100" />
        <div className="w-8 h-8 rounded-xl bg-gray-100" />
      </div>
      <div className="px-4 pb-4 space-y-2.5">
        <div className="flex gap-1.5">
          <div className="h-4 w-10 bg-gray-100 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="h-3.5 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="h-3.5 w-full bg-gray-100 rounded" />
        <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
        <div className="h-1.5 w-full bg-gray-100 rounded-full mt-3" />
        <div className="flex gap-2 pt-1">
          <div className="h-9 flex-1 bg-gray-100 rounded-xl" />
          <div className="h-9 flex-1 bg-gray-200 rounded-xl" />
        </div>
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
          return {
            ...a,
            name: a.title,
            credits: a.sdc_credits,
            enrolledCount: a.enrolledCount || 0,
            maxEnrollment: a.max_seats || 0,
            isEnrolled: a.isEnrolled || false,
          };
        });
        setActivities(mapped);
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/student/bookmarks")
      .then((r) => r.json())
      .then((d) => { if (d?.success) setBookmarks(new Set(d.codes || [])); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleBookmark = async (code: string) => {
    if (!code) return;
    const wasSaved = bookmarks.has(code);
    setBookmarks((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(code) : next.add(code);
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
    } catch {
      setBookmarks((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(code) : next.delete(code);
        return next;
      });
      toast.error(wasSaved ? "Could not remove" : "Could not save");
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const out = activities.filter((a) => {
      if (savedOnly && !bookmarks.has(a.code)) return false;
      if (q && !a.name?.toLowerCase().includes(q)
            && !a.code?.toLowerCase().includes(q)
            && !a.purpose?.toLowerCase().includes(q)) return false;
      if (activeFilters.domain && a.domain !== activeFilters.domain) return false;
      if (activeFilters.difficulty && a.difficulty !== activeFilters.difficulty) return false;
      if (activeFilters.pack && a.category !== activeFilters.pack) return false;
      if (activeFilters.status) {
        const isFull = a.maxEnrollment > 0 && a.enrolledCount >= a.maxEnrollment;
        if (activeFilters.status === "Full" && !isFull) return false;
        if (activeFilters.status === "Open" && isFull) return false;
      }
      return true;
    });
    if (sort === "name") out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "credits") out.sort((a, b) => (b.credits || 0) - (a.credits || 0));
    else if (sort === "seats") {
      const left = (x: any) => (x.maxEnrollment || 0) - (x.enrolledCount || 0);
      out.sort((a, b) => left(b) - left(a));
    }
    return out;
  }, [search, activeFilters, activities, sort, savedOnly, bookmarks]);

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  // Grouped by category/pack (e.g. "ZeroOne Code Club Activities") rather
  // than the broad domain (e.g. "Technology & Emerging Tech") -- domain is
  // still used for filtering and for each section's icon/color, but it's too
  // coarse a label on its own since many differently-focused activity packs
  // share the same domain.
  const grouped = useMemo(() =>
    shown.reduce((acc: any, curr: any) => {
      const c = curr.category || "General";
      if (!acc[c]) acc[c] = [];
      acc[c].push(curr);
      return acc;
    }, {}),
  [shown]);

  const availableDomains = useMemo(
    () => Array.from(new Set(activities.map((a: any) => a.domain || "Other"))) as string[],
    [activities],
  );
  const availableCategories = useMemo(() =>
    Array.from(new Set(
      activities
        .filter((a: any) => !activeFilters.domain || a.domain === activeFilters.domain)
        .map((a: any) => a.category || "General"),
    )).sort() as string[],
  [activities, activeFilters.domain]);

  const activeChips = Object.entries(activeFilters).filter(([, v]) => v !== "");
  const enrolledCount = activities.filter((a) => a.isEnrolled).length;

  return (
    <div className="max-w-7xl mx-auto pb-20">

      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 50%, #2563EB 100%)` }} />
        <div className="px-6 py-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Catalogue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Explore SAMAM activities across all 5 domains and build your profile.
              </p>
            </div>
            <div className="flex gap-6">
              {[
                { label: "Total",    value: loading ? "—" : activities.length },
                { label: "Enrolled", value: loading ? "—" : enrolledCount, color: BRAND },
                { label: "Saved",    value: loading ? "—" : bookmarks.size },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <p className="text-xl font-bold text-gray-900" style={s.color ? { color: s.color } : {}}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-gray-50/90 backdrop-blur">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-3">

          {/* Row 1: search + controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
                placeholder="Search activities…"
                className="w-full h-10 pl-9 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 pl-3 pr-8 text-[13px] font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 appearance-none cursor-pointer"
              >
                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-1.5 h-10 px-3.5 text-[13px] font-semibold rounded-xl border transition-all ${
                filterOpen || activeChips.length > 0
                  ? "text-white border-transparent shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
              style={filterOpen || activeChips.length > 0 ? { backgroundColor: BRAND } : {}}
            >
              <FiFilter size={13} />
              Filters
              {activeChips.length > 0 && (
                <span className="w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full bg-white" style={{ color: BRAND }}>
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Saved toggle */}
            <button
              onClick={() => { setSavedOnly((s) => !s); setVisible(PAGE_SIZE); }}
              className={`flex items-center gap-1.5 h-10 px-3.5 text-[13px] font-semibold rounded-xl border transition-all ${
                savedOnly ? "text-white border-transparent shadow-sm" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
              style={savedOnly ? { backgroundColor: BRAND } : {}}
            >
              <FiBookmark size={13} className={savedOnly ? "fill-current" : ""} />
              <span className="hidden sm:inline">Saved</span>
              {bookmarks.size > 0 && (
                <span
                  className="w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full"
                  style={savedOnly ? { backgroundColor: "rgba(255,255,255,0.3)", color: "#fff" } : { backgroundColor: "#FEE2E2", color: BRAND }}
                >
                  {bookmarks.size}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-10">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`px-3 h-full transition-all ${view === "grid" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "grid" ? { backgroundColor: BRAND } : {}}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                className={`px-3 h-full transition-all ${view === "list" ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={view === "list" ? { backgroundColor: BRAND } : {}}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>

          {/* Row 2: domain pills with icons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter("domain", "")}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                !activeFilters.domain ? "text-white border-transparent shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={!activeFilters.domain ? { backgroundColor: BRAND } : {}}
            >
              All domains
            </button>
            {availableDomains.map((id) => {
              const d = (DOMAINS as any)[id];
              const meta = DOMAIN_META[id];
              const DomainIcon = meta?.Icon;
              const isActive = activeFilters.domain === id;
              const color = d?.color || BRAND;
              return (
                <button
                  key={id}
                  onClick={() => setFilter("domain", isActive ? "" : id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all"
                  style={isActive
                    ? { backgroundColor: color, color: "#fff", borderColor: color, boxShadow: `0 2px 8px ${color}40` }
                    : { backgroundColor: d?.bg || "#F9FAFB", color, borderColor: `${color}40` }}
                >
                  {DomainIcon && <DomainIcon size={11} />}
                  {id}
                  <span className="hidden sm:inline font-normal opacity-80">· {meta?.short || id}</span>
                </button>
              );
            })}
          </div>

          {/* Expandable filter panel */}
          {filterOpen && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "Category", key: "pack", opts: availableCategories.map((c) => ({ value: c, label: c })),
                  placeholder: "All categories",
                },
                {
                  label: "Difficulty", key: "difficulty",
                  opts: ["Beginner", "Intermediate", "Advanced"].map((d) => ({ value: d, label: d })),
                  placeholder: "Any difficulty",
                },
                {
                  label: "Availability", key: "status",
                  opts: [{ value: "Open", label: "Seats open" }, { value: "Full", label: "Full" }],
                  placeholder: "Any",
                },
              ].map(({ label, key, opts, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">{label}</label>
                  <div className="relative">
                    <select
                      value={activeFilters[key]}
                      onChange={(e) => setFilter(key, e.target.value)}
                      className="w-full h-9 px-3 pr-8 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 appearance-none cursor-pointer"
                    >
                      <option value="">{placeholder}</option>
                      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active chips + count */}
          {(activeChips.length > 0 || search || savedOnly) && (
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {activeChips.map(([key, val]) => (
                  <span key={key} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BRAND }}>
                    {val}
                    <button onClick={() => setFilter(key, "")} className="hover:opacity-75 ml-0.5">
                      <FiX size={9} />
                    </button>
                  </span>
                ))}
                {savedOnly && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: BRAND }}>
                    Saved only
                    <button onClick={() => setSavedOnly(false)} className="hover:opacity-75 ml-0.5"><FiX size={9} /></button>
                  </span>
                )}
                <button onClick={clearAll} className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 px-1">
                  Clear all
                </button>
              </div>
              <p className="text-[11px] font-medium text-gray-400">
                {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}${filtered.length > shown.length ? ` · ${shown.length} shown` : ""}`}
              </p>
            </div>
          )}

          {!activeChips.length && !search && !savedOnly && (
            <div className="flex justify-end pt-0.5">
              <p className="text-[11px] font-medium text-gray-400">
                {loading ? "Loading…" : `${filtered.length} activit${filtered.length !== 1 ? "ies" : "y"}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={24} className="text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-800">Couldn&apos;t load the catalogue</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Check your connection and try again.</p>
            <button onClick={load} className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: BRAND }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-6">
            {savedOnly && bookmarks.size === 0 ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FiBookmark size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-800">No saved activities yet</p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Tap the bookmark icon on any card to save it for later.
                </p>
                <button onClick={() => setSavedOnly(false)} className="mt-5 text-xs font-bold px-5 py-2 rounded-xl text-white" style={{ backgroundColor: BRAND }}>
                  Browse all
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FiSearch size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-800">No activities match</p>
                <p className="text-xs text-gray-400 mt-1.5">Try broader filters or a different search term.</p>
                <button onClick={clearAll} className="mt-5 text-xs font-bold px-5 py-2 rounded-xl text-white" style={{ backgroundColor: BRAND }}>
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]: [string, any]) => {
              const groupDomain = items[0]?.domain;
              const d = (DOMAINS as any)[groupDomain];
              const meta = DOMAIN_META[groupDomain];
              const DomainIcon = meta?.Icon;
              const color = d?.color || BRAND;
              return (
                <section key={category}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4">
                    {DomainIcon && (
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: d?.bg || "#F9FAFB" }}
                      >
                        <DomainIcon size={15} style={{ color }} />
                      </div>
                    )}
                    <h2 className="text-sm font-bold text-gray-900">{category}</h2>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: d?.bg || "#F3F4F6", color }}
                    >
                      {items.length}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {view === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  ) : (
                    <div className="space-y-2">
                      {items.map((a: any) => (
                        <CatalogueCard
                          key={a.id}
                          activity={a}
                          isEnrolled={a.isEnrolled}
                          bookmarked={bookmarks.has(a.code)}
                          onBookmark={toggleBookmark}
                          listMode
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {/* Load more */}
            {filtered.length > shown.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  Load more
                  <span className="text-gray-400 font-normal text-xs">({shown.length} of {filtered.length})</span>
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
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-2xl text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
          style={{ backgroundColor: BRAND }}
        >
          <FiArrowUp size={16} />
        </button>
      )}
    </div>
  );
}
