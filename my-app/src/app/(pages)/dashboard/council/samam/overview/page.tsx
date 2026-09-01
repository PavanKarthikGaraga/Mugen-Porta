"use client";
import { useState, useEffect, useCallback } from "react";
import AnalyticsView from "@/app/components/admin/samam/AnalyticsView";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed", "notifications", "settings"];

export default function AdminSamamOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/council/samam/stats");
      if (res.ok) setAnalytics(await res.json());
    } finally { setAnalyticsLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/council/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <AnalyticsView
          analytics={analytics}
          analyticsLoading={analyticsLoading}
          studentsHref="/dashboard/council/samam/students"
        />
      </div>
    </div>
  );
}
