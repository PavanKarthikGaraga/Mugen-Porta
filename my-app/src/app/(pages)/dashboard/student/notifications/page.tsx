"use client";

import { useState, useEffect } from "react";
import { FiBell, FiCheck, FiFilter } from "react-icons/fi";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/notifications")
      .then(r => r.json())
      .then(d => {
        if (d.success) setNotifications(d.notifications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/student/notifications/${id}/read`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Stay updated with your activities and achievements.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "all" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-zinc-400"}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === "unread" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 shadow-sm" : "text-gray-500 dark:text-zinc-400"}`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-zinc-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-zinc-400">
            <FiBell size={40} className="mx-auto mb-4 opacity-50" />
            <p>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {filtered.map((n) => {
              const icons: Record<string, string> = { activity: "📋", badge: "🏆", sdc: "⭐", reminder: "🔔", system: "ℹ️" };
              return (
                <div key={n.id} className={`p-5 flex gap-4 transition-colors ${!n.read ? "bg-red-50/30 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-zinc-900/50"}`}>
                  <div className="text-2xl mt-1 flex-shrink-0">{icons[n.type] || "🔔"}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{n.title}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">{n.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
