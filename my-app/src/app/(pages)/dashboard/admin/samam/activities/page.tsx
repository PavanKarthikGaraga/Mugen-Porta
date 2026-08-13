"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ActivityManager from "@/app/components/admin/samam/ActivityManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed", "notifications", "settings"];

export default function AdminSamamActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [actSearchStr, setActSearchStr] = useState("");

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/activities");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally { setActivitiesLoading(false); }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const deleteActivity = async (id: number) => {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/dashboard/admin/samam/activities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchActivities(); }
    else toast.error(data.message || "Failed");
  };

  const filteredActivities = activities.filter(a =>
    !actSearchStr || a.title?.toLowerCase().includes(actSearchStr.toLowerCase()) || a.code?.toLowerCase().includes(actSearchStr.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/admin/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <ActivityManager
          actSearchStr={actSearchStr} setActSearchStr={setActSearchStr} fetchActivities={fetchActivities}
          activitiesLoading={activitiesLoading} filteredActivities={filteredActivities} deleteActivity={deleteActivity}
          role="admin"
        />
      </div>
    </div>
  );
}
