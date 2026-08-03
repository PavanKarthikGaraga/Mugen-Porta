import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        let additionalData = {};

        // Get additional data based on role
        if (payload.role === 'lead') {
            try {
                const [leadResult] = await pool.execute(
                    'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
                    [payload.username]
                );
                if (leadResult.length > 0) {
                    additionalData = {
                        clubId: leadResult[0].clubId,
                        clubName: leadResult[0].clubName
                    };
                }
            } catch (error) {
                console.error('Error fetching lead data:', error);
            }
        } else if (payload.role === 'student') {
            try {
                const [studentResult] = await pool.execute(
                    'SELECT COALESCE(samam_access, 1) as samam_access, clubId, year, campus FROM students WHERE username = ?',
                    [payload.username]
                ) as any[];
                if (studentResult.length > 0) {
                    additionalData = {
                        samam_access: Number(studentResult[0].samam_access),
                        clubId: studentResult[0].clubId || null,
                        year: studentResult[0].year || null,
                        campus: studentResult[0].campus || null,
                    };
                }
            } catch {
                // Column not yet created — default open so existing users aren't locked out
                additionalData = { samam_access: 1 };
            }
        } else if (payload.role === 'faculty') {
            try {
                const [facultyResult] = await pool.execute(
                    'SELECT assignedClubs FROM faculty WHERE username = ?',
                    [payload.username]
                );
                if (facultyResult.length > 0) {
                    const assignedClubs = facultyResult[0].assignedClubs;
                    additionalData = {
                        assignedClubs: assignedClubs ? (Array.isArray(assignedClubs) ? assignedClubs : JSON.parse(assignedClubs)) : []
                    };
                }
            } catch (error) {
                console.error('Error fetching faculty data:', error);
            }
        } else if (payload.role === 'council') {
            try {
                const [councilResult]: any = await pool.execute(
                    'SELECT assignedDomain FROM council WHERE username = ?',
                    [payload.username]
                );
                if (councilResult.length > 0) {
                    const domain = councilResult[0].assignedDomain as string;
                    const [clubRows]: any = await pool.execute(
                        'SELECT id, name FROM clubs WHERE domain = ?', [domain]
                    );
                    additionalData = { assignedDomain: domain, clubs: clubRows };
                }
            } catch (error) {
                console.error('Error fetching council data:', error);
            }
        }

        // Check if this is a proxy session
        const isProxy = payload.isProxy || false;
        const proxyInfo = isProxy ? {
            isProxy: true,
            proxyAdminUsername: payload.proxyAdminUsername,
            proxyAdminName: payload.proxyAdminName
        } : {};

        return NextResponse.json({
            user: {
                username: payload.username,
                name: payload.name,
                role: payload.role,
                isProxy: isProxy,
                ...proxyInfo,
                ...additionalData
            }
        });
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}
