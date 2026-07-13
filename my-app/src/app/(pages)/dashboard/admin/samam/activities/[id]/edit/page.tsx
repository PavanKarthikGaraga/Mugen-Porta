"use client";
import { useEffect, useState, use } from "react";
import ActivityEditor from "@/app/components/admin/ActivityEditor";

export default function EditActivityPage({ params }) {
    const { id } = use(params);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/dashboard/admin/samam/activities/${id}`)
            .then(res => res.json())
            .then(data => {
                setActivity(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!activity || activity.error) return <div className="p-10 text-center text-red-500">Activity not found</div>;

    return <ActivityEditor initialData={activity} />;
}
