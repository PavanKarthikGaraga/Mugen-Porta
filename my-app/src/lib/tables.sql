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

-- Student Internal Submissions (7 reports + 2 links)
CREATE TABLE student_internal_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    r1 VARCHAR(500) NULL, -- Report 1 URL
    r2 VARCHAR(500) NULL, -- Report 2 URL
    r3 VARCHAR(500) NULL, -- Report 3 URL
    r4 VARCHAR(500) NULL, -- Report 4 URL
    r5 VARCHAR(500) NULL, -- Report 5 URL
    r6 VARCHAR(500) NULL, -- Report 6 URL
    r7 VARCHAR(500) NULL, -- Report 7 URL
    yt_l VARCHAR(500) NULL, -- YouTube Link
    lk_l VARCHAR(500) NULL, -- LinkedIn Link
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Student Internal Marks (7 reports + 2 links = 60 marks total)
CREATE TABLE student_internal_marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    m1 INT DEFAULT 0, -- Report 1 marks (0-7)
    m2 INT DEFAULT 0, -- Report 2 marks (0-7)
    m3 INT DEFAULT 0, -- Report 3 marks (0-7)
    m4 INT DEFAULT 0, -- Report 4 marks (0-7)
    m5 INT DEFAULT 0, -- Report 5 marks (0-7)
    m6 INT DEFAULT 0, -- Report 6 marks (0-7)
    m7 INT DEFAULT 0, -- Report 7 marks (0-7)
    yt_m DECIMAL(3,1) DEFAULT 0.0, -- YouTube marks (0-5.5)
    lk_m DECIMAL(3,1) DEFAULT 0.0, -- LinkedIn marks (0-5.5)
    total DECIMAL(5,1) DEFAULT 0.0, -- Total internal marks (calculated)
    evaluated_by VARCHAR(10) NULL, -- Username of lead/faculty who evaluated
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (evaluated_by) REFERENCES users(username)
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
CREATE INDEX idx_internal_submissions_username ON student_internal_submissions(username);
CREATE INDEX idx_internal_marks_username ON student_internal_marks(username);
CREATE INDEX idx_external_submissions_username ON student_external_submissions(username);
CREATE INDEX idx_external_marks_username ON student_external_marks(username);

-- Insert default controls
INSERT INTO controls (id, registrations_enabled)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE registrations_enabled = 1;