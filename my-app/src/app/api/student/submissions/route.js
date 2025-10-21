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

        if (payload.role !== 'student') {
            return NextResponse.json(
                { error: 'Access denied. Students only.' },
                { status: 403 }
            );
        }

        // Fetch internal marks
        const [internalMarks] = await pool.execute(
            'SELECT m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total FROM student_internal_marks WHERE username = ?',
            [payload.username]
        );

        // Fetch external marks
        const [externalMarks] = await pool.execute(
            'SELECT internal, frm, fyt_m, flk_m, total FROM student_external_marks WHERE username = ?',
            [payload.username]
        );

        const internalData = internalMarks.length > 0 ? internalMarks[0] : {
            m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0,
            yt_m: 0, lk_m: 0, total: 0
        };

        const externalData = externalMarks.length > 0 ? externalMarks[0] : {
            internal: 0, frm: 0, fyt_m: 0, flk_m: 0, total: 0
        };

        // Calculate statistics
        const reportsApproved = [internalData.m1, internalData.m2, internalData.m3, internalData.m4, internalData.m5, internalData.m6, internalData.m7].filter(m => m > 0).length;
        const youtubeApproved = internalData.yt_m > 0;
        const linkedinApproved = internalData.lk_m > 0;

        return NextResponse.json({
            success: true,
            overview: {
                internal: {
                    marks: internalData.total,
                    maxMarks: 60,
                    reportsApproved,
                    youtubeApproved,
                    linkedinApproved
                },
                external: {
                    marks: externalData.total,
                    maxMarks: 40,
                    status: externalData.total > 0 ? 'evaluated' : 'pending'
                },
                total: {
                    marks: internalData.total + externalData.total,
                    maxMarks: 100,
                    percentage: Math.round(((internalData.total + externalData.total) / 100) * 100)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching submissions overview:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
