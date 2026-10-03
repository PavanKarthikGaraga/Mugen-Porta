import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token) as { role: string; username: string } | null;
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // 1-12
        const year = searchParams.get('year'); // 2026

        if (!month || !year) {
            return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
        }

        const allowedClubs = [
            'ZeroOne Code Club', 'CyberSecurity', 'Electric Vehicle', 
            'Quantum Computing', 'WebApps', 'Automation', 
            'Force Vega Racing', 'EdTech',
            'Music Club', 'KL eSports Club', 'Short Film Makers', 
            'Adventure', 'Literature', 'Dance', 'DANCE',
            'Fashion', 'Handicrafts', 'Art Club', 
            'Photography',
            'SVR', 'Spiritual Sciences', 'Yuva Tourism', 'KL Youth Policy LAB',
            'IE', 'IE Club', 'Innovation & Entrepreneurship',
            'Yoga', 'SafeLife'
        ];

        // 1. Fetch Clubs (only the 25 allowed)
        const placeholders = allowedClubs.map(() => '?').join(',');
        const [clubsRows]: any = await pool.execute(`
            SELECT id, name, domain FROM clubs 
            WHERE domain IN ('TEC', 'LCH', 'ESO', 'IIE', 'HWB')
            AND name IN (${placeholders})
        `, [...allowedClubs]);

        const allowedClubIds = new Set(clubsRows.map((c: any) => c.id));
        const allowedClubNamesSet = new Set(allowedClubs);

        // 2. Fetch Activities in the month
        // We use LEFT JOIN to find the club, either through explicit mapping or category mapping
        const [activitiesRows]: any = await pool.execute(`
            SELECT a.code, a.title, a.domain, a.category, a.activity_date, a.venue,
                   COALESCE(cam.club_id, ccm.club_id, c_direct.id) as club_id,
                   COALESCE(c_mapped.name, c_cat.name, c_direct.name) as club_name,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = a.code AND ae.attendance_marked = TRUE) as participants
            FROM activity_catalogue a
            LEFT JOIN club_activity_mappings cam ON cam.activity_code = a.code
            LEFT JOIN clubs c_mapped ON c_mapped.id = cam.club_id
            LEFT JOIN club_category_mappings ccm ON ccm.category = a.category
            LEFT JOIN clubs c_cat ON c_cat.id = ccm.club_id
            LEFT JOIN clubs c_direct ON c_direct.name = a.category
            WHERE YEAR(a.activity_date) = ? AND MONTH(a.activity_date) = ?
              AND a.domain IN ('TEC', 'LCH', 'ESO', 'IIE', 'HWB')
            ORDER BY a.activity_date ASC
        `, [year, month]);

        // Deduplicate activities in JS to avoid ONLY_FULL_GROUP_BY SQL errors
        const uniqueActivities = [];
        const seenCodes = new Set();
        for (const row of activitiesRows) {
            // Only include activities mapped to the allowed 25 clubs
            if (row.club_name && allowedClubNamesSet.has(row.club_name)) {
                if (!seenCodes.has(row.code)) {
                    seenCodes.add(row.code);
                    uniqueActivities.push(row);
                }
            }
        }

        // 3. Fetch Student Stats
        const [studentsRows]: any = await pool.execute(`
            SELECT 
                clubId,
                SUM(CASE WHEN year = '1st' THEN 1 ELSE 0 END) as yr1,
                SUM(CASE WHEN year = '2nd' THEN 1 ELSE 0 END) as yr2,
                SUM(CASE WHEN year = '3rd' THEN 1 ELSE 0 END) as yr3,
                SUM(CASE WHEN year = '4th' THEN 1 ELSE 0 END) as yr4,
                SUM(CASE WHEN residenceType = 'Day Scholar' THEN 1 ELSE 0 END) as dayScholar,
                SUM(CASE WHEN residenceType = 'Hostel' THEN 1 ELSE 0 END) as hosteler,
                COUNT(*) as total
            FROM students
            WHERE clubId IS NOT NULL
            GROUP BY clubId
        `);

        return NextResponse.json({
            success: true,
            clubs: clubsRows,
            activities: uniqueActivities,
            studentStats: studentsRows.filter((s: any) => allowedClubIds.has(s.clubId))
        });
    } catch (error: any) {
        console.error('Monthly reports error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
