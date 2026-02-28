import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1, // Target max size (e.g. 1MB)
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
    };
    try {
        console.log(`Original image size: ${file.size / 1024 / 1024} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed image size: ${compressedFile.size / 1024 / 1024} MB`);
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return file; // Fallback to original
    }
}

export async function compressVideo(file: File): Promise<File> {
    try {
        if (!ffmpeg) {
            ffmpeg = new FFmpeg();
            // Load ffmpeg.wasm from CDN to avoid huge bundle
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: `${baseURL}/ffmpeg-core.js`,
                wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            });
        }

        console.log(`Original video size: ${file.size / 1024 / 1024} MB`);

        ffmpeg.on('log', ({ message }) => {
            console.log(`FFmpeg: ${message}`);
        });

        const inputName = 'input.mp4'; // We assume standard upload
        const outputName = 'output.mp4';

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Fast compression settings: 720p max width, H.264, CRF 28
        await ffmpeg.exec([
            '-i', inputName,
            '-vf', 'scale=min(720\\,iw):-2',
            '-vcodec', 'libx264',
            '-crf', '28',
            '-preset', 'fast',
            '-acodec', 'aac',
            outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        // Cast data to any to satisfy TypeScript Blob constructor (buffer type overlap)
        const compressedBlob = new Blob([data as any], { type: 'video/mp4' });
        const compressedFile = new File([compressedBlob], file.name, {
            type: 'video/mp4',
            lastModified: Date.now(),
        });

        console.log(`Compressed video size: ${compressedFile.size / 1024 / 1024} MB`);
        return compressedFile;

    } catch (error) {
        console.error('Video compression failed:', error);
        return file; // Fallback to original
    }
}
