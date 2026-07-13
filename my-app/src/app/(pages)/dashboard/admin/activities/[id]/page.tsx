import ActivityEditor from "@/app/components/admin/ActivityEditor";

export default function EditActivityPage({ params }: { params: { id: string } }) {
  return <ActivityEditor activityId={params.id} />;
}
