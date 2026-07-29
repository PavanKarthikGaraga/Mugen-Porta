"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FiUser, FiMail, FiBookOpen, FiGithub, FiLinkedin, FiGlobe, FiSave,
  FiAward, FiX, FiPlus, FiAlertCircle,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

// Reads and writes through the existing passport endpoint, which owns the
// student_profiles row. Its PUT replaces the profile columns wholesale, so we
// always merge edits into the full object loaded from GET — sending a partial
// object here would blank out fields owned by the Excellence Passport page
// (skills, cgpa, banner, timeline).
const API = "/api/dashboard/student/passport";

const inputClass =
  "w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:border-transparent";

function isProbablyUrl(value: string) {
  if (!value.trim()) return true; // empty is fine — the field is optional
  return /^https?:\/\/.+\..+/i.test(value.trim());
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // The complete profile row as loaded, so unmanaged columns survive a save.
  const [baseProfile, setBaseProfile] = useState<any>(null);
  // Read-only identity fields sourced from the `students` table.
  const [identity, setIdentity] = useState({ name: "", email: "", branch: "", year: "", username: "" });

  const [form, setForm] = useState({
    tagline: "", about: "", github_url: "", linkedin_url: "", portfolio_url: "",
    cgpa: "", graduation_year: "", avatar_url: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      const p = data.profile || {};

      setBaseProfile(p);
      setIdentity({
        name: p.name || p.username || "",
        email: p.email || "",
        branch: p.branch || "",
        year: p.student_year ? `Year ${p.student_year}` : "",
        username: p.username || "",
      });
      setForm({
        tagline: p.tagline || "",
        about: p.about || "",
        github_url: p.github_url || "",
        linkedin_url: p.linkedin_url || "",
        portfolio_url: p.portfolio_url || "",
        cgpa: p.cgpa != null ? String(p.cgpa) : "",
        graduation_year: p.graduation_year != null ? String(p.graduation_year) : "",
        avatar_url: p.avatar_url || "",
      });
      setSkills(Array.isArray(p.skills) ? p.skills : []);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      toast.error(`"${s}" is already listed`);
      return;
    }
    setSkills((prev) => [...prev, s]);
    setSkillDraft("");
  };

  const handleSave = async () => {
    const urlFields: [string, string][] = [
      ["GitHub", form.github_url],
      ["LinkedIn", form.linkedin_url],
      ["Portfolio", form.portfolio_url],
    ];
    const badUrl = urlFields.find(([, v]) => !isProbablyUrl(v));
    if (badUrl) {
      toast.error(`${badUrl[0]} must be a full URL starting with https://`);
      return;
    }
    if (form.cgpa && (Number(form.cgpa) < 0 || Number(form.cgpa) > 10)) {
      toast.error("CGPA must be between 0 and 10");
      return;
    }

    setSaving(true);
    try {
      // Merge over the loaded row so passport-owned fields aren't cleared.
      const profile = {
        ...baseProfile,
        tagline: form.tagline.trim() || null,
        about: form.about.trim() || null,
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
        cgpa: form.cgpa === "" ? null : Number(form.cgpa),
        graduation_year: form.graduation_year === "" ? null : Number(form.graduation_year),
        avatar_url: form.avatar_url || null,
        skills,
      };

      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || data.message || "Could not save your profile");
        return;
      }
      setBaseProfile(profile);
      toast.success("Profile saved");
    } catch (e) {
      toast.error("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/r2", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        set("avatar_url", data.url);
        toast.success("Avatar uploaded — click Save Changes to keep it");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <FiAlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Couldn&apos;t load your profile</p>
        <p className="text-xs text-gray-500 mt-1">Please refresh the page, or try again in a moment.</p>
      </div>
    );
  }

  const initials = (identity.name || "?")
    .split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your personal and academic information.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: BRAND }}
        >
          <FiSave /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar & identity (read-only, owned by the students record) */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-4 h-fit">
          <label className="cursor-pointer relative group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <div className={`w-24 h-24 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-zinc-400 border-4 border-white dark:border-zinc-950 shadow-md overflow-hidden ${uploading ? "opacity-50" : ""}`}>
              {form.avatar_url ? (
                <Image src={form.avatar_url} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
              ) : (
                initials
              )}
            </div>
            {!uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <span className="text-white text-xs font-semibold">Change</span>
              </div>
            )}
          </label>
          {uploading && <p className="text-xs text-blue-500 animate-pulse">Uploading…</p>}

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{identity.name || "—"}</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{identity.branch || "Branch not set"}</p>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-zinc-800" />

          <div className="w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400 break-all">
              <FiMail className="flex-shrink-0" /> {identity.email || "No email on record"}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
              <FiBookOpen className="flex-shrink-0" /> {identity.year || "Year not set"}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
              <FiUser className="flex-shrink-0" /> {identity.username}
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Name, ID, branch and email come from your official student record. Contact the SAC office if any of these are wrong.
          </p>
        </div>

        {/* Editable fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiUser className="text-gray-400" /> Personal Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Tagline</label>
                <input
                  type="text" value={form.tagline} maxLength={120}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="e.g. Builder · Thinker · Change Agent"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">About</label>
                <textarea
                  rows={4} value={form.about} maxLength={1000}
                  onChange={(e) => set("about", e.target.value)}
                  placeholder="A short introduction — your interests, what you're working towards."
                  className={`${inputClass} resize-none`}
                />
                <p className="text-[10px] text-gray-400 text-right">{form.about.length}/1000</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">CGPA</label>
                  <input
                    type="number" step="0.01" min="0" max="10" value={form.cgpa}
                    onChange={(e) => set("cgpa", e.target.value)}
                    placeholder="8.70" className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Graduation Year</label>
                  <input
                    type="number" min="2000" max="2100" value={form.graduation_year}
                    onChange={(e) => set("graduation_year", e.target.value)}
                    placeholder="2027" className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiAward className="text-gray-400" /> Skills
            </h3>
            <div className="flex gap-2">
              <input
                type="text" value={skillDraft} maxLength={40}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Add a skill and press Enter"
                className={inputClass}
              />
              <button
                onClick={addSkill}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                <FiPlus size={13} /> Add
              </button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300">
                    {s}
                    <button
                      onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${s}`}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No skills added yet. These appear on your Excellence Passport.</p>
            )}
          </div>

          {/* Web profiles */}
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiGlobe className="text-gray-400" /> Web Profiles
            </h3>
            <div className="space-y-3">
              {[
                { key: "github_url",    Icon: FiGithub,   placeholder: "https://github.com/username" },
                { key: "linkedin_url",  Icon: FiLinkedin, placeholder: "https://linkedin.com/in/username" },
                { key: "portfolio_url", Icon: FiGlobe,    placeholder: "https://yourportfolio.com" },
              ].map(({ key, Icon, placeholder }) => {
                const value = (form as any)[key] as string;
                const invalid = !isProbablyUrl(value);
                return (
                  <div key={key}>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text" value={value}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={placeholder}
                        className={`${inputClass} pl-9 ${invalid ? "border-red-300 dark:border-red-800" : ""}`}
                      />
                    </div>
                    {invalid && <p className="text-[10px] text-red-500 mt-1">Enter a full URL starting with https://</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
