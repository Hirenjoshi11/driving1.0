import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');
const { markRead, unreadCount } = require('@/lib/notifications');

// POST /api/notifications/read — mark the caller's notifications read.
// Body: { ids?: number[] }  (omit ids to mark all read)
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const db = getDb();
    let ids = null;
    try {
      const body = await request.json();
      if (Array.isArray(body?.ids)) {
        ids = body.ids.map(Number).filter((n) => Number.isInteger(n));
      }
    } catch {
      // no body — mark all read
    }
    await markRead(db, session.userId, ids);
    return NextResponse.json({ success: true, unread: await unreadCount(db, session.userId) });
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
