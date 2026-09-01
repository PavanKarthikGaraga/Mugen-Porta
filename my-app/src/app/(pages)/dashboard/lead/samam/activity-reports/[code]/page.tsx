"use client";
import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft, FiUpload, FiX, FiSave, FiDownload, FiPlus, FiImage, FiFileText,
} from "react-icons/fi";
import { generateActivityReportPdf } from "@/lib/activityReportPdf";

const BRAND = "rgb(151,0,3)";
const MAX_GALLERY = 4;
const MAX_ATTENDANCE_SHEETS = 10;

type GalleryItem = { url: string };

function currentAcademicYear() {
  const now = new Date();
  const y = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1; // AY starts ~June
  return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
}

function formatActivityDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${String(d.getDate()).padStart(2, "0")}/${months[d.getMonth()]}/${d.getFullYear()}`;
}

/** Small labeled upload tile shared by poster/permission-letter/gallery/attendance uploads. */
function UploadSlot({
  label, url, onUpload, onRemove, uploading, aspect, hint,
}: {
  label: string; url: string; onUpload: (file: File) => void; onRemove?: () => void;
  uploading: boolean; aspect?: string; hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 mb-1.5">{label}</p>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {url ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className={`rounded-lg border border-gray-200 object-cover ${aspect || "max-h-48"}`} />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600"
          >
            <FiX size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          onDragEnter={(e) => {
            e.preventDefault();
            dragCounter.current++;
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            dragCounter.current--;
            if (dragCounter.current <= 0) setIsDragging(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            dragCounter.current = 0;
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`w-full sm:w-64 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
            isDragging
              ? "border-gray-400 bg-gray-50 text-gray-600"
              : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
          }`}
        >
          <FiUpload size={20} />
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : isDragging ? "Drop to upload" : "Click or drag & drop to upload"}
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Bullet-point editor: one line per bullet. Enter splits off a new bullet
 * below the cursor (like a list editor, not a plain textarea); Backspace on
 * an empty bullet removes it and moves focus to the previous one. The
 * underlying value stays a single newline-joined string, matching the DB
 * column and the PDF generator's existing bulletList() (splits on "\n"), so
 * nothing downstream needs to change shape.
 */
function BulletListInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const items = value ? value.split("\n") : [""];
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setItems = (next: string[]) => onChange(next.join("\n"));

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-gray-400 text-sm select-none">•</span>
          <input
            ref={(el) => { inputRefs.current[idx] = el; }}
            value={item}
            placeholder={idx === 0 ? placeholder : ""}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              setItems(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = [...items];
                next.splice(idx + 1, 0, "");
                setItems(next);
                requestAnimationFrame(() => inputRefs.current[idx + 1]?.focus());
              } else if (e.key === "Backspace" && item === "" && items.length > 1) {
                e.preventDefault();
                const next = items.filter((_, i) => i !== idx);
                setItems(next);
                requestAnimationFrame(() => inputRefs.current[Math.max(0, idx - 1)]?.focus());
              }
            }}
            className="flex-1 px-2 py-1.5 text-sm border-b border-gray-200 focus:outline-none focus:border-gray-400"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="text-gray-300 hover:text-red-500"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => { setItems([...items, ""]); requestAnimationFrame(() => inputRefs.current[items.length]?.focus()); }}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 mt-1"
      >
        <FiPlus size={12} /> Add bullet
      </button>
    </div>
  );
}

export default function ActivityReportFormPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const [activity, setActivity] = useState<any>(null);
  const [club, setClub] = useState<{ id: string; name: string } | null>(null);
  const [studentLead, setStudentLead] = useState<{ name: string; id: string } | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  // Attendance sheets show one upload slot at a time -- "Add another" reveals
  // the next one, rather than always showing an empty slot alongside every
  // filled one.
  const [showAttendanceSlot, setShowAttendanceSlot] = useState(true);

  const [form, setForm] = useState({
    facultyName: "", facultyId: "",
    academicYear: currentAcademicYear(), timeSlot: "", venue: "", studentsParticipated: "",
    posterUrl: "", permissionLetterUrl: "",
    overview: "", objectives: "", proceedings: "", keyHighlights: "", learningOutcomes: "", conclusion: "",
    gallery: [] as GalleryItem[],
    attendanceSheets: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/dashboard/lead/samam/activity-reports/${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          toast.error(d.message || "Failed to load activity");
          return;
        }
        setActivity(d.activity);
        setClub(d.club);
        setStudentLead(d.studentLead);
        const timeSlot = d.activity.start_time && d.activity.end_time
          ? `${String(d.activity.start_time).slice(0, 5)} to ${String(d.activity.end_time).slice(0, 5)}`
          : "";
        if (d.report) {
          setReportStatus(d.report.status);
          setForm({
            facultyName: d.report.faculty_name || "",
            facultyId: d.report.faculty_id || "",
            academicYear: d.report.academic_year || currentAcademicYear(),
            timeSlot: d.report.time_slot || timeSlot,
            venue: d.report.venue || d.activity.venue || "",
            studentsParticipated: d.report.students_participated ?? "",
            posterUrl: d.report.poster_url || "",
            permissionLetterUrl: d.report.permission_letter_url || "",
            overview: d.report.overview || "",
            objectives: d.report.objectives || "",
            proceedings: d.report.proceedings || "",
            keyHighlights: d.report.key_highlights || "",
            learningOutcomes: d.report.learning_outcomes || "",
            conclusion: d.report.conclusion || "",
            gallery: d.report.gallery || [],
            attendanceSheets: d.report.attendance_sheets || [],
          });
          if ((d.report.attendance_sheets || []).length > 0) setShowAttendanceSlot(false);
        } else {
          setForm((prev) => ({
            ...prev,
            timeSlot,
            venue: d.activity.venue || "",
            facultyName: d.activity.faculty_name || "",
          }));
        }
      })
      .catch(() => toast.error("Failed to load activity"))
      .finally(() => setLoading(false));
  }, [code]);

  const uploadFile = async (file: File, key: string): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10 MB)"); return null; }
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) { toast.error(data.error || "Upload failed"); return null; }
      return data.url;
    } catch {
      toast.error("Upload error");
      return null;
    } finally {
      setUploadingKey(null);
    }
  };

  const buildPayload = (markGenerated: boolean) => ({
    ...form,
    studentsParticipated: form.studentsParticipated === "" ? null : Number(form.studentsParticipated),
    studentLeadName: studentLead?.name || "",
    studentLeadId: studentLead?.id || "",
    markGenerated,
  });

  const saveDraft = async (markGenerated = false) => {
    const res = await fetch(`/api/dashboard/lead/samam/activity-reports/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(markGenerated)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Failed to save");
    return data;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveDraft(false);
      toast.success("Draft saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!form.posterUrl) { toast.error("Upload the activity poster first"); return; }
    if (!form.permissionLetterUrl) { toast.error("Upload the permission letter first"); return; }
    if (form.gallery.length !== 4) { toast.error("Upload exactly 4 gallery photos"); return; }
    if (form.attendanceSheets.length === 0) { toast.error("Upload at least one attendance sheet scan"); return; }
    if (!form.facultyName.trim()) { toast.error("Faculty name is required"); return; }
    if (!form.overview.trim()) { toast.error("Activity Overview is required"); return; }
    if (!form.objectives.trim() || form.objectives.trim() === "") { toast.error("Objectives are required"); return; }
    if (!form.proceedings.trim()) { toast.error("Activity Proceedings are required"); return; }
    if (!form.keyHighlights.trim() || form.keyHighlights.trim() === "") { toast.error("Key Highlights are required"); return; }
    if (!form.learningOutcomes.trim() || form.learningOutcomes.trim() === "") { toast.error("Learning Outcomes are required"); return; }
    if (!form.conclusion.trim()) { toast.error("Conclusion is required"); return; }

    setGenerating(true);
    try {
      await saveDraft(true);
      await generateActivityReportPdf({
        clubName: club?.name || "",
        activityTitle: activity?.title || "",
        activityDate: formatActivityDate(activity?.activity_date),
        facultyName: form.facultyName,
        posterUrl: form.posterUrl,
        permissionLetterUrl: form.permissionLetterUrl,
        eventParticulars: {
          activityName: activity?.title || "",
          organizingClub: club?.name || "",
          academicYear: form.academicYear,
          facultyIncharge: [form.facultyName, form.facultyId].filter(Boolean).join(" - "),
          studentLead: [studentLead?.name, studentLead?.id].filter(Boolean).join(" - "),
          timeSlot: form.timeSlot,
          venue: form.venue,
          studentsParticipated: form.studentsParticipated ? String(form.studentsParticipated) : "",
        },
        overview: form.overview,
        objectives: form.objectives,
        proceedings: form.proceedings,
        keyHighlights: form.keyHighlights,
        learningOutcomes: form.learningOutcomes,
        conclusion: form.conclusion,
        gallery: form.gallery,
        attendanceSheets: form.attendanceSheets,
      });
      setReportStatus("generated");
      toast.success("Report generated — check your downloads");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading activity...</div>;
  if (!activity) return <div className="p-12 text-center text-gray-500">Activity not found.</div>;

  return (
    <div
      className="max-w-4xl mx-auto space-y-5 pb-24"
      // Without this, dropping a file just outside one of the upload boxes
      // makes the browser navigate to it directly, losing the whole draft.
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/lead/samam/activity-reports" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{activity.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {club?.name} &middot; {formatActivityDate(activity.activity_date)}
            {reportStatus === "generated" && <span className="ml-2 text-emerald-600 font-medium">&middot; Previously generated</span>}
          </p>
        </div>
      </div>

      {/* Event particulars */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">Event Particulars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Faculty Name</label>
            <input
              value={form.facultyName}
              onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              placeholder="Faculty mentor's name"
            />
            <p className="text-[11px] text-gray-400 mt-1">Faculty Mentor - {club?.name}, KL University</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Faculty ID</label>
            <input
              value={form.facultyId}
              onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
            <input
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Time Slot</label>
            <input
              value={form.timeSlot}
              onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              placeholder="10:00 AM to 12:00 PM"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Students Participated</label>
            <input
              type="number"
              min={0}
              value={form.studentsParticipated}
              onChange={(e) => setForm({ ...form, studentsParticipated: e.target.value })}
              placeholder={String(activity.enrolledCount ?? "")}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          Student Lead: {studentLead?.name} ({studentLead?.id}) — auto-filled from your account.
        </p>
      </section>

      {/* Poster + Permission letter */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-gray-900">Poster &amp; Permission Letter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <UploadSlot
            label="Activity Poster"
            hint="Portrait, 3:4 ratio (e.g. 900x1200px) — should include event name, venue, and date/time."
            url={form.posterUrl}
            uploading={uploadingKey === "poster"}
            aspect="w-64 h-auto aspect-[3/4]"
            onUpload={async (file) => {
              const url = await uploadFile(file, "poster");
              if (url) setForm((p) => ({ ...p, posterUrl: url }));
            }}
            onRemove={() => setForm((p) => ({ ...p, posterUrl: "" }))}
          />
          <UploadSlot
            label="Permission Letter"
            hint="Scanned copy of the signed permission letter. Portrait, A4-like ratio (roughly 1:1.4)."
            url={form.permissionLetterUrl}
            uploading={uploadingKey === "permission"}
            aspect="w-64 h-auto"
            onUpload={async (file) => {
              const url = await uploadFile(file, "permission");
              if (url) setForm((p) => ({ ...p, permissionLetterUrl: url }));
            }}
            onRemove={() => setForm((p) => ({ ...p, permissionLetterUrl: "" }))}
          />
        </div>
      </section>

      {/* Description */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-gray-900">Description</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">1. Activity Overview</label>
          <p className="text-[11px] text-gray-400 mb-1.5">What the activity was, why it was organized, who organized it, the overall purpose.</p>
          <textarea rows={4} value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">2. Objectives</label>
          <p className="text-[11px] text-gray-400 mb-1.5">Press Enter for a new bullet point.</p>
          <BulletListInput
            value={form.objectives}
            onChange={(v) => setForm({ ...form, objectives: v })}
            placeholder="Enhance practical knowledge."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">3. Activity Proceedings</label>
          <p className="text-[11px] text-gray-400 mb-1.5">Describe the activity in chronological order — registration, welcome address, sessions, closing remarks, etc. This is the most important section.</p>
          <textarea rows={8} value={form.proceedings} onChange={(e) => setForm({ ...form, proceedings: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">4. Key Highlights</label>
          <p className="text-[11px] text-gray-400 mb-1.5">Press Enter for a new bullet point.</p>
          <BulletListInput
            value={form.keyHighlights}
            onChange={(v) => setForm({ ...form, keyHighlights: v })}
            placeholder="Active participation from students."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">5. Learning Outcomes</label>
          <p className="text-[11px] text-gray-400 mb-1.5">Press Enter for a new bullet point. Realistic outcomes, not exaggerated impact.</p>
          <BulletListInput
            value={form.learningOutcomes}
            onChange={(v) => setForm({ ...form, learningOutcomes: v })}
            placeholder="Improved understanding of the subject."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">6. Conclusion</label>
          <textarea rows={3} value={form.conclusion} onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400" />
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">Activity Gallery</h2>
        <p className="text-[11px] text-gray-400">Exactly {MAX_GALLERY} photos required, geo-tagged if possible. Each photo will show the SAC logo and your club name as a footer.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {form.gallery.map((item, idx) => (
            <div key={idx} className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={`Gallery ${idx + 1}`} className="w-64 h-48 object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }))}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600"
              >
                <FiX size={13} />
              </button>
            </div>
          ))}
          {form.gallery.length < MAX_GALLERY && (
            <UploadSlot
              label={`Photo ${form.gallery.length + 1}`}
              hint="Landscape works best, roughly 4:3."
              url=""
              uploading={uploadingKey === "gallery"}
              onUpload={async (file) => {
                const url = await uploadFile(file, "gallery");
                if (url) setForm((p) => ({ ...p, gallery: [...p.gallery, { url }] }));
              }}
            />
          )}
        </div>
      </section>

      {/* Attendance sheets */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">List of Participants</h2>
        <p className="text-[11px] text-gray-400">Upload scanned copies of the physical attendance sheet(s), up to {MAX_ATTENDANCE_SHEETS}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {form.attendanceSheets.map((url, idx) => (
            <div key={idx} className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Attendance sheet ${idx + 1}`} className="w-64 h-auto rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, attendanceSheets: p.attendanceSheets.filter((_, i) => i !== idx) }))}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600"
              >
                <FiX size={13} />
              </button>
            </div>
          ))}
          {showAttendanceSlot && form.attendanceSheets.length < MAX_ATTENDANCE_SHEETS && (
            <UploadSlot
              label={`Attendance Sheet ${form.attendanceSheets.length + 1}`}
              hint="Portrait, A4-like ratio (roughly 1:1.4)."
              url=""
              uploading={uploadingKey === "attendance"}
              onUpload={async (file) => {
                const url = await uploadFile(file, "attendance");
                if (url) {
                  setForm((p) => ({ ...p, attendanceSheets: [...p.attendanceSheets, url] }));
                  setShowAttendanceSlot(false);
                }
              }}
            />
          )}
        </div>
        {!showAttendanceSlot && form.attendanceSheets.length < MAX_ATTENDANCE_SHEETS && (
          <button
            type="button"
            onClick={() => setShowAttendanceSlot(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <FiPlus size={13} /> Add another sheet
          </button>
        )}
      </section>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-end gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || generating}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave /> {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || saving}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            <FiDownload /> {generating ? "Generating…" : "Generate Report (PDF)"}
          </button>
        </div>
      </div>
    </div>
  );
}
