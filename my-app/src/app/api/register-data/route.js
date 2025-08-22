import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Registration Data API - Read Only
 * 
 * This endpoint provides all data needed for the registration process:
 * - Clubs with their details
 * - Projects with their details and images (for Handicrafts/Painting clubs)
 * - Domain mappings
 */

// Helper function to get images for a project
function getProjectImages(clubName, projectName) {
    try {
        const publicDir = path.join(process.cwd(), 'public');
        const clubDir = path.join(publicDir, clubName);
        
        if (!fs.existsSync(clubDir)) {
            return [];
        }
        
        const files = fs.readdirSync(clubDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });
        
        // Filter images that match the project name
        const projectImages = images.filter(image => {
            const imageName = path.parse(image).name.toLowerCase();
            const projectNameLower = projectName.toLowerCase();
            return imageName.includes(projectNameLower) || projectNameLower.includes(imageName);
        });
        
        return projectImages.map(image => ({
            filename: image,
            url: `/${encodeURIComponent(clubName)}/${encodeURIComponent(image)}`,
            name: path.parse(image).name
        }));
    } catch (error) {
        console.error('Error reading project images:', error);
        return [];
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');
        const projectId = searchParams.get('projectId');
        
        // If specific club or project member count is requested
        if (clubId) {
            // Get current member count and club limit
            const [memberResult] = await pool.execute(
                "SELECT COUNT(*) as memberCount FROM students WHERE clubId = ?",
                [clubId]
            );

            const [clubResult] = await pool.execute(
                "SELECT `limit` FROM clubs WHERE id = ?",
                [clubId]
            );

            const currentMembers = memberResult[0].memberCount;
            const memberLimit = clubResult[0]?.limit || 50; // Default to 50 if not found

            return NextResponse.json({
                currentMembers,
                memberLimit,
                availableSpots: memberLimit - currentMembers
            });
        }
        
        if (projectId) {
            // Get the current member count for the project
            const [result] = await pool.execute(
                'SELECT COUNT(*) as memberCount FROM students WHERE projectId = ?',
                [projectId]
            );

            return NextResponse.json({
                success: true,
                projectId: projectId,
                memberCount: result[0].memberCount
            });
        }
        
        // Default: Return all registration data
        
        // Fetch clubs
        const [clubs] = await pool.execute('SELECT * FROM clubs ORDER BY id');
        
        // Fetch projects with club information
        const [projects] = await pool.execute(`
            SELECT p.*, c.name as clubName 
            FROM projects p 
            LEFT JOIN clubs c ON p.clubId = c.id 
            ORDER BY p.id
        `);
        
        // Enhance projects with images for Handicrafts and Painting clubs
        const enhancedProjects = projects.map(project => {
            const clubName = project.clubName;
            const projectName = project.name;
            
            // Check if this is a Handicrafts or Painting club
            if (clubName && (
                clubName.toLowerCase().includes('handicraft') || 
                clubName.toLowerCase().includes('painting') ||
                clubName.toLowerCase().includes('art')
            )) {
                const images = getProjectImages(clubName, projectName);
                return {
                    ...project,
                    images: images,
                    hasImages: images.length > 0
                };
            }
            
            return {
                ...project,
                images: [],
                hasImages: false
            };
        });
        
        // Domain categories for reference
        const domains = [
            { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
            { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
            { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
            { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
            { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" },
            { id: "Rural", name: "Rural Mission", description: "Rural development and community projects" }
        ];
        
        const registrationData = {
            clubs: clubs,
            projects: enhancedProjects,
            domains: domains,
            metadata: {
                clubsCount: clubs.length,
                projectsCount: enhancedProjects.length,
                timestamp: new Date().toISOString()
            }
        };
        
        const response = NextResponse.json(registrationData);
        
        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        
        return response;
        
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch registration data',
            details: error.message 
        }, { status: 500 });
    }
}

// Explicitly block write operations
export async function POST() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}
