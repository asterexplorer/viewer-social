import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { hashPassword } from '@/lib/auth';

/**
 * Handle Registration — Creates a new user and logs them in
 */
export async function POST(req: Request) {
    try {
        const { email, username, fullName, password } = await req.json();

        if (!email || !username || !password) {
            return NextResponse.json({ error: 'Email, Username, and Password are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username or Email is already taken' }, { status: 409 });
        }

        // Hash the password securely
        const hashedPassword = await hashPassword(password);

        // Auto-generate avatar if none provided (pravatar based on username)
        const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                fullName: fullName || username,
                password: hashedPassword,
                avatar,
                isVerified: false
            }
        });

        // Secure Session Cookie — 7 days
        const sessionExpiry = 60 * 60 * 24 * 7;
        (await cookies()).set('userId', newUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionExpiry,
            path: '/'
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error('Auth Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed due to an unexpected error.' },
            { status: 500 }
        );
    }
}
