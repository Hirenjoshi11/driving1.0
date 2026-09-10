import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const version = searchParams.get('version') || '1.2';
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    const db = getDb();

    // Query version metadata
    let versionMeta = await db.prepare(`
      SELECT * FROM privacy_notice_versions
      WHERE version = ? AND language = ? AND status = 'published'
      LIMIT 1
    `).get(version, lang);

    // Fallback to English if requested language version not found
    if (!versionMeta && lang !== 'en') {
      versionMeta = await db.prepare(`
        SELECT * FROM privacy_notice_versions
        WHERE version = ? AND language = 'en' AND status = 'published'
        LIMIT 1
      `).get(version);
    }

    // Available versions list
    const availableVersions = await db.prepare(`
      SELECT DISTINCT version, effective_from, status, title 
      FROM privacy_notice_versions 
      WHERE status = 'published'
      ORDER BY version DESC
    `).all();

    // Query all 14 structured sections
    let sections = await db.prepare(`
      SELECT * FROM privacy_policy_sections
      WHERE version = ? AND language = ? AND is_active = 1
      ORDER BY sort_order ASC
    `).all(version, lang);

    // Fallback to English if sections in requested language are missing
    if ((!sections || sections.length === 0) && lang !== 'en') {
      sections = await db.prepare(`
        SELECT * FROM privacy_policy_sections
        WHERE version = ? AND language = 'en' AND is_active = 1
        ORDER BY sort_order ASC
      `).all(version);
    }

    // Parse structured_json for frontend consumption
    const parsedSections = sections.map((sec) => {
      let structured = null;
      if (sec.structured_json) {
        try {
          structured = JSON.parse(sec.structured_json);
        } catch (e) {
          structured = null;
        }
      }
      return {
        ...sec,
        structured
      };
    });

    // If search term provided, filter/score sections
    let matchedSections = parsedSections;
    if (query) {
      matchedSections = parsedSections.filter((sec) => {
        const hMatch = (sec.heading || '').toLowerCase().includes(query);
        const subMatch = (sec.subheading || '').toLowerCase().includes(query);
        const cMatch = (sec.content || '').toLowerCase().includes(query);
        const rawStruct = (sec.structured_json || '').toLowerCase();
        return hMatch || subMatch || cMatch || rawStruct.includes(query);
      });
    }

    return NextResponse.json({
      success: true,
      currentVersion: version,
      language: lang,
      effectiveFrom: versionMeta?.effective_from || '2026-09-01',
      lastUpdated: versionMeta?.updated_at || versionMeta?.created_at || '2026-09-01',
      availableVersions: availableVersions || [],
      sectionsCount: parsedSections.length,
      matchedCount: matchedSections.length,
      sections: parsedSections,
      query: query || null
    });
  } catch (error) {
    console.error('Error fetching structured privacy policy:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy policy' }, { status: 500 });
  }
}
