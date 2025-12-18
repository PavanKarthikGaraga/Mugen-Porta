/* =========================================================
   CORE TABLES
   ========================================================= */

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('student', 'lead', 'faculty', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);


/* =========================================================
   CLUBS & PROJECTS
   ========================================================= */

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
    clubId VARCHAR(20) NOT NULL,
    category TEXT NOT NULL,
    subCategory VARCHAR(100) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clubId) REFERENCES clubs(id)
);

CREATE INDEX idx_projects_clubId ON projects(clubId);
CREATE INDEX idx_projects_domain ON projects(domain);


/* =========================================================
   LEADS & FACULTY
   ========================================================= */

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

CREATE INDEX idx_leads_username ON leads(username);
CREATE INDEX idx_leads_clubId ON leads(clubId);


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

CREATE INDEX idx_faculty_username ON faculty(username);


/* =========================================================
   STUDENTS
   ========================================================= */

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    projectId VARCHAR(10) DEFAULT NULL,
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
    erpFeeReceiptRef VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (clubId) REFERENCES clubs(id),
    FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE INDEX idx_students_clubId ON students(clubId);
CREATE INDEX idx_students_projectId ON students(projectId);
CREATE INDEX idx_students_selectedDomain ON students(selectedDomain);
CREATE INDEX idx_students_selectedCategory ON students(selectedCategory);
CREATE INDEX idx_students_erpFeeReceiptRef ON students(erpFeeReceiptRef);


/* =========================================================
   SYSTEM CONTROLS
   ========================================================= */

CREATE TABLE controls (
    id INT PRIMARY KEY DEFAULT 1,
    registrations_enabled TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO controls (id, registrations_enabled)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE registrations_enabled = 1;


/* =========================================================
   EMAIL LOGS
   ========================================================= */

CREATE TABLE email_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(10) NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'sent',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);


/* =========================================================
   INTERNAL SUBMISSIONS
   ========================================================= */

CREATE TABLE internal_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL,
    num INT NOT NULL,
    report VARCHAR(500) NULL,
    linkedin VARCHAR(500) NULL,
    youtube VARCHAR(500) NULL,
    status ENUM('S', 'A', 'R', 'N') NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    UNIQUE KEY unique_username_num (username, num)
);

CREATE INDEX idx_internal_username ON internal_submissions(username);
CREATE INDEX idx_internal_status ON internal_submissions(status);


/* =========================================================
   EXTERNAL SUBMISSIONS & MARKS
   ========================================================= */

CREATE TABLE student_external_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    fr VARCHAR(500) NULL,
    fyt_l VARCHAR(500) NULL,
    flk_l VARCHAR(500) NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE student_external_marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    internal DECIMAL(5,1) DEFAULT 0.0,
    frm INT DEFAULT 0,
    fyt_m DECIMAL(3,1) DEFAULT 0.0,
    flk_m DECIMAL(3,1) DEFAULT 0.0,
    total DECIMAL(5,1) DEFAULT 0.0,
    evaluated_by VARCHAR(10) NULL,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (evaluated_by) REFERENCES users(username)
);

CREATE INDEX idx_external_marks_username ON student_external_marks(username);

-- Example admin insert
INSERT INTO users (username, name, email, password, role)
VALUES (
  '2300032048',
  'Karthik',
  '2300032048@kluniversity.in',
  '$2a$12$AE84C6xCL60eUyPhJ32VH.piecWH.O.D4gQGXHY4NtMaieKlJVyfC',
  'admin'
);
