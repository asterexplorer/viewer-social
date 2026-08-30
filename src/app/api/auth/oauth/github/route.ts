import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback` 
        : 'http://localhost:3000/api/auth/oauth/callback';
    
    // In local development without GitHub credentials, log in with dev account
    if (!clientId) {
        let user = await prisma.user.findFirst({
            where: { email: 'github.dev@example.com' }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'github.dev@example.com',
                    username: 'github_developer',
                    fullName: 'GitHub Developer',
                    avatar: 'https://i.pravatar.cc/150?u=github',
                    password: 'password123',
                    isVerified: true
                }
            });
        }

        const cookieStore = await cookies();
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return NextResponse.redirect(new URL('/', req.url));
    }

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'user:email');

    return NextResponse.redirect(authUrl.toString());
}
