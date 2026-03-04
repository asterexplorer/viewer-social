import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const following = await prisma.follows.findMany({
            where: { followerId: session.id },
            include: { following: { select: { id: true, username: true, avatar: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const result = following.map(f => ({
            id: f.following.id,
            username: f.following.username,
            avatar: f.following.avatar,
            fullName: f.following.fullName || ''
        }));

        return NextResponse.json(result);
    } catch (err) {
        console.error('Failed to fetch following', err);
        return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
    }
}
