"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiAward, FiStar, FiCheckCircle, FiUser, FiZap, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

export default function AdminAwardPage() {
  const [studentId, setStudentId] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [student, setStudent] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"badge" | "points">("badge");

  // Badge state
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [badgeReason, setBadgeReason] = useState("");
  const [awardingBadge, setAwardingBadge] = useState(false);

  // Points state
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsDomain, setPointsDomain] = useState("TEC");
  const [pointsReason, setPointsReason] = useState("");
  const [pointsCategory, setPointsCategory] = useState("Manual Assignment");
  const [awardingPoints, setAwardingPoints] = useState(false);

  useEffect(() => {
    // Fetch available badges
    fetch("/api/dashboard/admin/samam/award-badge")
      .then(res => res.json())
      .then(data => {
        if (data.badges) setBadges(data.badges);
      })
      .catch(err => console.error("Failed to load badges", err));
  }, []);

  const handleFetchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    
    setLoadingStudent(true);
    setStudent(null);
    try {
      const res = await fetch(`/api/dashboard/student/profile/${studentId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      } else {
        toast.error("Student not found");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge) return toast.error("Please select a badge");
    
    setAwardingBadge(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/award-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: student.username,
          badge_id: selectedBadge,
          reason: badgeReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Badge awarded successfully!");
        setSelectedBadge("");
        setBadgeReason("");
      } else {
        toast.error(data.message || data.error || "Failed to award badge");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setAwardingBadge(false);
    }
  };

  const handleAwardPoints = async () => {
    if (!pointsAmount || isNaN(Number(pointsAmount))) return toast.error("Enter a valid amount");
    
    setAwardingPoints(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/award-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: student.username,
          domain: pointsDomain,
          credits: Number(pointsAmount),
          category: pointsCategory,
          description: pointsReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Points awarded successfully!");
        setPointsAmount("");
        setPointsReason("");
      } else {
        toast.error(data.message || data.error || "Failed to award points");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setAwardingPoints(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl flex-shrink-0">
          <FiAward />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Award Badges & Points</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manually assign digital badges or SAMAM points to a specific student by entering their university ID.
          </p>
        </div>
      </div>

      {/* Step 1: Find Student */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs">1</span>
          Find Student
        </h2>
        
        <form onSubmit={handleFetchStudent} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Student ID (e.g. 2400000000)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loadingStudent || !studentId.trim()}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loadingStudent ? <FiLoader className="animate-spin" /> : "Fetch Student"}
          </button>
        </form>

        {student && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg">
                <FiUser />
              </div>
              <div>
                <p className="font-bold text-emerald-900">{student.name}</p>
                <p className="text-xs text-emerald-700">{student.username} • {student.clubName || 'No Club'} • {student.branch}</p>
              </div>
            </div>
            <FiCheckCircle className="text-emerald-500 text-2xl" />
          </div>
        )}
      </div>

      {/* Step 2: Award Action (Only show if student is found) */}
      {student && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button 
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'badge' ? 'text-gray-900 border-b-2 border-red-600 bg-gray-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('badge')}
            >
              <FiAward /> Award Digital Badge
            </button>
            <button 
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'points' ? 'text-gray-900 border-b-2 border-red-600 bg-gray-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('points')}
            >
              <FiStar /> Award SAMAM Points
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'badge' ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Select Badge</label>
                  <select 
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                  >
                    <option value="">-- Choose a Badge --</option>
                    {badges.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.domain} - {b.rarity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reason / Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Winner of internal hackathon"
                    value={badgeReason}
                    onChange={(e) => setBadgeReason(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  onClick={handleAwardBadge}
                  disabled={awardingBadge || !selectedBadge}
                  className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: BRAND }}
                >
                  {awardingBadge ? <FiLoader className="animate-spin" /> : <><FiAward /> Award Badge to {student.name}</>}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Points Amount</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Domain</label>
                    <select 
                      value={pointsDomain}
                      onChange={(e) => setPointsDomain(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                    >
                      <option value="TEC">TEC - Technical</option>
                      <option value="LCH">LCH - Literary & Cultural</option>
                      <option value="ESO">ESO - Extension & Social</option>
                      <option value="IIE">IIE - Innovation</option>
                      <option value="HWB">HWB - Health</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Competition"
                      value={pointsCategory}
                      onChange={(e) => setPointsCategory(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. First place in coding contest"
                      value={pointsReason}
                      onChange={(e) => setPointsReason(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAwardPoints}
                  disabled={awardingPoints || !pointsAmount}
                  className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: BRAND }}
                >
                  {awardingPoints ? <FiLoader className="animate-spin" /> : <><FiStar /> Award Points to {student.name}</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
