-- =============================================================================
-- MIGRATION SCRIPT: Add JSON columns to activity_catalogue
-- Run this script in your MySQL client (DBeaver, phpMyAdmin, MySQL Workbench, etc.)
-- =============================================================================

ALTER TABLE activity_catalogue
ADD COLUMN outcomes JSON DEFAULT NULL,
ADD COLUMN timeline JSON DEFAULT NULL,
ADD COLUMN resources JSON DEFAULT NULL,
ADD COLUMN assignments JSON DEFAULT NULL,
ADD COLUMN competencies JSON DEFAULT NULL,
ADD COLUMN career JSON DEFAULT NULL,
ADD COLUMN sdgs JSON DEFAULT NULL,
ADD COLUMN ga JSON DEFAULT NULL,
ADD COLUMN facultyFeedback TEXT DEFAULT NULL,
ADD COLUMN reflection TEXT DEFAULT NULL,
ADD COLUMN purpose TEXT DEFAULT NULL,
ADD COLUMN difficulty VARCHAR(50) DEFAULT 'Beginner',
ADD COLUMN level VARCHAR(50) DEFAULT 'explorer',
ADD COLUMN enrolledCount INT DEFAULT 0;
