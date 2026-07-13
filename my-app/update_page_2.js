const fs = require('fs');
const path = './src/app/(pages)/dashboard/admin/samam/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new state variables for filtering
content = content.replace(
  `  const [actSearchStr, setActSearchStr] = useState("");`,
  `  const [actSearchStr, setActSearchStr] = useState("");
  const [filterActDomain, setFilterActDomain] = useState("");
  const [filterActDifficulty, setFilterActDifficulty] = useState("");
  const [filterActJourney, setFilterActJourney] = useState("");
  const [filterActPack, setFilterActPack] = useState("");
  const [filterActFaculty, setFilterActFaculty] = useState("");`
);

// 2. Update initial state of activityForm
content = content.replace(
  `title: "", description: "", domain: "TEC", activity_type: "event", points: "", max_participants: "", is_active: true,`,
  `code: "", title: "", description: "", domain: "TEC", activity_type: "event", points: "", max_participants: "", is_active: true, difficulty: "Beginner", journey_level: "Explorer", activity_pack: "", faculty_name: "", sdgs: [], hours: ""`
);

// 3. Update the filteredActivities logic
content = content.replace(
  `  const filteredActivities = activities.filter(a =>
    !actSearchStr || a.title?.toLowerCase().includes(actSearchStr.toLowerCase())
  );`,
  `  const filteredActivities = activities.filter(a => {
    let match = true;
    if (actSearchStr) match = match && (a.title?.toLowerCase().includes(actSearchStr.toLowerCase()) || a.code?.toLowerCase().includes(actSearchStr.toLowerCase()));
    if (filterActDomain) match = match && a.domain === filterActDomain;
    if (filterActDifficulty) match = match && a.difficulty === filterActDifficulty;
    if (filterActJourney) match = match && a.journey_level === filterActJourney;
    if (filterActPack) match = match && a.activity_pack === filterActPack;
    if (filterActFaculty) match = match && a.faculty_name === filterActFaculty;
    return match;
  });`
);

// We need to replace the entire chunk for Activities tab and Modal.
const tabStartStr = `{/* ═══ TAB: ACTIVITIES ══════════════════════════════════════════ */}`;
const modalEndStr = `</Modal>
      )}`;

const startIdx = content.indexOf(tabStartStr);
const endIdx = content.indexOf(modalEndStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newChunk = `{/* ═══ TAB: ACTIVITIES ══════════════════════════════════════════ */}
      {tab === "activities" && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              {(filterActDomain || filterActDifficulty || filterActJourney || filterActPack || filterActFaculty) && (
                <button onClick={() => { setFilterActDomain(""); setFilterActDifficulty(""); setFilterActJourney(""); setFilterActPack(""); setFilterActFaculty(""); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all filters</button>
              )}
            </div>

            <div className="space-y-4">
              <Field label="DOMAIN">
                <select value={filterActDomain} onChange={e => setFilterActDomain(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none">
                  <option value="">All</option>
                  {["TEC","LCH","ESO","IIE","HWB"].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="DIFFICULTY">
                <select value={filterActDifficulty} onChange={e => setFilterActDifficulty(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none">
                  <option value="">All</option>
                  {["Beginner","Intermediate","Advanced"].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="JOURNEY LEVEL">
                <select value={filterActJourney} onChange={e => setFilterActJourney(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none">
                  <option value="">All</option>
                  {["Explorer","Foundation","Practitioner","Leader","Fellow"].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="ACTIVITY PACK">
                <select value={filterActPack} onChange={e => setFilterActPack(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none">
                  <option value="">All</option>
                  {Array.from(new Set(activities.map(a => a.activity_pack).filter(Boolean))).map(d => <option key={d as string}>{d}</option>)}
                </select>
              </Field>
              <Field label="FACULTY">
                <select value={filterActFaculty} onChange={e => setFilterActFaculty(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none">
                  <option value="">All</option>
                  {Array.from(new Set(activities.map(a => a.faculty_name).filter(Boolean))).map(d => <option key={d as string}>{d}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="relative w-64 max-w-full">
                <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={actSearchStr} onChange={e => setActSearchStr(e.target.value)}
                  placeholder="Search by name, code..."
                  className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchActivities}
                  className="h-9 px-3 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                  <FiRefreshCw size={13} /> Refresh
                </button>
                <button
                  onClick={() => { setEditingActivity(null); setActivityForm({ code:"", title:"",description:"",domain:"TEC",activity_type:"event",points:"",max_participants:"",is_active:true, difficulty: "Beginner", journey_level: "Explorer", activity_pack: "", faculty_name: "", sdgs: [], hours: "" }); setShowActivityModal(true); }}
                  className="h-9 px-4 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5" style={{ backgroundColor: BRAND }}>
                  <FiPlus size={13} /> New Activity
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500 font-semibold">
                <span>{filteredActivities.length} results</span>
              </div>
              <div className="overflow-x-auto">
                {activitiesLoading ? (
                  <div className="p-4 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}</div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <FiActivity size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No activities found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredActivities.map(a => (
                      <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                        {/* Domain Icon & Code */}
                        <div className="flex-shrink-0 text-center w-16">
                           <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white mb-1 shadow-sm" style={{ backgroundColor: DOMAIN_COLORS[a.domain] || BRAND }}>
                              {DOMAIN_ICONS[a.domain] || <FiActivity />}
                           </div>
                           <p className="text-[10px] font-bold text-gray-500">{a.domain}</p>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-500 border border-gray-200 bg-white">{a.difficulty || "Beginner"}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: LEVEL_COLORS[a.journey_level] || "#6B7280" }}>• {a.journey_level || "Explorer"}</span>
                              {a.code && <span className="text-[10px] font-bold text-gray-400">{a.code}</span>}
                           </div>
                           <h4 className="text-sm font-bold text-gray-900 truncate">{a.title}</h4>
                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                           
                           <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1 font-semibold text-gray-700"><FiStar className="text-amber-500" /> {a.points} SDC</span>
                              {a.hours > 0 && <span className="flex items-center gap-1"><FiClock /> {a.hours}h</span>}
                              {a.faculty_name && <span className="flex items-center gap-1"><FiUser /> {a.faculty_name}</span>}
                              <span className="flex items-center gap-1"><FiUsers /> {a.participant_count || 0}{a.max_participants ? "/" + a.max_participants : ""}</span>
                           </div>
                        </div>

                        {/* SDGs & Actions */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-3 w-full md:w-auto">
                           {a.sdgs && Array.isArray(a.sdgs) && a.sdgs.length > 0 && (
                             <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                                {a.sdgs.map((sdg: string) => (
                                  <span key={sdg} className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-100">{sdg}</span>
                                ))}
                             </div>
                           )}
                           <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingActivity(a);
                                  setActivityForm({ code: a.code||"", title: a.title, description: a.description || "", domain: a.domain, activity_type: a.activity_type, points: String(a.points), max_participants: String(a.max_participants || ""), is_active: !!a.is_active, difficulty: a.difficulty||"Beginner", journey_level: a.journey_level||"Explorer", activity_pack: a.activity_pack||"", faculty_name: a.faculty_name||"", sdgs: a.sdgs||[], hours: a.hours||"" });
                                  setShowActivityModal(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors">
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => deleteActivity(a.id)}
                                className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors">
                                <FiTrash2 size={14} />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Create/Edit Modal */}
      {showActivityModal && (
        <Modal title={editingActivity ? "Edit Activity" : "Create New Activity"} onClose={() => setShowActivityModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <Field label="Activity Code *">
                 <input value={activityForm.code} onChange={e => setActivityForm(p => ({ ...p, code: e.target.value }))}
                   className={inputCls} placeholder="e.g. TEC-005" />
               </Field>
               <Field label="Domain *">
                 <select value={activityForm.domain} onChange={e => setActivityForm(p => ({ ...p, domain: e.target.value }))} className={inputCls}>
                   {["TEC","LCH","ESO","IIE","HWB"].map(d => <option key={d}>{d}</option>)}
                 </select>
               </Field>
            </div>
            <Field label="Title *">
              <input value={activityForm.title} onChange={e => setActivityForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls} placeholder="e.g. Machine Learning Fundamentals" />
            </Field>
            <Field label="Description">
              <textarea value={activityForm.description} onChange={e => setActivityForm(p => ({ ...p, description: e.target.value }))}
                className={textareaCls} rows={2} placeholder="Brief description of the activity…" />
            </Field>

            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
               <Field label="Difficulty">
                 <select value={activityForm.difficulty} onChange={e => setActivityForm(p => ({ ...p, difficulty: e.target.value }))} className={inputCls}>
                   {["Beginner","Intermediate","Advanced"].map(d => <option key={d}>{d}</option>)}
                 </select>
               </Field>
               <Field label="Journey Level">
                 <select value={activityForm.journey_level} onChange={e => setActivityForm(p => ({ ...p, journey_level: e.target.value }))} className={inputCls}>
                   {["Explorer","Foundation","Practitioner","Leader","Fellow"].map(d => <option key={d}>{d}</option>)}
                 </select>
               </Field>
               <Field label="Type *">
                 <select value={activityForm.activity_type} onChange={e => setActivityForm(p => ({ ...p, activity_type: e.target.value }))} className={inputCls}>
                   {["event","workshop","project","competition","volunteer","seminar","course","other"].map(t => (
                     <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                   ))}
                 </select>
               </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="SAMAM Points *">
                <input type="number" min="1" max="500" value={activityForm.points}
                  onChange={e => setActivityForm(p => ({ ...p, points: e.target.value }))}
                  className={inputCls} placeholder="e.g. 15" />
              </Field>
              <Field label="Hours">
                <input type="number" min="0" step="0.5" value={activityForm.hours}
                  onChange={e => setActivityForm(p => ({ ...p, hours: e.target.value }))}
                  className={inputCls} placeholder="e.g. 10" />
              </Field>
              <Field label="Max Seats">
                <input type="number" min="1" value={activityForm.max_participants}
                  onChange={e => setActivityForm(p => ({ ...p, max_participants: e.target.value }))}
                  className={inputCls} placeholder="Unlimited" />
              </Field>
            </div>
            
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
               <Field label="Activity Pack">
                 <input value={activityForm.activity_pack} onChange={e => setActivityForm(p => ({ ...p, activity_pack: e.target.value }))}
                   className={inputCls} placeholder="e.g. Software Engineering" />
               </Field>
               <Field label="Faculty Name">
                 <input value={activityForm.faculty_name} onChange={e => setActivityForm(p => ({ ...p, faculty_name: e.target.value }))}
                   className={inputCls} placeholder="e.g. Dr. Ramesh Kumar" />
               </Field>
            </div>
            
            <Field label="SDGs (comma-separated)">
              <input value={activityForm.sdgs.join(", ")} onChange={e => {
                  const val = e.target.value;
                  const arr = val.split(",").map(s => s.trim()).filter(Boolean);
                  setActivityForm(p => ({ ...p, sdgs: arr }));
                }}
                className={inputCls} placeholder="e.g. SDG 4, SDG 8" />
            </Field>

            {editingActivity && (
              <Field label="Status">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={activityForm.is_active}
                    onChange={e => setActivityForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Active and visible to students</label>
                </div>
              </Field>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
              <button onClick={() => setShowActivityModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
              <button onClick={saveActivity} className="px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm flex items-center gap-1.5" style={{ backgroundColor: BRAND }}>
                <FiCheck size={16} /> Save Activity
              </button>
            </div>
          </div>
        </Modal>
      )}`;
      
    const finalContent = content.substring(0, startIdx) + newChunk + content.substring(endIdx + modalEndStr.length);
    fs.writeFileSync(path, finalContent);
    console.log("Success");
} else {
    console.log("Could not find boundaries");
}
