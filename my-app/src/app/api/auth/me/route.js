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
        }

        return NextResponse.json({
            username: payload.username,
            name: payload.name,
            role: payload.role,
            ...additionalData
        });
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}
