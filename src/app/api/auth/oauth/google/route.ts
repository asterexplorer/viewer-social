import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback` 
        : 'http://localhost:3000/api/auth/oauth/callback';
    
    if (!clientId) {
        return NextResponse.redirect(new URL('/?error=MissingClientId', req.url));
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('access_type', 'offline');

    return NextResponse.redirect(authUrl.toString());
}
