import pool from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../auth-helper';

export async function GET(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM clubs ORDER BY id');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
}

export async function POST(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
    const { id, name, description, domain, categories, memberLimit } = await request.json();
        
        const [result] = await pool.execute(
            'INSERT INTO clubs (id, name, description, domain, categories, memberLimit) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, description, domain, JSON.stringify(categories), memberLimit || 50]
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
