import pool from '../../../../../../lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../auth-helper';

export async function PUT(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { id } = params;
        const { name, description, domain, categories, limit } = await request.json();
        
        const [result] = await pool.execute(
            'UPDATE clubs SET name = ?, description = ?, domain = ?, categories = ?, `limit` = ? WHERE id = ?',
            [name, description, domain, JSON.stringify(categories), limit || 50, id]
        );
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Club updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { id } = params;
        
        // Check if club has projects
        const [projects] = await pool.execute('SELECT COUNT(*) as count FROM projects WHERE clubId = ?', [id]);
        if (projects[0].count > 0) {
            return NextResponse.json({ error: 'Cannot delete club with existing projects' }, { status: 400 });
        }
        
        const [result] = await pool.execute('DELETE FROM clubs WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Club not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Club deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
    }
}
