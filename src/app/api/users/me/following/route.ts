import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) return NextResponse.json([], { status: 200 });

        const following = await prisma.follows.findMany({
            where: { followerId: user.id },
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
