import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_SHOTS } from '@/constants/mockData';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const shots = await prisma.shot.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                },
                likes: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit
        });
        // If no shots found in DB, fall back to mock data
        if (!shots || shots.length === 0) {
            const fallback = MOCK_SHOTS.map(s => ({
                id: String(s.id),
                video: s.video,
                caption: s.caption,
                createdAt: new Date().toISOString(),
                user: {
                    username: s.username,
                    avatar: s.avatar,
                },
                likes: [],
                comments: [],
            }));
            return NextResponse.json(fallback);
        }

        return NextResponse.json(shots);
    } catch {
        // If Prisma or DB is not available, return mock shots so frontend still works
        try {
            const fallback = MOCK_SHOTS.map(s => ({
                id: String(s.id),
                video: s.video,
                caption: s.caption,
                createdAt: new Date().toISOString(),
                user: {
                    username: s.username,
                    avatar: s.avatar,
                },
                likes: [],
                comments: [],
            }));
            return NextResponse.json(fallback);
        } catch {
            return NextResponse.json({ error: 'Failed to fetch shots' }, { status: 500 });
        }
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { video, caption, userId } = body;

        if (!video) {
            return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }

        let targetUserId = userId;
        if (!targetUserId) {
            const user = await prisma.user.findFirst();
            if (!user) return NextResponse.json({ error: 'User required' }, { status: 400 });
            targetUserId = user.id;
        }

        const shot = await prisma.shot.create({
            data: {
                video,
                caption,
                userId: targetUserId,
            }
        });

        return NextResponse.json(shot, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create shot' }, { status: 500 });
    }
}
