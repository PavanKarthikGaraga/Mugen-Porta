import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { getCouncilDomains } from '@/lib/councilScope';

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
                const [leadResult]: any = await pool.execute(
                    'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
                    [payload.username as string]
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
                const [studentResult]: any = await pool.execute(
                    'SELECT COALESCE(samam_access, 1) as samam_access, clubId FROM students WHERE username = ?',
                    [payload.username as string]
                );
                if (studentResult.length > 0) {
                    additionalData = {
                        samam_access: Number(studentResult[0].samam_access),
                        clubId: studentResult[0].clubId ?? '',
                    };
                }
            } catch {
                // Column not yet created — default open so existing users aren't locked out
                additionalData = { samam_access: 1, clubId: '' };
            }
        } else if (payload.role === 'faculty') {
            try {
                const [facultyResult]: any = await pool.execute(
                    'SELECT assignedClubs FROM faculty WHERE username = ?',
                    [payload.username as string]
                );
                if (facultyResult.length > 0) {
                    const assignedClubsStr = facultyResult[0].assignedClubs;
                    let parsedClubs: string[] = [];
                    if (assignedClubsStr) {
                        if (Array.isArray(assignedClubsStr)) {
                            parsedClubs = assignedClubsStr;
                        } else {
                            try {
                                parsedClubs = JSON.parse(assignedClubsStr);
                                if (!Array.isArray(parsedClubs)) parsedClubs = [assignedClubsStr];
                            } catch {
                                parsedClubs = [assignedClubsStr];
                            }
                        }
                    }
                    additionalData = {
                        assignedClubs: parsedClubs
                    };
                }
            } catch (error) {
                console.error('Error fetching faculty data:', error);
            }
        } else if (payload.role === 'council') {
            try {
                const domains = await getCouncilDomains(payload.username as string);
                if (domains.length > 0) {
                    const ph = domains.map(() => '?').join(',');
                    const [clubRows]: any = await pool.execute(
                        `SELECT id, name, domain FROM clubs WHERE domain IN (${ph})`, domains
                    );
                    // assignedDomain (singular, first domain) kept for any
                    // consumer not yet updated for multi-domain support.
                    additionalData = { assignedDomain: domains[0], assignedDomains: domains, clubs: clubRows };
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
