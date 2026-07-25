import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function checkDevAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;

    // Check dev access
    const envUsers = process.env.NEXT_PUBLIC_DEV_USERNAME ? process.env.NEXT_PUBLIC_DEV_USERNAME.split(',') : [];
    const defaultUsers = ['2300032048', '2400030188', '240030188'];
    const devUsernames = [...new Set([...envUsers, ...defaultUsers])].map(u => u.trim());
    
    if (!devUsernames.includes(decoded.username as string)) return null;
    
    return decoded;
}

export async function GET(request: Request) {
    try {
        if (!await checkDevAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        // Fetch all categories from activity_catalogue
        const [catRows] = await pool.execute(`
            SELECT DISTINCT domain, category 
            FROM activity_catalogue 
            WHERE category IS NOT NULL AND category != ''
            ORDER BY domain, category
        `);

        if (!username) {
            return NextResponse.json({ allCategories: catRows });
        }

        // Fetch lead data — join students for name, LEFT JOIN so it doesn't fail if student row missing
        let leadRows: any[] = [];
        try {
            const [rows]: any = await pool.execute(`
                SELECT l.username, COALESCE(s.name, l.username) as name, l.assigned_categories
                FROM leads l
                LEFT JOIN students s ON l.username = s.username
                WHERE l.username = ?
            `, [username]);
            leadRows = rows;
        } catch (queryError: any) {
            // If column doesn't exist yet, return a helpful message
            if (queryError.code === 'ER_BAD_FIELD_ERROR' || queryError.message?.includes('assigned_categories')) {
                return NextResponse.json({ 
                    message: 'Database schema not up to date. Please run: ALTER TABLE leads ADD COLUMN assigned_categories JSON DEFAULT NULL;' 
                }, { status: 500 });
            }
            throw queryError;
        }

        if (leadRows.length === 0) {
            return NextResponse.json({ message: 'Lead not found. Make sure the ID belongs to a user with the Lead role.' }, { status: 404 });
        }

        const lead = leadRows[0];
        // Parse JSON if it exists
        if (lead.assigned_categories && typeof lead.assigned_categories === 'string') {
            try {
                lead.assigned_categories = JSON.parse(lead.assigned_categories);
            } catch (e) {
                lead.assigned_categories = [];
            }
        } else if (!lead.assigned_categories) {
            lead.assigned_categories = [];
        }

        return NextResponse.json({ 
            lead, 
            allCategories: catRows 
        });

    } catch (error: any) {
        console.error('Lead Activities GET error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!await checkDevAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { username, assigned_categories } = body;

        if (!username || !Array.isArray(assigned_categories)) {
            return NextResponse.json({ message: 'Username and assigned_categories array required' }, { status: 400 });
        }

        await pool.execute(`
            UPDATE leads 
            SET assigned_categories = ? 
            WHERE username = ?
        `, [JSON.stringify(assigned_categories), username]);

        return NextResponse.json({ success: true, message: 'Assigned categories updated successfully' });

    } catch (error: any) {
        console.error('Lead Activities POST error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
