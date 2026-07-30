import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser, safeMessage } from '@/lib/apiSecurity';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Accept images, PDFs, and common document formats for assignment submissions
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
]);

export async function POST(request: Request) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (parseErr: any) {
            console.error("Upload: formData parse error:", parseErr);
            return NextResponse.json({ error: 'Failed to parse upload. File may be too large (max 10 MB).' }, { status: 400 });
        }

        const file = formData.get('file') as File | null;

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: 'File is too large. Maximum size is 10 MB.' }, { status: 400 });
        }

        // Allow empty/unknown MIME types (some browsers don't set it for certain files)
        if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const cleanFileName = (file.name || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const finalFilename = `${uniqueSuffix}-${cleanFileName}`;

        // Save to UPLOAD_DIR env var (production persistent mount) or <cwd>/uploads/
        // The /uploads/[...path] route handler serves these files regardless of location.
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            fs.writeFileSync(path.join(uploadDir, finalFilename), buffer);
        } catch (fsErr: any) {
            console.error("Upload: local write error:", fsErr);
            return NextResponse.json({ error: 'File storage failed on the server. Please contact support.' }, { status: 500 });
        }

        return NextResponse.json({ url: `/uploads/${finalFilename}` });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: safeMessage(error, 'Upload failed') }, { status: 500 });
    }
}
