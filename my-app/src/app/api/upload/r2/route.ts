import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { getSessionUser, safeMessage } from '@/lib/apiSecurity';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: CORS_HEADERS });
        }

        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (parseErr: any) {
            console.error('Upload/r2: formData parse error:', parseErr);
            return NextResponse.json(
                { error: 'Failed to parse upload. File may be too large (max 10 MB).' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const file = formData.get('file') as File | null;
        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: CORS_HEADERS });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: 'File is too large. Maximum size is 10 MB.' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}` },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const cleanFileName = (file.name || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const finalFilename = `${uniqueSuffix}-${cleanFileName}`;

        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrlPrefix = process.env.R2_PUBLIC_URL_PREFIX;

        // ── Local fallback when R2 is not configured ──
        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
            console.warn('Upload/r2: R2 credentials missing — using local filesystem fallback');
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            try {
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                fs.writeFileSync(path.join(uploadDir, finalFilename), buffer);
            } catch (fsErr: any) {
                console.error('Upload/r2: local write error:', fsErr);
                return NextResponse.json(
                    { error: 'Storage unavailable. Please contact support.' },
                    { status: 500, headers: CORS_HEADERS }
                );
            }
            return NextResponse.json({ url: `/uploads/${finalFilename}` }, { headers: CORS_HEADERS });
        }

        // ── R2 upload ──
        const S3 = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
        });

        try {
            await S3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: finalFilename,
                Body: buffer,
                ContentType: file.type || 'application/octet-stream',
            }));
        } catch (r2Err: any) {
            console.error('Upload/r2: R2 error:', r2Err?.message, r2Err?.Code, r2Err?.$metadata);
            return NextResponse.json(
                { error: `R2 upload failed: ${r2Err?.Code || r2Err?.message || 'unknown error'}` },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        const prefix = publicUrlPrefix
            ? (publicUrlPrefix.endsWith('/') ? publicUrlPrefix : `${publicUrlPrefix}/`)
            : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/`;

        return NextResponse.json({ url: `${prefix}${finalFilename}` }, { headers: CORS_HEADERS });

    } catch (error: any) {
        console.error('Upload/r2 error:', error);
        return NextResponse.json(
            { error: safeMessage(error, 'Upload failed') },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
