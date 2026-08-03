import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendRegistrationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";
import { safeMessage } from "@/lib/apiSecurity";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

// clubId/selectedDomain were required at registration until 1st years
// started deferring club selection to their dashboard — in production
// they're very likely still defined NOT NULL from before that, which would
// reject the NULL this route now inserts for them with a generic 500.
// Self-heals by reading the column's real current type from
// INFORMATION_SCHEMA and only loosening it (never guessing a type), same
// approach as the rest of this codebase's lazy schema migrations. Uses
// pool.query (text protocol) rather than pool.execute — mysql2's prepared
// statement protocol doesn't reliably support DDL on every MySQL/MariaDB
// build, which is exactly what broke this insert in production once already.
async function ensureNullable(table: string, column: string) {
    try {
        const [rows]: any = await pool.query(
            `SELECT COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [table, column]
        );
        const col = (rows as any[])[0];
        if (col && col.IS_NULLABLE === 'NO') {
            await pool.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${col.COLUMN_TYPE} NULL`);
        }
    } catch (e) {
        console.error(`Failed to ensure ${table}.${column} is nullable (non-fatal):`, e);
    }
}

export async function POST(req) {
    // Registration creates a DB record and sends email - protect against
    // automated mass-registration / abuse.
    const rateLimit = checkRateLimit(req, 'register', { limit: 5, windowMs: 60 * 1000 });
    if (rateLimit.limited) return rateLimit.response;

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
            campus,
            careerChoice,

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
            pathway,

            // Agreements
            agreedToTerms,

            // ERP Fee Receipt (kept for backward compat but no longer required)
            erpFeeReceiptRef
        } = await req.json();

        // Type / format validation - reject anything that isn't the plain
        // string shape we expect before it ever reaches a query or email.
        if (typeof username !== 'string' || typeof name !== 'string' || typeof email !== 'string' || typeof phoneNumber !== 'string') {
            return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
        }

        if (!USERNAME_REGEX.test(username) || username.length < 3 || username.length > 20) {
            return NextResponse.json({ message: "Username must be alphanumeric" }, { status: 400 });
        }

        // Registration IDs are entered manually — no year-prefix requirement,
        // just length and digits.
        if (!/^\d{10,11}$/.test(username)) {
            return NextResponse.json({ message: "Username must be exactly 10 or 11 digits" }, { status: 400 });
        }

        if (!EMAIL_REGEX.test(email) || email.length > 150) {
            return NextResponse.json({ message: "Please provide a valid email address" }, { status: 400 });
        }

        if (!/^\d{7,15}$/.test(phoneNumber)) {
            return NextResponse.json({ message: "Please provide a valid phone number" }, { status: 400 });
        }

        if (name.trim().length < 2 || name.length > 100) {
            return NextResponse.json({ message: "Please provide a valid name" }, { status: 400 });
        }

        // Check if it's Y22, Y23, Y24, Y25 or Y26 student based on username
        const isY22Student = username.startsWith('22');
        const isY23Student = username.startsWith('23');
        const isY24Student = username.startsWith('24');
        const isY25Student = username.startsWith('25');
        const isY26Student = username.startsWith('26');

        // Simplified registration: no projects or categories

        // Validate required fields
        // Cluster is optional for all students
        if (!username || !name || !email || !phoneNumber || !branch || !gender || !year || !campus) {
            return NextResponse.json(
                { message: "All required personal details are required" },
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

        // 1st years defer club selection to their dashboard, after their
        // Career Roadmap assessment suggests clubs to them — everyone else
        // must select a club and domain at registration.
        const deferClubSelection = year === '1st';

        if (!deferClubSelection && (!selectedClub || !selectedDomain)) {
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

        // ERP Fee Receipt is no longer required

        // Determine if user is from KLH campuses to conditionally require hostel/bus fields
        const isKLHCampus = campus === "KLH - Bachupally" || campus === "KLH - Aziz Nagar" || campus === "KLH - GBS";

        if (residenceType === "Hostel" && !hostelName && !isKLHCampus) {
            return NextResponse.json(
                { message: "Hostel name is required for hostel residents" },
                { status: 400 }
            );
        }

        if (residenceType === "Day Scholar" && !busRoute && !isKLHCampus) {
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
        ) as any[];

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
        ) as any[];

        if (existingStudents.length > 0) {
            return NextResponse.json(
                { message: "Phone number already registered" },
                { status: 409 }
            );
        }


        // Check club member limits — skipped for 1st years, who have no
        // club selected yet at this point.
        if (!deferClubSelection) {
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
        }

        if (deferClubSelection) {
            await ensureNullable('students', 'clubId');
            await ensureNullable('students', 'selectedDomain');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

        // Get connection for transaction
        const connection = await pool.getConnection();

        if (selectedClub === "ESO01" && !pathway) {
            return NextResponse.json(
                { message: "Pathway is required for SVR club" },
                { status: 400 }
            );
        }

        // Start database transaction
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
                    campus, year, phoneNumber, residenceType, hostelName, busRoute,
                    country, state, district, pincode, selectedDomain, pathway, careerChoice
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username,
                    deferClubSelection ? null : selectedClub, // 1st years: NULL until chosen from their dashboard
                    name, email, branch, gender,
                    campus,
                    year, phoneNumber, residenceType,
                    hostelName || 'N/A', busRoute || null,
                    countryName || country, state, district, pincode,
                    deferClubSelection ? null : selectedDomain,
                    pathway || null, careerChoice || null
                ]
            );

            // Commit transaction
            await connection.commit();
            connection.release();

            // 1st years land straight on their SAMAM dashboard (restricted to
            // the Career Roadmap page — see dashboard/student/layout.tsx) so
            // they can take the assessment that recommends their club.
            // Best-effort and outside the transaction: if the samam_access
            // column isn't there yet or this update fails for any reason,
            // registration must still succeed — an admin can always grant
            // access manually from the SAMAM Access page as a fallback.
            if (deferClubSelection) {
                try {
                    await pool.execute('UPDATE students SET samam_access = 1 WHERE username = ?', [username]);
                } catch (e) {
                    console.error('Failed to auto-unlock SAMAM access for 1st year (non-fatal):', e);
                }
            }

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
                isY25Student,
                isY26Student
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
                    userId: (userResult as any).insertId,
                    studentId: (studentResult as any).insertId,
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