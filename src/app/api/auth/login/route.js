import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
const { getDb } = require('@/lib/db');

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email / User ID and password are required' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim().toLowerCase();
    const user = db
      .prepare(
        'SELECT * FROM users WHERE (LOWER(email) = ? OR phone = ?) AND is_active = 1'
      )
      .get(trimmed, identifier.trim());

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'operator') {
      return NextResponse.json(
        { error: 'Access restricted to RTO operators and administrators' },
        { status: 403 }
      );
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password. Please check and try again.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    const token = await createSessionToken(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('Operator login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
