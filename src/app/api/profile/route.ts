import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const user = await prisma.user.findFirst({
            include: {
                posts: {
                    include: {
                        likes: true,
                        comments: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
