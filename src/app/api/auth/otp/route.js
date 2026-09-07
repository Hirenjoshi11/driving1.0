import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
const { getDb } = require('@/lib/db');

// In-memory OTP store for active sessions: phone -> { otp, expiresAt }
const otpStore = new Map();

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action, phone, mobile, otp, name } = body;

    const rawPhone = phone || mobile || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'A valid 10-digit mobile number is required' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // In development/demo, generate a 6-digit OTP (default 123456 or random)
      const generatedOtp = '123456';
      otpStore.set(cleanPhone, {
        otp: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      return NextResponse.json({
        success: true,
        message: `OTP sent to +91 ${cleanPhone}. For instant testing, use verification code: 123456`,
        devOtp: '123456',
      });
    }

    if (action === 'verify') {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json(
          { error: 'Please enter the 6-digit verification OTP' },
          { status: 400 }
        );
      }

      const stored = otpStore.get(cleanPhone);
      // Valid if matches stored OTP or demo universal code '123456'
      const isValid = (stored && stored.otp === otp.trim()) || otp.trim() === '123456';

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid verification code. Please check or use code 123456.' },
          { status: 400 }
        );
      }

      // Find or create citizen user
      let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);

      if (!user) {
        const citizenName = (name && name.trim()) || 'Citizen';
        const info = db
          .prepare(
            `INSERT INTO users (name, phone, role, password_hash, phone_verified)
             VALUES (?, ?, 'citizen', '', 1)`
          )
          .run(citizenName, cleanPhone);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      } else {
        db.prepare("UPDATE users SET phone_verified = 1, updated_at = datetime('now') WHERE id = ?").run(user.id);
      }

      // Cleanup OTP
      otpStore.delete(cleanPhone);

      const sessionPayload = {
        userId: user.id,
        role: user.role || 'citizen',
        name: user.name,
        phone: user.phone,
        email: user.email || null,
      };

      const token = await createSessionToken(sessionPayload);
      const response = NextResponse.json({
        success: true,
        user: sessionPayload,
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

      return response;
    }

    return NextResponse.json({ error: 'Invalid action. Supported: send, verify' }, { status: 400 });
  } catch (error) {
    console.error('OTP authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
