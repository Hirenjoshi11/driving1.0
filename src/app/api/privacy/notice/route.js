import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/privacy/notice?lang=en&version=1.0
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const version = searchParams.get('version') || '1.0';

    const db = getDb();

    // Query versioned notice
    let notice = await db.prepare(`
      SELECT pnv.*, pn.slug as notice_slug, pn.title as master_title
      FROM privacy_notice_versions pnv
      JOIN privacy_notices pn ON pnv.notice_id = pn.id
      WHERE pnv.language = ? AND pnv.version = ? AND pnv.status = 'published'
      LIMIT 1
    `).get(lang, version);

    // Fallback to English if requested language version not found
    if (!notice && lang !== 'en') {
      notice = await db.prepare(`
        SELECT pnv.*, pn.slug as notice_slug, pn.title as master_title
        FROM privacy_notice_versions pnv
        JOIN privacy_notices pn ON pnv.notice_id = pn.id
        WHERE pnv.language = 'en' AND pnv.version = ? AND pnv.status = 'published'
        LIMIT 1
      `).get(version);
    }

    // Available versions list
    const availableVersions = await db.prepare(`
      SELECT DISTINCT version, effective_from, status 
      FROM privacy_notice_versions 
      WHERE status = 'published'
      ORDER BY version DESC
    `).all();

    return NextResponse.json({
      notice: notice || null,
      availableVersions: availableVersions || [],
    });
  } catch (error) {
    console.error('Error fetching privacy notice:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy notice' }, { status: 500 });
  }
}
