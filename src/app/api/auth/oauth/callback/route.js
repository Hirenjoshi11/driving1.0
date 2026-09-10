import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const isMock = searchParams.get('mock') === 'true';
    const mockEmail = searchParams.get('email');

    let redirectTarget = '/';
    if (stateParam) {
      try {
        const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8'));
        if (decoded.redirect && !decoded.redirect.startsWith('/admin')) {
          redirectTarget = decoded.redirect;
        }
      } catch (_) {}
    } else if (searchParams.get('redirect')) {
      const paramRedirect = searchParams.get('redirect');
      if (paramRedirect && !paramRedirect.startsWith('/admin')) {
        redirectTarget = paramRedirect;
      }
    }

    let profile = null;

    if (isMock || (!code && mockEmail)) {
      // Instant / Mock OAuth profile for development and zero-config testing
      const targetEmail = (mockEmail || 'citizen.google@gmail.com').trim().toLowerCase();
      const usernamePart = targetEmail.split('@')[0];
      const displayName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1) + ' (Google)';

      profile = {
        id: 'google-mock-' + Buffer.from(targetEmail).toString('hex').slice(0, 12),
        email: targetEmail,
        name: displayName,
        picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(targetEmail),
      };
    } else if (code) {
      // Official Google OAuth token exchange
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const origin = new URL(request.url).origin;
      const redirectUri = `${origin}/api/auth/oauth/callback`;

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to exchange authorization code');
      }

      // Fetch user profile from Google API
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userinfo = await userinfoResponse.json();
      if (!userinfoResponse.ok || !userinfo.email) {
        throw new Error('Failed to retrieve user profile from Google');
      }

      profile = {
        id: userinfo.id,
        email: userinfo.email.toLowerCase(),
        name: userinfo.name || userinfo.email.split('@')[0],
        picture: userinfo.picture || null,
      };
    } else {
      return NextResponse.redirect(new URL('/login?error=oauth_missing_code', request.url));
    }

    // Persist or link user in database
    const db = getDb();
    let user = await db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(profile.email);

    if (user) {
      await db.prepare(`
        UPDATE users 
        SET oauth_provider = 'google',
            oauth_id = COALESCE(oauth_id, ?),
            avatar = COALESCE(?, avatar),
            email_verified = 1,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(profile.id, profile.picture, user.id);

      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    } else {
      const info = await db.prepare(`
        INSERT INTO users (name, email, role, oauth_provider, oauth_id, avatar, email_verified, is_active)
        VALUES (?, ?, 'citizen', 'google', ?, ?, 1, 1)
      `).run(profile.name, profile.email, profile.id, profile.picture);

      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    }

    const sessionPayload = {
      userId: user.id,
      role: user.role || 'citizen',
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatar: user.avatar || null,
    };

    const token = await createSessionToken(sessionPayload);
    const origin = new URL(request.url).origin;
    const response = NextResponse.redirect(new URL(redirectTarget, origin));

    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL('/login?error=oauth_failed', origin));
  }
}
