const { Pool } = require('pg');
const { sectionsData } = require('../database/seed_privacy_sections');

const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding privacy policy sections into Supabase PostgreSQL...');
    await client.query('BEGIN');

    // Ensure privacy_notice_versions contains 1.2
    const noticeVersions = [
      { notice_id: 1, version: '1.2', language: 'en', title: 'Master Privacy Policy v1.2', content: 'Complete DPDP Act 2023 & DPDP Rules 2025 compliant notice.', summary: 'Standard citizen privacy policy', status: 'published', effective_from: '2026-09-01' },
      { notice_id: 1, version: '1.2', language: 'gu', title: 'માસ્ટર ગોપનીયતા નીતિ v1.2', content: 'સંપૂર્ણ ડીપીડીપી કાયદો 2023 અને ડીપીડીપી નિયમો 2025 સુસંગત સૂચના.', summary: 'નાગરિક ગોપનીયતા નીતિ', status: 'published', effective_from: '2026-09-01' },
      { notice_id: 1, version: '1.2', language: 'hi', title: 'मास्टर गोपनीयता नीति v1.2', content: 'पूर्ण डीपीडीपी अधिनियम 2023 एवं डीपीडीपी नियम 2025 अनुपालन सूचना।', summary: 'नागरिक गोपनीयता नीति', status: 'published', effective_from: '2026-09-01' }
    ];

    for (const nv of noticeVersions) {
      await client.query(`
        INSERT INTO privacy_notice_versions (notice_id, version, language, title, content, summary, status, effective_from)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING;
      `, [nv.notice_id, nv.version, nv.language, nv.title, nv.content, nv.summary, nv.status, nv.effective_from]);
    }

    const insertSql = `
      INSERT INTO privacy_policy_sections (
        section_key, version, language, section_number, heading, subheading,
        content, structured_json, callout_title, callout_content, sort_order, is_active, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, NOW()
      )
      ON CONFLICT (section_key, version, language) DO UPDATE SET
        heading = EXCLUDED.heading,
        subheading = EXCLUDED.subheading,
        content = EXCLUDED.content,
        structured_json = EXCLUDED.structured_json,
        callout_title = EXCLUDED.callout_title,
        callout_content = EXCLUDED.callout_content,
        sort_order = EXCLUDED.sort_order,
        is_active = 1,
        updated_at = NOW();
    `;

    let count = 0;
    for (const s of sectionsData) {
      for (const lang of ['en', 'gu', 'hi']) {
        const langData = s[lang];
        // Version 1.2
        await client.query(insertSql, [
          s.key,
          '1.2',
          lang,
          s.num,
          langData.heading,
          langData.subheading,
          langData.content,
          JSON.stringify(langData.structured || {}),
          langData.callout_title || null,
          langData.callout_content || null,
          s.sort
        ]);
        count++;

        // Version 1.0 (backward compatibility)
        await client.query(insertSql, [
          s.key,
          '1.0',
          lang,
          s.num,
          langData.heading,
          langData.subheading,
          langData.content,
          JSON.stringify(langData.structured || {}),
          langData.callout_title || null,
          langData.callout_content || null,
          s.sort
        ]);
        count++;
      }
    }

    await client.query('COMMIT');
    console.log(`Successfully seeded ${count} privacy policy section entries into Supabase PostgreSQL!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
