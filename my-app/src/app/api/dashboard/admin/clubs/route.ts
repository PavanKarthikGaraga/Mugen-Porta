import pool from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import { requireAuth } from '@/lib/apiSecurity';
import { ensureClubsSchema } from '@/lib/dbMigrate';

export async function GET(request) {
    const auth = await requireAuth(['admin', 'analytics']);
    if (auth.response) {
        return auth.response;
    }

    try {
        await ensureClubsSchema();
        const [rows] = await pool.execute('SELECT * FROM clubs ORDER BY id');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) {
        return auth.response;
    }

    try {
        await ensureClubsSchema();
        const { id, name, description, domain, memberLimit, registration_open } = await request.json();
        
        const regOpen = registration_open === undefined ? 1 : (registration_open ? 1 : 0);
        
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO clubs (id, name, description, domain, memberLimit, registration_open) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, description, domain, memberLimit || 50, regOpen]
        );
        
        return NextResponse.json({ message: 'Club created successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Club ID already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
    }
}
