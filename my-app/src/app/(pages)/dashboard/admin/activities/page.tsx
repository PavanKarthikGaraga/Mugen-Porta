"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      } else {
        toast.error("Failed to load activities");
      }
    } catch (err) {
      toast.error("An error occurred while fetching activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success("Activity deleted successfully");
        fetchActivities();
      } else {
        toast.error("Failed to delete activity");
      }
    } catch (err) {
      toast.error("An error occurred while deleting");
    }
  };

  const filteredActivities = activities.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SAMAM Activities</h1>
          <p className="text-sm text-gray-500 mt-1">Manage catalogue events, assignments, and resources.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchActivities} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <Link href="/dashboard/admin/activities/new" className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 font-medium transition-colors">
            <FiPlus /> New Activity
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by code or title..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">{filteredActivities.length} Activities Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Domain</th>
                <th className="p-4 font-semibold">Level</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading activities...</td></tr>
              ) : filteredActivities.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No activities found.</td></tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm font-medium text-gray-900">{activity.code}</td>
                    <td className="p-4 text-sm text-gray-700">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-xs text-gray-500">{activity.category}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-semibold">{activity.domain}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 capitalize">{activity.level}</td>
                    <td className="p-4 text-sm text-right space-x-2">
                      <Link href={`/dashboard/admin/activities/${activity.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <FiEdit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(activity.id, activity.title)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
