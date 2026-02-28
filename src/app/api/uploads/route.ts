import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        // We might be receiving JSON (presigned URL request for S3)
        // OR we might be receiving FormData (local upload fallback)
        const contentTypeHeader = request.headers.get('content-type') || '';

        if (contentTypeHeader.includes('multipart/form-data')) {
            // --- LOCAL FILE UPLOAD FALLBACK ---
            const formData = await request.formData();
            const file = formData.get('file') as File | null;

            if (!file) {
                return NextResponse.json({ error: 'File is required.' }, { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            const filePath = join(uploadDir, fileName);

            // We assume public/uploads exists, let's write to it
            try {
                await writeFile(filePath, buffer);
            } catch (fsError: any) {
                // If directory doesn't exist, create it and try again
                if (fsError.code === 'ENOENT') {
                    const { mkdir } = await import('fs/promises');
                    await mkdir(uploadDir, { recursive: true });
                    await writeFile(filePath, buffer);
                } else {
                    throw fsError;
                }
            }

            return NextResponse.json({ publicUrl: `/uploads/${fileName}` });
        } else {
            // --- S3 PRESIGNED URL GENERATION ---
            const body = await request.json();
            const { fileName, contentType } = body;

            if (!fileName || !contentType) {
                return NextResponse.json({ error: 'fileName and contentType required' }, { status: 400 });
            }

            const { url, key } = await getPresignedUploadUrl(fileName, contentType);

            const bucket = process.env.AWS_S3_BUCKET_NAME || 'viewer-media';
            const region = process.env.AWS_REGION || 'us-east-1';
            let publicUrl = '';
            if (process.env.CDN_DOMAIN) {
                publicUrl = `${process.env.CDN_DOMAIN.replace(/\/$/, '')}/${key}`;
            } else {
                publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            }

            return NextResponse.json({ uploadUrl: url, key, publicUrl });
        }
    } catch (err) {
        console.error('Upload URL error:', err);
        return NextResponse.json({ error: 'Failed to create upload URL or upload file.' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ info: 'POST fileName & contentType to get presigned upload URL' });
}
