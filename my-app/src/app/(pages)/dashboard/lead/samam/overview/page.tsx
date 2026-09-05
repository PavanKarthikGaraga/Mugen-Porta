"use client";
import { useState, useEffect, useCallback } from "react";
import AnalyticsView from "@/app/components/admin/samam/AnalyticsView";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed"];

export default function LeadSamamOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam-stats");
      if (res.ok) setAnalytics(await res.json());
    } finally { setAnalyticsLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader
        basePath="/dashboard/lead/samam" tabs={TABS}
        title="SAMAM Dashboard"
        subtitle="Manage activities, submissions, and track student achievements."
      />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        {/* Lead has no Students page under SAMAM (it already has its own
            standalone /dashboard/lead/students), so no studentsHref — the
            leaderboard just isn't clickable, same as it always was. */}
        <AnalyticsView analytics={analytics} analyticsLoading={analyticsLoading} />
      </div>
    </div>
  );
}
