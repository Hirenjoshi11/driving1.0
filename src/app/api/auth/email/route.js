import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { getPgPool } from '@/lib/supabase';
const { getDb } = require('@/lib/db');

// Regular expression for standard email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, name } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address (e.g. name@example.com)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let citizenName = (name && typeof name === 'string' && name.trim()) || '';
    if (!citizenName) {
      const usernamePart = cleanEmail.split('@')[0];
      citizenName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);
    }

    let user;
    const pg = getPgPool();

    if (pg) {
      // Supabase PostgreSQL mode
      const selectRes = await pg.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      user = selectRes.rows[0];

      if (user) {
        if (user.is_active === 0) {
          return NextResponse.json(
            { error: 'This account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }
        if (!user.email_verified) {
          await pg.query('UPDATE users SET email_verified = 1, updated_at = NOW() WHERE id = $1', [user.id]);
          user.email_verified = 1;
        }
      } else {
        const insertRes = await pg.query(
          `INSERT INTO users (name, email, role, password_hash, email_verified, is_active)
           VALUES ($1, $2, 'citizen', '', 1, 1)
           RETURNING *`,
          [citizenName, cleanEmail]
        );
        user = insertRes.rows[0];
      }
    } else {
      // Local SQLite fallback mode
      const db = getDb();
      user = await db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

      if (user) {
        if (user.is_active === 0) {
          return NextResponse.json(
            { error: 'This account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }
        if (!user.email_verified) {
          await db.prepare("UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?").run(user.id);
          user.email_verified = 1;
        }
      } else {
        const info = db
          .prepare(`
            INSERT INTO users (name, email, role, password_hash, email_verified, is_active)
            VALUES (?, ?, 'citizen', '', 1, 1)
          `)
          .run(citizenName, cleanEmail);

        user = await db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      }
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
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Signed in successfully with email',
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('Direct email login error:', error);
    return NextResponse.json({ error: 'Failed to sign in with email' }, { status: 500 });
  }
}
