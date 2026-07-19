import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrlPrefix = process.env.R2_PUBLIC_URL_PREFIX; // e.g., https://pub-xxx.r2.dev

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '').replace(/\s+/g, '-');
        const finalFilename = `${uniqueSuffix}-${cleanFileName}`;

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
            console.warn("Missing R2 environment variables. Falling back to local upload.");
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, finalFilename);
            fs.writeFileSync(filePath, buffer);
            
            return NextResponse.json({ url: `/uploads/${finalFilename}` });
        }

        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

        const S3 = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        await S3.send(new PutObjectCommand({ 
            Bucket: bucketName, 
            Key: finalFilename, 
            Body: buffer,
            ContentType: file.type || 'application/octet-stream',
        }));
        
        let fileUrl = '';
        if (publicUrlPrefix) {
             const prefix = publicUrlPrefix.endsWith('/') ? publicUrlPrefix : `${publicUrlPrefix}/`;
             fileUrl = `${prefix}${finalFilename}`;
        } else {
             fileUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${finalFilename}`;
        }
        
        return NextResponse.json({ url: fileUrl });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
