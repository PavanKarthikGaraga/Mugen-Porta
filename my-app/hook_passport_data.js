const fs = require('fs');
const path = './src/app/(pages)/dashboard/student/passport/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add EditorModal import
content = content.replace(
  `import { mockSDC, mockStats } from "@/app/Data/samam-mock";`,
  `import { mockSDC, mockStats } from "@/app/Data/samam-mock";\nimport EditorModal from "./EditorModal";\nimport { useEffect } from "react";`
);

// 2. Replace state and fetch logic
const searchState = `export default function PassportPage() {
  const [activeSection, setActiveSection] = useState("about");
  const { about, tagline, links, academic, projects, internships, research,
          leadership, community, achievements, timeline } = PASSPORT;`;

const replaceState = `export default function PassportPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/student/passport")
      .then(res => res.json())
      .then(json => {
         setData(json);
         setLoading(false);
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  }, []);

  const { about, tagline, links, academic, projects, internships, research,
          leadership, community, achievements, timeline } = PASSPORT;`;

content = content.replace(searchState, replaceState);

// Wait, the variables from PASSPORT are still there. I should replace them to use `data`!
// Wait! `PASSPORT` mock has a specific structure. The API returns `profile, projects, internships, research, leadership, community, achievements`.
// Let's replace the whole block.
