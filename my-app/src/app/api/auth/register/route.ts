import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendRegistrationEmail } from "@/lib/email";

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

            // Club Selection
            selectedClub,
            selectedDomain,

            // Agreements
            agreedToTerms,

            // ERP Fee Receipt
            erpFeeReceiptRef
        } = await req.json();

        // Check if it's Y22, Y23, Y24 or Y25 student based on username
        const isY24Student = username.startsWith('24');
        const isY25Student = username.startsWith('25');
        const isY23Student = username.startsWith('23');
        const isY22Student = username.startsWith('22');

        // Simplified registration: no projects or categories

        // Validate required fields
        // Cluster is optional for 1st year (Y25) students
        const clusterRequired = !isY25Student;
        if (!username || !name || !email || !phoneNumber || !branch || !gender || !year || (clusterRequired && !cluster)) {
            return NextResponse.json(
                { message: clusterRequired && !cluster ? "Cluster is required for your year" : "All required personal details are required" },
                { status: 400 }
            );
        }

        if (!country || !state || !district || !pincode || !residenceType) {
            return NextResponse.json(
                { message: "Complete address information is required" },
                { status: 400 }
            );
        }

        // Validation based on student year - unified logic matching frontend

        if (!isY22Student && !isY23Student && !isY24Student && !isY25Student) {
            return NextResponse.json(
                { message: "Invalid username format. Must start with 22, 23, 24, or 25" },
                { status: 400 }
            );
        }

        // All students must select club and domain
        if (!selectedClub || !selectedDomain) {
            return NextResponse.json(
                { message: "Club and domain selection is required" },
                { status: 400 }
            );
        }


        if (!agreedToTerms) {
            return NextResponse.json(
                { message: "You must agree to all terms and conditions" },
                { status: 400 }
            );
        }

        // Validate ERP Fee Receipt Reference Number
        if (!erpFeeReceiptRef || erpFeeReceiptRef.trim().length === 0) {
            return NextResponse.json(
                { message: "ERP Fee Receipt Reference Number is required" },
                { status: 400 }
            );
        }

        if (erpFeeReceiptRef.length > 50) {
            return NextResponse.json(
                { message: "ERP Fee Receipt Reference Number must be 50 characters or less" },
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


        // Check club member limits for all students
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
                {
                    message: `This club is full. Maximum ${memberLimit} members allowed per club.`,
                    errorType: "CLUB_FULL",
                    clubId: selectedClub,
                    currentMembers: currentMembers,
                    maxMembers: memberLimit,
                    availableSpots: 0,
                    suggestion: "Please select a different club."
                },
                { status: 400 }
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

            const categoryToInsert = null;
            console.log('Database insertion data:', {
                username,
                categoryToInsert,
                selectedClub,
                selectedDomain,
            });

            // Insert into students table
            const [studentResult] = await connection.execute(
                `INSERT INTO students (
                    username, clubId, name, email, branch, gender,
                    cluster, year, phoneNumber, residenceType, hostelName, busRoute,
                    country, state, district, pincode, selectedDomain, erpFeeReceiptRef
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username,
                    selectedClub,                          // All students can have clubs
                    name, email, branch, gender,
                    isY25Student ? null : cluster, // Cluster is null for Y25 (1st year) students
                    year, phoneNumber, residenceType,
                    hostelName || 'N/A', busRoute || null,
                    countryName || country, state, district, pincode, selectedDomain,
                    erpFeeReceiptRef.trim() // ERP Fee Receipt Reference Number
                ]
            );

            // Commit transaction
            await connection.commit();
            connection.release();

            // Fetch club details for email
            let clubDetails = null;

            if (selectedClub) {
                const [clubInfo] = await pool.execute(
                    "SELECT name, description FROM clubs WHERE id = ?",
                    [selectedClub]
                );
                clubDetails = clubInfo[0] || null;
            }

            // Queue email for sending (non-blocking operation)
            const emailResult = await sendRegistrationEmail(
                email,
                name,
                username,
                generatedPassword,
                year,
                selectedDomain,
                clubDetails,
                isY22Student,
                isY23Student,
                isY24Student,
                isY25Student
            );

            // Log email result but don't fail registration if email queuing fails
            if (!emailResult.success) {
                console.error(`Failed to queue registration email to ${email}:`, emailResult.error);
            }

            // Return success response
            return NextResponse.json(
                {
                    message: emailResult.success
                        ? "Registration successful! Check your email for login credentials."
                        : "Registration successful! However, there was an issue queuing the confirmation email. Please contact support.",
                    userId: userResult.insertId,
                    studentId: studentResult.insertId,
                    username: username,
                    emailQueued: emailResult.success
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