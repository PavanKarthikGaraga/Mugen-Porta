"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ActivityManager from "@/app/components/admin/samam/ActivityManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

const TABS = ["overview", "activities", "submissions"];

export default function LeadSamamActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [actSearchStr, setActSearchStr] = usePersistedState("samam_activities_search_lead", "");

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/dashboard/lead/samam/activities");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally { setActivitiesLoading(false); }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const deleteActivity = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/dashboard/lead/samam/activities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchActivities(); }
    else toast.error(data.message || "Failed");
  };

  const filteredActivities = activities.filter(a => {
    if (actSearchStr) {
      const q = actSearchStr.toLowerCase();
      return (a.title?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader
        basePath="/dashboard/lead/samam" tabs={TABS}
        title="SAMAM Dashboard"
        subtitle="Manage activities, submissions, and track student achievements."
      />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <ActivityManager
          actSearchStr={actSearchStr}
          setActSearchStr={setActSearchStr}
          fetchActivities={fetchActivities}
          activitiesLoading={activitiesLoading}
          filteredActivities={filteredActivities}
          deleteActivity={deleteActivity}
          role="lead"
        />
      </div>
    </div>
  );
}
