import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET: list all versions, their statuses, and section counts
export async function GET(request) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');
    const lang = searchParams.get('lang') || 'en';

    const db = getDb();

    // If specific version & lang requested, return full details & sections
    if (version) {
      const versionRecord = await db.prepare(`
        SELECT * FROM privacy_notice_versions
        WHERE version = ? AND language = ?
        LIMIT 1
      `).get(version, lang);

      const sections = await db.prepare(`
        SELECT * FROM privacy_policy_sections
        WHERE version = ? AND language = ?
        ORDER BY sort_order ASC
      `).all(version, lang);

      return NextResponse.json({
        version: versionRecord || null,
        sections: sections || []
      });
    }

    // Otherwise list all policy notice versions
    const allVersions = await db.prepare(`
      SELECT pnv.*, 
        (SELECT COUNT(*) FROM privacy_policy_sections s WHERE s.version = pnv.version AND s.language = pnv.language) as section_count
      FROM privacy_notice_versions pnv
      ORDER BY pnv.version DESC, pnv.language ASC
    `).all();

    return NextResponse.json({
      versions: allVersions
    });
  } catch (error) {
    console.error('Error fetching admin privacy policies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new Draft version or clone existing version to new Draft
export async function POST(request) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { newVersion, sourceVersion = '1.2', title, effectiveFrom } = body;

    if (!newVersion || !/^\d+\.\d+$/.test(newVersion)) {
      return NextResponse.json({ error: 'Valid version number (e.g. 1.3) is required.' }, { status: 400 });
    }

    const db = getDb();

    // Check if version already exists
    const existing = await db.prepare(`
      SELECT count(*) as count FROM privacy_notice_versions WHERE version = ?
    `).get(newVersion);

    if (existing && existing.count > 0) {
      return NextResponse.json({ error: `Version ${newVersion} already exists.` }, { status: 400 });
    }

    // Insert draft records for en, gu, hi
    const insertVersion = await db.prepare(`
      INSERT INTO privacy_notice_versions (notice_id, version, language, title, content, summary, status, effective_from, created_by)
      VALUES (1, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `);

    const copySections = await db.prepare(`
      INSERT INTO privacy_policy_sections (
        section_key, version, language, section_number, heading, subheading,
        content, structured_json, callout_title, callout_content, sort_order, is_active
      )
      SELECT section_key, ?, language, section_number, heading, subheading,
             content, structured_json, callout_title, callout_content, sort_order, 1
      FROM privacy_policy_sections
      WHERE version = ?
    `);

    const runTransaction = db.transaction(async () => {
      // Create entries in en, gu, hi with 'draft' state
      insertVersion.run(newVersion, 'en', title || `Privacy Policy v${newVersion} (Draft)`, 'Draft privacy policy', 'Draft version in preparation', effectiveFrom || '2026-10-01', auth.user.id);
      insertVersion.run(newVersion, 'gu', `ગોપનીયતા નીતિ v${newVersion} (ડ્રાફ્ટ)`, 'ડ્રાફ્ટ ગોપનીયતા નીતિ', 'તૈયારી હેઠળ ડ્રાફ્ટ આવૃત્તિ', effectiveFrom || '2026-10-01', auth.user.id);
      insertVersion.run(newVersion, 'hi', `गोपनीयता नीति v${newVersion} (प्रारूप)`, 'प्रारूप गोपनीयता नीति', 'तैयारी के अंतर्गत प्रारूप संस्करण', effectiveFrom || '2026-10-01', auth.user.id);

      // Copy sections from sourceVersion
      copySections.run(newVersion, sourceVersion);
    });

    await runTransaction();

    return NextResponse.json({
      success: true,
      message: `Draft Version ${newVersion} created successfully from ${sourceVersion}.`,
      version: newVersion,
      status: 'draft'
    });
  } catch (error) {
    console.error('Error creating policy version draft:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT / PATCH: Update draft sections or transition workflow status (draft -> review -> published -> archived)
export async function PUT(request) {
  try {
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { action, version, language = 'en', status, effectiveFrom, sectionId, heading, content, calloutTitle, calloutContent } = body;

    const db = getDb();

    // Action 1: Status transition workflow
    if (action === 'change_status') {
      const allowedStatuses = ['draft', 'review', 'published', 'archived'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
      }

      // If publishing, archive any older version that was published
      const updateTransaction = db.transaction(async () => {
        if (status === 'published') {
          // Archive other published versions
          await db.prepare(`
            UPDATE privacy_notice_versions
            SET status = 'archived'
            WHERE status = 'published' AND version != ?
          `).run(version);
        }

        await db.prepare(`
          UPDATE privacy_notice_versions
          SET status = ?, effective_from = COALESCE(?, effective_from), updated_at = datetime('now')
          WHERE version = ?
        `).run(status, effectiveFrom || null, version);
      });

      await updateTransaction();

      return NextResponse.json({
        success: true,
        message: `Version ${version} updated to status '${status}'.`
      });
    }

    // Action 2: Update section content in draft
    if (action === 'update_section') {
      if (!sectionId) {
        return NextResponse.json({ error: 'sectionId is required.' }, { status: 400 });
      }

      await db.prepare(`
        UPDATE privacy_policy_sections
        SET heading = COALESCE(?, heading),
            content = COALESCE(?, content),
            callout_title = COALESCE(?, callout_title),
            callout_content = COALESCE(?, callout_content),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(heading, content, calloutTitle, calloutContent, sectionId);

      return NextResponse.json({
        success: true,
        message: 'Section updated successfully.'
      });
    }

    return NextResponse.json({ error: 'Unknown action specified.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating admin privacy policy:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
