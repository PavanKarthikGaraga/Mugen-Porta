"use client";
import SubmissionsManager from "@/app/components/admin/samam/SubmissionsManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "students", "activities", "submissions", "completed", "notifications", "settings"];

export default function AdminSamamSubmissionsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/council/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <SubmissionsManager role="council" />
      </div>
    </div>
  );
}
