import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FeedService } from '@/lib/feed-service';
import { getCassandraClient } from '@/lib/cassandra';
import { types } from 'cassandra-driver';

// GET all posts with ranking algorithm
// GET all posts with ranking algorithm
export async function GET() {
    try {
        // 1. Identify current user (Simulated)
        // In a real app, this would come from session/auth
        const currentUser = await prisma.user.findFirst({
            include: { following: true }
        });

        if (!currentUser) {
            // Fallback: Just get latest posts if no user
            const posts = await prisma.post.findMany({
                include: {
                    user: { select: { username: true, avatar: true, fullName: true } },
                    likes: true,
                    comments: { include: { user: { select: { username: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });
            return NextResponse.json(posts);
        }

        // 2. Delegate to FeedService
        const rankedFeed = await FeedService.generateFeed(currentUser.id);

        return NextResponse.json(rankedFeed);
    } catch (error) {
        console.error('API Error (GET /api/posts):', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST create a new post
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { caption, image, userId } = body;

        if (!image) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        // For demo purposes, if userId is not provided, use the first available user
        let targetUserId = userId;
        if (!targetUserId) {
            const defaultUser = await prisma.user.findFirst();
            if (!defaultUser) {
                return NextResponse.json({ error: 'No users exist in the system' }, { status: 400 });
            }
            targetUserId = defaultUser.id;
        }

        // --- CASSANDRA PATH ---
        const cassandra = getCassandraClient();
        if (process.env.CASSANDRA_CONTACT_POINTS && cassandra) {
            try {
                const postId = types.TimeUuid.now();
                const query = `
                    INSERT INTO ${process.env.CASSANDRA_KEYSPACE || 'viewer_feed'}.posts_by_user 
                    (user_id, post_id, caption, image_url, created_at, likes_count, comments_count)
                    VALUES (?, ?, ?, ?, ?, 0, 0)
                `;

                await cassandra.execute(query, [targetUserId, postId, caption, image, new Date()], { prepare: true });

                return NextResponse.json({ id: postId.toString(), caption, image, userId: targetUserId }, { status: 201 });
            } catch (err) {
                console.error('Cassandra Write Failed, falling back to Postgres:', err);
                // Fallback
            }
        }
        // ----------------------

        const newPost = await prisma.post.create({
            data: {
                caption,
                image,
                userId: targetUserId,
            },
            include: {
                user: true
            }
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('API Error (POST /api/posts):', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
