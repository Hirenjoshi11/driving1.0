import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';
const { getDb } = require('@/lib/db');

// GET /api/applications/track/[appNo]
// DPDP Section 31: Account-based tracking only. Authenticated user sees only their applications.
export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to view your applications.' },
        { status: 401 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`track_${session.userId}_${clientIp}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const db = getDb();
    const resolvedParams = await params;
    const appNo = resolvedParams.appNo;

    if (!appNo) {
      return NextResponse.json({ error: 'Application number is required' }, { status: 400 });
    }

    const rawApp = db
      .prepare(
        `
      SELECT a.id,
             a.user_id,
             a.application_number,
             a.status,
             a.payment_status,
             a.first_name,
             a.last_name,
             a.mobile,
             a.date_of_birth,
             a.government_application_number as gov_reference_number,
             a.total_payable,
             a.payment_method,
             a.final_document_path,
             a.final_document_uploaded_at,
             a.created_at,
             a.updated_at,
             s.name as state_name, s.code as state_code,
             ls.name as service_name, ls.slug as service_slug, ls.description as service_description,
             r.name as rto_name, r.rto_code, r.address as rto_address,
             tc.name as test_centre_name, tc.address as test_centre_address,
             d.name as district_name
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN driving_test_centres tc ON a.test_centre_id = tc.id
      LEFT JOIN districts d ON a.district_id = d.id
      WHERE UPPER(a.application_number) = UPPER(?)
    `
      )
      .get(appNo.trim());

    if (!rawApp) {
      return NextResponse.json(
        { error: 'No application found with this reference number.' },
        { status: 404 }
      );
    }

    // Backend ownership verification (DPDP Rule & Access Control)
    if (session.role === 'citizen') {
      if (rawApp.user_id !== session.userId) {
        return NextResponse.json(
          { error: 'Forbidden: You are only authorized to view your own applications.' },
          { status: 403 }
        );
      }
    } else if (session.role === 'operator') {
      const inScope = isApplicationInScope(db, session, rawApp.id);
      if (!inScope) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
    } else if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const application = {
      id: rawApp.id,
      application_number: rawApp.application_number,
      status: rawApp.status,
      payment_status: rawApp.payment_status,
      applicant_name: `${rawApp.first_name || ''} ${rawApp.last_name || ''}`.trim(),
      gov_reference_number: rawApp.gov_reference_number,
      created_at: rawApp.created_at,
      updated_at: rawApp.updated_at,
      state_name: rawApp.state_name,
      state_code: rawApp.state_code,
      service_name: rawApp.service_name,
      service_slug: rawApp.service_slug,
      service_description: rawApp.service_description,
      rto_name: rawApp.rto_name,
      rto_code: rawApp.rto_code,
      rto_address: rawApp.rto_address,
      test_centre_name: rawApp.test_centre_name,
      test_centre_address: rawApp.test_centre_address,
      district_name: rawApp.district_name,
      total_fee: rawApp.total_payable,
      payment_method: rawApp.payment_method,
      has_final_document: !!rawApp.final_document_path,
      final_document_uploaded_at: rawApp.final_document_uploaded_at,
    };

    // Query uploaded documents with safe download links
    const documents = db
      .prepare(
        `SELECT d.id, dt.name as document_name, dt.category as document_category, 
                (CASE WHEN d.verified_at IS NOT NULL THEN 1 ELSE 0 END) as verified, 
                d.upload_status as status, 
                d.uploaded_at as created_at,
                '/api/documents/download/' || d.id as download_url
         FROM application_documents d 
         LEFT JOIN document_types dt ON d.document_type_id = dt.id 
         WHERE d.application_id = ? 
         ORDER BY d.uploaded_at ASC`
      )
      .all(rawApp.id);

    // Status timeline
    const history = db
      .prepare(
        `SELECT from_status, to_status, notes, created_at 
         FROM application_status_history 
         WHERE application_id = ? 
         ORDER BY created_at ASC`
      )
      .all(rawApp.id);

    return NextResponse.json({
      application,
      history,
      documents: documents || [],
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    return NextResponse.json({ error: 'Failed to track application' }, { status: 500 });
  }
}
