'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function createPost(formData: FormData) {
    const caption = formData.get('caption') as string;
    const media0 = formData.get('media-0') as string;
    const directImage = formData.get('image') as string;
    let imageString = media0 || directImage;
    const location = formData.get('location') as string || '';
    const filter = formData.get('filter') as string || 'none';

    if (!imageString) {
        throw new Error('At least one image is required');
    }

    try {
        // Find existing user (ideally this should be from auth)
        // We prioritize 'antigravity_dev' if it exists, otherwise any user
        let user = await prisma.user.findFirst({
            where: { username: 'antigravity_dev' }
        });

        if (!user) {
            user = await prisma.user.findFirst();
        }

        if (!user) {
            // Fallback to create if no user at all (first run scenario)
            user = await prisma.user.create({
                data: {
                    username: 'demo_user',
                    fullName: 'Demo User',
                    avatar: 'https://i.pravatar.cc/150?u=demo',
                    email: 'demo@example.com',
                    password: 'password123'
                }
            });
        }

        const isVideo = imageString.startsWith('data:video/');
        let finalMediaUrl = imageString;

        // Save file to disk if it's base64 (to avoid large DB size)
        if (imageString.startsWith('data:')) {
            try {
                // Extract base64 data
                const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

                if (matches && matches.length === 3) {
                    const mimeType = matches[1];
                    const data = matches[2];
                    const buffer = Buffer.from(data, 'base64');

                    // Determine extension
                    let ext = 'jpg';
                    if (mimeType.includes('video')) ext = 'mp4';
                    else if (mimeType.includes('png')) ext = 'png';
                    else if (mimeType.includes('gif')) ext = 'gif';
                    else if (mimeType.includes('jpeg')) ext = 'jpg';

                    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    const filePath = path.join(uploadDir, filename);
                    fs.writeFileSync(filePath, buffer);
                    finalMediaUrl = `/uploads/${filename}`;
                }
            } catch (err) {
                console.error('Failed to save file to disk, falling back to base64 string:', err);
                // finalMediaUrl remains as base64 string
            }
        }

        if (isVideo) {
            await prisma.shot.create({
                data: {
                    video: finalMediaUrl,
                    caption: caption + (location ? ` • ${location}` : ''),
                    userId: user.id,
                    music: 'Original Audio',
                    location: location || undefined
                }
            });
            revalidatePath('/shots');
        } else {
            await prisma.post.create({
                data: {
                    caption: caption + (location ? ` • ${location}` : ''),
                    image: finalMediaUrl,
                    userId: user.id,
                    location: location || undefined
                },
            });
            revalidatePath('/');
        }

        revalidatePath('/profile');
    } catch (error) {
        console.error('Server Action Error:', error);
        throw new Error('Failed to create content: ' + (error as Error).message);
    }
}

export async function toggleLike(postId: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    const existingLike = await prisma.like.findUnique({
        where: {
            userId_postId: {
                userId: user.id,
                postId: postId,
            },
        },
    });

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id },
        });
    } else {
        await prisma.like.create({
            data: {
                userId: user.id,
                postId: postId,
            },
        });
    }

    revalidatePath('/');
}

export async function toggleShotLike(shotId: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    const existingLike = await prisma.shotLike.findUnique({
        where: {
            userId_shotId: {
                userId: user.id,
                shotId: shotId,
            },
        },
    });

    if (existingLike) {
        await prisma.shotLike.delete({
            where: { id: existingLike.id },
        });
    } else {
        await prisma.shotLike.create({
            data: {
                userId: user.id,
                shotId: shotId,
            },
        });
    }

    revalidatePath('/shots');
}
