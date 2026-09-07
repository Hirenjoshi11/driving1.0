import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserConsents, recordConsentChoice } from '@/lib/dpdp/consent';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

// GET /api/privacy/consent
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const consents = getUserConsents(session.userId);
    return NextResponse.json({ consents });
  } catch (error) {
    console.error('Error fetching user consents:', error);
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 });
  }
}

// POST /api/privacy/consent
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`consent_${session.userId}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const body = await request.json();
    const { purposeId, purposeCode, action, reason, noticeVersionId = 1, language = 'en' } = body;

    if (!action || (!purposeId && !purposeCode)) {
      return NextResponse.json(
        { error: 'Action (grant/withdraw) and purpose identifier are required' },
        { status: 400 }
      );
    }

    const result = recordConsentChoice({
      userId: session.userId,
      purposeCodeOrId: purposeId || purposeCode,
      action,
      noticeVersionId,
      language,
      source: 'privacy_center',
      ipAddress: clientIp,
      deviceRef: request.headers.get('user-agent'),
      reason: reason || (action === 'withdraw' ? 'Citizen withdrew consent via Privacy Center' : 'Citizen granted consent'),
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json({ error: error.message || 'Failed to update consent' }, { status: 400 });
  }
}
