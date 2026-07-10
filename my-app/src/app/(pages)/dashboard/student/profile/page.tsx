"use client";

import { useState } from "react";
import { FiUser, FiMail, FiBookOpen, FiMapPin, FiGithub, FiLinkedin, FiGlobe, FiSave } from "react-icons/fi";
import { toast } from "sonner";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage your personal and academic information.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
          style={{ backgroundColor: "rgb(151,0,3)" }}
        >
          <FiSave /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar & Quick Info */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center space-y-4 h-fit">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-zinc-400 border-4 border-white dark:border-zinc-950 shadow-md">
            ST
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Arjun Sharma</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Computer Science & Engineering</p>
          </div>
          <div className="w-full h-px bg-gray-100 dark:bg-zinc-800" />
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
              <FiMail /> arjun@kluniversity.in
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
              <FiBookOpen /> Year 3 · Sem 6
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
              <FiMapPin /> Vijayawada Campus
            </div>
          </div>
        </div>

        {/* Editable Form Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiUser className="text-gray-400" /> Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">First Name</label>
                <input type="text" defaultValue="Arjun" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Last Name</label>
                <input type="text" defaultValue="Sharma" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Tagline / Bio</label>
                <textarea rows={2} defaultValue="Aspiring AI Engineer passionate about scalable systems." className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FiGlobe className="text-gray-400" /> Web Profiles
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="github.com/username" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
              <div className="relative">
                <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="linkedin.com/in/username" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
