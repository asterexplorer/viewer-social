import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const followers = await prisma.follows.findMany({
            where: { followingId: session.id },
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
