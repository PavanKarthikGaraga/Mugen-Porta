import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../auth-helper';
import { ensureClubGroupMappingsTable } from '@/lib/dbMigrate';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        await ensureClubGroupMappingsTable();
        
        // Fetch mappings joined with club names
        const [rows] = await pool.execute(`
            SELECT m.id, m.group_type, m.group_name, m.club_id, c.name as club_name
            FROM club_group_mappings m
            LEFT JOIN clubs c ON m.club_id = c.id
            ORDER BY m.group_type, m.group_name, m.club_id
        `);
        
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch mappings' }, { status: 500 });
    }
}

export async function POST(request) {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        await ensureClubGroupMappingsTable();
        const { group_type, group_name, club_id } = await request.json();
        
        if (!group_type || !group_name || !club_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [result] = await pool.execute(
            'INSERT INTO club_group_mappings (group_type, group_name, club_id) VALUES (?, ?, ?)',
            [group_type, group_name, club_id]
        );
        
        return NextResponse.json({ message: 'Mapping created successfully', id: (result as any).insertId });
    } catch (error: any) {
        console.error('Database error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'This club is already mapped to this group' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create mapping' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Mapping ID is required' }, { status: 400 });
        }

        await pool.execute('DELETE FROM club_group_mappings WHERE id = ?', [id]);
        
        return NextResponse.json({ message: 'Mapping deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to delete mapping' }, { status: 500 });
    }
}
