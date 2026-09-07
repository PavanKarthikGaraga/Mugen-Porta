"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiPlus, FiList } from "react-icons/fi";

export default function IqacActivitiesPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        activity_code: '',
        title: '',
        activity_date: '',
        start_time: '',
        end_time: '',
        venue: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/dashboard/iqac/activities');
            if (res.ok) {
                const data = await res.json();
                setActivities(data.activities || []);
            }
        } catch (e) {
            toast.error("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingId ? `/api/dashboard/iqac/activities/${editingId}` : '/api/dashboard/iqac/activities';
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setShowForm(false);
                setEditingId(null);
                setFormData({
                    activity_code: '', title: '', activity_date: '', start_time: '', end_time: '', venue: ''
                });
                fetchActivities();
            } else {
                toast.error(data.error || data.message || `Failed to ${editingId ? 'update' : 'create'} activity`);
            }
        } catch (e) {
            toast.error(`Failed to ${editingId ? 'update' : 'create'} activity`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (activity) => {
        // Parse date for the input field (YYYY-MM-DD format)
        let formattedDate = '';
        if (activity.activity_date) {
            const dateObj = new Date(activity.activity_date);
            formattedDate = dateObj.toISOString().split('T')[0];
        }

        setFormData({
            activity_code: activity.activity_code || '',
            title: activity.title || '',
            activity_date: formattedDate,
            start_time: activity.start_time || '',
            end_time: activity.end_time || '',
            venue: activity.venue || ''
        });
        setEditingId(activity.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this activity? This cannot be undone.")) return;
        
        try {
            const res = await fetch(`/api/dashboard/iqac/activities/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success(data.message || "Activity deleted successfully");
                fetchActivities();
            } else {
                toast.error(data.error || data.message || "Failed to delete activity");
            }
        } catch (e) {
            toast.error("Failed to delete activity");
        }
    };

    const handleAddNew = () => {
        setFormData({
            activity_code: '', title: '', activity_date: '', start_time: '', end_time: '', venue: ''
        });
        setEditingId(null);
        setShowForm(!showForm);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">IQAC Activities</h1>
                    <p className="text-gray-500 mt-1">Manage simplified activities for IQAC reporting.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    {showForm ? 'List Activities' : 'Add Activity'}
                </button>
            </div>

            {showForm ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">{editingId ? 'Edit Activity' : 'Add New Activity'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Code</label>
                                <input type="text" name="activity_code" required value={formData.activity_code} onChange={handleChange}
                                    placeholder="e.g. IQAC-001" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                                    placeholder="Activity Title" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" name="activity_date" required value={formData.activity_date} onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                <input type="text" name="venue" required value={formData.venue} onChange={handleChange}
                                    placeholder="Venue" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input type="time" name="end_time" required value={formData.end_time} onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 space-x-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button disabled={submitting} type="submit" className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 disabled:opacity-50">
                                {submitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Activity' : 'Create Activity')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading activities...</div>
                    ) : activities.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No activities found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activities.map((a: any) => (
                                    <tr key={a.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.activity_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{a.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.activity_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.start_time} - {a.end_time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.venue}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleEdit(a)} 
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(a.id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
