"use client";
import CompletedActivitiesManager from "@/app/components/admin/samam/CompletedActivitiesManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed"];

export default function AdminSamamCompletedPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/council/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <CompletedActivitiesManager />
      </div>
    </div>
  );
}
