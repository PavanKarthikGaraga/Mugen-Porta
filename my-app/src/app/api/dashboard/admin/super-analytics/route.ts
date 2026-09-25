import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { safeMessage } from '@/lib/apiSecurity';

async function checkSuperAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token) as { role: string; username: string } | null;
    // Only allow admin
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await checkSuperAdmin();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        // Default to today if date is not provided
        let targetDate = searchParams.get('date');
        if (!targetDate) {
            const today = new Date();
            // format as YYYY-MM-DD
            targetDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        }

        // 1. Overall Analytics (All Time)
        const [overallRows]: any = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN domain LIKE '%SAC%' THEN 1 ELSE 0 END) as sac_total,
                SUM(CASE WHEN domain LIKE '%DEPT%' THEN 1 ELSE 0 END) as dept_total,
                SUM(CASE WHEN domain LIKE '%MHS%' THEN 1 ELSE 0 END) as mhs_total
            FROM activity_catalogue
        `);

        // 2. Today's Activities
        const [todayRows]: any = await pool.execute(`
            SELECT 
                ac.code,
                ac.title,
                ac.domain,
                c.name AS club_name,
                ac.category,
                ac.venue,
                ac.start_time,
                ac.end_time,
                ac.status,
                ac.activity_date
            FROM activity_catalogue ac
            LEFT JOIN club_activity_mappings cam ON ac.code = cam.activity_code
            LEFT JOIN clubs c ON cam.club_id = c.id
            WHERE ac.activity_date = ?
            ORDER BY ac.start_time ASC
        `, [targetDate]);

        // Process today's activities to calculate derived status
        const todayStr = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS format

        let todayActivities = (todayRows as any[]).map(row => {
            const isToday = targetDate === todayStr;
            let derivedStatus = 'upcoming'; // Default

            if (row.status === 'completed') {
                derivedStatus = 'completed';
            } else {
                // Not completed in DB. Check end time.
                if (row.end_time) {
                    if (isToday) {
                        if (nowTime > row.end_time) {
                            derivedStatus = 'pending'; // Time passed, but attendance not submitted
                        } else if (nowTime >= row.start_time && nowTime <= row.end_time) {
                            derivedStatus = 'ongoing';
                        }
                    } else if (targetDate! < todayStr) {
                         derivedStatus = 'pending'; // Past date, but not completed
                    }
                }
            }

            return {
                code: row.code,
                title: row.title,
                domain: row.domain || 'UNKNOWN',
                dept_club: row.club_name || row.category || 'N/A',
                venue: row.venue || 'TBA',
                start_time: row.start_time,
                end_time: row.end_time,
                status: derivedStatus,
                db_status: row.status
            };
        });

        const dailyAnalytics = {
            total: todayActivities.length,
            completed: todayActivities.filter(a => a.status === 'completed').length,
            pending: todayActivities.filter(a => a.status === 'pending').length,
            upcoming: todayActivities.filter(a => a.status === 'upcoming').length,
            ongoing: todayActivities.filter(a => a.status === 'ongoing').length,
            sac_count: todayActivities.filter(a => (a.domain || '').toUpperCase().includes('SAC')).length,
            dept_count: todayActivities.filter(a => (a.domain || '').toUpperCase().includes('DEPT')).length,
            mhs_count: todayActivities.filter(a => (a.domain || '').toUpperCase().includes('MHS')).length,
        };

        return NextResponse.json({
            success: true,
            targetDate,
            overall: overallRows[0],
            daily: dailyAnalytics,
            activities: todayActivities
        });

    } catch (error: any) {
        console.error('Super Analytics Error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch analytics') }, { status: 500 });
    }
}
