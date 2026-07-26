import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

// One-time (idempotent) demo-content seeder for activity AC-A02
// ("Sketching & Drawing Workshop"). Run once by an admin, e.g.:
//   POST /api/setup-db/seed-ac-a02-demo
// It only ever touches the `resources` / `assignments` columns of an
// existing activity row (never overwrites title/domain/etc. an admin may
// have already customized), and creates the activity itself only if it
// doesn't exist yet.

const ACTIVITY_CODE = 'AC-A02';

const DEMO_RESOURCES = [
    {
        id: 1,
        type: 'pdf',
        title: 'Sketching & Drawing Workshop — Reference Guide',
        url: '/uploads/sketching-drawing-workshop-guide.pdf',
    },
    {
        id: 2,
        type: 'link',
        title: 'Drawing — Techniques & Fundamentals (Wikipedia)',
        url: 'https://en.wikipedia.org/wiki/Drawing',
    },
    {
        id: 3,
        type: 'link',
        title: 'Proko — Figure & Observational Drawing Lessons',
        url: 'https://www.proko.com/',
    },
];

function twoWeeksFromNow() {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
}

const DEMO_ASSIGNMENTS = [
    {
        id: 1,
        title: 'Submit Your Sketch Portfolio (3 Observational Drawings)',
        dueDate: twoWeeksFromNow(),
        type: 'submission',
        description:
            'Upload 3 original pencil/pen sketches demonstrating proportion, perspective, and shading as covered in the workshop. Accepted formats: PDF, JPG, or PNG.',
    },
];

async function ensureSubmissionsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS activity_assignment_submissions (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            activity_code VARCHAR(50) NOT NULL,
            assignment_id VARCHAR(50) NOT NULL,
            username VARCHAR(10) NOT NULL,
            file_url VARCHAR(500) NOT NULL,
            file_name VARCHAR(255) DEFAULT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_submission (activity_code, assignment_id, username)
        );
    `);
}

export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureSubmissionsTable();

        const [rows]: any = await pool.execute(
            `SELECT id FROM activity_catalogue WHERE code = ? LIMIT 1`,
            [ACTIVITY_CODE]
        );

        const resourcesJson = JSON.stringify(DEMO_RESOURCES);
        const assignmentsJson = JSON.stringify(DEMO_ASSIGNMENTS);

        if (rows.length > 0) {
            // Activity already exists — only attach the demo resources/
            // assignments, don't clobber anything an admin already set.
            await pool.execute(
                `UPDATE activity_catalogue SET resources = ?, assignments = ? WHERE code = ?`,
                [resourcesJson, assignmentsJson, ACTIVITY_CODE]
            );
            return NextResponse.json({
                success: true,
                message: `Updated existing activity ${ACTIVITY_CODE} with demo resources and assignments.`,
                created: false,
            });
        }

        const description =
            'This workshop introduces students to the foundations of drawing by developing observation, ' +
            'proportion, perspective, and shading techniques.';

        await pool.execute(
            `INSERT INTO activity_catalogue
                (code, title, description, domain, category, sdc_credits, max_seats, status,
                 difficulty, journey_level, purpose, resources, assignments, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                ACTIVITY_CODE,
                'Sketching & Drawing Workshop',
                description,
                'LCH',
                'Workshop',
                20,
                50,
                'active',
                'Beginner',
                'Explorer',
                description,
                resourcesJson,
                assignmentsJson,
                auth.user.username || 'admin',
            ]
        );

        return NextResponse.json({
            success: true,
            message: `Created activity ${ACTIVITY_CODE} with demo resources and assignments.`,
            created: true,
        });
    } catch (error: any) {
        console.error('Seed AC-A02 demo error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to seed demo activity') }, { status: 500 });
    }
}
