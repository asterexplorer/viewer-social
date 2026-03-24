import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback` 
        : 'http://localhost:3000/api/auth/oauth/callback';
    
    if (!clientId) {
        return NextResponse.redirect(new URL('/?error=MissingClientId', req.url));
    }

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'user:email');

    return NextResponse.redirect(authUrl.toString());
}
