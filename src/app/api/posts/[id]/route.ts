
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// GET a single post
export async function GET(request: Request, props: Params) {
    const params = await props.params;
    const { id } = params;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error(`API Error (GET /api/posts/${id}):`, error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// PATCH update a post
export async function PATCH(request: Request, props: Params) {
    const params = await props.params;
    const { id } = params;

    try {
        const body = await request.json();
        const { caption } = body;

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { caption },
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error(`API Error (PATCH /api/posts/${id}):`, error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// DELETE a post
export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    const { id } = params;

    try {
        // Delete associated likes and comments first (if not handled by cascade)
        await prisma.like.deleteMany({ where: { postId: id } });
        await prisma.comment.deleteMany({ where: { postId: id } });

        await prisma.post.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(`API Error (DELETE /api/posts/${id}):`, error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
