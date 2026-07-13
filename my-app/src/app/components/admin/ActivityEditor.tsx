"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiTrash2, FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";
import Link from "next/link";

const BRAND = "rgb(151,0,3)";

export default function ActivityEditor({ initialData = null }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    
    const [form, setForm] = useState({
        code: initialData?.code || "",
        title: initialData?.title || "",
        description: initialData?.description || "",
        domain: initialData?.domain || "TEC",
        category: initialData?.category || "event",
        points: initialData?.points || "",
        max_participants: initialData?.max_participants || "",
        status: initialData?.status || "upcoming",
        difficulty: initialData?.difficulty || "Beginner",
        journey_level: initialData?.journey_level || "Explorer",
        activity_pack: initialData?.activity_pack || "",
        faculty_name: initialData?.faculty_name || "",
        hours: initialData?.hours || "",
        purpose: initialData?.purpose || "",
        
        // JSON Arrays
        learning_outcomes: initialData?.learning_outcomes || [],
        competencies: initialData?.competencies || [],
        graduate_attributes: initialData?.graduate_attributes || [],
        resources: initialData?.resources || [],
        assignments: initialData?.assignments || [],
        timeline: initialData?.timeline || [],
        sdgs: initialData?.sdgs || [],
    });

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = initialData ? `/api/dashboard/admin/samam/activities/${initialData.id}` : "/api/dashboard/admin/samam/activities";
            const method = initialData ? "PUT" : "POST";
            
            const payload = {
                ...form,
                points: Number(form.points) || 0,
                max_participants: form.max_participants ? Number(form.max_participants) : null,
                hours: form.hours ? Number(form.hours) : 0,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success(data.message || "Activity saved");
                router.push(initialData ? `/dashboard/admin/samam/activities/${initialData.id}` : "/dashboard/admin/samam");
                router.refresh();
            } else {
                toast.error(data.message || "Failed to save");
            }
        } catch (err) {
            toast.error("Error saving activity");
        } finally {
            setSaving(false);
        }
    };

    // Helper for simple string arrays
    const renderStringArrayEditor = (key, label, placeholder) => (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                <button type="button" onClick={() => updateForm(key, [...form[key], ""])} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
            </div>
            <div className="space-y-2">
                {form[key].map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input value={item} onChange={e => {
                            const newArr = [...form[key]];
                            newArr[idx] = e.target.value;
                            updateForm(key, newArr);
                        }} className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg" placeholder={placeholder} />
                        <button type="button" onClick={() => {
                            const newArr = [...form[key]];
                            newArr.splice(idx, 1);
                            updateForm(key, newArr);
                        }} className="text-red-400 hover:text-red-600 p-2"><FiTrash2 size={16} /></button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <div className="flex items-center gap-4">
                <Link href={initialData ? `/dashboard/admin/samam/activities/${initialData.id}` : "/dashboard/admin/samam"} className="text-gray-400 hover:text-gray-900">
                    <FiArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{initialData ? "Edit Activity" : "Create New Activity"}</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                
                {/* Basic Details */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Basic Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-semibold text-gray-600">Code *</label><input required value={form.code} onChange={e => updateForm("code", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div><label className="text-xs font-semibold text-gray-600">Title *</label><input required value={form.title} onChange={e => updateForm("title", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Domain *</label>
                            <select value={form.domain} onChange={e => updateForm("domain", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1">
                                {["TEC","LCH","ESO","IIE","HWB"].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div><label className="text-xs font-semibold text-gray-600">Category *</label><input required value={form.category} onChange={e => updateForm("category", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div><label className="text-xs font-semibold text-gray-600">SAMAM Points *</label><input required type="number" value={form.points} onChange={e => updateForm("points", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div><label className="text-xs font-semibold text-gray-600">Max Participants</label><input type="number" value={form.max_participants} onChange={e => updateForm("max_participants", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div><label className="text-xs font-semibold text-gray-600">Hours</label><input type="number" step="0.5" value={form.hours} onChange={e => updateForm("hours", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        <div><label className="text-xs font-semibold text-gray-600">Faculty Name</label><input value={form.faculty_name} onChange={e => updateForm("faculty_name", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1" /></div>
                        
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Difficulty *</label>
                            <select value={form.difficulty} onChange={e => updateForm("difficulty", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1">
                                {["Beginner","Intermediate","Advanced"].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Journey Level *</label>
                            <select value={form.journey_level} onChange={e => updateForm("journey_level", e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg mt-1">
                                {["Explorer","Foundation","Practitioner","Leader","Fellow"].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="text-xs font-semibold text-gray-600">Description</label><textarea value={form.description} onChange={e => updateForm("description", e.target.value)} rows={3} className="w-full p-3 border border-gray-200 rounded-lg mt-1" /></div>
                    <div><label className="text-xs font-semibold text-gray-600">Purpose</label><textarea value={form.purpose} onChange={e => updateForm("purpose", e.target.value)} rows={3} className="w-full p-3 border border-gray-200 rounded-lg mt-1" /></div>
                </div>

                {/* Arrays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderStringArrayEditor("learning_outcomes", "Learning Outcomes", "e.g. Write basic Python programs")}
                    {renderStringArrayEditor("competencies", "Competencies Developed", "e.g. Critical Thinking")}
                    {renderStringArrayEditor("graduate_attributes", "Graduate Attributes", "e.g. Domain Knowledge")}
                    {renderStringArrayEditor("sdgs", "SDGs", "e.g. SDG 4")}
                </div>

                {/* Complex Arrays - Resources */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Resources</h3>
                        <button type="button" onClick={() => updateForm("resources", [...form.resources, { title: "", type: "pdf", link: "", size: "" }])} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                        {form.resources.map((res, idx) => (
                            <div key={idx} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 flex gap-3 flex-wrap pr-8">
                                <button type="button" onClick={() => {
                                    const newArr = [...form.resources];
                                    newArr.splice(idx, 1);
                                    updateForm("resources", newArr);
                                }} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                
                                <input value={res.title} onChange={e => { const a=[...form.resources]; a[idx].title=e.target.value; updateForm("resources", a); }} className="h-9 px-3 text-sm border flex-1 rounded-lg" placeholder="Title" />
                                <select value={res.type} onChange={e => { const a=[...form.resources]; a[idx].type=e.target.value; updateForm("resources", a); }} className="h-9 px-3 text-sm border rounded-lg w-24">
                                    <option value="pdf">PDF</option>
                                    <option value="video">Video</option>
                                    <option value="link">Link</option>
                                    <option value="github">GitHub</option>
                                </select>
                                <input value={res.link} onChange={e => { const a=[...form.resources]; a[idx].link=e.target.value; updateForm("resources", a); }} className="h-9 px-3 text-sm border flex-1 min-w-[200px] rounded-lg" placeholder="URL" />
                                <input value={res.size} onChange={e => { const a=[...form.resources]; a[idx].size=e.target.value; updateForm("resources", a); }} className="h-9 px-3 text-sm border rounded-lg w-20" placeholder="Size" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Complex Arrays - Timeline */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Timeline</h3>
                        <button type="button" onClick={() => updateForm("timeline", [...form.timeline, { date: "", title: "", description: "" }])} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                    </div>
                    <div className="space-y-4">
                        {form.timeline.map((item, idx) => (
                            <div key={idx} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 flex gap-3 flex-col pr-8">
                                <button type="button" onClick={() => {
                                    const newArr = [...form.timeline];
                                    newArr.splice(idx, 1);
                                    updateForm("timeline", newArr);
                                }} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                
                                <div className="flex gap-3">
                                    <input value={item.date} onChange={e => { const a=[...form.timeline]; a[idx].date=e.target.value; updateForm("timeline", a); }} className="h-9 px-3 text-sm border rounded-lg w-1/3" placeholder="Date (e.g. Week 1)" />
                                    <input value={item.title} onChange={e => { const a=[...form.timeline]; a[idx].title=e.target.value; updateForm("timeline", a); }} className="h-9 px-3 text-sm border flex-1 rounded-lg" placeholder="Title" />
                                </div>
                                <textarea value={item.description} onChange={e => { const a=[...form.timeline]; a[idx].description=e.target.value; updateForm("timeline", a); }} className="w-full p-3 text-sm border rounded-lg" placeholder="Description" rows={2} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-5">
                    <button disabled={saving} type="submit" className="px-8 py-3 text-sm font-bold text-white rounded-xl shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50" style={{ backgroundColor: BRAND }}>
                        {saving ? "Saving..." : "Save Activity"} <FiSave />
                    </button>
                </div>

            </form>
        </div>
    );
}
