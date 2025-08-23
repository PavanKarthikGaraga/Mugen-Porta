import pool from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../auth-helper';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const [rows] = await pool.execute(`
            SELECT p.*, c.name as clubName 
            FROM projects p 
            LEFT JOIN clubs c ON p.clubId = c.id 
            ORDER BY p.id
        `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
                const { id, domain, clubId, category, rural, ruralCategory, subCategory, name, description, image } = await request.json();
        
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
        
        // Insert project into database
        const [result] = await pool.execute(
            'INSERT INTO projects (id, domain, clubId, category, rural, ruralCategory, subCategory, name, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, domain, clubId, category, rural || false, ruralCategory || null, subCategory || null, name, description]
        );
        
        return NextResponse.json({ message: 'Project created successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Project ID already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
