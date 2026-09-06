"use client";

import { useState } from "react";
import { generateActivityReportPdf } from "@/lib/activityReportPdf";
import { FiDownload, FiCheckCircle, FiFileText, FiMapPin, FiClock, FiCalendar, FiUser } from "react-icons/fi";

export default function ReportViewerClient({ activity, report, clubName }: { activity: any; report: any; clubName: string }) {
  const [downloading, setDownloading] = useState(false);

  const formatDate = (d: any) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateActivityReportPdf({
        clubName: clubName || "",
        activityTitle: activity.title || "",
        activityDate: formatDate(activity.activity_date),
        facultyName: report.faculty_name || "",
        posterUrl: report.poster_url || "",
        permissionLetterUrl: report.permission_letter_url || "",
        eventParticulars: {
          activityName: activity.title || "",
          organizingClub: clubName || "",
          academicYear: report.academic_year || "",
          facultyIncharge: [report.faculty_name, report.faculty_id].filter(Boolean).join(" - "),
          studentLead: [report.student_lead_name, report.student_lead_id].filter(Boolean).join(" - "),
          timeSlot: report.time_slot || "",
          venue: report.venue || "",
          studentsParticipated: report.students_participated ? String(report.students_participated) : "",
        },
        overview: report.overview || "",
        objectives: report.objectives || "",
        proceedings: report.proceedings || "",
        keyHighlights: report.key_highlights || "",
        learningOutcomes: report.learning_outcomes || "",
        conclusion: report.conclusion || "",
        gallery: typeof report.gallery === 'string' ? JSON.parse(report.gallery) : (report.gallery || []),
        attendanceSheets: typeof report.attendance_sheets === 'string' ? JSON.parse(report.attendance_sheets) : (report.attendance_sheets || []),
      });
    } catch (err: any) {
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const gallery = typeof report.gallery === 'string' ? JSON.parse(report.gallery) : (report.gallery || []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100 flex-shrink-0">
              <FiFileText className="text-red-600" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 line-clamp-1">{activity.title}</h1>
              <p className="text-xs text-gray-500">Official Activity Report</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70 text-sm"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiDownload size={16} />
            )}
            {downloading ? "Generating PDF..." : "Download Full PDF"}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Cover Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {report.poster_url && (
            <div className="w-full h-48 sm:h-72 bg-gray-900 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.poster_url} alt="Poster" className="w-full h-full object-cover opacity-60" crossOrigin="anonymous" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm mb-3 inline-block">
                  {clubName}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">{activity.title}</h2>
              </div>
            </div>
          )}
          
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <FiCalendar size={14} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(activity.activity_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <FiClock size={14} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Time</p>
                  <p className="font-semibold text-gray-900">{report.time_slot || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <FiMapPin size={14} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Venue</p>
                  <p className="font-semibold text-gray-900">{report.venue || activity.venue || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <FiUser size={14} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-0.5">Faculty In-charge</p>
                  <p className="font-semibold text-gray-900">{report.faculty_name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Sections */}
        <div className="grid grid-cols-1 gap-8">
          {[
            { title: "Overview", content: report.overview },
            { title: "Objectives", content: report.objectives },
            { title: "Proceedings", content: report.proceedings },
            { title: "Key Highlights", content: report.key_highlights },
            { title: "Learning Outcomes", content: report.learning_outcomes },
            { title: "Conclusion", content: report.conclusion },
          ].map((section, idx) => section.content ? (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                {section.title}
              </h3>
              <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 prose-p:leading-relaxed">
                {section.content.split('\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ) : null)}
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-red-600 rounded-full" />
              Photo Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((g: any, i: number) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={`Gallery ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center pb-8 pt-4">
          <p className="text-sm font-semibold text-gray-400 flex items-center justify-center gap-1.5">
            <FiCheckCircle />
            Verified & Approved by Student Activity Center
          </p>
        </div>

      </div>
    </div>
  );
}
