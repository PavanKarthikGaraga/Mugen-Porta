"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiUpload, FiLink, FiFileText, FiRefreshCw, FiEye, FiX, FiCalendar, FiMapPin, FiClock, FiTarget, FiGlobe } from "react-icons/fi";
import Link from "next/link";
import { SDG_MAP, DOMAINS } from "@/app/Data/activities-mock";

// Domain prefix used only as a fallback when creating the very first
// activity for a brand-new sub-category (one with no existing activities to
// derive a prefix from). Every domain that already has activities gets its
// real sub-categories + code prefixes from /api/activities/subcategories
// instead -- see fetchSubcategories below.
const DOMAIN_CODE_PREFIX: Record<string, string> = {
  TEC: "TECH", ESO: "ESO", LCH: "LCH", HWB: "HWB", IIE: "IIE",
};

interface DynamicSubcategory { category: string; code_prefix: string; activity_count: number; }

interface ActivityEditorProps {
  activityId?: string;
  initialData?: any;
  role?: "admin" | "lead";
}

// MySQL DATE comes back as an ISO timestamp ("2026-08-14T00:00:00.000Z");
// <input type="date"> requires exactly YYYY-MM-DD or it renders blank.
function toDateInput(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  try { return new Date(val).toISOString().slice(0, 10); } catch { return ""; }
}

// MySQL TIME comes back as "HH:MM:SS"; <input type="time"> wants HH:MM.
function toTimeInput(val: any): string {
  if (!val) return "";
  return String(val).slice(0, 5);
}

export default function ActivityEditor({ activityId, initialData, role = "admin" }: ActivityEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!activityId && !initialData);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadIdx, setPendingUploadIdx] = useState<number | null>(null);

  const isNew = !activityId && !initialData;
  const apiPrefix = role === "lead" ? "/api/dashboard/lead/samam/activities" : "/api/activities";
  const [assignedCategories, setAssignedCategories] = useState<string[]>([]);
  const [subCategory, setSubCategory] = useState<string>("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [dynamicSubcategories, setDynamicSubcategories] = useState<DynamicSubcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [addingNewSubcategory, setAddingNewSubcategory] = useState(false);
  const [newSubcategoryLabel, setNewSubcategoryLabel] = useState("");
  const [newSubcategoryAbbr, setNewSubcategoryAbbr] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    title: initialData?.title || initialData?.name || "",
    description: initialData?.description || "",
    domain: initialData?.domain || "TEC",
    category: initialData?.category || "General",
    sdc_credits: initialData?.sdc_credits || initialData?.credits || 0,
    max_seats: initialData?.max_seats || initialData?.maxEnrollment || 50,
    difficulty: initialData?.difficulty || "Beginner",
    // Schedule + venue. `activity_date` arrives from MySQL as a full ISO
    // timestamp; the date input needs a bare YYYY-MM-DD, and the time inputs
    // need HH:MM (MySQL TIME comes back as HH:MM:SS).
    activity_date: toDateInput(initialData?.activity_date),
    start_time: toTimeInput(initialData?.start_time),
    end_time: toTimeInput(initialData?.end_time),
    venue: initialData?.venue || "",
    registration_open: initialData?.registration_open === undefined ? 1 : Number(initialData.registration_open),
    assignments: (initialData?.assignments || []) as any[],
    resources: (initialData?.resources || []) as any[],
    outcomes: (initialData?.outcomes || initialData?.learning_outcomes || []) as string[],
    competencies: (initialData?.competencies || []) as string[],
    ga: (initialData?.ga || []) as string[],
    sdgs: (initialData?.sdgs || []) as number[],
    level: initialData?.level || "explorer",
    timeline: (initialData?.timeline || []) as any[],
  });

  useEffect(() => {
    if (activityId && !initialData) {
      fetch(`${apiPrefix}/${activityId}`)
        .then(r => r.json())
        .then(d => {
          if (d.error || d.message) {
            toast.error(d.error || d.message || "Failed to load activity");
          } else if (d.success && d.data) {
            const data = d.data;
            setFormData(prev => ({
              ...prev, ...data,
              outcomes: data.outcomes || data.learning_outcomes || prev.outcomes,
              assignments: parseJson(data.assignments) || prev.assignments,
              resources: parseJson(data.resources) || prev.resources,
              // Spreading the raw row would put an ISO timestamp / HH:MM:SS
              // into the date+time inputs, which render blank unless the value
              // is exactly YYYY-MM-DD / HH:MM.
              activity_date: toDateInput(data.activity_date),
              start_time: toTimeInput(data.start_time),
              end_time: toTimeInput(data.end_time),
              venue: data.venue || "",
              level: data.level || prev.level,
              timeline: parseJson(data.timeline) || prev.timeline,
              registration_open: data.registration_open === undefined || data.registration_open === null
                ? prev.registration_open : Number(data.registration_open),
            }));
          } else if (d.code || d.title) {
            setFormData(prev => ({
              ...prev, ...d,
              outcomes: d.outcomes || d.learning_outcomes || prev.outcomes,
              assignments: parseJson(d.assignments) || prev.assignments,
              resources: parseJson(d.resources) || prev.resources,
              activity_date: toDateInput(d.activity_date),
              start_time: toTimeInput(d.start_time),
              end_time: toTimeInput(d.end_time),
              venue: d.venue || "",
              level: d.level || prev.level,
              timeline: parseJson(d.timeline) || prev.timeline,
              registration_open: d.registration_open === undefined || d.registration_open === null
                ? prev.registration_open : Number(d.registration_open),
            }));
          } else {
            toast.error("Failed to load activity");
          }
          setLoading(false);
        })
        .catch(() => { toast.error("Error loading activity"); setLoading(false); });
    }
  }, [activityId, initialData, apiPrefix]);

  useEffect(() => {
    if (role === "lead") {
      fetch("/api/dashboard/lead/samam/activities")
        .then(r => r.json())
        .then(d => { if (d.assigned_categories) setAssignedCategories(d.assigned_categories); })
        .catch(console.error);
    }
  }, [role]);

  // Sub-category options are the real (category, code prefix) pairs already
  // in use for this domain -- not a hardcoded list -- so a new activity
  // always attaches to the club series it actually belongs to. Re-fetched
  // whenever the domain changes.
  useEffect(() => {
    if (!formData.domain) return;
    setLoadingSubcategories(true);
    fetch(`/api/activities/subcategories?domain=${encodeURIComponent(formData.domain)}`)
      .then(r => r.json())
      .then(d => setDynamicSubcategories(d.subcategories || []))
      .catch(() => setDynamicSubcategories([]))
      .finally(() => setLoadingSubcategories(false));
  }, [formData.domain]);

  function parseJson(val: any) {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return null; }
  }

  // Now takes the code prefix directly (e.g. "TECH-CYB", derived from real
  // existing activities) rather than synthesizing one from a hardcoded
  // domain+abbreviation pair.
  const generateCode = async (prefix: string) => {
    setGeneratingCode(true);
    try {
      const r = await fetch(`/api/activities/next-code?prefix=${encodeURIComponent(prefix)}`);
      const d = await r.json();
      if (d.code) setFormData(prev => ({ ...prev, code: d.code }));
    } catch { /* silently skip — user can edit manually */ }
    finally { setGeneratingCode(false); }
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const domain = e.target.value;
    setFormData(prev => ({ ...prev, domain, ...(isNew ? { code: "", category: "" } : {}) }));
    if (isNew) {
      setSubCategory("");
      setAddingNewSubcategory(false);
      setNewSubcategoryLabel("");
      setNewSubcategoryAbbr("");
    }
  };

  // Select value is the code_prefix (e.g. "TECH-CYB") since that's what
  // uniquely identifies an existing club/series and is what generateCode
  // needs directly.
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "__new__") {
      setAddingNewSubcategory(true);
      setSubCategory("");
      return;
    }
    setAddingNewSubcategory(false);
    setSubCategory(value);
    if (!value) return;
    const match = dynamicSubcategories.find(s => s.code_prefix === value);
    if (match) setFormData(prev => ({ ...prev, category: match.category }));
    generateCode(value);
  };

  // For a genuinely new club/series with no existing activities to derive a
  // prefix from -- admin supplies both the category name and a short code.
  const handleNewSubcategoryConfirm = () => {
    if (!newSubcategoryLabel.trim() || !newSubcategoryAbbr.trim()) {
      toast.error("Enter both a name and a short code for the new sub-category");
      return;
    }
    const abbr = newSubcategoryAbbr.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!abbr) { toast.error("Short code must contain letters or numbers"); return; }
    const prefix = `${DOMAIN_CODE_PREFIX[formData.domain] ?? formData.domain}-${abbr}`;
    setFormData(prev => ({ ...prev, category: newSubcategoryLabel.trim() }));
    setSubCategory(prefix);
    setAddingNewSubcategory(false);
    generateCode(prefix);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStringArrayChange = (field: string, index: number, value: string) => {
    const arr = [...(formData as any)[field]];
    arr[index] = value;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };
  const addStringArrayItem = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev as any)[field], ""] }));
  };
  const removeStringArrayItem = (field: string, index: number) => {
    const arr = [...(formData as any)[field]];
    arr.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const toggleSdg = (num: number) => {
    setFormData(prev => ({
      ...prev,
      sdgs: prev.sdgs.includes(num) ? prev.sdgs.filter(n => n !== num) : [...prev.sdgs, num].sort((a, b) => a - b),
    }));
  };

  // Timeline
  const addTimelineStep = () => {
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { time: "", activity: "" }]
    }));
  };
  const updateTimelineStep = (index: number, key: string, value: string) => {
    const arr = [...formData.timeline];
    arr[index] = { ...arr[index], [key]: value };
    setFormData(prev => ({ ...prev, timeline: arr }));
  };
  const removeTimelineStep = (index: number) => {
    const arr = [...formData.timeline];
    arr.splice(index, 1);
    setFormData(prev => ({ ...prev, timeline: arr }));
  };

  // Tasks
  const addAssignment = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, {
        id: Date.now(), title: "", description: "", type: "submission",
        startDate: today, startTime: "09:00",
        endDate: today, endTime: "23:59"
      }]
    }));
  };
  const updateAssignment = (index: number, key: string, value: string) => {
    const arr = [...formData.assignments];
    arr[index] = { ...arr[index], [key]: value };
    setFormData(prev => ({ ...prev, assignments: arr }));
  };
  const removeAssignment = (index: number) => {
    const arr = [...formData.assignments];
    arr.splice(index, 1);
    setFormData(prev => ({ ...prev, assignments: arr }));
  };

  // Resources — link
  const addLinkResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { id: Date.now(), type: "link", title: "", url: "" }]
    }));
  };
  const updateResource = (index: number, key: string, value: string) => {
    const arr = [...formData.resources];
    arr[index] = { ...arr[index], [key]: value };
    setFormData(prev => ({ ...prev, resources: arr }));
  };
  const removeResource = (index: number) => {
    const arr = [...formData.resources];
    arr.splice(index, 1);
    setFormData(prev => ({ ...prev, resources: arr }));
  };

  // Resources — PDF upload
  const handlePdfUpload = async (index: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)"); return; }
    setUploadingIdx(index);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { toast.error(data.error || "Upload failed"); return; }
      const arr = [...formData.resources];
      arr[index] = { ...arr[index], url: data.url, title: arr[index].title || file.name };
      setFormData(prev => ({ ...prev, resources: arr }));
      toast.success("PDF uploaded");
    } catch { toast.error("Upload error"); }
    finally { setUploadingIdx(null); }
  };

  const triggerPdfUpload = (index: number) => {
    setPendingUploadIdx(index);
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const url = isNew ? apiPrefix : `${apiPrefix}/${activityId}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isNew ? "Activity created" : "Activity updated");
        router.push(role === "lead" ? "/dashboard/lead/samam/activities" : "/dashboard/admin/samam/activities");
      } else {
        toast.error(`Error: ${data.error || data.message}`);
      }
    } catch { toast.error("Failed to save activity"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-24">
      {/* Hidden file input for PDF upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && pendingUploadIdx !== null) handlePdfUpload(pendingUploadIdx, file);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={role === "lead" ? "/dashboard/lead/samam/activities" : "/dashboard/admin/samam/activities"} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <FiArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Create New Activity" : `Edit ${formData.code}`}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium">
            <FiEye /> Preview
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 font-medium disabled:opacity-60">
            {saving ? "Saving..." : <><FiSave /> Save Activity</>}
          </button>
        </div>
      </div>

      {/* Basic details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1: Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain <span className="text-red-500">*</span>
            </label>
            <select value={formData.domain} onChange={handleDomainChange} className="w-full border rounded-md px-3 py-2">
              <option value="TEC">TEC — Technical</option>
              <option value="LCH">LCH — Liberal Arts & Cultural</option>
              <option value="ESO">ESO — Extension & Society</option>
              <option value="IIE">IIE — Innovation & Entrepreneurship</option>
              <option value="HWB">HWB — Health & Wellbeing</option>
            </select>
          </div>

          {/* Step 2: Sub-category — real (category, code prefix) pairs already
              in use for this domain, not a hardcoded list, so a new activity
              always attaches to the club series it actually belongs to. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-category <span className="text-red-500">*</span>
            </label>
            {addingNewSubcategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New sub-category name"
                  value={newSubcategoryLabel}
                  onChange={e => setNewSubcategoryLabel(e.target.value)}
                  className="flex-1 p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Code e.g. CYB"
                  value={newSubcategoryAbbr}
                  onChange={e => setNewSubcategoryAbbr(e.target.value)}
                  className="w-28 p-2 border rounded text-sm"
                />
                <button type="button" onClick={handleNewSubcategoryConfirm} className="px-3 py-2 border rounded bg-gray-900 text-white text-sm hover:bg-gray-800">
                  Use
                </button>
                <button type="button" onClick={() => setAddingNewSubcategory(false)} className="px-3 py-2 border rounded text-sm text-gray-500 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={subCategory}
                onChange={handleSubCategoryChange}
                className="w-full border rounded-md px-3 py-2"
                disabled={loadingSubcategories}
              >
                <option value="">{loadingSubcategories ? "Loading…" : "Select sub-category…"}</option>
                {dynamicSubcategories.map(s => (
                  <option key={s.code_prefix} value={s.code_prefix}>
                    {s.category} ({s.code_prefix}) · {s.activity_count} {s.activity_count === 1 ? "activity" : "activities"}
                  </option>
                ))}
                <option value="__new__">+ Add new sub-category…</option>
              </select>
            )}
          </div>

          {/* Step 3: Activity Code — auto-generated from the sub-category,
              editable both when creating and when editing an existing
              activity. Changing the code on an existing activity also
              re-points every enrollment, club mapping, submission, and
              report that referenced the old one (handled server-side). */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="flex-1 p-2 border rounded"
                placeholder={subCategory ? `e.g. ${subCategory}01` : "Select domain & sub-category first"}
                readOnly={generatingCode}
              />
              {subCategory && (
                <button
                  type="button"
                  onClick={() => generateCode(subCategory)}
                  disabled={generatingCode}
                  title="Re-generate next available code"
                  className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <FiRefreshCw size={14} className={generatingCode ? "animate-spin" : ""} />
                </button>
              )}
            </div>
            {subCategory && (
              <p className="text-xs text-gray-400 mt-1">Auto-generated from {subCategory}. You can edit it.</p>
            )}
            {!isNew && (
              <p className="text-xs text-amber-600 mt-1">
                Changing this updates every enrollment, mapping, submission, and report already linked to this activity.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SAMAM Points</label>
            <input type="number" name="sdc_credits" value={formData.sdc_credits} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
            <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      {/* Schedule & venue */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Schedule &amp; Venue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="activity_date" value={formData.activity_date} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. Seminar Hall, C-Block" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Registration gate */}
        <div className="flex items-start justify-between gap-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium text-gray-900">Registration Open</p>
            <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
              When open, this activity appears in the catalogue for students of the clubs it&apos;s
              mapped to, and they can enrol. When closed it is hidden from the catalogue and new
              enrolments are refused — students already enrolled keep it in My Activities.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={Number(formData.registration_open) === 1}
              onChange={(e) => setFormData(prev => ({ ...prev, registration_open: e.target.checked ? 1 : 0 }))}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Timeline</h2>
          <button onClick={addTimelineStep} className="text-sm bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-gray-200"><FiPlus /> Add Step</button>
        </div>
        {formData.timeline.length === 0 ? (
          <p className="text-gray-400 text-sm py-2">No timeline added yet.</p>
        ) : (
          <div className="space-y-3">
            {formData.timeline.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                <input
                  type="text"
                  placeholder="Time (e.g. 5:45 PM)"
                  value={step.time || ""}
                  onChange={e => updateTimelineStep(idx, "time", e.target.value)}
                  className="w-32 flex-shrink-0 p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Activity description"
                  value={step.activity || step.topic || step.title || ""}
                  onChange={e => updateTimelineStep(idx, "activity", e.target.value)}
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button onClick={() => removeTimelineStep(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded flex-shrink-0"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Tasks</h2>
          <button onClick={addAssignment} className="text-sm bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-gray-200"><FiPlus /> Add Task</button>
        </div>
        {formData.assignments.length === 0 ? (
          <p className="text-gray-400 text-sm py-2">No tasks added. Students will see tasks only during the submission window you set.</p>
        ) : (
          <div className="space-y-4">
            {formData.assignments.map((a, idx) => (
              <div key={a.id ?? idx} className="bg-gray-50 p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={a.title}
                    onChange={e => updateAssignment(idx, "title", e.target.value)}
                    className="flex-1 p-2 border rounded text-sm font-medium"
                  />
                  <button onClick={() => removeAssignment(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded flex-shrink-0"><FiTrash2 size={15} /></button>
                </div>
                <textarea
                  placeholder="Task description (optional)"
                  value={a.description || ""}
                  onChange={e => updateAssignment(idx, "description", e.target.value)}
                  className="w-full p-2 border rounded text-sm resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Submission Opens</label>
                    <div className="flex gap-2">
                      <input type="date" value={a.startDate || ""} onChange={e => updateAssignment(idx, "startDate", e.target.value)} className="flex-1 p-2 border rounded text-sm" />
                      <input type="time" value={a.startTime || "09:00"} onChange={e => updateAssignment(idx, "startTime", e.target.value)} className="w-28 p-2 border rounded text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Submission Deadline</label>
                    <div className="flex gap-2">
                      <input type="date" value={a.endDate || a.dueDate || ""} onChange={e => updateAssignment(idx, "endDate", e.target.value)} className="flex-1 p-2 border rounded text-sm" />
                      <input type="time" value={a.endTime || "23:59"} onChange={e => updateAssignment(idx, "endTime", e.target.value)} className="w-28 p-2 border rounded text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Resources</h2>
          <div className="flex gap-2">
            <button onClick={addLinkResource} className="text-sm bg-gray-100 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-gray-200">
              <FiLink size={13} /> Add Link
            </button>
            <button
              onClick={() => {
                const idx = formData.resources.length;
                setFormData(prev => ({
                  ...prev,
                  resources: [...prev.resources, { id: Date.now(), type: "pdf", title: "", url: "" }]
                }));
                // Wait for state to settle then trigger upload
                setTimeout(() => triggerPdfUpload(idx), 50);
              }}
              className="text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-red-100"
            >
              <FiUpload size={13} /> Upload PDF
            </button>
          </div>
        </div>
        {formData.resources.length === 0 ? (
          <p className="text-gray-400 text-sm py-2">No resources added yet.</p>
        ) : (
          <div className="space-y-3">
            {formData.resources.map((res, idx) => (
              <div key={res.id ?? idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {res.type === "pdf" ? <FiFileText className="text-red-500" size={18} /> : <FiLink className="text-blue-500" size={18} />}
                </div>
                <input
                  type="text"
                  placeholder="Resource title"
                  value={res.title}
                  onChange={e => updateResource(idx, "title", e.target.value)}
                  className="w-40 flex-shrink-0 p-2 border rounded text-sm"
                />
                {res.type === "pdf" ? (
                  <div className="flex-1 flex items-center gap-2">
                    {res.url ? (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate flex-1">
                        {res.url.split("/").pop()}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 flex-1">No file yet</span>
                    )}
                    <button
                      onClick={() => triggerPdfUpload(idx)}
                      disabled={uploadingIdx === idx}
                      className="text-xs px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 flex items-center gap-1 whitespace-nowrap disabled:opacity-60"
                    >
                      <FiUpload size={11} />
                      {uploadingIdx === idx ? "Uploading…" : res.url ? "Replace" : "Upload PDF"}
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="URL (https://…)"
                    value={res.url}
                    onChange={e => updateResource(idx, "url", e.target.value)}
                    className="flex-1 p-2 border rounded text-sm"
                  />
                )}
                <button onClick={() => removeResource(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded flex-shrink-0"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outcomes & Competencies */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Outcomes & Competencies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm">Learning Outcomes</span>
              <button onClick={() => addStringArrayItem("outcomes")} className="text-blue-600 text-sm">+ Add</button>
            </div>
            {formData.outcomes.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={item} onChange={e => handleStringArrayChange("outcomes", idx, e.target.value)} className="flex-1 p-1.5 border rounded text-sm" />
                <button onClick={() => removeStringArrayItem("outcomes", idx)} className="text-red-500"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm">Competencies</span>
              <button onClick={() => addStringArrayItem("competencies")} className="text-blue-600 text-sm">+ Add</button>
            </div>
            {formData.competencies.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={item} onChange={e => handleStringArrayChange("competencies", idx, e.target.value)} className="flex-1 p-1.5 border rounded text-sm" />
                <button onClick={() => removeStringArrayItem("competencies", idx)} className="text-red-500"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm">Graduate Attributes</span>
              <button onClick={() => addStringArrayItem("ga")} className="text-blue-600 text-sm">+ Add</button>
            </div>
            {formData.ga.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={item} onChange={e => handleStringArrayChange("ga", idx, e.target.value)} className="flex-1 p-1.5 border rounded text-sm" />
                <button onClick={() => removeStringArrayItem("ga", idx)} className="text-red-500"><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SDGs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Sustainable Development Goals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(SDG_MAP).map(([num, name]) => {
            const n = Number(num);
            const selected = formData.sdgs.includes(n);
            return (
              <button
                type="button"
                key={n}
                onClick={() => toggleSdg(n)}
                className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  selected ? "bg-red-50 border-red-300 text-red-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                SDG {n}: {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student-view preview — mirrors the sections of the real student
          activity-catalogue page, rendered live from the current (possibly
          unsaved) form state so an admin can check it before saving. */}
      {showPreview && (() => {
        const dom = DOMAINS[formData.domain] || { name: formData.domain, color: "#111827" };
        const dateStr = formData.activity_date
          ? new Date(formData.activity_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
          : null;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Student Dashboard Preview</p>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><FiX /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Hero */}
                <div>
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full text-white mb-3" style={{ backgroundColor: dom.color }}>
                    {formData.domain} · {dom.name}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{formData.title || "Untitled Activity"}</h2>
                  {formData.category && <p className="text-sm text-gray-500 mt-1">{formData.category}</p>}
                  {formData.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{formData.description}</p>}

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    {dateStr && <span className="flex items-center gap-1.5"><FiCalendar size={14} style={{ color: dom.color }} /> {dateStr}</span>}
                    {(formData.start_time || formData.end_time) && (
                      <span className="flex items-center gap-1.5">
                        <FiClock size={14} style={{ color: dom.color }} />
                        {formData.start_time || "?"}{formData.end_time ? ` – ${formData.end_time}` : ""}
                      </span>
                    )}
                    {formData.venue && <span className="flex items-center gap-1.5"><FiMapPin size={14} style={{ color: dom.color }} /> {formData.venue}</span>}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {formData.sdc_credits || 0} SAMAM Points
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                      {formData.difficulty}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                      Max {formData.max_seats} seats
                    </span>
                    {Number(formData.registration_open) !== 1 && (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        Registration closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Resources */}
                <div className="border-t pt-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><FiFileText size={14} /> Resources</h3>
                  {formData.resources.length === 0 ? (
                    <p className="text-xs text-gray-400">No resources added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.resources.map((r: any, i: number) => (
                        <div key={r.id ?? i} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-lg text-sm">
                          {r.type === "pdf" ? <FiFileText size={14} className="text-red-500" /> : <FiLink size={14} className="text-blue-500" />}
                          <span className="font-medium text-gray-800">{r.title || "Untitled resource"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tasks */}
                <div className="border-t pt-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><FiTarget size={14} /> Tasks</h3>
                  {formData.assignments.length === 0 ? (
                    <p className="text-xs text-gray-400">No tasks added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.assignments.map((a: any, i: number) => (
                        <div key={a.id ?? i} className="p-3 border border-gray-100 rounded-lg">
                          <p className="text-sm font-semibold text-gray-800">{a.title || "Untitled task"}</p>
                          {a.description && <p className="text-xs text-gray-500 mt-1">{a.description}</p>}
                          {(a.startDate || a.endDate) && (
                            <p className="text-[11px] text-gray-400 mt-1.5">
                              {a.startDate && `Opens ${a.startDate} ${a.startTime || ""}`}{a.endDate && ` · Due ${a.endDate} ${a.endTime || ""}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Outcomes / Competencies / GA */}
                <div className="border-t pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Learning Outcomes</h4>
                    {formData.outcomes.filter(Boolean).length === 0 ? <p className="text-xs text-gray-400">None yet.</p> : (
                      <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                        {formData.outcomes.filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Competencies</h4>
                    {formData.competencies.filter(Boolean).length === 0 ? <p className="text-xs text-gray-400">None yet.</p> : (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.competencies.filter(Boolean).map((c, i) => (
                          <span key={i} className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Graduate Attributes</h4>
                    {formData.ga.filter(Boolean).length === 0 ? <p className="text-xs text-gray-400">None yet.</p> : (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.ga.filter(Boolean).map((g, i) => (
                          <span key={i} className="text-[11px] font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SDGs */}
                {formData.sdgs.length > 0 && (
                  <div className="border-t pt-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><FiGlobe size={14} /> Sustainable Development Goals</h3>
                    <div className="flex flex-col gap-2">
                      {formData.sdgs.map(sdg => (
                        <span key={sdg} className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                          SDG {sdg}: {SDG_MAP[sdg] || "Sustainable Goal"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
