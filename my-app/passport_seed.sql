-- Set the username for the profile
SET @username = '2400000000';

-- 1. UPDATE STUDENT PROFILE (About, CGPA, Tagline)
INSERT INTO student_profiles (username, tagline, about, cgpa, career_choice)
VALUES (
    @username, 
    'Full-Stack Developer | Software Engineering Enthusiast', 
    'Computer Science & Engineering student at KL University with interests in Full-Stack Development, Software Engineering, Cloud Computing, and AI. Passionate about building real-world web applications.', 
    9.56, 
    'Software Engineer'
)
ON DUPLICATE KEY UPDATE 
    tagline = VALUES(tagline),
    about = VALUES(about),
    cgpa = VALUES(cgpa),
    career_choice = VALUES(career_choice);

-- 2. INSERT PROJECTS
-- Clear existing projects for a clean slate
DELETE FROM passport_projects WHERE username = @username;

INSERT INTO passport_projects (username, name, description, tech_stack, status, sort_order) VALUES
(@username, 'EcoCred', 'Environmental education and activity tracking platform.', '["Full-Stack"]', 'completed', 1),
(@username, 'SAMAM', 'Student Activity Management System for universities.', '["AI", "ERP", "Full-Stack"]', 'ongoing', 2),
(@username, 'ZeroOne Club ERP', 'Club management and event portal.', '["Full-Stack"]', 'completed', 3),
(@username, 'Foodies Delight', 'Recipe website built using HTML, CSS, and JavaScript.', '["HTML", "CSS", "JavaScript"]', 'completed', 4);

-- 3. INSERT INTERNSHIPS
DELETE FROM passport_internships WHERE username = @username;

INSERT INTO passport_internships (username, company, role, description, skills, is_verified, sort_order) VALUES
(@username, 'Tech Mahindra', 'Software Engineering Intern', 'Worked on enterprise software concepts, cloud computing, AWS, Linux, and software engineering practices.', '["Cloud Computing", "AWS", "Linux", "Software Engineering"]', 1, 1);

-- 4. INSERT RESEARCH
DELETE FROM passport_research WHERE username = @username;

INSERT INTO passport_research (username, title, status, sort_order) VALUES
(@username, 'Working on SAMAM, a competency-based student activity framework with AI and ERP integration.', 'under_review', 1);

-- 5. INSERT LEADERSHIP
DELETE FROM passport_leadership WHERE username = @username;

INSERT INTO passport_leadership (username, role, organisation, sort_order) VALUES
(@username, 'Co-Lead', 'ZeroOne Code Club', 1),
(@username, 'Course Coordinator', 'Frontend Web Development', 2),
(@username, 'Peer Mentor', 'KL University', 3);

-- 6. INSERT COMMUNITY SERVICE
DELETE FROM passport_community WHERE username = @username;

INSERT INTO passport_community (username, activity, impact, sort_order) VALUES
(@username, 'Social Internship in Agriculture & Rural Development', 'Conducted village surveys and awareness programs.', 1);

-- 7. INSERT ACHIEVEMENTS
DELETE FROM passport_achievements WHERE username = @username;

INSERT INTO passport_achievements (username, title, icon, sort_order) VALUES
(@username, '9.56 CGPA', '🏆', 1),
(@username, 'Software Engineering Intern at Tech Mahindra', '💼', 2),
(@username, 'Smart India Hackathon (SIH) Participant', '🚀', 3),
(@username, 'Built multiple full-stack web applications', '💻', 4);

