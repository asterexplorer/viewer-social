import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // In a real app, we would get the session/token here.
        // For now, we fetch the first user in the DB to simulate "Logged In" state.
        const user = await prisma.user.findFirst({
            include: {
                _count: {
                    select: { followers: true, following: true, posts: true }
                }
            }
        });

        if (!user) {
            // If DB is empty, return a 404 or a special "init" state
            return NextResponse.json({ error: 'No users found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('API Error (GET /api/users/me):', error);
        return NextResponse.json({ error: 'Failed to fetch current user' }, { status: 500 });
    }
}
