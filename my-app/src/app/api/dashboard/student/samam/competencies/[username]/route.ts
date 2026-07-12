import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        // Fetch all definitions joined with student scores
        const [rows] = await pool.execute(`
            SELECT 
                cd.id as comp_id, cd.name, cd.category_id, cd.category_name, 
                cd.color, cd.icon, cd.sort_order,
                sc.score, sc.trend, sc.level
            FROM competency_definitions cd
            LEFT JOIN student_competencies sc 
                ON cd.id = sc.competency_id AND sc.username = ?
            WHERE cd.is_active = 1
            ORDER BY cd.category_id, cd.sort_order
        `, [username]) as any[];

        // Group by category
        const categoriesMap: Record<string, any> = {};

        rows.forEach(row => {
            const catId = row.category_id;
            if (!categoriesMap[catId]) {
                categoriesMap[catId] = {
                    id: catId,
                    title: row.category_name,
                    icon: getCategoryIcon(catId),
                    description: getCategoryDescription(catId),
                    competencies: []
                };
            }

            categoriesMap[catId].competencies.push({
                id: row.comp_id,
                name: row.name,
                score: row.score || 0,
                trend: row.trend || 0,
                level: row.level || 'Explorer',
                color: row.color,
                icon: row.icon
            });
        });

        // Convert map to array
        const categories = Object.values(categoriesMap);

        return NextResponse.json(categories);

    } catch (error: any) {
        console.error('Database error fetching competencies:', error);
        return NextResponse.json({ error: 'Failed to fetch competencies', details: error.message }, { status: 500 });
    }
}

// Helpers to provide missing UI data for categories
function getCategoryIcon(catId: string) {
    const icons: Record<string, string> = {
        'technical': '💻',
        'professional': '👔',
        'leadership': '👑',
        'research': '🔬',
        'innovation': '💡',
        'personal': '🌱'
    };
    return icons[catId] || '📌';
}

function getCategoryDescription(catId: string) {
    const desc: Record<string, string> = {
        'technical': 'Core engineering and technical skills',
        'professional': 'Workplace readiness and soft skills',
        'leadership': 'Guiding teams and driving impact',
        'research': 'Academic inquiry and analysis',
        'innovation': 'Creative problem solving and ventures',
        'personal': 'Self-awareness and emotional intelligence'
    };
    return desc[catId] || '';
}
