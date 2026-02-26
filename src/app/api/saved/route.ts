import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) return NextResponse.json([], { status: 200 });

        const saved = await prisma.savedPost.findMany({
            where: { userId: user.id },
            include: { post: { include: { user: true, likes: true, comments: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const result = saved.map(s => ({
            id: s.post.id,
            image: s.post.image,
            caption: s.post.caption,
            likes: s.post.likes ? s.post.likes.length : 0,
            comments: s.post.comments ? s.post.comments.length : 0,
            user: { id: s.post.user.id, username: s.post.user.username, avatar: s.post.user.avatar }
        }));

        return NextResponse.json(result);
    } catch (err) {
        console.error('Failed to fetch saved posts', err);
        return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
    }
}
