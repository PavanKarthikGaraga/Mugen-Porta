"use client";
import NotificationsManager from "@/app/components/admin/samam/NotificationsManager";
import SamamControlHeader from "@/app/components/admin/samam/SamamControlHeader";

const TABS = ["overview", "activities", "submissions", "notifications"];

export default function FacultySamamNotificationsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <SamamControlHeader basePath="/dashboard/faculty/samam" tabs={TABS} />
      <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
        <NotificationsManager />
      </div>
    </div>
  );
}
