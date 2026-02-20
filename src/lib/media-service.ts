import { uploadToS3 } from '@/lib/s3';
import path from 'path';
import fs from 'fs';

export type MediaUploadResult = {
    url: string;
    type: 'image' | 'video';
    mimeType: string;
};

export const MediaService = {
    async processAndUpload(fileBase64: string): Promise<MediaUploadResult> {
        if (!fileBase64) {
            throw new Error('No file provided');
        }

        const matches = fileBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 string');
        }

        const mimeType = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // Determine type and extension
        let type: 'image' | 'video' = 'image';
        let ext = 'jpg';

        if (mimeType.includes('video')) {
            type = 'video';
            ext = 'mp4';
            // In a real microservice, we would queue this for transcoding (FFmpeg)
            // e.g. await VideoEncoder.queue(buffer);
        } else if (mimeType.includes('png')) {
            ext = 'png';
        } else if (mimeType.includes('gif')) {
            ext = 'gif';
        }

        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        // 1. Try S3 / CDN Upload
        try {
            const s3Url = await uploadToS3(buffer, filename, mimeType);
            if (s3Url) {
                return { url: s3Url, type, mimeType };
            }
        } catch (e) {
            console.warn('S3 upload failed, falling back to local storage', e);
        }

        // 2. Fallback: Base64 String Storage
        // Skip ephemeral local storage completely, so images and videos save directly
        // to the database and work instantly on Vercel without S3/Blob setup.
        console.log('Skipping local FS, returning base64 string directly for database storage');

        return {
            url: fileBase64,
            type,
            mimeType
        };
    }
};
