import pool from "@/lib/db";
import { notFound } from "next/navigation";
import ReportViewerClient from "./ReportViewerClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [rows]: any = await pool.execute("SELECT title FROM activity_catalogue WHERE code = ?", [id]);
  const title = (rows as any[])[0]?.title || "Activity Report";
  return { title: `${title} | SAC Report` };
}

export default async function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the activity details
  const [activityRows]: any = await pool.execute(`
    SELECT ac.*, c.name as club_name
    FROM activity_catalogue ac
    LEFT JOIN club_activity_mappings cam ON cam.activity_code = ac.code
    LEFT JOIN clubs c ON c.id = cam.club_id
    WHERE ac.code = ?
    LIMIT 1
  `, [id]);

  if (activityRows.length === 0) {
    return notFound();
  }
  const activity = activityRows[0];

  // Fetch the report details
  const [reportRows]: any = await pool.execute(`
    SELECT * FROM activity_reports
    WHERE activity_code = ?
    LIMIT 1
  `, [id]);

  if (reportRows.length === 0) {
    // Return a page indicating no report has been filed yet
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-500 text-sm">
            The official activity report for <strong>{activity.title}</strong> has not been generated or published yet.
          </p>
        </div>
      </div>
    );
  }

  const report = reportRows[0];
  // Determine clubName from report or fallback to mapping
  const clubName = report.organizing_entity || activity.club_name || "SAC (Student Activity Center)";

  // The client component handles the rendering and PDF download
  return <ReportViewerClient activity={activity} report={report} clubName={clubName} />;
}
