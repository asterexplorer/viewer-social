import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
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
            }
        });
        return NextResponse.json(shots);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch shots' }, { status: 500 });
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
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create shot' }, { status: 500 });
    }
}
