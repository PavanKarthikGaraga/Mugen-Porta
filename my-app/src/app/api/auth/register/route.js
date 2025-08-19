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
            selectedProject,
            projectName,
            selectedClub,
            selectedCategory,
            selectedDomain,
            isY24Student,
            socialInternshipId,
            
            // Agreements
            agreedToTerms
        } = await req.json();

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

        if (!selectedProject || !selectedClub || !selectedCategory || !selectedDomain) {
            return NextResponse.json(
                { message: "Project selection is required" },
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
                    country, state, district, pincode, selectedDomain, socialInternshipId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?)`,
                [
                    username, selectedProject, selectedClub, name, email, branch, gender,
                    cluster, year, phoneNumber, residenceType, 
                    hostelName || 'N/A', busRoute || null,
                    countryName || country, state, district, pincode, selectedDomain, socialInternshipId || null
                ]
            );

            // Commit transaction
            await connection.commit();
            connection.release();

            // Queue email for async processing (non-blocking)
            emailQueue.add({
                email: email,
                name: name,
                username: username,
                password: generatedPassword
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