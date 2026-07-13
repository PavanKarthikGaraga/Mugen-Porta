const fs = require('fs');
const path = './src/app/(pages)/dashboard/student/passport/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/p\.tech\.map/g, '(p.tech_stack || []).map');
content = content.replace(/p\.demo/g, 'p.demo_url');
content = content.replace(/p\.github/g, 'p.github_url');
content = content.replace(/p\.year/g, 'p.project_year');

content = content.replace(/item\.company/g, 'i.company');
content = content.replace(/item\.role/g, 'i.role');
content = content.replace(/item\.location/g, 'i.location');
content = content.replace(/item\.duration/g, 'i.duration');
content = content.replace(/item\.description/g, 'i.description');
content = content.replace(/item\.skills\.map/g, '(i.skills || []).map');
content = content.replace(/internships\.map\(\(item\)/g, 'internships.map((i)');

content = content.replace(/r\.coAuthors/g, '(r.co_authors || [])');
content = content.replace(/r\.year/g, 'r.publication_year');

content = content.replace(/l\.org/g, 'l.organisation');
content = content.replace(/l\.year/g, 'l.period');

content = content.replace(/c\.hours/g, 'c.hours_spent');

content = content.replace(/a\.org/g, 'a.organisation');
content = content.replace(/a\.year/g, 'a.achievement_year');

fs.writeFileSync(path, content);
console.log("Fixed properties");
