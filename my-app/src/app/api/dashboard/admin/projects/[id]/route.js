import pool from '../../../../../../lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../auth-helper';
import fs from 'fs';
import path from 'path';

export async function PUT(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { id } = params;
        const { domain, clubId, category, name, description, image } = await request.json();
        
        // Verify club exists and get club name
        const [clubCheck] = await pool.execute('SELECT id, name FROM clubs WHERE id = ?', [clubId]);
        if (clubCheck.length === 0) {
            return NextResponse.json({ error: 'Club not found' }, { status: 400 });
        }
        
        const clubName = clubCheck[0].name;
        
        // Handle image upload for LCH handicrafts/painting clubs
        if (domain === 'LCH' && image && (clubName.toLowerCase().includes('handicraft') || clubName.toLowerCase().includes('painting'))) {
            try {
                // Create directory if it doesn't exist
                const clubDir = path.join(process.cwd(), 'public', clubName);
                if (!fs.existsSync(clubDir)) {
                    fs.mkdirSync(clubDir, { recursive: true });
                }
                
                // Save image as {name}.png
                const imagePath = path.join(clubDir, `${name}.png`);
                const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                fs.writeFileSync(imagePath, base64Data, 'base64');
                
            } catch (imageError) {
                console.error('Error saving image:', imageError);
                return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
            }
        }
        
        const [result] = await pool.execute(
            'UPDATE projects SET domain = ?, clubId = ?, category = ?, name = ?, description = ? WHERE id = ?',
            [domain, clubId, category, name, description, id]
        );
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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
        
        // Check if project has students
        const [students] = await pool.execute('SELECT COUNT(*) as count FROM students WHERE projectId = ?', [id]);
        if (students[0].count > 0) {
            return NextResponse.json({ error: 'Cannot delete project with assigned students' }, { status: 400 });
        }
        
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
