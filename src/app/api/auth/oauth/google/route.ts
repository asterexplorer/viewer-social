import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback` 
        : 'http://localhost:3000/api/auth/oauth/callback';
    
    // In local development without Google Cloud credentials, log in with dev account
    if (!clientId) {
        let user = await prisma.user.findFirst({
            where: { email: 'google.dev@example.com' }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'google.dev@example.com',
                    username: 'google_creator',
                    fullName: 'Google User',
                    avatar: 'https://i.pravatar.cc/150?u=google',
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

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('access_type', 'offline');

    return NextResponse.redirect(authUrl.toString());
}
