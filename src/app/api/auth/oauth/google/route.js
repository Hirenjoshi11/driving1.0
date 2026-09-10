import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectTarget = searchParams.get('redirect') || '/';
  const mockEmail = searchParams.get('email');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/oauth/callback`;

  // If real Google OAuth credentials are set, redirect to Google OAuth 2.0 endpoint
  if (clientId && clientSecret) {
    const state = Buffer.from(JSON.stringify({ redirect: redirectTarget })).toString('base64url');
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Zero-config / Instant Testing Mode (runs seamlessly without requiring GCP setup first)
  const mockParams = new URLSearchParams({
    mock: 'true',
    redirect: redirectTarget,
    ...(mockEmail ? { email: mockEmail } : {}),
  });

  return NextResponse.redirect(`${origin}/api/auth/oauth/callback?${mockParams.toString()}`);
}
