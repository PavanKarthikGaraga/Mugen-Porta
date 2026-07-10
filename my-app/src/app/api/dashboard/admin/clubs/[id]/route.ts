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
        const { id: oldId } = await params;
        const { id: newId, name, description, domain, memberLimit } = await request.json();
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Disable foreign key checks temporarily to allow ID update
            await connection.execute('SET FOREIGN_KEY_CHECKS=0');

            // Update the main club record
            const targetId = newId || oldId;
            const [result] = await connection.execute(
                'UPDATE clubs SET id = ?, name = ?, description = ?, domain = ?, memberLimit = ? WHERE id = ?',
                [targetId, name, description, domain, memberLimit || 50, oldId]
            );

            // If the ID changed, update references manually
            if (newId && newId !== oldId) {
                await connection.execute('UPDATE students SET clubId = ? WHERE clubId = ?', [newId, oldId]);
                await connection.execute('UPDATE leads SET clubId = ? WHERE clubId = ?', [newId, oldId]);
            }

            // Re-enable foreign key checks
            await connection.execute('SET FOREIGN_KEY_CHECKS=1');

            await connection.commit();
            
            if (result.affectedRows === 0) {
                return NextResponse.json({ error: 'Club not found' }, { status: 404 });
            }
            
            return NextResponse.json({ message: 'Club updated successfully' });
        } catch (error) {
            await connection.rollback();
            await connection.execute('SET FOREIGN_KEY_CHECKS=1');
            throw error;
        } finally {
            connection.release();
        }
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
        const { id } = await params;
        
        
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
