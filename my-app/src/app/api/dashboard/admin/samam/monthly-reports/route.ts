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

        // 1. Define exactly 25 Canonical Clubs with safe matchers per domain
        const canonicalClubs = [
            // TEC
            { canonical: 'ZeroOne Code Club', domain: 'TEC', matchers: ['zeroone', 'zero one'] },
            { canonical: 'Cyber Security Club', domain: 'TEC', matchers: ['cyber'] },
            { canonical: 'Electric Vehicle Club', domain: 'TEC', matchers: ['electric vehicle', 'ev club', 'electric'] },
            { canonical: 'Quantum Computing Club', domain: 'TEC', matchers: ['quantum'] },
            { canonical: 'WebApps Club', domain: 'TEC', matchers: ['webapp'] },
            { canonical: 'Automation Club', domain: 'TEC', matchers: ['automation'] },
            { canonical: 'Force Vega Racing', domain: 'TEC', matchers: ['vega', 'force vega'] },
            { canonical: 'Ed Tech Club', domain: 'TEC', matchers: ['edtech', 'ed tech'] },
            // LCH
            { canonical: 'Music Club', domain: 'LCH', matchers: ['music'] },
            { canonical: 'KL eSports Club', domain: 'LCH', matchers: ['esport', 'e-sport'] },
            { canonical: 'Short Film Makers Club', domain: 'LCH', matchers: ['short film'] },
            { canonical: 'Adventure Club', domain: 'LCH', matchers: ['adventure'] },
            { canonical: 'Literature Club', domain: 'LCH', matchers: ['literature'] },
            { canonical: 'Dance Club', domain: 'LCH', matchers: ['dance'] },
            { canonical: 'Vastraa (Fashion) Club', domain: 'LCH', matchers: ['fashion', 'vastraa'] },
            { canonical: 'Handicrafts Club', domain: 'LCH', matchers: ['handicraft'] },
            { canonical: 'Arts & Painting Club', domain: 'LCH', matchers: ['arts', 'painting', 'art club'] },
            { canonical: 'Photography Club', domain: 'LCH', matchers: ['photography'] },
            // ESO
            { canonical: 'SVR Club', domain: 'ESO', matchers: ['svr'] },
            { canonical: 'Spiritual Sciences Club', domain: 'ESO', matchers: ['spiritual'] },
            { canonical: 'Yuva Tourism Club', domain: 'ESO', matchers: ['yuva'] },
            { canonical: 'KL Youth Policy LAB', domain: 'ESO', matchers: ['policy'] },
            // IIE
            { canonical: 'IE Club', domain: 'IIE', matchers: ['ie club', 'innovation', 'incubation'] },
            // HWB
            { canonical: 'Yoga Club', domain: 'HWB', matchers: ['yoga'] },
            { canonical: 'SafeLife Club', domain: 'HWB', matchers: ['safelife', 'safe life'] }
        ];

        const getCanonicalMatch = (name: string, domain: string) => {
            if (!name || !domain) return null;
            const lowerName = name.toLowerCase();
            for (const c of canonicalClubs) {
                if (c.domain === domain) {
                    // Match if any substring is present. Because we also filter by domain,
                    // false positives (like "Smart" matching "art" in TEC) are prevented.
                    if (c.matchers.some(m => lowerName.includes(m))) {
                        return c.canonical;
                    }
                }
            }
            return null;
        };

        // 2. Fetch ALL Clubs in domains and group them into the Canonical 25
        const [rawClubsRows]: any = await pool.execute(`
            SELECT id, name, domain FROM clubs 
            WHERE domain IN ('TEC', 'LCH', 'ESO', 'IIE', 'HWB')
        `);

        const canonicalToClubMap = new Map();
        const dbIdToCanonical = new Map();

        for (const dbClub of rawClubsRows) {
            const canonName = getCanonicalMatch(dbClub.name, dbClub.domain);
            if (canonName) {
                dbIdToCanonical.set(dbClub.id, canonName);
                if (!canonicalToClubMap.has(canonName)) {
                    canonicalToClubMap.set(canonName, {
                        id: canonName, // Use canonical string as virtual ID
                        name: canonName,
                        domain: dbClub.domain
                    });
                }
            }
        }
        
        const finalClubsList = Array.from(canonicalToClubMap.values());

        // 3. Fetch and Merge Activities
        const [activitiesRows]: any = await pool.execute(`
            SELECT a.code, a.title, a.domain, a.category, a.activity_date, a.venue,
                   COALESCE(cam.club_id, ccm.club_id, c_direct.id) as club_id,
                   COALESCE(c_mapped.name, c_cat.name, c_direct.name) as club_name,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = a.code AND ae.attendance_marked = TRUE) as present,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = a.code) as enrolled
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

        const uniqueActivities = [];
        const seenCodes = new Set();
        for (const row of activitiesRows) {
            const canonName = dbIdToCanonical.get(row.club_id) || getCanonicalMatch(row.club_name, row.domain);
            if (canonName) {
                row.club_name = canonName;
                if (!seenCodes.has(row.code)) {
                    seenCodes.add(row.code);
                    row.participants = row.present > 0 ? row.present : row.enrolled;
                    uniqueActivities.push(row);
                }
            }
        }

        // 4. Fetch and Merge Student Stats
        const [rawStudentsRows]: any = await pool.execute(`
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

        const mergedStudentStats = new Map();
        for (const s of rawStudentsRows) {
            const canonName = dbIdToCanonical.get(s.clubId);
            if (canonName) {
                if (!mergedStudentStats.has(canonName)) {
                    mergedStudentStats.set(canonName, {
                        clubId: canonName,
                        yr1: 0, yr2: 0, yr3: 0, yr4: 0, dayScholar: 0, hosteler: 0, total: 0
                    });
                }
                const merged = mergedStudentStats.get(canonName);
                merged.yr1 += Number(s.yr1) || 0;
                merged.yr2 += Number(s.yr2) || 0;
                merged.yr3 += Number(s.yr3) || 0;
                merged.yr4 += Number(s.yr4) || 0;
                merged.dayScholar += Number(s.dayScholar) || 0;
                merged.hosteler += Number(s.hosteler) || 0;
                merged.total += Number(s.total) || 0;
            }
        }
        
        const finalStudentStats = Array.from(mergedStudentStats.values());

        return NextResponse.json({
            success: true,
            clubs: finalClubsList,
            activities: uniqueActivities,
            studentStats: finalStudentStats
        });
    } catch (error: any) {
        console.error('Monthly reports error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
