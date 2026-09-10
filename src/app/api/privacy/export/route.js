import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { generateCitizenDataPackage } from '@/lib/dpdp/export';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

// GET /api/privacy/export
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`export_${session.userId}`, 5, 10 * 60 * 1000); // 5 exports per 10 mins
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const exportBundle = generateCitizenDataPackage(session.userId);

    // Audit log this sensitive export
    const db = getDb();
    await logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'DATA_PRINCIPAL_EXPORT',
      entityType: 'user',
      entityId: session.userId,
      summary: `Citizen ${session.userId} exported full personal data bundle under DPDP Act Section 11`,
      ip: clientIp,
    });

    const jsonString = JSON.stringify(exportBundle, null, 2);
    const filename = `data_principal_export_${session.userId}_${Date.now()}.json`;

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating export package:', error);
    return NextResponse.json({ error: 'Failed to generate data export' }, { status: 500 });
  }
}
