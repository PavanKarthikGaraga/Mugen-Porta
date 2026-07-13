const fs = require('fs');
const path = './src/app/(pages)/dashboard/student/passport/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file is currently using PASSPORT from development-mock.
// We need to rewrite `export default function PassportPage() { ... }` up to the return statement.

const startStr = `export default function PassportPage() {`;
const endStr = `  return (`;

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

const newLogic = `import EditorModal from "./EditorModal";
import { useEffect } from "react";

export default function PassportPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/student/passport")
      .then(res => res.json())
      .then(json => {
         // Fallback to mock for academic data since it's not in the DB schema for passport
         json.academic = PASSPORT.academic; 
         json.timeline = PASSPORT.timeline; // Also fallback timeline
         setData(json);
         setLoading(false);
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div className="p-10 text-center">Loading Passport...</div>;
  if (!data || !data.profile) return <div className="p-10 text-center text-red-500">Failed to load passport.</div>;

  const { profile, academic, projects, internships, research, leadership, community, achievements, timeline } = data;

  return (
    <>
      <EditorModal isOpen={isEditing} onClose={() => setIsEditing(false)} initialData={data} onSave={(newData) => setData(newData)} />
`;

content = content.substring(0, startIdx) + newLogic + content.substring(endIdx + endStr.length);
fs.writeFileSync(path, content);
console.log("Rewrote logic");
