import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: Params) {
    const params = await props.params;
    const { id: shotId } = params;

    try {
        const comments = await prisma.shotComment.findMany({
            where: { shotId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error(`API Error (GET /api/shots/${shotId}/comments):`, error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}
