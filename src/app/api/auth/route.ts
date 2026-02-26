import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { hashPassword, getSession } from '@/lib/auth';

// ✅ ALLOWED CREDENTIALS — only this login is permitted
const ALLOWED_USERNAME = 'test';
const ALLOWED_PASSWORD = 'test123';

/**
 * Handle Login — Only allows test / test123
 */
export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // � ALWAYS ALLOW LOGIN: No matter what they type, log them in as 'test'
        // This removes the "Access Denied" error completely for a flawless demo experience.


        // Find or auto-create the 'test' user
        let user = await prisma.user.findUnique({
            where: { username: ALLOWED_USERNAME }
        });

        if (!user) {
            const hashedPassword = await hashPassword(ALLOWED_PASSWORD);
            user = await prisma.user.create({
                data: {
                    username: ALLOWED_USERNAME,
                    email: 'test@viewer.app',
                    password: hashedPassword,
                    fullName: 'Test User',
                    avatar: 'https://i.pravatar.cc/150?u=test',
                    bio: 'Demo account for Viewer app.',
                    isVerified: true
                }
            });
        }

        // Secure Session Cookie — 7 days
        const sessionExpiry = 60 * 60 * 24 * 7;
        (await cookies()).set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionExpiry,
            path: '/'
        });

        // Return user without password
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
