import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FeedService } from '@/services/feed-service';
import { getSession } from '@/lib/auth';
import { MOCK_POSTS } from '@/constants/mockData';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const session = await getSession();

        if (!session) {
            // Public feed - latest posts
            const skip = (page - 1) * limit;
            const posts = await prisma.post.findMany({
                include: {
                    user: { select: { username: true, avatar: true, fullName: true } },
                    likes: true,
                    comments: { include: { user: { select: { username: true } } } },
                    media: { orderBy: { order: 'asc' } }
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit
            });

            const mappedPosts = posts.map(p => ({
                ...p,
                image: p.media?.[0]?.url || ''
            }));

            return NextResponse.json(mappedPosts);
        }

        // Personalized feed
        const rankedFeed = await FeedService.generateFeed(session.id, page, limit);
        return NextResponse.json(rankedFeed);
    } catch (error) {
        console.error('API Error (GET /api/posts):', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { caption, media, location } = body;

        if (!media || media.length === 0) {
            return NextResponse.json({ error: 'At least one media item is required' }, { status: 400 });
        }

        const newPost = await prisma.post.create({
            data: {
                caption: caption ? caption.trim() : '',
                location: location ? location.trim() : '',
                userId: session.id,
                media: {
                    create: media.map((m: any, idx: number) => ({
                        url: m.url,
                        type: m.type || 'IMAGE',
                        order: idx
                    }))
                }
            },
            include: {
                user: true,
                media: true
            }
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('API Error (POST /api/posts):', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
