"use client";
import SubmissionsManager from "@/app/components/admin/samam/SubmissionsManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed"];

export default function LeadSamamSubmissionsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader
        basePath="/dashboard/lead/samam" tabs={TABS}
        title="SAMAM Dashboard"
        subtitle="Manage activities, submissions, and track student achievements."
      />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <SubmissionsManager role="lead" />
      </div>
    </div>
  );
}
