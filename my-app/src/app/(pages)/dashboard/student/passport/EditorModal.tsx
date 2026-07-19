import { useState, useRef } from "react";
import { FiX, FiPlus, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { toast } from "sonner";
import SkillInput from "./SkillInput";

const BRAND = "rgb(151,0,3)";

export default function EditorModal({ isOpen, onClose, initialData, onSave }) {
    const [data, setData] = useState(initialData);
    const [saving, setSaving] = useState(false);
    
    // File upload refs
    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleUpload = async (file: File, type: 'avatar' | 'banner') => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const json = await res.json();
            if (res.ok) {
                setData((prev: any) => ({
                    ...prev,
                    profile: { ...prev.profile, [type === 'avatar' ? 'avatar_url' : 'banner_url']: json.url }
                }));
                toast.success(`${type} uploaded successfully`);
            } else {
                toast.error("Upload failed");
            }
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/dashboard/student/passport", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toast.success("Profile saved!");
                onSave(data);
                onClose();
            } else {
                toast.error("Failed to save");
            }
        } catch (err) {
            toast.error("Error saving");
        } finally {
            setSaving(false);
        }
    };

    const updateProfile = (key: string, value: any) => {
        setData((prev: any) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
    };

    const updateArray = (section: string, index: number, key: string, value: any) => {
        setData((prev: any) => {
            const newArr = [...(prev[section] || [])];
            newArr[index] = { ...newArr[index], [key]: value };
            return { ...prev, [section]: newArr };
        });
    };

    const addArrayItem = (section: string, template: any) => {
        setData((prev: any) => ({ ...prev, [section]: [...(prev[section] || []), template] }));
    };

    const removeArrayItem = (section: string, index: number) => {
        setData((prev: any) => {
            const newArr = [...(prev[section] || [])];
            newArr.splice(index, 1);
            return { ...prev, [section]: newArr };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Edit Excellence Passport</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
                    
                    {/* Media Uploads */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Media</h3>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Banner Image</label>
                                <div className="flex gap-2 items-center">
                                    <input type="text" value={data.profile?.banner_url || ""} onChange={e => updateProfile("banner_url", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg" placeholder="URL or upload..." />
                                    <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
                                    <button onClick={() => bannerRef.current?.click()} className="h-9 px-3 bg-gray-100 rounded-lg flex items-center gap-1 text-xs font-semibold hover:bg-gray-200"><FiUploadCloud size={14} /> Upload</button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Avatar Image</label>
                                <div className="flex gap-2 items-center">
                                    <input type="text" value={data.profile?.avatar_url || ""} onChange={e => updateProfile("avatar_url", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg" placeholder="URL or upload..." />
                                    <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')} />
                                    <button onClick={() => avatarRef.current?.click()} className="h-9 px-3 bg-gray-100 rounded-lg flex items-center gap-1 text-xs font-semibold hover:bg-gray-200"><FiUploadCloud size={14} /> Upload</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Profile */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Basic Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-semibold text-gray-600">Tagline *</label><input required value={data.profile?.tagline || ""} onChange={e => updateProfile("tagline", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">CGPA</label><input type="number" step="0.01" value={data.profile?.cgpa || ""} onChange={e => updateProfile("cgpa", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                            <div className="col-span-2">
                                <label className="text-xs font-semibold text-gray-600">Skills *</label>
                                <SkillInput 
                                    value={data.profile?.skills || []} 
                                    onChange={(newSkills) => updateProfile("skills", newSkills)} 
                                />
                            </div>
                        </div>
                        <div><label className="text-xs font-semibold text-gray-600">About Me *</label><textarea required value={data.profile?.about || ""} onChange={e => updateProfile("about", e.target.value)} rows={3} className="w-full p-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                        
                        <h4 className="text-xs font-bold text-gray-900 mt-4 border-t pt-4 mb-2">Links</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-xs font-semibold text-gray-600">Portfolio</label><input value={data.profile?.portfolio_url || ""} onChange={e => updateProfile("portfolio_url", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">GitHub</label><input value={data.profile?.github_url || ""} onChange={e => updateProfile("github_url", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                            <div><label className="text-xs font-semibold text-gray-600">LinkedIn</label><input value={data.profile?.linkedin_url || ""} onChange={e => updateProfile("linkedin_url", e.target.value)} className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg mt-1" /></div>
                        </div>
                    </div>

                    {/* Internships */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Internships</h3>
                            <button onClick={() => addArrayItem('internships', { company: '', role: '', duration: '', location: '', description: '', skills: [] })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.internships || []).map((exp: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('internships', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Company *" value={exp.company} onChange={e => updateArray('internships', i, 'company', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input required placeholder="Role *" value={exp.role} onChange={e => updateArray('internships', i, 'role', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Duration (e.g. Jun 2023 - Aug 2023)" value={exp.duration} onChange={e => updateArray('internships', i, 'duration', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Location" value={exp.location} onChange={e => updateArray('internships', i, 'location', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                    </div>
                                    <textarea placeholder="Description" value={exp.description} onChange={e => updateArray('internships', i, 'description', e.target.value)} rows={2} className="w-full mt-3 p-3 text-sm border border-gray-200 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Projects</h3>
                            <button onClick={() => addArrayItem('projects', { name: '', description: '', tech_stack: [], github_url: '', demo_url: '', project_year: '' })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.projects || []).map((proj: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('projects', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Project Name *" value={proj.name} onChange={e => updateArray('projects', i, 'name', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Year" value={proj.project_year} onChange={e => updateArray('projects', i, 'project_year', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <div className="col-span-2">
                                            <SkillInput 
                                                value={proj.tech_stack || []} 
                                                onChange={(newSkills) => updateArray('projects', i, 'tech_stack', newSkills)} 
                                            />
                                        </div>
                                        <input placeholder="GitHub URL" value={proj.github_url} onChange={e => updateArray('projects', i, 'github_url', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Demo URL" value={proj.demo_url} onChange={e => updateArray('projects', i, 'demo_url', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                    </div>
                                    <textarea required placeholder="Description *" value={proj.description} onChange={e => updateArray('projects', i, 'description', e.target.value)} rows={2} className="w-full mt-3 p-3 text-sm border border-gray-200 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Research */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Research</h3>
                            <button onClick={() => addArrayItem('research', { title: '', journal: '', publication_year: '', co_authors: [], status: 'under_review' })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.research || []).map((res: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('research', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Title *" value={res.title} onChange={e => updateArray('research', i, 'title', e.target.value)} className="col-span-2 h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Journal/Conference" value={res.journal} onChange={e => updateArray('research', i, 'journal', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Year" value={res.publication_year} onChange={e => updateArray('research', i, 'publication_year', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Co-authors (comma separated)" value={(res.co_authors || []).join(', ')} onChange={e => updateArray('research', i, 'co_authors', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <select value={res.status} onChange={e => updateArray('research', i, 'status', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white">
                                            <option value="Under Review">Under Review</option>
                                            <option value="Published">Published</option>
                                            <option value="Ongoing">Ongoing</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leadership */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Leadership</h3>
                            <button onClick={() => addArrayItem('leadership', { role: '', organisation: '', period: '', impact: '' })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.leadership || []).map((l: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('leadership', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Role *" value={l.role} onChange={e => updateArray('leadership', i, 'role', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input required placeholder="Organisation *" value={l.organisation} onChange={e => updateArray('leadership', i, 'organisation', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Period (e.g. 2023 - Present)" value={l.period} onChange={e => updateArray('leadership', i, 'period', e.target.value)} className="col-span-2 h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <textarea placeholder="Impact/Description" value={l.impact} onChange={e => updateArray('leadership', i, 'impact', e.target.value)} rows={2} className="col-span-2 w-full mt-1 p-3 text-sm border border-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Community Service</h3>
                            <button onClick={() => addArrayItem('community', { activity: '', hours_spent: 0, impact: '' })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.community || []).map((c: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('community', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Activity Name *" value={c.activity} onChange={e => updateArray('community', i, 'activity', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input type="number" placeholder="Hours Spent" value={c.hours_spent} onChange={e => updateArray('community', i, 'hours_spent', parseInt(e.target.value) || 0)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Impact / Outcome" value={c.impact} onChange={e => updateArray('community', i, 'impact', e.target.value)} className="col-span-2 h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Achievements</h3>
                            <button onClick={() => addArrayItem('achievements', { title: '', organisation: '', achievement_year: '' })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add</button>
                        </div>
                        <div className="space-y-4">
                            {(data.achievements || []).map((a: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('achievements', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <input required placeholder="Title *" value={a.title} onChange={e => updateArray('achievements', i, 'title', e.target.value)} className="col-span-2 h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Organisation / Event" value={a.organisation} onChange={e => updateArray('achievements', i, 'organisation', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <input placeholder="Year" value={a.achievement_year} onChange={e => updateArray('achievements', i, 'achievement_year', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">My Journey (Timeline)</h3>
                            <button onClick={() => addArrayItem('timeline', { year: '', events: [] })} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"><FiPlus /> Add Year</button>
                        </div>
                        <div className="space-y-4">
                            {(data.timeline || []).map((t: any, i: number) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50">
                                    <button onClick={() => removeArrayItem('timeline', i)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"><FiTrash2 size={14}/></button>
                                    <div className="pr-8 space-y-3">
                                        <input required placeholder="Year (e.g. 2024) *" value={t.year} onChange={e => updateArray('timeline', i, 'year', e.target.value)} className="w-1/3 h-9 px-3 text-sm border border-gray-200 rounded-lg" />
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Events (one per line)</label>
                                            <textarea 
                                                rows={4}
                                                value={(t.events || []).join('\n')}
                                                onChange={e => updateArray('timeline', i, 'events', e.target.value.split('\n').map((s: string) => s.trim()).filter(Boolean))}
                                                className="w-full p-3 text-sm border border-gray-200 rounded-lg"
                                                placeholder="Built an app...&#10;Won a hackathon..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                
                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm flex items-center gap-2" style={{ backgroundColor: BRAND }}>
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
}
