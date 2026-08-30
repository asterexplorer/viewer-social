import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Find or create default demo user
        let user = await prisma.user.findFirst({
            where: { username: 'antigravity_dev' }
        });

        if (!user) {
            user = await prisma.user.findFirst();
        }

        if (!user) {
            return NextResponse.json({ error: 'No demo user found' }, { status: 404 });
        }

        // Set session cookie
        const sessionExpiry = 60 * 60 * 24 * 7;
        (await cookies()).set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionExpiry,
            path: '/'
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        console.error('Demo auth error:', error);
        return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
    }
}
