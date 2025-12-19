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
   CLUBS
   ========================================================= */

CREATE TABLE clubs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    domain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB') NOT NULL,
    memberLimit INT DEFAULT 50
);

INSERT INTO clubs (id, name, description, domain, memberLimit) VALUES
('TEC01', 'ZeroOne Code Club', 'ZeroOne Code Club', 'TEC', 50),
('TEC02', 'CyberSecurity', 'CyberSecurity', 'TEC', 50),
('TEC03', 'WebApps', 'WebApps', 'TEC', 50),
('TEC04', 'AgriTech Nexus', 'AgriTech Nexus', 'TEC', 50),
('TEC05', 'Electric Vehicle / Automation', 'Electric Vehicle / Automation', 'TEC', 50),
('TEC06', 'Animation', 'Animation', 'TEC', 50),

('LCH01', 'Short Film Makers', 'Short Film Makers', 'LCH', 50),
('LCH02', 'DANCE', 'DANCE', 'LCH', 50),
('LCH03', 'Music Club', 'Music Club', 'LCH', 50),
('LCH04', 'Handicrafts', 'Handicrafts', 'LCH', 50),
('LCH05', 'Adventure', 'Adventure', 'LCH', 50),
('LCH06', 'VERSATALES', 'VERSATALES', 'LCH', 50),
('LCH07', 'Dramatics', 'Dramatics', 'LCH', 50),
('LCH08', 'Fashion', 'Fashion', 'LCH', 50),
('LCH09', 'Painting', 'Painting', 'LCH', 50),
('LCH10', 'KL eSports Club', 'KL eSports Club', 'LCH', 50),
('LCH11', 'Photography', 'Photography', 'LCH', 50),
('LCH12', 'Vachas', 'Vachas', 'LCH', 50),
('LCH13', 'Mugen Manji™', 'Mugen Manji™', 'LCH', 50),
('LCH14', 'Japanese Cultural Club', 'Japanese Cultural Club', 'LCH', 50),

('ESO01', 'SVR', 'SVR', 'ESO', 50),
('ESO02', 'Event Management Society', 'Event Management Society', 'ESO', 50),
('ESO03', 'KUTUMB Society', 'KUTUMB Society', 'ESO', 50),
('ESO04', 'Yuva Tourism', 'Yuva Tourism', 'ESO', 50),
('ESO05', 'OHANA CLUB (International Student Council)', 'OHANA CLUB (International Student Council)', 'ESO', 50),
('ESO06', 'Spiritual Sciences', 'Spiritual Sciences', 'ESO', 50),
('ESO07', 'KL Youth Policy LAB', 'KL Youth Policy LAB', 'ESO', 50),

('IIE01', 'VYUHA', 'VYUHA', 'IIE', 50),

('HWB01', 'Yoga', 'Yoga', 'HWB', 50),
('HWB02', 'SafeLife', 'SafeLife', 'HWB', 50);




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
    erpFeeReceiptRef VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (clubId) REFERENCES clubs(id)
);

CREATE INDEX idx_students_clubId ON students(clubId);
CREATE INDEX idx_students_selectedDomain ON students(selectedDomain);
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
