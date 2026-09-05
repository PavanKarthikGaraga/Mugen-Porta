import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
};

// Candidate upload directories, searched in order:
// 1. UPLOAD_DIR env (production persistent mount)
// 2. <cwd>/uploads (default new location)
// 3. <cwd>/public/uploads (legacy location)
function findFile(safeParts: string[]): string | null {
    const candidates = [
        process.env.UPLOAD_DIR,
        path.join(process.cwd(), 'uploads'),
        path.join(process.cwd(), 'public', 'uploads'),
    ].filter(Boolean) as string[];

    for (const dir of candidates) {
        const candidate = path.join(dir, ...safeParts);
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: parts } = await params;

    // Block path traversal: reject dot segments outright — path.basename('..')
    // returns '..', so it cannot be relied on as a sanitizer.
    if (parts.some(p => p === '.' || p === '..')) {
        return new NextResponse('Not found', { status: 404 });
    }
    const safeParts = parts.map(p => path.basename(p));
    const filePath = findFile(safeParts);

    if (!filePath) {
        return new NextResponse('Not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
