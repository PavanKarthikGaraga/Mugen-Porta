"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiUpload, FiLink, FiFileText } from "react-icons/fi";
import Link from "next/link";

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

  function parseJson(val: any) {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return null; }
  }

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
        router.push(role === "lead" ? "/dashboard/lead/samam" : "/dashboard/admin/samam");
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
          <Link href={role === "lead" ? "/dashboard/lead/samam" : "/dashboard/admin/samam"} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <FiArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Create New Activity" : `Edit ${formData.code}`}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 font-medium disabled:opacity-60">
          {saving ? "Saving..." : <><FiSave /> Save Activity</>}
        </button>
      </div>

      {/* Basic details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Basic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Code</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. TECH-AI-001" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <select name="domain" value={formData.domain} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
              <option value="TEC">TEC (Technical)</option>
              <option value="LCH">LCH (Liberal Arts)</option>
              <option value="ESO">ESO (Extension & Society)</option>
              <option value="IIE">IIE (Innovation)</option>
              <option value="HWB">HWB (Health & Wellbeing)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {role === "lead" ? (
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="" disabled>Select category…</option>
                {assignedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            ) : (
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-md px-3 py-2" placeholder="e.g. Workshop" />
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      </div>
    </div>
  );
}
