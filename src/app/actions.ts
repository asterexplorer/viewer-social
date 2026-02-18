'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache'; import { MediaService } from '@/lib/media-service';
import { sendNotification } from '@/lib/queue';
import fs from 'fs';
import path from 'path';
import { invalidateCache } from '@/lib/redis';
import { uploadToS3 } from '@/lib/s3';

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



        // ... (keep surrounding code)

        let finalMediaUrl = imageString;
        let isVideo = false;

        // Process Upload (S3 or Local) via Media Service
        if (imageString.startsWith('data:')) {
            try {
                const uploadResult = await MediaService.processAndUpload(imageString);
                finalMediaUrl = uploadResult.url;
                isVideo = uploadResult.type === 'video';
            } catch (err) {
                console.error('Media upload failed:', err);
                // Fallback: keep original base64 if upload fails (though MediaService errs on invalid base64)
                isVideo = imageString.startsWith('data:video/');
            }
        } else {
            // Handle case where it might be a direct URL already
            isVideo = imageString.endsWith('.mp4') || imageString.endsWith('.webm');
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
            await invalidateCache('feed:suggested_pool*');
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

        // Notify Author
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        if (post && post.userId !== user.id) {
            await sendNotification(post.userId, 'like', {
                postId,
                actorId: user.id,
                actorName: user.username || 'User'
            });
        }
    }

    await invalidateCache('feed:suggested_pool*');
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

export async function addComment(postId: string, text: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    await prisma.comment.create({
        data: {
            text,
            userId: user.id,
            postId
        }
    });

    await invalidateCache('feed:suggested_pool*');
    revalidatePath('/');
}

export async function addShotComment(shotId: string, text: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    await prisma.shotComment.create({
        data: {
            text,
            userId: user.id,
            shotId
        }
    });

    revalidatePath('/shots');
}

export async function toggleSavedPost(postId: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    const existingSave = await prisma.savedPost.findUnique({
        where: {
            userId_postId: {
                userId: user.id,
                postId
            }
        }
    });

    if (existingSave) {
        await prisma.savedPost.delete({
            where: { id: existingSave.id }
        });
    } else {
        await prisma.savedPost.create({
            data: {
                userId: user.id,
                postId
            }
        });
    }

    // Not strictly necessary for suggested feed rank, but good practice
    revalidatePath('/');
    revalidatePath('/saved');
}

export async function toggleSavedShot(shotId: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    const existingSave = await prisma.savedShot.findUnique({
        where: {
            userId_shotId: {
                userId: user.id,
                shotId
            }
        }
    });

    if (existingSave) {
        await prisma.savedShot.delete({
            where: { id: existingSave.id }
        });
    } else {
        await prisma.savedShot.create({
            data: {
                userId: user.id,
                shotId
            }
        });
    }

    revalidatePath('/shots');
    revalidatePath('/saved');
}
