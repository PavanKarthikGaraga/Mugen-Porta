import { ACTIVITIES } from './src/app/Data/activities-mock';
import fs from 'fs';

let sql = `INSERT INTO activity_catalogue (
  code, title, description, domain, category, sdc_credits, max_seats, 
  enrolledCount, outcomes, timeline, resources, assignments, 
  competencies, career, sdgs, ga, facultyFeedback, reflection, purpose, difficulty, level, status, created_at
) VALUES\n`;

const values = ACTIVITIES.map(activity => {
    const safeDescription = (activity.description || "No description provided.").replace(/'/g, "''");
    const title = (activity.name || "").replace(/'/g, "''");
    
    return `('${activity.code}', '${title}', '${safeDescription}', '${activity.domain || 'TEC'}', '${activity.pack || 'General'}', ${activity.credits || 0}, ${activity.maxEnrollment || 0}, ${activity.enrolledCount || 0}, '${JSON.stringify(activity.outcomes || []).replace(/'/g, "''")}', '${JSON.stringify(activity.timeline || []).replace(/'/g, "''")}', '${JSON.stringify(activity.resources || []).replace(/'/g, "''")}', '${JSON.stringify(activity.assignments || []).replace(/'/g, "''")}', '${JSON.stringify(activity.competencies || []).replace(/'/g, "''")}', '${JSON.stringify(activity.career || []).replace(/'/g, "''")}', '${JSON.stringify(activity.sdgs || []).replace(/'/g, "''")}', '${JSON.stringify(activity.ga || []).replace(/'/g, "''")}', NULL, NULL, '${(activity.purpose || '').replace(/'/g, "''")}', '${activity.difficulty || 'Beginner'}', '${activity.level || 'explorer'}', 'active', NOW())`;
});

sql += values.join(',\n') + ';\n';
fs.writeFileSync('seed.sql', sql);
console.log('Done!');
