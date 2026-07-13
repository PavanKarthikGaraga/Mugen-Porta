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

// 4. Update the "TAB: ACTIVITIES" block and the Modal block
const tabActivitiesStart = content.indexOf(`{/* ═══ TAB: ACTIVITIES`);
if (tabActivitiesStart !== -1) {
    const nextTabStart = content.indexOf(`{/* ═══ TAB:`, tabActivitiesStart + 10);
    // There is no next tab, it's the modal
    const modalStart = content.indexOf(`{/* Activity Create/Edit Modal */}`);
    
    // So the Activities tab + Modal is everything from tabActivitiesStart down to the end of the return statement.
    // Wait, let's just do a string replacement on the blocks.
}

fs.writeFileSync('update_page_in_progress.js', 'console.log("Ready");');
