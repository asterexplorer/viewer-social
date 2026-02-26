import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyPassword, hashPassword, getSession } from '@/lib/auth';

/**
 * Handle Login / Registration
 */
export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Find user
        let user = await prisma.user.findUnique({
            where: { username }
        });

        // Demo mode: Create dev user if it doesn't exist
        if (!user && username === 'antigravity_dev') {
            const hashedPassword = await hashPassword('password123');
            user = await prisma.user.create({
                data: {
                    username: 'antigravity_dev',
                    email: 'dev@antigravity.com',
                    password: hashedPassword,
                    fullName: 'Antigravity Developer',
                    avatar: 'https://i.pravatar.cc/150?u=antigravity',
                    bio: 'Building the next gen social app.',
                    isVerified: true
                }
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Secure Session Cookie
        const sessionExpiry = 60 * 60 * 24 * 7; // 7 days
        (await cookies()).set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionExpiry,
            path: '/'
        });

        // Don't return password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Auth POST error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

/**
 * Verify Session
 */
export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user });
    } catch (error) {
        console.error('Auth GET error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}

/**
 * Logout
 */
export async function DELETE() {
    (await cookies()).delete('userId');
    return NextResponse.json({ success: true });
}
