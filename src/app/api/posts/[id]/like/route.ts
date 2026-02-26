
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: postId } = params;

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                }
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ liked: false, message: 'Like removed' });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    postId,
                }
            });
            return NextResponse.json({ liked: true, message: 'Like added' });
        }
    } catch (error) {
        console.error('Like toggle error:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
