CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    projectId VARCHAR(20) DEFAULT NULL,
    clubId VARCHAR(20) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    branch VARCHAR(50) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    cluster INT NOT NULL,
    year ENUM('1st', '2nd', '3rd', '4th') NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE NOT NULL,
    residenceType ENUM('Hostel', 'Day Scholar') NOT NULL,
    hostelName VARCHAR(100) DEFAULT 'N/A',
    busRoute VARCHAR(100) DEFAULT NULL,
    country VARCHAR(50) DEFAULT 'IN',
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    selectedDomain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB', 'Rural') NOT NULL,
    socialInternshipId VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (projectId) REFERENCES projects(id),
    FOREIGN KEY (clubId) REFERENCES clubs(id)
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('student', 'lead', 'faculty', 'admin') NOT NULL DEFAULT 'student'
);

CREATE TABLE clubs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    domain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB', 'Rural') NOT NULL,
    categories JSON NOT NULL
);

CREATE TABLE projects (
    id VARCHAR(10) PRIMARY KEY,
    domain ENUM('TEC', 'LCH', 'ESO', 'IIE', 'HWB', 'Rural') NOT NULL,
    clubId VARCHAR(100) NOT NULL,
    category TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


-- Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);