import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) return NextResponse.json([], { status: 200 });

        const followers = await prisma.follows.findMany({
            where: { followingId: user.id },
            include: { follower: { select: { id: true, username: true, avatar: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const result = followers.map(f => ({
            id: f.follower.id,
            username: f.follower.username,
            avatar: f.follower.avatar,
            fullName: f.follower.fullName || ''
        }));

        return NextResponse.json(result);
    } catch (err) {
        console.error('Failed to fetch followers', err);
        return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
    }
}
