"use client";
import { use } from "react";
import EnrolledStudentsView from "@/app/components/dashboard/EnrolledStudentsView";

export default function EnrolledStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EnrolledStudentsView activityCode={id} backHref="/dashboard/lead/samam/activities" />;
}
