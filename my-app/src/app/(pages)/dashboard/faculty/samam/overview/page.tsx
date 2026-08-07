"use client";
import { useState, useEffect, useCallback } from "react";
import AnalyticsView from "@/app/components/admin/samam/AnalyticsView";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "activities", "submissions", "notifications"];

export default function FacultySamamOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/faculty/samam/stats");
      if (res.ok) {
        const d = await res.json();
        // AnalyticsView expects `totalClubStudents`; faculty stats returns `activeSamamStudents`
        setAnalytics({ ...d, totalClubStudents: d.activeSamamStudents });
      }
    } finally { setAnalyticsLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/faculty/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <AnalyticsView
          analytics={analytics}
          analyticsLoading={analyticsLoading}
          studentsHref="/dashboard/faculty/samam/students"
        />
      </div>
    </div>
  );
}
