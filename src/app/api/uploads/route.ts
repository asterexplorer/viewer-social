import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileName, contentType } = body;

        if (!fileName || !contentType) {
            return NextResponse.json({ error: 'fileName and contentType required' }, { status: 400 });
        }

        const { url, key } = await getPresignedUploadUrl(fileName, contentType);

        // Construct public URL server-side so client doesn't need S3 config
        const bucket = process.env.AWS_S3_BUCKET_NAME || 'viewer-media';
        const region = process.env.AWS_REGION || 'us-east-1';
        let publicUrl = '';
        if (process.env.CDN_DOMAIN) {
            publicUrl = `${process.env.CDN_DOMAIN.replace(/\/$/, '')}/${key}`;
        } else {
            publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        }

        return NextResponse.json({ uploadUrl: url, key, publicUrl });
    } catch (err) {
        console.error('Upload URL error:', err);
        return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ info: 'POST fileName & contentType to get presigned upload URL' });
}
