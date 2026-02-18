import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Mock Authentication - In a real app, use NextAuth or similar
// This simulates logging in as the main dev user or creating it if missing
export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        // Find or Create user
        let user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user && username === 'antigravity_dev') {
            user = await prisma.user.create({
                data: {
                    username: 'antigravity_dev',
                    email: 'dev@antigravity.com',
                    password: 'mock_password_hash', // In real app, hash this!
                    fullName: 'Antigravity Developer',
                    avatar: 'https://i.pravatar.cc/150?u=antigravity',
                    bio: 'Building the next gen social app.',
                    isVerified: true
                }
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Set a simple cookie session (Insecure for prod, fine for MVP demo)
        (await cookies()).set('userId', user.id, { httpOnly: true });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            avatar: true,
            fullName: true,
            email: true
        }
    });

    if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
}
