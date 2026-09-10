import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');
const { listForUser, unreadCount } = require('@/lib/notifications');

// GET /api/notifications — the current user's own notifications + unread count.
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const db = getDb();
    const notifications = await listForUser(db, session.userId, { limit: 30 });
    const unread = await unreadCount(db, session.userId);
    return NextResponse.json({ notifications, unread });
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}
