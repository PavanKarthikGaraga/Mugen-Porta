"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiSave, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

interface ActivityEditorProps {
  activityId?: string; // If undefined, it's a new activity
}

export default function ActivityEditor({ activityId }: ActivityEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!activityId);
  const [saving, setSaving] = useState(false);
  const isNew = !activityId;

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    domain: "TEC",
    category: "General",
    sdc_credits: 0,
    max_seats: 50,
    difficulty: "Beginner",
    level: "explorer",
    assignments: [] as any[],
    resources: [] as any[],
    outcomes: [] as string[],
    competencies: [] as string[]
  });

  useEffect(() => {
    if (activityId) {
      fetch(`/api/activities/${activityId}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setFormData(prev => ({ ...prev, ...d.data }));
          else toast.error("Failed to load activity");
          setLoading(false);
        })
        .catch(() => {
          toast.error("Error loading activity");
          setLoading(false);
        });
    }
  }, [activityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Generic array handlers
  const handleStringArrayChange = (field: string, index: number, value: string) => {
    const arr = [...(formData as any)[field]];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };
  const addStringArrayItem = (field: string) => {
    setFormData({ ...formData, [field]: [...(formData as any)[field], ""] });
  };
  const removeStringArrayItem = (field: string, index: number) => {
    const arr = [...(formData as any)[field]];
    arr.splice(index, 1);
    setFormData({ ...formData, [field]: arr });
  };

  // Assignments
  const addAssignment = () => {
    setFormData({
      ...formData,
      assignments: [...formData.assignments, { id: Date.now(), title: "", dueDate: "", type: "submission" }]
    });
  };
  const updateAssignment = (index: number, key: string, value: string) => {
    const arr = [...formData.assignments];
    arr[index][key] = value;
    setFormData({ ...formData, assignments: arr });
  };
  const removeAssignment = (index: number) => {
    const arr = [...formData.assignments];
    arr.splice(index, 1);
    setFormData({ ...formData, assignments: arr });
  };

  // Resources
  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { id: Date.now(), type: "link", title: "", url: "" }]
    });
  };
  const updateResource = (index: number, key: string, value: string) => {
    const arr = [...formData.resources];
    arr[index][key] = value;
    setFormData({ ...formData, resources: arr });
  };
  const removeResource = (index: number) => {
    const arr = [...formData.resources];
    arr.splice(index, 1);
    setFormData({ ...formData, resources: arr });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const url = isNew ? `/api/activities` : `/api/activities/${activityId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(isNew ? "Activity created successfully" : "Activity updated successfully");
        router.push("/dashboard/admin/activities");
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (err) {
      toast.error("Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/activities" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Create New Activity" : `Edit ${formData.code}`}</h1>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 font-medium">
          {saving ? "Saving..." : <><FiSave /> Save Activity</>}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
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
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <select name="domain" value={formData.domain} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="TEC">Technical (TEC)</option>
              <option value="LCH">Liberal & Creative Arts (LCH)</option>
              <option value="ESO">Extension & Outreach (ESO)</option>
              <option value="IIE">Innovation & Ent. (IIE)</option>
              <option value="HWB">Health & Well-being (HWB)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select name="level" value={formData.level} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="explorer">Explorer (Level 1)</option>
              <option value="foundation">Foundation (Level 2)</option>
              <option value="practitioner">Practitioner (Level 3)</option>
              <option value="leader">Leader (Level 4)</option>
              <option value="fellow">Fellow (Level 5)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credits (SDC)</label>
            <input type="number" name="sdc_credits" value={formData.sdc_credits} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
            <input type="number" name="max_seats" value={formData.max_seats} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Assignments</h2>
          <button onClick={addAssignment} className="text-sm bg-gray-100 px-3 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><FiPlus /> Add</button>
        </div>
        <div className="space-y-4">
          {formData.assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments added.</p>}
          {formData.assignments.map((assignment, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded border">
              <input type="text" placeholder="Assignment Title" value={assignment.title} onChange={(e) => updateAssignment(idx, 'title', e.target.value)} className="flex-1 p-2 border rounded text-sm" />
              <input type="date" value={assignment.dueDate} onChange={(e) => updateAssignment(idx, 'dueDate', e.target.value)} className="w-40 p-2 border rounded text-sm" />
              <button onClick={() => removeAssignment(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Resources</h2>
          <button onClick={addResource} className="text-sm bg-gray-100 px-3 py-1 rounded flex items-center gap-1 hover:bg-gray-200"><FiPlus /> Add</button>
        </div>
        <div className="space-y-4">
          {formData.resources.length === 0 && <p className="text-gray-500 text-sm">No resources added.</p>}
          {formData.resources.map((res, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded border">
              <select value={res.type} onChange={(e) => updateResource(idx, 'type', e.target.value)} className="w-24 p-2 border rounded text-sm">
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
              <input type="text" placeholder="Resource Title / Description" value={res.title} onChange={(e) => updateResource(idx, 'title', e.target.value)} className="flex-1 p-2 border rounded text-sm" />
              <input type="text" placeholder="URL (e.g. https://...)" value={res.url} onChange={(e) => updateResource(idx, 'url', e.target.value)} className="flex-1 p-2 border rounded text-sm" />
              <button onClick={() => removeResource(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Outcomes & Competencies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2"><span className="font-semibold text-sm">Learning Outcomes</span> <button onClick={() => addStringArrayItem('outcomes')} className="text-blue-600 text-sm">+ Add</button></div>
            {formData.outcomes.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={item} onChange={e => handleStringArrayChange('outcomes', idx, e.target.value)} className="flex-1 p-1.5 border rounded text-sm" />
                <button onClick={() => removeStringArrayItem('outcomes', idx)} className="text-red-500"><FiTrash2/></button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-2"><span className="font-semibold text-sm">Competencies</span> <button onClick={() => addStringArrayItem('competencies')} className="text-blue-600 text-sm">+ Add</button></div>
            {formData.competencies.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={item} onChange={e => handleStringArrayChange('competencies', idx, e.target.value)} className="flex-1 p-1.5 border rounded text-sm" />
                <button onClick={() => removeStringArrayItem('competencies', idx)} className="text-red-500"><FiTrash2/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
