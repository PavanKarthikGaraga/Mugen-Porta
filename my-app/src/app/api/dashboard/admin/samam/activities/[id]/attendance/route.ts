import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty' && decoded.role !== 'council')) return null;
    return decoded;
}

async function isAuthorizedForActivity(user: any, activityCode: string): Promise<boolean> {
    if (user.role === 'council') {
        const councilDomains = await getCouncilDomains(user.username);
        
        if (councilDomains.length === 0) return false;
        
        const [rows] = await pool.execute('SELECT domain FROM activity_catalogue WHERE code = ?', [activityCode]);
        if ((rows as any[]).length === 0) return true; // Let 404 handle it
        
        return councilDomains.includes((rows as any[])[0].domain);
    } else if (user.role === 'faculty') {
        const facultyClubs = await getFacultyClubIds(user.username);
        if (facultyClubs.length === 0) return false;
        const placeholders = facultyClubs.map(() => '?').join(',');
        const [rows] = await pool.execute(`SELECT 1 FROM club_activity_mappings WHERE activity_code = ? AND club_id IN (${placeholders})`, [activityCode, ...facultyClubs]);
        return (rows as any[]).length > 0;
    }
    return true; // admin
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params; // id is the activity code
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const [rows] = await pool.execute(`
            SELECT ae.id, ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        return NextResponse.json({ success: true, students: rows });

    } catch (error: any) {
        console.error('Fetch attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const { absentees } = await request.json(); // Array of usernames

        // Once attendance has been marked/locked for this activity, only an
        // admin may make further changes -- faculty can mark it the first
        // time, but not re-edit it afterward.
        const [lockRows]: any = await pool.execute(
            'SELECT 1 FROM activity_enrollments WHERE activity_code = ? AND attendance_marked = TRUE LIMIT 1',
            [id]
        );
        if ((lockRows as any[]).length > 0 && user.role !== 'admin') {
            return NextResponse.json({ message: 'Attendance is locked. Only an admin can make further changes.' }, { status: 403 });
        }

        // Mark everyone in the activity as attendance_marked = TRUE
        // If username in absentees, set attendance_percentage = 0, else 100
        const absenteesPlaceholders = absentees.length > 0 ? absentees.map(() => '?').join(',') : "''";
        
        let query = `
            UPDATE activity_enrollments 
            SET 
                attendance_marked = TRUE,
                attendance_percentage = CASE 
                    WHEN username IN (${absenteesPlaceholders}) THEN 0
                    ELSE 100
                END
            WHERE activity_code = ?
        `;
        
        let queryParams = [...absentees, id];

        await pool.execute(query, queryParams);

        // Close registration immediately when attendance is locked so no new
        // students can enroll after the fact.
        await pool.execute(
            'UPDATE activity_catalogue SET registration_open = 0 WHERE code = ?',
            [id]
        );

        // Auto-approve the submission when Admin/Faculty takes attendance
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS attendance_submissions (
                    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
                    activity_code VARCHAR(50)  NOT NULL,
                    club_id       VARCHAR(20)  NOT NULL,
                    club_name     VARCHAR(100) NOT NULL DEFAULT '',
                    activity_title VARCHAR(200) NOT NULL DEFAULT '',
                    lead_username VARCHAR(10)  NOT NULL,
                    submitted_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
                    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    status        ENUM('pending','verified','rejected') DEFAULT 'pending',
                    scanned_copy_url VARCHAR(500) DEFAULT NULL,
                    verified_by   VARCHAR(10)  DEFAULT NULL,
                    verified_at   TIMESTAMP    DEFAULT NULL,
                    faculty_notes TEXT         DEFAULT NULL,
                    UNIQUE KEY uq_activity (activity_code)
                )
            `);

            const [actInfo]: any = await pool.execute(
                'SELECT title FROM activity_catalogue WHERE code = ?', [id]
            );
            const actTitle = (actInfo as any[])[0]?.title ?? id;

            if (user.role === 'admin') {
                await pool.execute(`
                    INSERT INTO attendance_submissions
                        (activity_code, club_id, club_name, activity_title, lead_username, status, verified_by, verified_at)
                    VALUES (?, 'ADMIN_TAKEN', 'Admin Action', ?, ?, 'verified', ?, CURRENT_TIMESTAMP)
                    ON DUPLICATE KEY UPDATE
                        status = 'verified',
                        verified_by = ?,
                        verified_at = CURRENT_TIMESTAMP
                `, [id, actTitle, user.username, user.username, user.username]);
            } else {
                await pool.execute(`
                    INSERT INTO attendance_submissions
                        (activity_code, club_id, club_name, activity_title, lead_username, status)
                    VALUES (?, 'ROLE_TAKEN', ?, ?, ?, 'pending')
                    ON DUPLICATE KEY UPDATE
                        status = 'pending',
                        verified_by = NULL,
                        verified_at = NULL
                `, [id, String(user.role).toUpperCase() + ' Action', actTitle, user.username]);
            }
        } catch (submitErr) {
            console.error('Auto-verify for admin failed (non-fatal):', submitErr);
        }

        return NextResponse.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error: any) {
        console.error('Save attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
