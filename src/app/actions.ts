'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MediaService } from '@/services/media-service';
import { sendNotification } from '@/lib/queue';
import { sendWebPushNotification } from '@/lib/push';
import { invalidateCache } from '@/lib/redis';
import { pusherServer } from '@/lib/pusher';
import dbConnect from '@/lib/mongodb';
import { Activity } from '@/models/Activity';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const sanitize = (text: string) => text.replace(/<[^>]*>?/gm, '').trim();

export async function createPost(formData: FormData) {
    const caption = sanitize(formData.get('caption') as string);
    const location = sanitize(formData.get('location') as string || '');

    // Collect all media URLs
    const mediaUrls: string[] = [];
    let i = 0;
    while (formData.has(`media-${i}`)) {
        mediaUrls.push(formData.get(`media-${i}`) as string);
        i++;
    }

    // Fallback to legacy 'image' field if no media-X fields
    const legacyImage = formData.get('image') as string;
    if (mediaUrls.length === 0 && legacyImage) {
        mediaUrls.push(legacyImage);
    }

    if (mediaUrls.length === 0) {
        throw new Error('At least one media item is required');
    }

    try {
        // 1. Identify User (SECURE)
        const user = await requireAuth();

        // 2. Process Media
        // We handle Shots (video) and Posts (images/carousel)
        // If the first item is a video, we create a Shot
        const firstMedia = mediaUrls[0];
        const isVideo = firstMedia.endsWith('.mp4') || firstMedia.endsWith('.webm') || firstMedia.startsWith('data:video/');

        if (isVideo) {
            // Processing for Shot (Single Video)
            let videoUrl = firstMedia;
            if (firstMedia.startsWith('data:')) {
                const res = await MediaService.processAndUpload(firstMedia);
                videoUrl = res.url;
            }

            const shot = await prisma.shot.create({
                data: {
                    video: videoUrl,
                    caption: caption + (location ? ` • ${location}` : ''),
                    userId: user.id,
                    music: 'Original Audio',
                    location: location || undefined
                }
            });
            revalidatePath('/shots');

            // Trigger Real-time update for Shots
            await pusherServer.trigger('feed', 'new-shot', {
                ...shot,
                user: { username: user.username, avatar: user.avatar }
            });

            return shot;
        } else {
            // Processing for Post (Can be carousel)
            const post = await prisma.post.create({
                data: {
                    caption: caption + (location ? ` • ${location}` : ''),
                    userId: user.id,
                    location: location || undefined
                }
            });

            // Create Media entries for each URL
            for (let j = 0; j < mediaUrls.length; j++) {
                let currentUrl = mediaUrls[j];
                let type = currentUrl.endsWith('.mp4') || currentUrl.startsWith('data:video/') ? 'VIDEO' : 'IMAGE';

                if (currentUrl.startsWith('data:')) {
                    const res = await MediaService.processAndUpload(currentUrl);
                    currentUrl = res.url;
                    type = res.type.toUpperCase();
                }

                await prisma.media.create({
                    data: {
                        url: currentUrl,
                        type,
                        order: j,
                        postId: post.id
                    }
                });
            }

            await invalidateCache('feed:suggested_pool*');
            revalidatePath('/');
            revalidatePath('/profile');

            // Trigger Real-time update for Posts
            await pusherServer.trigger('feed', 'new-post', {
                ...post,
                media: await prisma.media.findMany({ where: { postId: post.id } }),
                user: { username: user.username, avatar: user.avatar }
            });

            return post;
        }

    } catch (error) {
        console.error('Server Action Error (createPost):', error);
        throw new Error('Failed to create content: ' + (error as Error).message);
    }
}

export async function createStory(formData: FormData) {
    const imageUrl = formData.get('image') as string;
    if (!imageUrl) throw new Error('Story image is required');

    try {
        const user = await requireAuth();

        let finalUrl = imageUrl;
        if (imageUrl.startsWith('data:')) {
            const res = await MediaService.processAndUpload(imageUrl);
            finalUrl = res.url;
        }

        const story = await prisma.story.create({
            data: {
                image: finalUrl,
                userId: user.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });

        revalidatePath('/');

        // Trigger Real-time update for Stories
        await pusherServer.trigger('stories', 'new-story', {
            ...story,
            user: { username: user.username, avatar: user.avatar }
        });

        return story;
    } catch (error) {
        console.error('Create Story Error:', error);
        throw new Error('Failed to create story');
    }
}

export async function toggleLike(postId: string) {
    const user = await requireAuth();

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

            // Send Web Push Notification
            await sendWebPushNotification(post.userId, {
                title: 'New Like',
                body: `${user.username || 'Someone'} liked your post!`,
                url: `/post/${postId}`
            });
        }
    }

    // Log to MongoDB for Real-time Analytics
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'LIKE',
            targetId: postId,
            targetType: 'POST'
        });

        // Trigger Pusher for real-time Like count increment (optional enhancement)
        await pusherServer.trigger(`post-${postId}`, 'like-update', { count: 1 });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    await invalidateCache('feed:suggested_pool*');
    revalidatePath('/');
}

export async function toggleShotLike(shotId: string) {
    const user = await requireAuth();

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

    // Log to MongoDB
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'LIKE',
            targetId: shotId,
            targetType: 'SHOT'
        });

        await pusherServer.trigger(`shot-${shotId}`, 'like-update', { increment: 1 });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    revalidatePath('/shots');
}

export async function addComment(postId: string, text: string) {
    const user = await requireAuth();
    const cleanText = sanitize(text);

    if (!cleanText) throw new Error('Comment cannot be empty');

    await prisma.comment.create({
        data: {
            text: cleanText,
            userId: user.id,
            postId
        }
    });

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== user.id) {
        // Send Web Push Notification
        await sendWebPushNotification(post.userId, {
            title: 'New Comment',
            body: `${user.username || 'Someone'} commented: "${cleanText}"`,
            url: `/post/${postId}`
        });
    }

    // Log to MongoDB
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'COMMENT',
            targetId: postId,
            targetType: 'POST',
            content: cleanText
        });

        // Real-time update for comments
        await pusherServer.trigger(`post-${postId}`, 'new-comment', {
            text: cleanText,
            username: user.username,
            createdAt: new Date()
        });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    await invalidateCache('feed:suggested_pool*');
    revalidatePath('/');
}

export async function addShotComment(shotId: string, text: string) {
    const user = await requireAuth();
    const cleanText = sanitize(text);

    if (!cleanText) throw new Error('Comment cannot be empty');

    await prisma.shotComment.create({
        data: {
            text: cleanText,
            userId: user.id,
            shotId
        }
    });

    // Log to MongoDB
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'COMMENT',
            targetId: shotId,
            targetType: 'SHOT',
            content: cleanText
        });

        await pusherServer.trigger(`shot-${shotId}`, 'new-comment', {
            text: cleanText,
            username: user.username,
            createdAt: new Date()
        });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    revalidatePath('/shots');
}

export async function toggleSavedPost(postId: string) {
    const user = await requireAuth();

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

    // Log to MongoDB
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'SAVE',
            targetId: postId,
            targetType: 'POST'
        });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    // Not strictly necessary for suggested feed rank, but good practice
    revalidatePath('/');
    revalidatePath('/saved');
}

export async function toggleSavedShot(shotId: string) {
    const user = await requireAuth();

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

    // Log to MongoDB
    try {
        await dbConnect();
        await Activity.create({
            userId: user.id,
            username: user.username,
            type: 'SAVE',
            targetId: shotId,
            targetType: 'SHOT'
        });
    } catch (e) {
        console.warn('MongoDB log failed', e);
    }

    revalidatePath('/shots');
    revalidatePath('/saved');
}

export async function toggleFollow(targetUsername: string) {
    const user = await requireAuth();

    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) throw new Error('Target user not found');

    // Check existing follow
    const existing = await prisma.follows.findFirst({
        where: {
            followerId: user.id,
            followingId: target.id,
        }
    });

    if (existing) {
        await prisma.follows.delete({ where: { id: existing.id } });
    } else {
        await prisma.follows.create({ data: { followerId: user.id, followingId: target.id } });

        // send notification (best effort)
        if (target.id !== user.id) {
            await sendNotification(target.id, 'follow', {
                actorId: user.id,
                actorName: user.username || 'User'
            });

            // Send Web Push Notification
            await sendWebPushNotification(target.id, {
                title: 'New Follower',
                body: `${user.username || 'Someone'} started following you!`,
                url: `/profile/${user.username}`
            });
        }
    }

    // Revalidate profile routes
    revalidatePath('/profile');
}

export async function updateUserSettings(data: {
    fullName?: string;
    username?: string;
    bio?: string;
    website?: string;
    isPrivate?: boolean;
    avatar?: string;
}) {
    const schema = z.object({
        fullName: z.string().max(50).optional(),
        username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
        bio: z.string().max(200).optional(),
        website: z.string().url().or(z.literal('')).optional(),
        isPrivate: z.boolean().optional(),
        avatar: z.string().url().optional(),
    });

    try {
        const validated = schema.parse(data);
        const user = await requireAuth();

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: validated.fullName ? sanitize(validated.fullName) : undefined,
                username: validated.username,
                bio: validated.bio ? sanitize(validated.bio) : undefined,
                website: validated.website,
                isPrivate: validated.isPrivate,
                avatar: validated.avatar,
            }
        });

        revalidatePath('/settings');
        revalidatePath('/profile');
        revalidatePath('/');

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Update Settings Error:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function trackView(targetId: string, targetType: 'POST' | 'SHOT') {
    try {
        let user = await prisma.user.findFirst();

        await dbConnect();
        await Activity.create({
            userId: user?.id || 'anonymous',
            username: user?.username || 'anonymous',
            type: 'VIEW',
            targetId: targetId,
            targetType: targetType
        });

        // Trigger real-time view counter update
        await pusherServer.trigger(`${targetType.toLowerCase()}-${targetId}`, 'view-update', { increment: 1 });

        return { success: true };
    } catch (error) {
        console.warn('View tracking failed', error);
        return { success: false };
    }
}
