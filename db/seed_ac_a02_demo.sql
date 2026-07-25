-- =========================================================================
-- SAMAM / KL SAC -- Demo resources & assignment for AC-A02
-- (Sketching & Drawing Workshop)
--
-- Safe to re-run. If the activity already exists, only its `resources` and
-- `assignments` columns are touched -- nothing else you've already set on
-- it (title, seats, points, etc.) gets overwritten. If it doesn't exist
-- yet, this creates it.
-- =========================================================================

-- 1. Table used to record student assignment-file submissions (created by
--    the app automatically too, but included here so this script is
--    fully self-contained).
CREATE TABLE IF NOT EXISTS activity_assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_code VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(50) NOT NULL,
    username VARCHAR(10) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_submission (activity_code, assignment_id, username)
);

-- 2. Upsert the AC-A02 activity with its demo resources + assignment.
INSERT INTO activity_catalogue
    (code, title, description, domain, category, sdc_credits, max_seats, status,
     difficulty, journey_level, purpose, resources, assignments, created_by, created_at)
VALUES (
    'AC-A02',
    'Sketching & Drawing Workshop',
    'This workshop introduces students to the foundations of drawing by developing observation, proportion, perspective, and shading techniques.',
    'LCH',
    'Workshop',
    20,
    50,
    'active',
    'Beginner',
    'Explorer',
    'This workshop introduces students to the foundations of drawing by developing observation, proportion, perspective, and shading techniques.',
    '[{"id":1,"type":"pdf","title":"Sketching & Drawing Workshop — Reference Guide","url":"/uploads/sketching-drawing-workshop-guide.pdf"},{"id":2,"type":"link","title":"Drawing — Techniques & Fundamentals (Wikipedia)","url":"https://en.wikipedia.org/wiki/Drawing"},{"id":3,"type":"link","title":"Proko — Figure & Observational Drawing Lessons","url":"https://www.proko.com/"}]',
    '[{"id":1,"title":"Submit Your Sketch Portfolio (3 Observational Drawings)","dueDate":"2026-08-08","type":"submission","description":"Upload 3 original pencil/pen sketches demonstrating proportion, perspective, and shading as covered in the workshop. Accepted formats: PDF, JPG, or PNG."}]',
    'admin',
    NOW()
)
ON DUPLICATE KEY UPDATE
    resources = VALUES(resources),
    assignments = VALUES(assignments);

-- 3. Quick sanity check -- run this separately to confirm it worked:
-- SELECT code, title, resources, assignments FROM activity_catalogue WHERE code = 'AC-A02';
