import ActivityEditor from "@/app/components/admin/ActivityEditor";

export default async function LeadEditActivityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ActivityEditor activityId={id} role="lead" />;
}
