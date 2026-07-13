"use client";
import { FiAward, FiStar, FiClock } from "react-icons/fi";
import { BRAND, RARITY_COLORS } from "./SharedUI";
import { Field } from "./SharedUI";

export default function BadgeManager({
  badgeCatalog, pointsForm, setPointsForm, badgeForm, setBadgeForm,
  awardPoints, awardBadge, awardHistory, awardLoading
}: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ backgroundColor: "#D97706" }}>
                <FiStar size={12} />
              </span>
              Manual Point Award
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username">
                <input value={pointsForm.username} onChange={e => setPointsForm({ ...pointsForm, username: e.target.value })}
                  placeholder="e.g. 230003299" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </Field>
              <Field label="Points">
                <input type="number" value={pointsForm.points} onChange={e => setPointsForm({ ...pointsForm, points: e.target.value })}
                  placeholder="e.g. 5" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Domain">
                <select value={pointsForm.domain} onChange={e => setPointsForm({ ...pointsForm, domain: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white">
                  <option value="TEC">Technology (TEC)</option>
                  <option value="LCH">Literary & Cultural (LCH)</option>
                  <option value="ESO">Extension (ESO)</option>
                  <option value="IIE">Innovation (IIE)</option>
                  <option value="HWB">Health & Wellness (HWB)</option>
                </select>
              </Field>
              <Field label="Category">
                <select value={pointsForm.category} onChange={e => setPointsForm({ ...pointsForm, category: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white">
                  <option value="admin_award">Admin Discretion</option>
                  <option value="competition">Competition Win</option>
                  <option value="contribution">Special Contribution</option>
                </select>
              </Field>
            </div>
            <Field label="Reason / Description">
              <textarea value={pointsForm.reason} onChange={e => setPointsForm({ ...pointsForm, reason: e.target.value })}
                placeholder="Reason for awarding points..." rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none" />
            </Field>
            <button onClick={awardPoints} disabled={awardLoading || !pointsForm.username || !pointsForm.points}
              className="w-full h-10 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              style={{ backgroundColor: "#D97706" }}>
              <FiStar size={14} /> Grant Points
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded flex items-center justify-center text-white" style={{ backgroundColor: "#7C3AED" }}>
                <FiAward size={12} />
              </span>
              Manual Badge Award
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username">
                <input value={badgeForm.username} onChange={e => setBadgeForm({ ...badgeForm, username: e.target.value })}
                  placeholder="e.g. 230003299" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              </Field>
              <Field label="Badge">
                <select value={badgeForm.badge_id} onChange={e => setBadgeForm({ ...badgeForm, badge_id: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white">
                  <option value="">Select a badge...</option>
                  {badgeCatalog.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.rarity})</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Reason / Comment">
              <input value={badgeForm.reason} onChange={e => setBadgeForm({ ...badgeForm, reason: e.target.value })}
                placeholder="Why are they receiving this?" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            </Field>
            <button onClick={awardBadge} disabled={awardLoading || !badgeForm.username || !badgeForm.badge_id}
              className="w-full h-10 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              style={{ backgroundColor: "#7C3AED" }}>
              <FiAward size={14} /> Grant Badge
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FiClock className="text-gray-400" /> Recent Admin Awards
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {awardHistory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No recent awards this session</p>
          ) : (
            <div className="space-y-2">
              {awardHistory.map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: h.type === "points" ? "#D9770620" : "#7C3AED20", color: h.type === "points" ? "#D97706" : "#7C3AED" }}>
                    {h.type === "points" ? <FiStar size={14} /> : <FiAward size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {h.type === "points" ? `+${h.points} ${h.domain} Points` : `Badge Granted`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5"><span className="font-semibold text-gray-700">{h.username}</span> • {h.reason || "No reason"}</p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 bg-white px-2 py-1 rounded border border-gray-100">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
