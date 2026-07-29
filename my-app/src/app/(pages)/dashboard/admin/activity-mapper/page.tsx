"use client";
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiSave, FiCheckSquare, FiSquare, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

export default function ActivityMapperPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [mapped, setMapped] = useState<Set<string>>(new Set());
  const [originalMapped, setOriginalMapped] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard/admin/activity-mapper")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setClubs(d.clubs);
          setActivities(d.activities);
        } else toast.error("Failed to load data");
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load"); setLoading(false); });
  }, []);

  const loadClubMappings = (clubId: number) => {
    fetch("/api/dashboard/admin/activity-mapper")
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const codes = new Set<string>(
          d.mappings.filter((m: any) => m.club_id === clubId).map((m: any) => m.activity_code)
        );
        setMapped(codes);
        setOriginalMapped(new Set(codes));
      });
  };

  const handleSelectClub = (club: any) => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Discard and switch club?")) return;
    }
    setSelectedClub(club);
    setSearch("");
    setCollapsedCategories(new Set());
    loadClubMappings(club.id);
  };

  const toggleActivity = (code: string) => {
    setMapped(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleCategory = (category: string, codes: string[]) => {
    const allMapped = codes.every(c => mapped.has(c));
    setMapped(prev => {
      const next = new Set(prev);
      if (allMapped) codes.forEach(c => next.delete(c));
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
        toast.success(`Saved mappings for ${selectedClub.name}`);
        setOriginalMapped(new Set(mapped));
      } else {
        toast.error(d.error || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  };

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = activities.filter(a =>
      !q || a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
    return filtered.reduce((acc: Record<string, any[]>, a) => {
      const cat = a.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    }, {});
  }, [activities, search]);

  const hasUnsavedChanges = useMemo(() => {
    if (mapped.size !== originalMapped.size) return true;
    for (const c of mapped) if (!originalMapped.has(c)) return true;
    return false;
  }, [mapped, originalMapped]);

  const totalMapped = mapped.size;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Mapper</h1>
          <p className="text-sm text-gray-500 mt-1">Map activities to clubs. Students will only see their club's activities.</p>
        </div>
        {selectedClub && (
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            <FiSave size={15} />
            {saving ? "Saving…" : `Save Mappings${hasUnsavedChanges ? " *" : ""}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Club list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Club</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
            {clubs.map(club => (
              <button
                key={club.id}
                onClick={() => handleSelectClub(club)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  selectedClub?.id === club.id
                    ? "font-bold text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={selectedClub?.id === club.id ? { backgroundColor: BRAND } : {}}
              >
                <div className="font-medium">{club.name}</div>
                {club.domain && <div className={`text-[11px] mt-0.5 ${selectedClub?.id === club.id ? "text-red-200" : "text-gray-400"}`}>{club.domain}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Activity panel */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedClub ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-gray-400 text-sm">← Select a club to manage its activity mappings</p>
            </div>
          ) : (
            <>
              {/* Club stats bar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400">Selected Club</p>
                  <p className="font-bold text-gray-900">{selectedClub.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mapped Activities</p>
                  <p className="font-bold" style={{ color: BRAND }}>{totalMapped} / {activities.length}</p>
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => setMapped(new Set(activities.map(a => a.code)))}
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
                  placeholder="Search activities…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Category groups */}
              <div className="space-y-3">
                {Object.entries(grouped).map(([category, items]) => {
                  const codes = items.map(a => a.code);
                  const allChecked = codes.every(c => mapped.has(c));
                  const someChecked = codes.some(c => mapped.has(c));
                  const isCollapsed = collapsedCategories.has(category);

                  return (
                    <div key={category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Category header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                        <button
                          onClick={() => toggleCategory(category, codes)}
                          className="flex-shrink-0"
                        >
                          {allChecked ? (
                            <FiCheckSquare size={16} style={{ color: BRAND }} />
                          ) : someChecked ? (
                            <FiCheckSquare size={16} className="text-gray-400" />
                          ) : (
                            <FiSquare size={16} className="text-gray-300" />
                          )}
                        </button>
                        <span className="flex-1 font-semibold text-sm text-gray-800">{category}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {codes.filter(c => mapped.has(c)).length}/{codes.length}
                        </span>
                        <button
                          onClick={() => setCollapsedCategories(prev => {
                            const n = new Set(prev);
                            n.has(category) ? n.delete(category) : n.add(category);
                            return n;
                          })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isCollapsed ? <FiChevronRight size={15} /> : <FiChevronDown size={15} />}
                        </button>
                      </div>

                      {/* Activity rows */}
                      {!isCollapsed && (
                        <div className="divide-y divide-gray-50">
                          {items.map(activity => (
                            <label
                              key={activity.code}
                              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={mapped.has(activity.code)}
                                onChange={() => toggleActivity(activity.code)}
                                className="rounded border-gray-300 accent-red-700 w-4 h-4 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                <p className="text-[11px] text-gray-400">{activity.code} · {activity.domain} · {activity.sdc_credits} pts</p>
                              </div>
                              {activity.difficulty && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                                  {activity.difficulty}
                                </span>
                              )}
                            </label>
                          ))}
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
    </div>
  );
}
