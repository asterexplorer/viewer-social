import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all posts
export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        fullName: true,
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(posts);
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
