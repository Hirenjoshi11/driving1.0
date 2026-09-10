import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');

// GET /api/applications/[id]
export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const application = await db.prepare(`
      SELECT a.id,
             a.application_number,
             a.user_id,
             a.state_id,
             a.service_id,
             a.district_id,
             a.rto_id,
             a.test_centre_id,
             a.first_name,
             a.middle_name,
             a.last_name,
             a.relation_type,
             a.father_name,
             a.date_of_birth,
             a.gender,
             a.blood_group,
             a.mobile,
             a.email,
             a.nationality,
             a.education,
             a.identification_mark,
             a.identity_type,
             CASE 
               WHEN a.identity_number IS NOT NULL AND LENGTH(a.identity_number) >= 4 
               THEN 'XXXX-XXXX-' || SUBSTR(a.identity_number, -4) 
               ELSE 'XXXX-XXXX-XXXX' 
             END as identity_number,
             a.current_house,
             a.current_city,
             a.current_taluka,
             a.current_pincode,
             a.permanent_house,
             a.permanent_city,
             a.permanent_state_id,
             a.permanent_pincode,
             a.existing_licence_number,
             a.learner_licence_number,
             a.status,
             a.payment_status,
             a.payment_method,
             a.total_payable as total_fee,
             a.government_application_number,
             a.government_application_number as gov_reference_number,
             (CASE WHEN a.final_document_path IS NOT NULL THEN 1 ELSE 0 END) as has_final_document,
             a.final_document_uploaded_at,
             a.correction_reason as rejection_reason,
             a.notes,
             a.is_minor,
             a.created_at,
             a.updated_at,
             s.name as state_name, s.code as state_code,
             ls.name as service_name, ls.slug as service_slug,
             r.name as rto_name, r.rto_code,
             tc.name as test_centre_name,
             d.name as district_name
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN driving_test_centres tc ON a.test_centre_id = tc.id
      LEFT JOIN districts d ON a.district_id = d.id
      WHERE a.id = ?
    `).get(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Citizen can only access their own application (by user_id or linked email)
    if (session.role === 'citizen') {
      const isOwner = application.user_id === session.userId ||
        (session.email && application.email && application.email.toLowerCase() === session.email.toLowerCase());
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Query documents for this application
    const documents = await db.prepare(`
      SELECT d.id, dt.name as document_name, dt.category as document_category, 
             (CASE WHEN d.verified_at IS NOT NULL THEN 1 ELSE 0 END) as verified, 
             d.upload_status as status, 
             d.uploaded_at as created_at 
      FROM application_documents d 
      LEFT JOIN document_types dt ON d.document_type_id = dt.id 
      WHERE d.application_id = ? 
      ORDER BY d.uploaded_at ASC
    `).all(application.id);

    // Query status history
    const history = await db.prepare(`
      SELECT from_status, to_status, notes, created_at 
      FROM application_status_history 
      WHERE application_id = ? 
      ORDER BY created_at ASC
    `).all(application.id);

    return NextResponse.json({ application, documents: documents || [], history: history || [] });
  } catch (error) {
    console.error('Failed to fetch application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

// PATCH /api/applications/[id] - Gate behind operator/admin session (SEC-06, FLOW-10)
export async function PATCH(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.role !== 'admin' && session.role !== 'operator') {
      return NextResponse.json(
        { error: 'Operator access required to update application' },
        { status: 403 }
      );
    }

    const db = getDb();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { status, govReferenceNumber, governmentApplicationNumber, internalNotes, notes } = body;
    const govRef = governmentApplicationNumber !== undefined ? governmentApplicationNumber : govReferenceNumber;
    const notesVal = notes !== undefined ? notes : internalNotes;

    const existing = await db.prepare('SELECT status FROM applications WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const VALID_STATUSES = [
      'draft',
      'submitted',
      'payment_pending',
      'paid',
      'under_review',
      'assigned',
      'government_processing',
      'completed',
      'correction_required',
      'resubmitted',
    ];

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid application status value' }, { status: 400 });
    }

    let query = "UPDATE applications SET updated_at = datetime('now')";
    const values = [];

    if (status) {
      query += ', status = ?';
      values.push(status);
    }
    if (govRef !== undefined) {
      query += ', government_application_number = ?';
      values.push(govRef);
    }
    if (notesVal !== undefined) {
      query += ', notes = ?';
      values.push(notesVal);
    }

    query += ' WHERE id = ?';
    values.push(id);

    // Atomic transaction ensuring status history is guaranteed (FLOW-10 fix)
    const updateTx = db.transaction(async () => {
      await db.prepare(query).run(...values);

      if (status && status !== existing.status) {
        await db.prepare(`
          INSERT INTO application_status_history (
            application_id, from_status, to_status, changed_by, notes
          ) VALUES (?, ?, ?, ?, ?)
        `).run(id, existing.status, status, session.userId, notesVal || `Status updated to ${status}`);
      }
    });

    await updateTx();

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: error.message || 'Failed to update application' }, { status: 500 });
  }
}
