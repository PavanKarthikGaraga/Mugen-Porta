import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { emailQueue } from "@/lib/emailQueue";

export async function POST(req) {
    try {
        const { 
            // Personal Details
            username, 
            name, 
            email,
            phoneNumber,
            countryCode,
            branch,
            gender,
            cluster,
            year,
            
            // Address Details
            country,
            countryName,
            state,
            district,
            pincode,
            residenceType,
            hostelName,
            busRoute,
            
            // Project Selection
            selectedProject: originalSelectedProject,
            projectName,
            selectedClub,
            selectedCategory: originalSelectedCategory,
            selectedDomain,
            ruralCategory,
            socialInternshipId,
            
            // Agreements
            agreedToTerms
        } = await req.json();

        // Create mutable variables for project-related fields that might be cleared for Y25 students
        let selectedProject = originalSelectedProject;
        let selectedCategory = originalSelectedCategory;

        // Validate required fields
        if (!username || !name || !email || !phoneNumber || !branch || !gender || !cluster || !year) {
            return NextResponse.json(
                { message: "All personal details are required" },
                { status: 400 }
            );
        }

        if (!country || !state || !district || !pincode || !residenceType) {
            return NextResponse.json(
                { message: "Complete address information is required" },
                { status: 400 }
            );
        }

        // Check if it's Y24 or Y25 student based on username
        const isY24Student = username.startsWith('24');
        const isY25Student = username.startsWith('25');

        // Validation based on student year and domain
        const clubOnlyDomains = ['ESO', 'HWB', 'IIE'];

        if (isY24Student) {
            // Y24 students must select either a project or club (depending on domain)
            if (!selectedClub || !selectedDomain) {
                return NextResponse.json(
                    { message: "Club selection is required for Y24 students" },
                    { status: 400 }
                );
            }

            // For ESO, HWB, IIE domains - club selection is sufficient
            if (!clubOnlyDomains.includes(selectedDomain)) {
                if (!selectedProject || !selectedCategory) {
                    return NextResponse.json(
                        { message: "Project selection is required for this domain" },
                        { status: 400 }
                    );
                }
            }
        } else if (isY25Student) {
            // Y25 students must select a club but not a project
            if (!selectedClub || !selectedDomain) {
                return NextResponse.json(
                    { message: "Club selection is required for Y25 students" },
                    { status: 400 }
                );
            }
            // Clear project-related fields for Y25 students
            selectedProject = null;
            selectedCategory = null;
        } else {
            return NextResponse.json(
                { message: "Invalid username format. Must start with 24 or 25" },
                { status: 400 }
            );
        }

        if (!agreedToTerms) {
            return NextResponse.json(
                { message: "You must agree to all terms and conditions" },
                { status: 400 }
            );
        }

        // Additional validations
        if (username.length > 10) {
            return NextResponse.json(
                { message: "Username must be 10 characters or less" },
                { status: 400 }
            );
        }

        if (residenceType === "Hostel" && !hostelName) {
            return NextResponse.json(
                { message: "Hostel name is required for hostel residents" },
                { status: 400 }
            );
        }

        if (residenceType === "Day Scholar" && !busRoute) {
            return NextResponse.json(
                { message: "Bus route is required for day scholars" },
                { status: 400 }
            );
        }

        // Generate password: username + last 4 digits of phone number
        const last4Digits = phoneNumber.slice(-4);
        const generatedPassword = username + last4Digits;

        // Check if username or email already exists
        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { message: "Username or email already exists" },
                { status: 409 }
            );
        }

        // Check if phone number already exists in students table
        const [existingStudents] = await pool.execute(
            "SELECT id FROM students WHERE phoneNumber = ?",
            [phoneNumber]
        );

        if (existingStudents.length > 0) {
            return NextResponse.json(
                { message: "Phone number already registered" },
                { status: 409 }
            );
        }

        // Check member limits based on student year and domain
        if (isY24Student && selectedDomain === 'TEC') {
            // TEC projects limited to 2 members for Y24 students
            const [projectMembers] = await pool.execute(
                "SELECT COUNT(*) as currentMembers FROM students WHERE projectId = ?",
                [selectedProject]
            );

            const currentMembers = projectMembers[0].currentMembers;
            if (currentMembers >= 2) {
                return NextResponse.json(
                    { message: "This TEC project is full. TEC projects can only have a maximum of 2 members. Please select a different project." },
                    { status: 400 }
                );
            }
        } else if (isY24Student && clubOnlyDomains.includes(selectedDomain)) {
            // For ESO, HWB, IIE domains - check club member limits for Y24 students
            const [clubInfo] = await pool.execute(
                "SELECT memberLimit FROM clubs WHERE id = ?",
                [selectedClub]
            );

            const [clubMembers] = await pool.execute(
                "SELECT COUNT(*) as currentMembers FROM students WHERE clubId = ?",
                [selectedClub]
            );

            const currentMembers = clubMembers[0].currentMembers;
            const memberLimit = clubInfo[0]?.memberLimit || 50; // Default to 50 if not found

            if (currentMembers >= memberLimit) {
                return NextResponse.json(
                    { message: `This club is full. Maximum ${memberLimit} members allowed per club. Please select a different club.` },
                    { status: 400 }
                );
            }
        } else if (isY25Student) {
            // Get club member limit dynamically from database
            const [clubInfo] = await pool.execute(
                "SELECT memberLimit FROM clubs WHERE id = ?",
                [selectedClub]
            );

            const [clubMembers] = await pool.execute(
                "SELECT COUNT(*) as currentMembers FROM students WHERE clubId = ?",
                [selectedClub]
            );

            const currentMembers = clubMembers[0].currentMembers;
            const memberLimit = clubInfo[0]?.memberLimit || 50; // Default to 50 if not found

            if (currentMembers >= memberLimit) {
                return NextResponse.json(
                    { message: `This club is full. Maximum ${memberLimit} members allowed per club. Please select a different club.` },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

        // Get connection for transaction
        const connection = await pool.getConnection();

        // Start transaction
        await connection.beginTransaction();

        try {
            // Insert into users table
            const [userResult] = await connection.execute(
                `INSERT INTO users (username, name, email, password, role) 
                 VALUES (?, ?, ?, ?, 'student')`,
                [username, name, email, hashedPassword]
            );

            // Insert into students table
            const [studentResult] = await connection.execute(
                `INSERT INTO students (
                    username, projectId, clubId, name, email, branch, gender, 
                    cluster, year, phoneNumber, residenceType, hostelName, busRoute,
                    country, state, district, pincode, selectedDomain, ruralCategory, socialInternshipId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username, 
                    isY24Student ? selectedProject : null, // Y24 can have projects, Y25 null
                    selectedClub,                          // Both Y24 and Y25 can have clubs
                    name, email, branch, gender,
                    cluster, year, phoneNumber, residenceType, 
                    hostelName || 'N/A', busRoute || null,
                    countryName || country, state, district, pincode, selectedDomain, ruralCategory || null, socialInternshipId || null
                ]
            );

            // Commit transaction
            await connection.commit();
            connection.release();

            // Fetch project and club details for email
            let projectDetails = null;
            let clubDetails = null;

            if (isY24Student && selectedProject && !clubOnlyDomains.includes(selectedDomain)) {
                const [projectInfo] = await pool.execute(
                    "SELECT name, description FROM projects WHERE id = ?",
                    [selectedProject]
                );
                projectDetails = projectInfo[0] || null;
            }

            if (selectedClub) {
                const [clubInfo] = await pool.execute(
                    "SELECT name, description FROM clubs WHERE id = ?",
                    [selectedClub]
                );
                clubDetails = clubInfo[0] || null;
            }

            // Queue email for async processing (non-blocking)
            emailQueue.add({
                email: email,
                name: name,
                username: username,
                password: generatedPassword,
                year: year,
                selectedDomain: selectedDomain,
                projectDetails: projectDetails,
                clubDetails: clubDetails,
                isY24Student: isY24Student,
                isY25Student: isY25Student
            });

            // Return immediate success response
            return NextResponse.json(
                { 
                    message: "Registration successful! You will receive a confirmation email shortly with your login credentials.",
                    userId: userResult.insertId,
                    studentId: studentResult.insertId,
                    username: username,
                    emailQueued: true
                },
                { status: 201 }
            );

        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}