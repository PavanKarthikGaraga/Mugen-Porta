"use client";

import { useState, useEffect } from "react";
import {
  FiSearch, FiAward, FiStar, FiCheckCircle, FiUser, FiZap, FiLoader,
  FiFileText, FiAlertTriangle, FiExternalLink,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "Technology & Emerging Technologies",
  LCH: "Liberal Arts, Culture and Heritage",
  ESO: "Extension & Social Outreach",
  IIE: "Innovation & Entrepreneurship",
  HWB: "Health & Well-being",
};

export default function AdminAwardPage() {
  const [studentId, setStudentId] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [student, setStudent] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"badge" | "points" | "certificate">("badge");

  // Certificate state — activity chosen by domain → category → activity
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [certDomain, setCertDomain] = useState("");
  const [certCategory, setCertCategory] = useState("");
  const [certActivity, setCertActivity] = useState("");
  const [certStatus, setCertStatus] = useState<any>(null);
  const [checkingCert, setCheckingCert] = useState(false);
  const [issuingCert, setIssuingCert] = useState(false);
  const [issuedCert, setIssuedCert] = useState<any>(null);

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

    // Catalogue drives the domain → category → activity pickers.
    fetch("/api/activities")
      .then(res => res.json())
      .then(data => { if (data.success) setCatalogue(data.data || []); })
      .catch(err => console.error("Failed to load activities", err));
  }, []);

  // Derived option lists for the cascading selects.
  const certDomains = Array.from(new Set(catalogue.map((a: any) => a.domain).filter(Boolean))).sort() as string[];
  const certCategories = Array.from(new Set(
    catalogue.filter((a: any) => !certDomain || a.domain === certDomain)
             .map((a: any) => a.category).filter(Boolean)
  )).sort() as string[];
  const certActivities = catalogue.filter((a: any) =>
    (!certDomain || a.domain === certDomain) && (!certCategory || a.category === certCategory)
  );
  const selectedActivity = catalogue.find((a: any) => a.code === certActivity);

  // Whenever the student or activity changes, check for an existing
  // certificate and the student's enrollment state before issuing.
  useEffect(() => {
    setIssuedCert(null);
    setCertStatus(null);
    if (!student?.username || !certActivity) return;
    setCheckingCert(true);
    fetch(`/api/dashboard/admin/samam/award-certificate?username=${encodeURIComponent(student.username)}&code=${encodeURIComponent(certActivity)}`)
      .then(res => res.json())
      .then(data => { if (data.success) setCertStatus(data); })
      .catch(() => { /* the issue call reports failures anyway */ })
      .finally(() => setCheckingCert(false));
  }, [student?.username, certActivity]);

  const handleIssueCertificate = async () => {
    if (!certActivity) return toast.error("Please select an activity");
    setIssuingCert(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/award-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: student.username, activityCode: certActivity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || data.error || "Failed to issue certificate");
        return;
      }
      setIssuedCert(data);
      if (data.alreadyIssued) toast.info(data.message);
      else toast.success(data.message);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIssuingCert(false);
    }
  };

  const fetchStudent = async (id: string) => {
    if (!id.trim()) return;

    setLoadingStudent(true);
    setStudent(null);
    try {
      const res = await fetch(`/api/dashboard/student/profile/${id.trim()}`);
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

  const handleFetchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchStudent(studentId);
  };

  // Deep-link support: /dashboard/admin/samam/award?student=<username>&tab=points|badge
  // lets other pages (e.g. a student's quick-action buttons) jump straight
  // here with the student pre-loaded, instead of requiring a manual re-search.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillId = params.get("student");
    const prefillTab = params.get("tab");
    if (prefillId) {
      setStudentId(prefillId);
      fetchStudent(prefillId);
    }
    if (prefillTab === "points" || prefillTab === "badge" || prefillTab === "certificate") {
      setActiveTab(prefillTab);
    }
  }, []);

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
            <button
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'certificate' ? 'text-gray-900 border-b-2 border-red-600 bg-gray-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('certificate')}
            >
              <FiFileText /> Issue Certificate
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
            ) : activeTab === 'points' ? (
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
                      <option value="LCH">LCH - Liberal Arts, Culture and Heritage</option>
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
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Narrow down by domain and category, then pick the activity. The certificate is
                  issued immediately and appears in the student&apos;s certificates wallet with a
                  verifiable link.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Domain</label>
                    <select
                      value={certDomain}
                      onChange={(e) => { setCertDomain(e.target.value); setCertCategory(""); setCertActivity(""); }}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
                    >
                      <option value="">All domains</option>
                      {certDomains.map((d) => (
                        <option key={d} value={d}>{d} — {DOMAIN_NAMES[d] || d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Category</label>
                    <select
                      value={certCategory}
                      onChange={(e) => { setCertCategory(e.target.value); setCertActivity(""); }}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
                    >
                      <option value="">All categories</option>
                      {certCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Activity <span className="text-gray-400 normal-case font-normal">({certActivities.length})</span>
                    </label>
                    <select
                      value={certActivity}
                      onChange={(e) => setCertActivity(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
                    >
                      <option value="">-- Choose an activity --</option>
                      {certActivities.map((a: any) => (
                        <option key={a.code} value={a.code}>{a.code} — {a.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedActivity && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-[10px] font-mono text-gray-400">{selectedActivity.code}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedActivity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {[selectedActivity.category, selectedActivity.domain,
                        selectedActivity.sdc_credits ? `${selectedActivity.sdc_credits} SAMAM Points` : null]
                        .filter(Boolean).join("  ·  ")}
                    </p>
                  </div>
                )}

                {checkingCert && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FiLoader className="animate-spin" size={12} /> Checking existing certificates…
                  </p>
                )}

                {/* Existing certificate — issuing again would be a no-op */}
                {certStatus?.existing && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-2.5">
                    <FiAlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={15} />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-semibold">This student already has a certificate for this activity.</p>
                      <p className="mt-0.5">
                        ID <span className="font-mono">{certStatus.existing.verificationId}</span>. Issuing again
                        will not create a duplicate.
                      </p>
                    </div>
                  </div>
                )}

                {/* Manual issuance bypasses the usual completed-enrollment rule,
                    so make the actual state visible before the admin commits. */}
                {certStatus && !certStatus.existing && certStatus.enrollmentStatus !== 'completed' && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-2.5">
                    <FiAlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={15} />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-semibold">
                        {certStatus.enrollmentStatus
                          ? `This student's enrollment is "${certStatus.enrollmentStatus}", not completed.`
                          : "This student is not enrolled in this activity."}
                      </p>
                      <p className="mt-0.5">
                        Leads can only issue for completed enrollments. As an admin you can still issue
                        manually — just confirm this is intended.
                      </p>
                    </div>
                  </div>
                )}

                {certStatus && !certStatus.existing && certStatus.enrollmentStatus === 'completed' && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-2.5">
                    <FiCheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={15} />
                    <p className="text-xs text-emerald-800">
                      Enrollment is marked completed — this student is eligible.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleIssueCertificate}
                  disabled={issuingCert || !certActivity}
                  className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: BRAND }}
                >
                  {issuingCert
                    ? <FiLoader className="animate-spin" />
                    : <><FiFileText /> Issue Certificate to {student.name}</>}
                </button>

                {issuedCert && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                      <FiCheckCircle size={15} />
                      {issuedCert.alreadyIssued ? "Certificate already existed" : "Certificate issued"}
                    </p>
                    <p className="text-xs text-emerald-800 mt-1 font-mono break-all">{issuedCert.verificationId}</p>
                    <a
                      href={issuedCert.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline mt-2"
                    >
                      <FiExternalLink size={12} /> Open verification page
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
