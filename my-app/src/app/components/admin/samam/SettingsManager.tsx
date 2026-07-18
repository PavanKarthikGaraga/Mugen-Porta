"use client";
import { useState, useEffect } from "react";
import { FiSettings, FiSave, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "./SharedUI";

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [controls, setControls] = useState({ registrations_enabled: true });

  useEffect(() => {
    fetch("/api/dashboard/admin/samam/controls")
      .then(r => r.json())
      .then(d => {
        if (d.success) setControls({ registrations_enabled: Boolean(d.controls.registrations_enabled) });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(controls)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-[13px] text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiSettings size={16} className="text-gray-400" />
          Global System Controls
        </h3>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-gray-900">Student Registrations</p>
              <p className="text-[12px] text-gray-500 mt-1 max-w-sm leading-relaxed">
                Allow new students to register on the platform. Disabling this will prevent any new signups across the entire system.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={controls.registrations_enabled}
                onChange={(e) => setControls({ ...controls, registrations_enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {!controls.registrations_enabled && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-[12px] flex gap-2 items-start">
              <FiAlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p>Warning: New users will not be able to create accounts while registrations are disabled.</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-6 text-[13px] font-medium rounded-md text-white flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            <FiSave size={14} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
