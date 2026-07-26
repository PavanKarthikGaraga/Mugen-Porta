"use client";
import { useState, useEffect } from "react";
import { FiSearch, FiSave, FiAward, FiCheckSquare, FiSquare } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "@/app/components/admin/samam/SharedUI";

export default function LeadActivitiesDevPage() {
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [lead, setLead] = useState<any>(null);
    const [categoriesByDomain, setCategoriesByDomain] = useState<any>({});
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);

    // Initial load: fetch all categories
    useEffect(() => {
        fetch("/api/dashboard/admin/dev/lead-activities")
            .then(res => res.json())
            .then(data => {
                if (data.allCategories) {
                    const grouped: any = {};
                    data.allCategories.forEach((c: any) => {
                        if (!grouped[c.domain]) grouped[c.domain] = [];
                        grouped[c.domain].push(c.category);
                    });
                    setCategoriesByDomain(grouped);
                }
            });
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId) return toast.error("Enter a Lead ID");
        
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard/admin/dev/lead-activities?username=${searchId}`);
            const data = await res.json();
            
            if (res.ok) {
                setLead(data.lead);
                setSelectedCategories(new Set(data.lead.assigned_categories || []));
                toast.success(`Found lead: ${data.lead.name}`);
            } else {
                setLead(null);
                setSelectedCategories(new Set());
                toast.error(data.message || "Lead not found");
            }
        } catch (error) {
            toast.error("Network error");
        }
        setLoading(false);
    };

    const toggleCategory = (category: string) => {
        const newSet = new Set(selectedCategories);
        if (newSet.has(category)) newSet.delete(category);
        else newSet.add(category);
        setSelectedCategories(newSet);
    };

    const handleSave = async () => {
        if (!lead) return;
        setSaving(true);
        try {
            const res = await fetch("/api/dashboard/admin/dev/lead-activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: lead.username,
                    assigned_categories: Array.from(selectedCategories)
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Assigned categories saved successfully");
            } else {
                toast.error(data.message || "Failed to save");
            }
        } catch (error) {
            toast.error("Network error");
        }
        setSaving(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700">
                    <FiAward size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Activities Assignment</h1>
                    <p className="text-gray-500 text-sm">Assign specific activity categories to Club Leads for their SAMAM dashboard.</p>
                </div>
            </div>

            {/* Search Section */}
            <form onSubmit={handleSearch} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead ID Number</label>
                    <input 
                        type="text" 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Enter Lead ID (e.g. 2300032048)" 
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button type="submit" disabled={loading} className="h-10 px-6 rounded-md text-white font-medium flex items-center gap-2" style={{ backgroundColor: BRAND }}>
                    {loading ? <span className="animate-pulse">Searching...</span> : <><FiSearch /> Search</>}
                </button>
            </form>

            {/* Lead Details & Categories */}
            {lead && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{lead.name}</h2>
                            <p className="text-sm text-gray-500">ID: {lead.username}</p>
                        </div>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="h-9 px-5 rounded-md text-white font-medium flex items-center gap-2 shadow-sm"
                            style={{ backgroundColor: BRAND }}
                        >
                            {saving ? "Saving..." : <><FiSave /> Save Assignments</>}
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        <p className="text-sm text-gray-600 mb-4">Select the categories this Lead should be able to manage in their dashboard.</p>
                        
                        {Object.entries(categoriesByDomain).map(([domain, categories]: any) => (
                            <div key={domain} className="space-y-3">
                                <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">{domain}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                                    {categories.map((cat: string) => {
                                        const isSelected = selectedCategories.has(cat);
                                        return (
                                            <div 
                                                key={cat} 
                                                onClick={() => toggleCategory(cat)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <div className={isSelected ? 'text-indigo-600' : 'text-gray-400'}>
                                                    {isSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                                                </div>
                                                <span className={`text-sm ${isSelected ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>
                                                    {cat}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
