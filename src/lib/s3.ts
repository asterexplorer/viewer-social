import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'viewer-media';

// Upload file to S3 and return the public URL
export async function uploadToS3(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;

    // Check if credentials exist, otherwise fallback or error
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn('AWS Credentials missing, cannot upload to S3.');
        return '';
    }

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            // ACL: 'public-read', // Deprecated in many new buckets, use Bucket Policy instead strictly
        });

        await s3Client.send(command);

        // Return the CDN URL if configured, otherwise the standard S3 URL
        if (process.env.CDN_DOMAIN) {
            const cdnDomain = process.env.CDN_DOMAIN.replace(/\/$/, ''); // Remove trailing slash
            return `${cdnDomain}/${key}`;
        }

        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload file to S3');
    }
}

// Generate a presigned URL for client-side uploads (Alternative strategy)
export async function getPresignedUploadUrl(fileName: string, contentType: string) {
    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { url, key };
}
