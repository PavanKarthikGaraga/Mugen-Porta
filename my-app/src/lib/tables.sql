CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('student', 'lead', 'faculty', 'admin') NOT NULL DEFAULT 'student'
);

CREATE TABLE leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    year ENUM('1st', '2nd', '3rd', '4th') NOT NULL,
    branch VARCHAR(50) NOT NULL,
    clubId VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (clubId) REFERENCES clubs(id)
);

CREATE TABLE faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL,
    year ENUM('1st', '2nd', '3rd', '4th') NOT NULL,
    branch VARCHAR(50) NOT NULL,
    assignedClubs JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE clubs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    domain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB') NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    categories JSON NOT NULL,
    memberLimit INT DEFAULT 50
);

CREATE TABLE projects (
    id VARCHAR(10) PRIMARY KEY,
    domain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB') NOT NULL,
    clubId VARCHAR(100) NOT NULL,
    category TEXT NOT NULL,
    rural BOOLEAN DEFAULT FALSE,
    ruralCategory VARCHAR(50) DEFAULT NULL,
    subCategory VARCHAR(100) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    projectId VARCHAR(20) DEFAULT NULL,
    clubId VARCHAR(20) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    branch VARCHAR(50) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    cluster INT DEFAULT NULL,
    year ENUM('1st', '2nd', '3rd', '4th') NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE NOT NULL,
    residenceType ENUM('Hostel', 'Day Scholar') NOT NULL,
    hostelName VARCHAR(100) DEFAULT 'N/A',
    busRoute VARCHAR(100) DEFAULT NULL,
    country VARCHAR(50) DEFAULT 'IN',
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    selectedDomain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB') NOT NULL,
    selectedCategory VARCHAR(100) DEFAULT NULL,
    ruralCategory VARCHAR(50) DEFAULT NULL,
    subCategory VARCHAR(100) DEFAULT NULL,
    socialInternshipId VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (clubId) REFERENCES clubs(id),
    -- FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE email_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(10) NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);


-- Create indexes for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_leads_username ON leads(username);
CREATE INDEX idx_leads_clubId ON leads(clubId);
CREATE INDEX idx_faculty_username ON faculty(username);
CREATE INDEX idx_students_clubId ON students(clubId);
CREATE INDEX idx_students_projectId ON students(projectId);
CREATE INDEX idx_students_selectedDomain ON students(selectedDomain);
CREATE INDEX idx_students_selectedCategory ON students(selectedCategory);
CREATE INDEX idx_projects_clubId ON projects(clubId);
CREATE INDEX idx_projects_domain ON projects(domain);



-- Controls table for system-wide settings
CREATE TABLE IF NOT EXISTS controls (
    id INT PRIMARY KEY DEFAULT 1,
    registrations_enabled TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Internal Submissions (6 submissions, each with report + linkedin + youtube)
CREATE TABLE internal_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL,
    day INT NOT NULL, -- Day 1-6
    report VARCHAR(500) NULL, -- Report URL
    linkedin VARCHAR(500) NULL, -- LinkedIn Link
    youtube VARCHAR(500) NULL, -- YouTube Link
    status ENUM('S', 'A', 'R','N') NULL, -- Status: Submitted, Approved, Rejected (NULL = Not Submitted)
    reason TEXT NULL, -- Reason for rejection (if status = 'R')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    UNIQUE KEY unique_username_day (username, day)
);

-- Student External Submissions (final report + 2 presentation links)
CREATE TABLE student_external_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    fr VARCHAR(500) NULL, -- Final Report URL
    fyt_l VARCHAR(500) NULL, -- Final YouTube Link
    flk_l VARCHAR(500) NULL, -- Final LinkedIn Link
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Student External Marks (internal total + final components = 100 marks total)
CREATE TABLE student_external_marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    internal DECIMAL(5,1) DEFAULT 0.0, -- Total from internal_marks table
    frm INT DEFAULT 0, -- Final Report marks (0-25)
    fyt_m DECIMAL(3,1) DEFAULT 0.0, -- Final YouTube marks (0-7.5)
    flk_m DECIMAL(3,1) DEFAULT 0.0, -- Final LinkedIn marks (0-7.5)
    total DECIMAL(5,1) DEFAULT 0.0, -- Total marks (calculated)
    evaluated_by VARCHAR(10) NULL, -- Username of lead/faculty who evaluated
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (evaluated_by) REFERENCES users(username)
);

-- Create indexes for faster lookups
CREATE INDEX idx_internal_submissions_username ON internal_submissions(username);
CREATE INDEX idx_internal_submissions_username_day ON internal_submissions(username, day);
CREATE INDEX idx_internal_submissions_status ON internal_submissions(status);
CREATE INDEX idx_external_submissions_username ON student_external_submissions(username);
CREATE INDEX idx_external_marks_username ON student_external_marks(username);

-- Insert default controls
INSERT INTO controls (id, registrations_enabled)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE registrations_enabled = 1;

-- Migration commands to drop old tables and create new structure
-- WARNING: These commands will delete existing internal submissions data
-- Run these only after backing up your data if needed

-- Drop old internal tables
DROP TABLE IF EXISTS student_internal_marks;
DROP TABLE IF EXISTS student_internal_submissions;

-- Create new internal submissions table
CREATE TABLE IF NOT EXISTS internal_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL,
    day INT NOT NULL, -- Day 1-6
    report VARCHAR(500) NULL, -- Report URL
    linkedin VARCHAR(500) NULL, -- LinkedIn Link
    youtube VARCHAR(500) NULL, -- YouTube Link
    status ENUM('S', 'A', 'R') NULL, -- Status: Submitted, Approved, Rejected (NULL = Not Submitted)
    reason TEXT NULL, -- Reason for rejection (if status = 'R')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    UNIQUE KEY unique_username_day (username, day)
);

-- Create indexes for new table
CREATE INDEX IF NOT EXISTS idx_internal_submissions_username ON internal_submissions(username);
CREATE INDEX IF NOT EXISTS idx_internal_submissions_username_day ON internal_submissions(username, day);
CREATE INDEX IF NOT EXISTS idx_internal_submissions_status ON internal_submissions(status);