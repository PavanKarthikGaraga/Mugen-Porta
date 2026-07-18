"use client";
import { useState } from "react";
import { FiSend, FiInfo, FiAlertTriangle, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import { BRAND } from "./SharedUI";

export default function NotificationsManager() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [target, setTarget] = useState("all");
  const [targetUser, setTargetUser] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please provide a title and message.");
      return;
    }

    if (target === "specific" && !targetUser.trim()) {
      toast.error("Please specify a target username.");
      return;
    }

    setSending(true);
    try {
      const payload = {
        title,
        message,
        type,
        target: target === "all" ? "all" : targetUser.trim()
      };

      const res = await fetch("/api/dashboard/admin/samam/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        setTitle("");
        setMessage("");
        setTargetUser("");
      } else {
        toast.error(data.message || "Failed to send notification.");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
        <FiInfo size={20} className="mt-0.5 flex-shrink-0" />
        <div className="text-[13px] leading-relaxed">
          <p className="font-semibold mb-1">Broadcast Notifications</p>
          <p>Send real-time alerts and updates directly to students&apos; dashboards. Broadcasts sent to &quot;All Students&quot; may take a moment to process.</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Notification Title <span className="text-red-500">*</span></label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g., Registrations Closing Soon!"
              className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              required 
            />
          </div>
          
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Enter the full announcement details here..."
              className="w-full min-h-[100px] p-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 resize-y"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Type</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              >
                <option value="system">System (Info)</option>
                <option value="alert">Alert (Warning)</option>
                <option value="success">Success (Positive)</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target Audience</label>
              <select 
                value={target} 
                onChange={e => setTarget(e.target.value)}
                className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
              >
                <option value="all">All Students</option>
                <option value="specific">Specific Student</option>
              </select>
            </div>
          </div>

          {target === "specific" && (
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Student Username <span className="text-red-500">*</span></label>
              <input 
                value={targetUser} 
                onChange={e => setTargetUser(e.target.value)} 
                placeholder="e.g., 23A91A0501"
                className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                required={target === "specific"} 
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button 
            type="submit"
            disabled={sending}
            className="h-10 px-6 text-[13px] font-medium rounded-md text-white flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {sending ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSend size={14} />}
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
}
