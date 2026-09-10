import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';
import { getPgPool } from '@/lib/supabase';
const { getDb } = require('@/lib/db');

// In-memory OTP store: phone -> { otp, expiresAt, attempts }
const otpStore = new Map();

// Periodic cleanup of expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 10 * 60 * 1000).unref();

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, phone, mobile, otp, name } = body;

    const rawPhone = phone || mobile || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'A valid 10-digit mobile number is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'ip';
    const rateLimitKey = `otp_${action}_${cleanPhone}_${ip}`;

    if (action === 'send') {
      // Max 5 OTP requests per 10 minutes per phone
      const limit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
      if (!limit.allowed) {
        return rateLimitExceededResponse(limit.resetTime);
      }

      // Generate cryptographically secure 6-digit numeric OTP
      const generatedOtp = String(crypto.randomInt(100000, 1000000));
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      otpStore.set(cleanPhone, {
        otp: generatedOtp,
        expiresAt,
        attempts: 0,
      });

      // In production, integrate with SMS gateway (DLF SMS DLT sender)
      // In development, log to server console only if explicitly enabled
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[DEV OTP] Generated verification code for +91 ${cleanPhone}: ${generatedOtp}`);
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to +91 ${cleanPhone}. Valid for 5 minutes.`,
      });
    }

    if (action === 'verify') {
      // Max 5 verification attempts per 5 minutes to prevent brute-forcing
      const limit = checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000);
      if (!limit.allowed) {
        return rateLimitExceededResponse(limit.resetTime);
      }

      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json(
          { error: 'Please enter the 6-digit verification OTP' },
          { status: 400 }
        );
      }

      const stored = otpStore.get(cleanPhone);
      if (!stored || Date.now() > stored.expiresAt) {
        return NextResponse.json(
          { error: 'Verification code has expired or was not requested. Please request a new OTP.' },
          { status: 400 }
        );
      }

      stored.attempts += 1;
      if (stored.attempts > 5) {
        otpStore.delete(cleanPhone);
        return NextResponse.json(
          { error: 'Too many incorrect attempts. Please request a new verification code.' },
          { status: 429 }
        );
      }

      if (stored.otp !== otp.trim()) {
        return NextResponse.json(
          { error: 'Invalid verification code. Please check and try again.' },
          { status: 400 }
        );
      }

      // Successful verification: consume OTP immediately (single-use)
      otpStore.delete(cleanPhone);

      let user;
      const citizenName = (name && typeof name === 'string' && name.trim()) || 'Citizen';

      // Datastore resolution (Supabase PostgreSQL / SQLite)
      const pg = getPgPool();
      if (pg) {
        const selectRes = await pg.query('SELECT * FROM users WHERE phone = $1', [cleanPhone]);
        user = selectRes.rows[0];

        if (!user) {
          const insertRes = await pg.query(
            `INSERT INTO users (name, phone, role, password_hash, phone_verified, is_active)
             VALUES ($1, $2, 'citizen', '', 1, 1)
             RETURNING *`,
            [citizenName, cleanPhone]
          );
          user = insertRes.rows[0];
        } else {
          if (user.is_active === 0) {
            return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 });
          }
          await pg.query('UPDATE users SET phone_verified = 1, updated_at = NOW() WHERE id = $1', [user.id]);
          user.phone_verified = 1;
        }
      } else {
        const db = getDb();
        user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);

        if (!user) {
          const info = db
            .prepare(
              `INSERT INTO users (name, phone, role, password_hash, phone_verified, is_active)
               VALUES (?, ?, 'citizen', '', 1, 1)`
            )
            .run(citizenName, cleanPhone);

          user = await db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
        } else {
          if (user.is_active === 0) {
            return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 });
          }
          await db.prepare("UPDATE users SET phone_verified = 1, updated_at = datetime('now') WHERE id = ?").run(user.id);
        }
      }

      const sessionPayload = {
        userId: user.id,
        role: user.role || 'citizen',
        name: user.name,
        phone: user.phone,
        email: user.email || null,
        avatar: user.avatar || null,
      };

      const token = await createSessionToken(sessionPayload);
      const response = NextResponse.json({
        success: true,
        user: sessionPayload,
        message: 'Mobile number verified successfully',
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
      return response;
    }

    return NextResponse.json({ error: 'Invalid action. Supported: send, verify' }, { status: 400 });
  } catch (error) {
    console.error('OTP authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed. Please try again.' }, { status: 500 });
  }
}
